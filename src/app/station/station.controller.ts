import { type Request, type Response, type NextFunction } from "express";
import ChargingStationModel from "./station.model";

type filterType = 
  | string 
  | Array<Record<string, string | RegExp>>
  | Record<string, string>
  |  RegExp;  
export default class ChargingStationController {
    async addStation(req: Request, res: Response, next: NextFunction) {
        try{
            const data = req.body;

            //Get owner from the logged-in user
            data.owner = req.loggedInUser?._id;
            data.createdBy = req.loggedInUser?._id;

            // set default status
            data.status = "active";

            //create loaction
            data.location = {
                type: "Point",
                coordinates: [
                    data.longitude,
                    data.latitude,
                ],
            };

            // Initilize available slots
            data.availableSlots = data.totalSlots;

            //create satation
            const station = new ChargingStationModel(data);
            await station.save();

            res.status(200).json({
                data: station,
                message: "Charging station created successfully...",
                meta: null,
            })
        } catch (exception) {
            next(exception);
        }
    }
    async listAllStations(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            let filter: Record<string, filterType> = {
                status: "active",
            };
            //search stations
            if (req.query.search) {
                const search = req.query.search as string;
                filter = {
                    ...filter,
                    $or: [
                        {name: new RegExp(search, "i")},
                        {address: new RegExp(search, "i")},
                        {description: new RegExp(search, "i")},
                        {chargerType: new RegExp(search, "i")},
                    ]
                }
            }
            //pagination
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 20);

            const skip = (page - 1) * limit;

            const stations = await ChargingStationModel.find(filter)
            .populate("owner", ["_id", "name", "email", "role"])
            .sort({ createdAt: "desc"})
            .skip(skip)
            .limit(limit);
            const count =await ChargingStationModel.countDocuments(filter);

           //Send Response
            res.status(200).json({
                data: stations,
                message: "Charging stations list",
                meta: {
                    pagination:{
                        page:page,
                        limit:limit,
                        count:count,
                        pages:Math.ceil(count/limit),
                    },
                },
            });
        } catch(exception){
            next(exception)
        }
        
    }
    async nearbyStatios(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try{
            // Get customer coordinates
            const latitude = Number(req.query.latitude);
            const longitude = Number(req.query.longitude);
            const maxDistance = Number(req.query.maxDistance) || 5000;

            //Validate coordinates
            if(
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {
                return res.status(400).json({
                    data: null,
                    message: "Invalid latitude or longitude",
                    meta: null,                    
                });
            }
            if (maxDistance <= 0 || maxDistance > 5000) {
                return res.status(400).json({
                    data: null,
                    message: "Maximum distance must be between 1 and 5000 meters",
                    meta: null,
                });
            }
            //Find nearby active charging stations
            const stations = await ChargingStationModel.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [longitude, latitude],
                        },
                        key: "location",
                        distanceField: "distance",
                        maxDistance: maxDistance,
                        spherical: true,
                        query: {
                            status: "active",
                        },
                    },
                },
            ]);
            res.status(200).json({
                data: stations,
                message: "Nearby chargig stations fetched succesfully",
                meta: {
                    count: stations.length,
                    maxDistance,
                },
            });
        } catch (exception) {
            next(exception);
        }
    }
}