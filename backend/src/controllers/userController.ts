import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.js';
import User from '../models/User.js';
import { NotFoundError, UnauthenticatedError } from '../errors/index.js';
import {
    ApiResponse,
    UserDeleteSuccess,
    UserPatchBody,
    UserPatchSuccess,
    UserWhoAmISuccess,
} from '../types/api.js';
import { StatusCodes } from 'http-status-codes';
import JournalEntry from '../models/JournalEntry.js';

const whoAmI = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    // Extract the user from the incoming token (added to the request via middleware) - type AuthenticatedRequest instead of Request
    const { userId } = req.user;

    try {
        // Find the current logged-in user if there's one
        const currentUser = await User.findById(userId);

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

        res.status(StatusCodes.OK)
           .json(response);
    } catch (e) {
        next(e);
    }
};

const patchUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const { userId } = req.user;

    try {
        const updatePayload: UserPatchBody = req.body;

        // Only these fields can be changed
        const allowedFields: (keyof UserPatchBody)[] = ['email', 'password'];

        // Pick only allowed fields
        const filtered: Partial<UserPatchBody> = {};
        for (const key of allowedFields) {
            if (key in updatePayload) filtered[key] = updatePayload[key];
        }

        // Load the user with password enabled
        const user = await User.findById(userId)
                               .select('+password');
        if (!user) {
            next(new NotFoundError('User does not exist.'));
            return;
        }

        // Apply updates - pre-save hook will hash the password
        if (filtered.email !== undefined) user.email = filtered.email;
        if (filtered.password !== undefined) user.password = filtered.password;

        await user.save();

        const response: ApiResponse<UserPatchSuccess> = {
            status: 'success',
            data: {
                message: 'Account updated successfully.',
                id: user._id.toString(),
                email: user.email,
            },
        };

        res.status(StatusCodes.OK)
           .json(response);
    } catch (e) {
        next(e);
    }
};

const deleteUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const { userId } = req.user;

    try {
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            next(new NotFoundError('User was not found.'));
            return;
        }
        
        await Promise.all([
            JournalEntry.deleteMany({ createdBy: userId }),
            User.findByIdAndDelete(userId),
        ]);

        const response: ApiResponse<UserDeleteSuccess> = {
            status: 'success',
            data: {
                message: 'User deleted successfully.',
            },
        };

        res.status(StatusCodes.OK)
           .json(response);
    } catch (e) {
        next(e);
    }
};

export { whoAmI, patchUser, deleteUser };
