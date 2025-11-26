import { z } from 'zod';
import { userRegisterSchema } from '../zodSchemas/user.js';
// Generic types
export interface ApiResponse<T = never> {
    status: 'success' | 'error';
    data: T;
}

export interface ApiError {
    message: string;
}

export interface MongoDatabaseError {
    code: number;
    message: string;
}

// Authentication types

export type UserRegistrationBody = z.infer<typeof userRegisterSchema>;

export interface UserBase {
    message: string;
    email: string;
}

export interface UserRegistrationSuccess extends UserBase {
    id: string;
    token: string;
}
