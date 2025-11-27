import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import comparePasswords from '../utils/comparePasswords.js';
import User, { IUserDocument } from '../models/User.js';
import { UnauthenticatedError, UnauthorizedError } from '../errors/index.js';
import {
    ApiResponse,
    UserLoginBody,
    UserLoginSuccess,
    UserLogoutSuccess,
    UserRegistrationBody,
    UserRegistrationSuccess,
    UserWhoAmISuccess,
} from '../types/api.js';
import { AuthenticatedRequest } from '../types/express.js';

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

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: UserLoginBody = req.body; // Validated with zod

    try {
        // Search for the user in the DB, and include the hashed password in the returned value
        const candidateUser = await User.findOne<IUserDocument>({
            email,
        }).select('+password');

        if (!candidateUser) {
            next(
                new UnauthorizedError(
                    'There is an issue with your email or password. Please try again.',
                ),
            );
            return;
        }

        // Verify if the password is valid
        const isPasswordValid = await comparePasswords(
            password,
            candidateUser.password,
        );

        if (!isPasswordValid) {
            next(
                new UnauthorizedError(
                    'There is an issue with your email or password. Please try again.',
                ),
            );
            return;
        }

        // Generate a new token to be sent
        const token = await candidateUser.createJWT();

        const response: ApiResponse<UserLoginSuccess> = {
            status: 'success',
            data: {
                message: 'Login successful. Welcome back!',
                id: candidateUser._id.toString(),
                email: candidateUser.email,
                token: token,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (e) {
        next(e);
    }
};

const logoutUser = (req: Request, res: Response, next: NextFunction) => {
    const response: ApiResponse<UserLogoutSuccess> = {
        status: 'success',
        data: {
            message: 'Good Bye!',
        },
    };

    res.status(StatusCodes.OK).json(response);
};

const me = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    // Extract the user from the incoming token (added to the request via middleware) - type AuthenticatedRequest instead of Request
    const { userId } = req.user;

    try {
        // Find the current logged-in user if there's one
        const currentUser: IUserDocument | null = await User.findById(userId);

        if (!currentUser) {
            next(new UnauthenticatedError('User is not authenticated.'));
            return;
        }

        const response: ApiResponse<UserWhoAmISuccess> = {
            status: 'success',
            data: {
                message: 'User retrieved successfully.',
                id: currentUser._id.toString(),
                email: currentUser.email,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (e) {
        next(e);
    }
};

export { registerUser, loginUser, logoutUser, me };
