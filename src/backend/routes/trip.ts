import {Request, Response} from "express";
import router from "./auth";
import {returnError, returnSuccess} from "../functions/responseBuilder";
import {UserController} from "../controllers/userController";
import {pool} from "../config/database";
import {TripController} from "../controllers/TripController";


const userController = new UserController(pool);
const tripController = new TripController(pool);
router.post('/create-trip', async (req: Request, res: Response) => {
    const {token, name} = req.body;
    if (!token) {
        return res.status(400).send(returnError('Token is required'));
    }
    try {
        const result = await userController.getUserByToken(token);
        if (result) {
            const {USER_ID} = result;
            const trips = await tripController.createTrip(name, USER_ID);
            if (trips) {
                res.status(200).send(returnSuccess(trips));
            } else {
                res.status(500).send(returnError('Error during registration'));
            }
        } else {
            res.status(401).send(returnError('Invalid credentials'));
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(returnError('Internal server error'));
    }
})
router.post('/insert-check', async (req: Request, res: Response) => {
    const {token, checksum, goods, tripId} = req.body;

    if (!token) {
        return res.status(400).send(returnError('Token is required'));
    }
    try {
        const result = await userController.getUserByToken(token);
        if (result) {
            const {USER_ID} = result;
            const trips = await tripController.insertCheckInTrip(tripId, USER_ID, checksum, goods);
            console.log(trips)
            if (trips) {
                res.status(200).send(returnSuccess(trips));
            } else {
                res.status(500).send(returnError('Error during registration'));
            }
        } else {
            res.status(401).send(returnError('Invalid credentials'));
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(returnError('Internal server error'));
    }
})

export default router
