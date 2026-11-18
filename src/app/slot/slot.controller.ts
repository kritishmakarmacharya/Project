import {Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import ChargingStation from "../station/station.model";
import Slot from "./slot.model";
import Booking from "../Booking/booking.model";

const checkStationPermission = (
    station: any,
    user: any
): boolean => {
    if (!user) {
        return false;
    }
    //Admin can manage every satation
    if (user.role === "admin") {
        return true;
    }

    //owner can manage only their own station
    if (
        user.role === "owner" &&
        String(station.owner) === String(user._id)
    ) {
        return true;
    }
    return false;
};
class SlotController {
    async createSlots(req: Request, res: Response, next: NextFunction){
        try {
            const { stationId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(String(stationId))) {
                return res.status(400).json({
                    message: "Invalid Station Id"
                });
            }
            const station = await ChargingStation.findById(stationId);
            if (!station) {
                return res.status(404).json({
                    message: "Charging station not found"
                });
            }
            // check owner/admin authorization
            if (!checkStationPermission(station, req.loggedInUser)) {
                return res.status(403).json({
                    message: "You are not authorized to create slots for this station"
                });
            }
            //Check whather slots already exist
            const existingSlots = await Slot.countDocuments({
                station: station._id
            });
            if (existingSlots > 0) {
                return res.status(400).json({
                    message: "Slots have already been created for this station"
                });
            }
            const slots = [];
            for (let i = 1; i <= station.totalSlots; i++) {
                slots.push({
                    station: station._id,
                    slotNumber: i,
                    status: "available"
                });
            }
            const createSlots = await Slot.insertMany(slots);
            return res.status(201).json({
                message: "Charging Slots created successfully..",
                totalSlots: createSlots.length,
                data: createSlots
            });
        } catch (error) {
            next (error);
        }
    }
    async listSlotByStation(req: Request, res: Response, next: NextFunction) {
        try {
            const { stationId } = req.params;
            if(!mongoose.Types.ObjectId.isValid(String(stationId))) {
                return res.status(400).json({
                    message: "Invalid Station Id.."
                });
            }
            const station = await ChargingStation.findById(stationId);
            if (!station) {
                return res.status(404).json({
                    message: "Charging station not found"
                });
            }
            const slots = await Slot.find({
                station: stationId
            }).sort({ slotNumber: 1 });

            return res.status(200).json({
                message: "Charging slots fetched successfully",
                totalSlots: slots.length,
                data: slots
            });
        }catch(error){
            next(error);
        }
    }

    async updateSlotsStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { slotId } = req.params;
            const { status } = req.body;

            if (!mongoose.Types.ObjectId.isValid(String(slotId))) {
                return res.status(400).json({
                    message: "Invalid Slot Id.."
                });
            }
            if (!["available", "maintenance"].includes(status)) {
                return res.status(400).json({
                    message: "Invalid slot status"
                });
            }
            const slot = await Slot.findById(slotId);
            if (!slot) {
                return res.status(404).json({
                    message: "Slot not found"
                });
            }
            // check owner/admin authorization
            const station = await ChargingStation.findById(slot.station);
            if (!station) {
                return res.status(404).json({
                    messgae: "Charding station ot found"
                });
            }
            if (!checkStationPermission(station, req.loggedInUser)) {
                return res.status(403).json({
                    message: "You are not authorized to update this slot"
                });
            }
            //prevent maintenance if confirmed bookig exists
            if (status === "maintenance") {
                const existingBooking = await Booking.findOne({
                    slot: slot._id,
                    status: "confirmed",
                    endTime: {
                        $gt: new Date ()
                    }
                });
                if (existingBooking) {
                    return res.status(400).json({
                        message: "Cannot set slot to maintenance because it has an active or upcoming booking.."
                    });
                }
            }
            slot.status = status;
            await slot.save();
            
            return res.status(200).json({
                message: "Slot status updated successfully",
                data: slot
            });
        }catch(error){
            next(error);
        }
    }
}
export default new SlotController();