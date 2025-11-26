import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
    ApiResponse,
    UserRegistrationBody,
    UserRegistrationSuccess,
} from '../types/api.js';
import User, { IUserDocument } from '../models/User.js';

const registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { email, password }: UserRegistrationBody = req.body; // Validated with zod

    try {
        // Create new user in the DB
        const newUser: IUserDocument = await User.create({
            email,
            password,
        });

        // Generate a new token to be sent
        const token = await newUser.createJWT();

        // Generate the response
        const response: ApiResponse<UserRegistrationSuccess> = {
            status: 'success',
            data: {
                message: 'Account created. Welcome aboard!',
                id: newUser._id.toString(),
                email: newUser.email,
                token: token,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (e) {
        next(e);
    }
};

const loginUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'login route hit' });
};

const logoutUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'logout route hit' });
};

const me = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'me route hit' });
};

export { registerUser, loginUser, logoutUser, me };
