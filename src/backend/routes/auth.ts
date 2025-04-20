import express from "express";
import {pool} from "../config/database";
import {UserController} from "../controllers/userController";
import {returnError, returnSuccess} from "../functions/responseBuilder";
import { Request, Response, Router } from 'express';

const router = express.Router();
const userController = new UserController(pool);

router.post('/sign-up', async (req: Request, res: Response) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).send(returnError('Login and password are required'));
    }

    try {
        const isUserExist = await userController.checkIfUserExistByLogin(login);
        if (isUserExist) return res.status(400).send(returnError('User already exist'));

        const result = await userController.registration(login, password);
        if (result) {
            res.send(returnSuccess({ token: result }));
        } else {
            res.status(500).send(returnError('Error during registration'));
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(returnError('Internal server error'));
    }
});


router.post('/login', async (req: Request, res: Response) => {
    const { login, password } = req.body;
    console.log(login, password)

    if (!login || !password) {
        return res.status(400).send(returnError('Login and password are required'));
    }

    try {
        const result = await userController.login(login, password);
        if (result) {
            res.send(returnSuccess({ token: result }));
        } else {
            res.status(401).send(returnError('Invalid credentials'));
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(returnError('Internal server error'));
    }
});


export default router
