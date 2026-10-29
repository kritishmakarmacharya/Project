import { NextFunction, type Request, type Response } from "express";
import { generateOTP, imageMap } from "../../utilities/helpers";
import bcrypt from "bcryptjs";
import UserModel from "../user/User.model";
import EmailService from "../../services/EmailService";
import jwt from "jsonwebtoken";
import { AppConfig } from "../../config/appConfig";
import SessionModel from "./Session.model";

class AuthController {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      //file accept
      if (req.file) {
        data.image = imageMap(req.file, "users/");
      }

      //password has to be encrypt(hashed)
      data.password = bcrypt.hashSync(data.password, 12);

      //activation process
      data.status = "inactive";
      data.activated = false;
      data.otp = generateOTP();

      const userObj = new UserModel(data);
      await userObj.save();

      //SMTP feature
      const emailSvc = new EmailService();
      await emailSvc.sendEmail({
        to: userObj.email,
        subject: "Activate your account..!!!",
        message: ` 
<div style="
  width:100%;
  min-height:100vh;
  background:linear-gradient(135deg, #f8fafc, #e0f2fe 90%);
  padding:40px 0;
  font-family:'Segoe UI', Roboto, sans-serif;
">

  <div style="
    max-width:520px;
    background:#fff;
    border-radius:24px;
    box-shadow:0 4px 32px rgba(60,72,210,0.09);
    margin:0 auto;
    padding:40px 32px;
    text-align:center;
  ">

    <div style="
      font-size:42px;
      margin-bottom:15px;
    ">
    </div>

    <h2 style="
      color:#2563eb;
      margin-bottom:12px;
      font-size:2.1rem;
      font-weight:700;
    ">
      Thank You for Registering!
    </h2>

    <p style="
      color:#333;
      font-size:1.04rem;
      line-height:1.7;
      margin:0;
    ">
      We're excited to have you on board.<br>
      Please confirm your email address using the OTP below
      to activate your EVCharge profile.
    </p>

    <div style="
      margin:28px auto;
      display:inline-block;
    ">

      <div style="
        letter-spacing:15px;
        font-size:2.4rem;
        font-weight:700;
        color:#fff;
        background:linear-gradient(90deg,#2563eb,#00c3a5);
        padding:18px 38px;
        border-radius:12px;
      ">
        ${userObj.otp}
      </div>

      <div style="
        margin-top:12px;
        font-size:0.95rem;
        color:#7e8792;
      ">
        Enter this OTP to activate your account.<br>
        It will expire in 10 minutes.
      </div>

    </div>

    <p style="
      color:#697089;
      font-size:15px;
      line-height:1.6;
    ">
      If you didn't create an account, you can safely ignore this email.<br>
      <b>Welcome to EVCharge! </b>
    </p>

    <hr style="
      margin:38px 0 18px 0;
      border:none;
      border-top:1px solid #ececff;
    ">

    <div style="
      color:#9a9bae;
      font-size:13px;
    ">
      &copy; ${new Date().getFullYear()} EVCharge.
      All rights reserved.
    </div>

  </div>

</div>
`,
      });

      res.json({
        data: null,
        message: "Your account has been registered",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      // const userDetail = await UserModel.findOne({
      //   $or: [{ username: username }, { email: username }],
      // });
      const userDetail = await UserModel.findOne({
        email: email,
      });
      if (!userDetail) {
        throw { code: 422, message: "User does not exists" };
      }
      //activation
      if (userDetail.activated === false || userDetail.status === "inactive") {
        throw { code: 422, message: "Your account is not activated" };
      }

      //password verificaton
      if (!bcrypt.compareSync(password, userDetail.password)) {
        throw { code: 422, message: "Credentials does not match" };
      }

      //user login
      const accessToken = jwt.sign(
        { sub: userDetail._id },
        AppConfig.jwtSecrets as string,
        {
          expiresIn: "8h",
        },
      );

      //save the token to db
      const session = new SessionModel({
        userId: userDetail._id,
        tokens: {
          accessToken: accessToken,
        },
        status: "active",
        data: JSON.stringify({ device: "web" }),
      });
      await session.save();

      res.cookie("atSessId", session.tokens?.accessToken, {
        httpOnly: true,
        //secure: process.env.NODE_ENV === 'production'
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000, //8 hours
      });

      res.json({
        data: {
          sessionId: session._id,
          _id: userDetail._id,
          name: userDetail.name,
          email: userDetail.email,
          image: userDetail.image,
          role: userDetail.role,
          status: userDetail.status,
        },
      });
    } catch (exception) {
      // handling
      next(exception);
    }
  }

  getLoggedInUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        data: req.loggedInUser,
        message: "Your account details",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async verifyRegisterOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const userDetail = await UserModel.findOne({
        email: email,
      });
      if (!userDetail) {
        throw { code: 422, message: "User not found..!!" };
      }

      if (userDetail.activated === true) {
        throw { code: 422, message: "Your account is already activated" };
      }

      // otp erify
      if (userDetail.otp !== otp) {
        throw {
          code: 400,
          message: "OTP Not Verified",
          details: { otp: "OTP Does Not Match" },
        };
      }

      userDetail.otp = null;
      userDetail.status = "active";
      userDetail.activated = true;

      //Update
      await userDetail.save();

      res.json({
        data: null,
        message: "User activated",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
  async logoutUser(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.atSessId;
      if (token) {
        await SessionModel.deleteOne({ "tokens.accessToken": token });
      }
      res.clearCookie("atSessId", {
        httpOnly: true,
        sameSite: "lax",
      });
      res.json({
        data: null,
        message: "Logged out Sucessfully...",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
}

export default AuthController;
