import crypto from "crypto";
import path from "node:path";
import { AppConfig } from "../config/appConfig";

export const imageMap = (image: Express.Multer.File, dir = "/") => {
  return {
    url: AppConfig.imageUrl + dir + image.filename,
    path: path.resolve(image.destination),
    filename: image.filename,
    type: image.mimetype,
    size: image.size,
  };
};

export const generateOTP = (len: number = 4): string => {
  let otp = crypto.randomInt(0, 10000).toString().padStart(len, "0");
  return otp;
};
