import mongoose from "mongoose";
import { string } from "zod";
import { required } from "zod/mini";
import { ImageSchema } from "../../common/Schema";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 3,
      max: 160,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      //type: mongoose.Types.ObjectId
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    //price should be always kept in paisa format not in rupee
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    afterDiscount: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
    },
    seller: {
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
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
    autoCreate: true,
    autoIndex: true,
  },
);

const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;
