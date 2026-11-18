import { Router } from "express";
import auth from "../../middlewares/AuthMiddleware";
import BookingController from "./booking.controller";
import bodyValidator from "../../middlewares/BodyValidatorMiddleware";
import { bookingCreateDTO } from "./booking.dto";

const bookingCtrl = new BookingController();
const bookingRouter = Router();
// Check available slots
bookingRouter.get(
    "/availability",
    auth(),
    bookingCtrl.checkAvailableSlots
);

//Create booking
bookingRouter.post(
    "/create",
    auth(),
    bodyValidator(bookingCreateDTO),
    bookingCtrl.createBooking
);

//get logged in users booking
bookingRouter.get(
    "/my-bookings",
    auth(),
    bookingCtrl.myBookings
);

//get booking details
bookingRouter.get(
    "/:id",
    auth(),
    bookingCtrl.getBookingDetails
);
//cancel booking
bookingRouter.patch(
    "/:id/cancel",
    auth(),
    bookingCtrl.cancelBooking
);
// complete booking
bookingRouter.patch(
    "/:id/complete",
    auth(),
    bookingCtrl.completeBooking
);

export default bookingRouter;