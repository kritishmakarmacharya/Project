import { Router } from "express";
import UserController from "./user.controller";
import auth from "../../middlewares/AuthMiddleware";
const userRouter = Router();

const userCtrl = new UserController();

// routes
//only available for loggedin users
userRouter.post("/", auth(), userCtrl.create);

userRouter.get("/", userCtrl.listAllUsers);
userRouter.get("/:userId", userCtrl.getUserDetailsById);
userRouter.put("/:userId", userCtrl.updateUserById);
userRouter.delete("/:userId", userCtrl.deleteUserById);

export default userRouter;
