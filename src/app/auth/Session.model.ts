import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokens: {
      accessToken: {
        type: String,
        required: true,
      },
      refreshToken: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    data: String,
  },
  {
    autoCreate: true,
    autoIndex: true,
    timestamps: true,
  },
);

const SessionModel = mongoose.model("Session", SessionSchema);
export default SessionModel;
