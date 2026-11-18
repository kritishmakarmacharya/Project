import { Router } from "express";
import auth from "../../middlewares/AuthMiddleware";
import bodyValidator from "../../middlewares/BodyValidatorMiddleware";

import { startSessionDTO, endSessionDTO } from "./session.dto";
import ChargingSessionController from "./session.controller";

const sessionCtrl = new ChargingSessionController();
const sessionRouter = Router();

//start charging session
sessionRouter.post(
    "/start",
    auth(),
    bodyValidator(startSessionDTO),
    sessionCtrl.startSession
);

// End charging session
sessionRouter.patch(
    "/:id/end",
    auth(),
    bodyValidator(endSessionDTO),
    sessionCtrl.endSession
);
// Get my charging session
sessionRouter.get(
    "/my",
    auth(),
    sessionCtrl.mySession
);

// get Sessions details
sessionRouter.get(
    "/:id",
    auth(),
    sessionCtrl.sessionDetails
);
//Admin get all charging session
sessionRouter.get(
    "/",
    auth(),
    sessionCtrl.listAllSessions
);

export default sessionRouter;