import mongoose from "mongoose";

export const ImageSchema = new mongoose.Schema(
  {
    url: String,
    path: String,
    filename: String,
    type: String,
    size: Number,
  },
  {
    _id: false,
  },
);
