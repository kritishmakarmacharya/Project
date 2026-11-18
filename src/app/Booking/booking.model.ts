import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        station: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChargingStation",
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
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending",
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        energyKwh: {
            type: Number,
            required: true,
            min: 0.1,
        },
    },
    {
        timestamps: true,
    }
);

//Index for booking availability queries
BookingSchema.index({
    slot: 1,
    startTime: 1,
    endTime: 1,
    status: 1,
});

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;