import mongoose from "mongoose";
import { ImageSchema } from "../../common/Schema";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 2,
      max: 50,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "owner", "customer"],
      default: "customer",
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    image: ImageSchema,
    activated: { type: Boolean, default: false },
    otp: String,
    timeExpiry: Date,
  },
  {
    autoCreate: true,
    autoIndex: true,
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
