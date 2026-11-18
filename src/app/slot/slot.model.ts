import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema(
    {
        station: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChargingStation",
            required: true,
        },
        slotNumber: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["available", "maintenance"],
            default: "available",
        },
    },
    {
        timestamps: true,
    }
);
// Same station cannot have duplicate slot numbers
SlotSchema.index(
    { station: 1, slotNumber: 1 },
    { unique: true }
);
const Slot = mongoose.model("Slot", SlotSchema);

export default Slot;