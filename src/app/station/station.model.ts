import mongoose from "mongoose";
import { ImageSchema } from "../../common/Schema";

const ChargingStationSchema = new mongoose.Schema({
    name: {
        type:String,
        minlength: 3,
        maxlength: 160,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
    },
    longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
    },
    chargerType: {
        type: String,
        enum: ["AC", "DC"],
        required: true,
    },
    pricePerKwh: {
        type: Number,
        required: true,
        min: 0
    },
    totalSlots: {
        type: Number,
        required: true,
        min: 1
    },
    availableSlots: {
        type: Number,
        default: 0,
        min: 0
    },
    openingTime: {
        type: String,
        required: true,
    },
    closingTime: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
    },
    images: [ImageSchema],
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type:mongoose.Types.ObjectId,
        ref: "User",
        required: false,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // longitude, latitude
            required: true,
        },
    },
    powerKW: {
        type: Number,
        required: true,
        min: 1,
    },
},
{
    timestamps: true,
    autoCreate: true,
    autoIndex: true,
},
);

ChargingStationSchema.index({
    location: "2dsphere",
})

const ChargingStation = mongoose.model("ChargingStation",ChargingStationSchema);
export default ChargingStation;