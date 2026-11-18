import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import ChargingSession from "./session.model";
import Booking from "../Booking/booking.model";

export default class ChargingSessionController {
    async startSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { booking: bookingId } = req.body;
            const userId = req.loggedInUser?._id;

            //Validate booking Id
            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
             return res.status(400).json({
                    message: "Invalid Booking Id.."
                });
            }
            // Find booking
            const booking = await Booking.findOne({
            _id: bookingId,
            user: userId,
            status: "confirmed"
            });
            if (!booking) {
                return res.status(404).json({
                    message: "Confirmed booking not found"
                });
            }
            //check booking start time
            if(new Date() < booking.startTime) {
                return res.status(400).json({
                    message: "Booking time has not started yet"
                });
            }
            //check booking end time
            if (new Date() >= booking.endTime) {
                return res.status(400).json({
                    message: "Booking time has already expired"
                });
            }
            //Check existig session
            const existingSession = await ChargingSession.findOne({
                booking: booking._id,
                status: "ongoing"
            });
            if (existingSession) {
                return res.status(400).json({
                    message: "Charging session is already ongoing"
                });
            }
            //create charging session
            const session= await ChargingSession.create({
                user: userId,
                booking: booking._id,
                station: booking.station,
                slot: booking.slot,
                startTime: new Date(),
                status: "ongoing"
            });
            return res.status(201).json({
                message: "Charging session started successfully",
                data: session
            });
        } catch(error){
            next(error);
        }
    }
    async endSession(req: Request, res: Response, next: NextFunction) {
        try{
            const id = req.params.id as string;
            const { energyConsumed } = req.body;

            // Validate session Id
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "Invalid Session Id"
                });
            }

            //Find ongoing session
            const session = await ChargingSession.findOne({
                _id: id,
                user: req.loggedInUser?._id,
                status: "ongoing"
            });
            if (!session) {
                return res.status(404).json({
                    message: "Ongoing charging session not found"
                });
            }
            //Get booking details
            const booking = await Booking.findById(session.booking);
            //check booking exists
            if (!booking) {
                return res.status(404).json({
                    message: "Related booking not found"
                });
            }
            // check booking end time
            if(new Date() >= booking.endTime) {
                return res.status(400).json({
                    message: "Booking time has already expired"
                });
            }
            //calculate total amount
            const station = await mongoose.model("ChargingStation")
            .findById(session.station);
            if (!station) {
                return res.status(404).json({
                    message: "Charging station not found"
                });
            }
            const totalAmount=energyConsumed * station.pricePerKwh;

            // Update session
            session.endTime = new Date();
            session.energyConsumed = energyConsumed;
            session.totalAmount = totalAmount;
            session.status = "completed";

            await session.save();
            return res.status(200).json({
                message: "Charging sessio completed successfully",
                data: session
            });
        } catch(error) {
            next(error);
        }
    }
    async mySession(req: Request, res: Response, next: NextFunction) {
        try {
            const sessions = await ChargingSession.find({
                user: req.loggedInUser?._id
            })
            .populate("station")
            .populate("slot")
            .populate("booking")
            .sort({ createdAt: -1 });

            return res.status(200).json({
                message: "Charging sessions fetched successfully",
                total: sessions.length,
                data: sessions
            });
        } catch(error){
            next(error);
        }
    }
    async sessionDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;

            //validate session id
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "Invalid Session Id"
                });
            }
            const session = await ChargingSession.findOne({
                _id:id,
                user: req.loggedInUser?._id
            })
            .populate("station")
            .populate("slot")
            .populate("booking");

            if (!session) {
                return res.status(404).json({
                    message: "Charging session not found"
                });
            }
            return res.status(200).json({
                message: "Charging session details fetched successfully",
                data: session
            });
        } catch(error){
            next(error);
        }
    }
    //Admin get all charging sessions
    async listAllSessions(req: Request, res: Response, next: NextFunction) {
        try {
            // check admin role
            if (req.loggedInUser?.role !== "admin") {
                return res.status(403).json({
                    message: "Access denied. Only admi can view all charging sessions..."
                });
            }
            
            const sessions =await ChargingSession.find()
            .populate("user", " name email")
            .populate("booking")
            .populate("station")
            .populate("slot")
            .sort({ createdAt: -1 });

            return res.status(200).json({
                message: "All Charging sessios fetched successfully",
                total: sessions.length,
                data: sessions
            });
        } catch(error){
            next(error);
        }
    }
}
