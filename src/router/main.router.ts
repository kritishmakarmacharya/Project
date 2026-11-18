import { Router } from "express";
import frontRouter from "../app/front/front.router";
import authRouter from "../app/auth/auth.router";
import userRouter from "../app/user/user.router";
import ProductRouter from "../app/products/product.router";
import ChargingStationRouter from "../app/station/station.router";
import SlotRouter from "../app/slot/slot.router";
import bookingRouter from "../app/Booking/booking.router";
const mainRouter = Router();

mainRouter.use(frontRouter);

mainRouter.use("/auth", authRouter);
mainRouter.use("/user", userRouter);
mainRouter.use("/product", ProductRouter);
mainRouter.use("/station",ChargingStationRouter);
mainRouter.use("/slot"),SlotRouter;
mainRouter.use("bookings",bookingRouter)
export default mainRouter;
