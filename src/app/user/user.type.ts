import mongoose from "mongoose";
import { IImage } from "../../types/common";

export interface IUserDetail {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: string;
  phone?: string | undefined | null;
  address: string;
  status: string;
  image?: IImage;
  activated: boolean;
}
