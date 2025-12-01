import { z } from 'zod';
import {
    userLoginSchema,
    userPatchSchema,
    userRegisterSchema,
} from '../zodSchemas/user.js';
import { IJournalEntry } from '../models/JournalEntry.js';

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

export type UserLoginBody = z.infer<typeof userLoginSchema>;

export interface UserBase {
    message: string;
    email: string;
}

export interface UserRegistrationSuccess extends UserBase {
    id: string;
    token: string;
}

export type UserLoginSuccess = UserRegistrationSuccess;

export interface UserLogoutSuccess {
    message: string;
}

// User types

export interface UserWhoAmISuccess extends UserBase {
    id: string;
}

export type UserPatchBody = z.infer<typeof userPatchSchema>;

export interface UserPatchSuccess extends UserBase {
    id: string;
}

export interface UserDeleteSuccess {
    message: string;
}

// Journal entry types
export interface JournalEntryBase {
    message: string;
}

export interface CreateJournalEntrySuccess extends JournalEntryBase {
    content: IJournalEntry;
}

export interface FindJournalEntryByIdSuccess extends JournalEntryBase {
    content: IJournalEntry;
}