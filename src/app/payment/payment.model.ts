import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChargingSession",
            required: true,
            unique: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        transactionUuid: {
            type: String,
            required: true,
            unique: true,
        },
        transactionCode: {
            type: String,
        },
        paymentMethod: {
            type: String,
            enum: ["esewa"],
            default: "esewa",
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);
const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;