import mongoose from "mongoose";

const ChargingSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },
        station: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Station",
            required: true, 
        },
        slot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Slot",
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            default: null,
        },
        energyConsumed: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ["ongoing", "completed"],
            default: "ongoing",
        },
    },
    {
        timestamps: true,
    }
);
const ChargingSession = mongoose.model("ChargingSession",ChargingSessionSchema);

export default ChargingSession;
