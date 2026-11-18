import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import Payment from "./payment.model";
import ChargingSession from "../session/session.model";

 //Generate eSewa signature
    const generateSignature = (message: string): string => {
        return crypto
        .createHmac(
            "sha256",
            process.env.ESEWA_SECRET_KEY as string
        )
        .update(message)
        .digest("base64");
    };

export default class PaymentController {
    //Initiate sSewa payment
    async initiatePayment( req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            const userId = req.loggedInUser?._id;

            if (!sessionId || 
                typeof sessionId !== "string" || 
                !mongoose.Types.ObjectId.isValid(sessionId)
            ) {
                return res.status(400).json({
                    message: "Invalid session Id"
                });
            }
            //Find complete session belong to logged in user
            const session = await ChargingSession.findOne({
                _id: sessionId,
                user: userId,
                status: "completed"
            });
            if (!session) {
                return res.status(404).json({
                    message: "Completed charging session not found"
                });
            }
            // use amount calculated 
            const amount = Number(session.totalAmount);
            if (!Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({
                    message: "Invalid paymet amount"
                });
            }
            const transactionUuid = crypto.randomUUID();
            const amountString = amount.toFixed(2);
            const productCode = process.env.ESEWA_PRODUCT_CODE as string;
            if (
                !productCode ||
                !process.env.ESEWA_SECRET_KEY ||
                !process.env.ESEWA_PAYMENT_URL ||
                !process.env.BACKEND_URL
            ){
                return res.status(500).json({
                    message: "eSewa configuration is missing"
                });
            }
            //create or update payment record for retry
            const payment = await Payment.findOneAndUpdate(
                { session: session._id },
                {
                    user: userId,
                    session: session._id,
                    amount,
                    transactionUuid,
                    paymentMethod: "esewa",
                    status: "pending"
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            );
            //Generate signature
            const message = `total_amount=${amountString},transaction_uuid=${transactionUuid},product_code=${productCode}`;
            const signature = generateSignature(message);
            return res.status(200).json({
                message: "Payment initiated successfully",
                paymentId: payment._id,
                paymentUrl: process.env.ESEWA_PAYMENT_URL,
                formData: {
                    amount: amountString,
                    tax_amount: "0",
                    total_amount: amountString,
                    transaction_uuid: transactionUuid,
                    product_code: productCode,
                    product_service_charge: "0",
                    product_delivery_charge: "0",
                    success_url: `${process.env.BACKEND_URL}/api/payments/esewa/success`,
                    failure_url: `${process.env.BACKEND_URL}/api/payments/esewa/failure`,
                    signed_field_names: "total_amount,transaction_uuid,product_code",
                    signature
                }
            });
        } catch (error) {
            next(error);
        }
    }
    //verify successfull eSewa payment
    async verifyPayment(req: Request, res: Response, next: NextFunction){
        try {
            const { data } = req.query;
            if (!data || typeof data !== "string") {
                return res.status(400).json({
                    message: "Payment response data is missing"
                });
            }
            //decode Base64 response
            const decodeData = JSON.parse(
                Buffer.from(data, "base64").toString("utf-8")
            );
            const {
                transaction_uuid,
                transaction_code,
                total_amount,
                status,
                product_code,
                signed_field_names,
                signature
            } = decodeData;
            //Find our payment
            const payment = await Payment.findOne({
                transactionUid: transaction_uuid
            });
            if (!payment) {
                return res.status(404).json({
                    message: "Payment record ot found"
                });
            }
            //verify response signature
            const fields = typeof signed_field_names === "string"
            ? signed_field_names.split(",")
            : [];

            const requiredFields = [
                "status",
                "total_amount",
                "transaction_uuid",
                "product_code"
            ];
            if ( 
                !requiredFields.every(field => fields.includes(field))
            ){
                return res.status (400).json({
                    message: "Invalid signed fields"
                });
            }
            // generate message
            const message = fields
            .map((field: string) => `${field}=${decodeData[field]}`)
            .join(",");

            //generate expected signature
            const expectedSignature = generateSignature(message);
            const receivedBuffer = Buffer.from(signature || "");
            const expectedBuffer = Buffer.from(expectedSignature);

            if (
                receivedBuffer.length !== expectedBuffer.length ||
                !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
            ) {
                return res.status(400).json({
                    message: "Invalid payment signature"
                });
            }
            //check response details
            const responseAmount = Number(
                String(total_amount).replace(/,/g,"")
            );
            if (status !== "COMPLETE" || 
                product_code !== process.env.ESEWA_PRODUCT_CODE ||
                responseAmount !== payment.amount
            ) {
                return res.status(400).json({
                    message: "Payment details do not match"
                });
            }
            //verify transaction directly with eSewa
            const statusUrl = new URL(
                process.env.ESEWA_STATUS_URL as string
            );
            statusUrl.search = new URLSearchParams({
                product_code: process.env.ESEWA_PRODUCT_CODE as string,
                total_amount: payment.amount.toFixed(2),
                transaction_uid: transaction_uuid
            }).toString();
            const statusResponse = await fetch(statusUrl);
            if (!statusResponse.ok) {
                return res.status(502).json({
                    message: "Unable to verify payment with esewa"
                });
            }
            const verifiedData = await statusResponse.json() as {
                status: string;
                ref_id: string;
                transaction_uuid: string;
                product_code: string;
                total_amount: number | string;
            };
            const verifiedAmount = Number(
                String(verifiedData.total_amount).replace(/,/g, "")
            );
            if (
                verifiedData.status !== "COMPLETE" ||
                verifiedData.transaction_uuid !== transaction_uuid ||
                verifiedData.product_code !== process.env.ESEWA_PRODUCT_CODE ||
                verifiedAmount !== payment.amount
            ) {
                return res.status(400).json({
                    message: "eSewa payment verification failed"
                });
            }
            //update payment only after successful verification
            payment.status = "completed",
            payment.transactionCode = verifiedData.ref_id;
            await payment.save();

            return res.redirect(
                `${process.env.FRONTEND_URL}/payment/success`
            );
        } catch(error){
            next(error);
        }
    }
    //Handle failed payment
    async paymentFailure(req: Request, res: Response, next:NextFunction){
        try {
            const { transaction_uuid } = req.query;
            if (typeof transaction_uuid === "string") {
                await Payment.findOneAndUpdate(
                    {
                        transactionUuid: transaction_uuid,
                        status: "pending"
                    },
                    {
                        status: "failed"
                    }
                );
            }
            return res.redirect(
                `${process.env.FRONTEND_URL}/payment/failure`
            );
        } catch(error){
            next(error);
        }
    }
}