import { Router } from "express";
import slotController from "./slot.controller";
import auth from "../../middlewares/AuthMiddleware";

const SlotRouter = Router();

//create slots for a charging station
SlotRouter.post(
    "/station/:stationId",
    auth(),
    slotController.createSlots
);
//Get slots by station can remain public
SlotRouter.get(
    "/station/:stationId",
    slotController.listSlotByStation
);
SlotRouter.patch(
    "/:slotId/status",
    auth(),
    slotController.updateSlotsStatus
);

export default SlotRouter;