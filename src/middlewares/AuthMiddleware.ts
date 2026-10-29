import { type Request, type Response, type NextFunction } from "express";
import SessionModel from "../app/auth/Session.model";
import jwt from "jsonwebtoken";
import { AppConfig } from "../config/appConfig";
import UserModel from "../app/user/User.model";
import { IUserDetail } from "../app/user/user.type";
const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies?.atSessId;
      const sessionData = await SessionModel.findOne({
        "tokens.accessToken": accessToken,
      }).populate("userId", [
        "_id",
        "name",
        "email",
        "username",
        "role",
        "phone",
        "address",
        "status",
        "image.url",
        "activated",
      ]);
      if (!sessionData) {
        throw { code: 401, message: "Token not found" };
      }

      const data = jwt.verify(accessToken, AppConfig.jwtSecrets as string);
      const userDetail = await UserModel.findOne(
        {
          _id: data.sub,
        },
        {
          __v: 0,
          otp: 0,
          password: 0,
          createAt: 0,
          updatedAt: 0,
        },
      );
      if (!userDetail) {
        res.clearCookie("atSessId");
        throw { code: 401, message: "User not found" };
      }

      req.loggedInUser = userDetail as IUserDetail;
      next();
    } catch (exception) {
      res.clearCookie("atSessId");
      next(exception);
    }
  };
};

export default auth;
