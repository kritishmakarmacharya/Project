import { Router } from "express";
import auth from "../../middlewares/AuthMiddleware";
import bodyValidator from "../../middlewares/BodyValidatorMiddleware";
import ChargingStationController from "./station.controller";
import { stationCreateDTO } from "./station.dto";
import allowRoles from "../../middlewares/RoleMiddleware";

const stationCtrl = new ChargingStationController();
const ChargingStationRouter =Router();

ChargingStationRouter.post(
    "/addStation",
    auth(),
    allowRoles("owner", "admin"),
    bodyValidator(stationCreateDTO),
    stationCtrl.addStation,
)
ChargingStationRouter.get("/nearby",stationCtrl.nearbyStatios);
ChargingStationRouter.get("/", stationCtrl.listAllStations);

export default ChargingStationRouter;