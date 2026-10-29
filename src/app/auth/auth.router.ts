import { Router } from "express";
import AuthController from "./auth.controller";
import auth from "../../middlewares/AuthMiddleware";
import bodyValidator from "../../middlewares/BodyValidatorMiddleware";
import { LoginDTO, OTPValidationDTO, RegisterDTO } from "./auth.dto";
import uploader from "../../middlewares/UploaderMiddleware";

const authRouter = Router();
const authCtrl = new AuthController();

// doesnot have any file upload
//authRouter.post("/register", uploader().none(),bodyValidator(RegisterDTO), authCtrl.registerUser);

// allowed select one files
authRouter.post(
  "/register",
  uploader("/users").single("image"),
  bodyValidator(RegisterDTO),
  authCtrl.registerUser,
);
authRouter.post(
  "/register-otp-verify",
  bodyValidator(OTPValidationDTO),
  authCtrl.verifyRegisterOTP,
);

// allowed n number of files
// authRouter.post("/register", uploader("/users").array('image'),bodyValidator(RegisterDTO), authCtrl.registerUser);

// multiple fields to upload files with different config
// authRouter.post("/register", uploader("/users").fields([
// {name: "image", maxCount:3},
// {name: "profilePic", maxCount: 1}
// ]), bodyValidator(RegisterDTO), authCtrl.registerUser);

authRouter.post("/login", bodyValidator(LoginDTO), authCtrl.loginUser);

// only allow to user with login status true
authRouter.get("/me", auth(), authCtrl.getLoggedInUserProfile);
authRouter.post("/logout", auth(), authCtrl.logoutUser);

export default authRouter;
