import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import ChargingStation from "../station/station.model";
import Booking from "./booking.model";
import Slot from "../slot/slot.model";


export default class BookingController {
    async checkAvailableSlots(req: Request, res: Response, next: NextFunction) {
        try {
            const { stationId, startTime, endTime } = req.query;

            //Validate required fields
            if (!stationId || !startTime || !endTime) {
                return res.status(400).json({
                    message: "Station Id, start time and end time are required.."
                });
            }

            // Validate station Id
            if (!mongoose.Types.ObjectId.isValid(stationId as string)) {
                return res.status(400).json({
                    message: "Invalid Station Id.."
                });
            }
            const start = new Date(startTime as string);
            const end = new Date(endTime as string);

            //Validates dates
            if (
                isNaN(start.getTime()) ||
                isNaN(end.getTime()) ||
                start >= end
            ) {
                return res.status(400).json({
                    message: "Please provide valid start and end times.."
                });
            }

            const stationObjectId = new mongoose.Types.ObjectId(
                stationId as string
            );
            //Find bookings that overlap with requested time
            const bookedSlots = await Booking.distinct("slot", {
                station: stationObjectId,
                status: { $in: ["pending", "confirmed"] },
                startTime: { $lt: end},
                endTime: { $gt: start} 
            });
            //Find available slots
            const availableSlots = await Slot.find({
                station: stationObjectId,
                status: "available",
                _id: { $nin: bookedSlots}
            });
            return res.status(200).json({
                message: "Available slots fetched succesfully..",
                totalAvailableSlots: availableSlots.length,
                data: availableSlots
            });
        } catch (error) {
            next(error);
        }
    }
    async createBooking(req: Request, res: Response, next: NextFunction) {
        try {
             const { station, slot, startTime, endTime, energyKwh }= req.body;
            //Get loogedin user
            const userId = req.loggedInUser?._id;
            if (!userId) {
                return res.status(401).json({
                    message: "Please login first.."
                });
            }
            if(
                !mongoose.Types.ObjectId.isValid(station) ||
                !mongoose.Types.ObjectId.isValid(slot)
            ) {
                return res.status(400).json({
                    message: "Invalid station or slot Id"
                });
            }
            //Find station
            const chargingStation = await ChargingStation.findById(station);
            if (!chargingStation || chargingStation.status !== "active") {
                return res.status(404).json({
                    message: "Charging station not found or inactive"
                });
            }
            //Find slot
            const selectedSlot = await Slot.findOne({
                _id: slot,
                station: station,
                status: "available"
            });
            if (!selectedSlot) {
                return res.status(404).json({
                    message: "Slot not found or unavailable"
                });
            }
            //Validate booking time
            const start = new Date(startTime);
            const end = new Date(endTime);
            if (
                isNaN(start.getTime()) ||
                isNaN(end.getTime()) ||
                start <= new Date() ||
                start >= end
            ) {
                return res.status(400).json({
                    message: "Please provide valid booking start ad end times"
                });
            }
            // check overlapping bookings
            const existingBooking = await Booking.findOne({
                slot: selectedSlot._id,
                status: { $in: ["pending", "confirmed"] },
                startTime: { $lt: end },
                endTime: { $gt: start }
            });
            if (existingBooking) {
                return res.status(409).json({
                    message: "This slot is already booked for the selected time.."
                });
            }
            //validate energy
            if(
                typeof energyKwh !== "number" ||
                !Number.isFinite(energyKwh) ||
                energyKwh <= 0.1
            ) {
                return res.status(400).json({
                    message: "Energy must be at least 0.1 Kwh"
                });
            }
            //calculate expected charging duration
            const expectedDuration = (energyKwh / chargingStation.powerKW) * 60;

            //Actual booking duration in minutes
            const actualDuration = (end.getTime() - start.getTime()) / (1000 * 60);
            if (actualDuration < expectedDuration) {
                return res.status(400).json({
                    message: "Selected booking duration is insufficient for the requested energy"
                });
            }
            //calculate total amount
            const totalAmount = energyKwh * chargingStation.pricePerKwh;

            //create pendig booking
            const booking = await Booking.create({
                user: userId,
                station: chargingStation._id,
                slot: selectedSlot._id,
                startTime: start,
                endTime: end,
                energyKwh,
                totalAmount,
                status: "pending"
            });
            return res.status(201).json({
                message: "Booking created successfully. Please complete payment..",
                data: booking
            });
        } catch(error) {
            next(error);
        }
    }

    async myBookings( req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.loggedInUser?._id;
            const bookings = await Booking.find({
                user:userId,
            })
            .populate("station")
            .populate("slot")
            .sort({ createdAt: -1 });

            return res.status(200).json({
                message: "My Booking fetched successfully..",
                total: bookings.length,
                data: bookings,
            });
        } catch(error){
            next(error);
        }
    }
    async getBookingDetails(req: Request, res: Response,next: NextFunction) {
        try{
            const id = req.params.id as string;
            //validate booking id
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "Invali Booking Id.."
                });
            }

            // Find booking belong to logged in user
            const booking = await Booking.findOne({
                _id: id,
                user: req.loggedInUser?._id
            })
            .populate("station")
            .populate("slot")
            .populate("user", "name email");

            if (!booking) {
                return res.status(404).json({
                    message: "Booking not found.."
                });
            }
            return res.status(200).json({
                message: "Booking details fetched successfully",
                data: booking
            });
        } catch (error){
            next(error);
        }
    }
    async cancelBooking(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;

            ////Validate Booking Id
            if(!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "Invalid Booking Id"
                });
            }
            //Find booking belong logged in user
            const booking = await Booking.findOne({
                _id: id,
                user: req.loggedInUser?._id
            });
            if (!booking) {
                return res.status(404).json({
                    message: "Booking not found"
                });
            }
            if (booking.status !== "confirmed") {
                return res.status(400).json({
                    message: "Only confirmed bookings can be cancelled"
                });
            }
            //cancel booking
            booking.status = "cancelled";
            await booking.save();

            return res.status(200).json({
                message: "Booking cancelled successfully",
                data: booking
            });
        } catch(error){
            next(error);
        }
    }
    async completeBooking(req: Request, res: Response, next: NextFunction) {
        try {
            const id =req.params.id as string;

            //validate booking id
            if(!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "Invalid Booking Id"
                });
            }
            //Find booking belng to loggedin user
            const booking = await Booking.findOne({
                _id: id,
                user: req.loggedInUser?._id
            });
            if (!booking) {
                return res.status(404).json({
                    message: "Booking not found"
                });
            }
            // check booking status
            if (booking.status !== "confirmed") {
                return res.status(400).json({
                    message: "Only confirmed bookings can be completed"
                });
            }
            //check booking end time
            if(new Date() < booking.endTime) {
                return res.status(400).json({
                    message: "Booking time has not ended yet"
                });
            }
            //update booking status
            booking.status = "completed";
            await booking.save();

            return res.status(200).json({
                message: "Booking completed successfully",
                data: booking
            });
        } catch (error) {
            next(error);
        }
    }
}

