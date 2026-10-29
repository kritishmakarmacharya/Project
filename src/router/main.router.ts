import { Router } from "express";
import frontRouter from "../app/front/front.router";
import authRouter from "../app/auth/auth.router";
import userRouter from "../app/user/user.router";
import ProductRouter from "../app/products/product.router";

const mainRouter = Router();

mainRouter.use(frontRouter);

mainRouter.use("/auth", authRouter);
mainRouter.use("/user", userRouter);
mainRouter.use("/product", ProductRouter);

export default mainRouter;
