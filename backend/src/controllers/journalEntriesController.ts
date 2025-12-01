import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import JournalEntry, { IJournalEntry } from '../models/JournalEntry.js';
import { AuthenticatedRequest } from '../types/express.js';
import {
    ApiResponse,
    CreateJournalEntrySuccess,
} from '../types/api.js';
import { StatusCodes } from 'http-status-codes';

const getJournalEntries = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const { userId } = req.user; // Ensured to exist by middleware

    try {

        // Extract query parameters
        const {
                  limit: queryLimit,
                  cursor,
                  title,
                  status,
                  rating,
                  platform,
              } = req.query;

        // How many entries should be fetched for pagination
        const limit = parseInt(queryLimit as string, 10) || 20;

        // Base query: only entries created by the authenticated user
        const query: Record<string, unknown> = {
            createdBy: new mongoose.Types.ObjectId(userId),
        };

        // Optional filters

        // Status and platform are not typed, no need for regex
        if (typeof status === 'string') {
            query.status = status;
        }

        if (typeof platform === 'string') {
            query.platform = platform;
        }

        // Search for partial titles too
        if (typeof title === 'string') {
            query.title = { $regex: new RegExp(title, 'i') };
        }

        // Search for rating and parse it
        if (typeof rating === 'string') {
            const parsedRating = parseInt(rating, 10);
            if (!Number.isNaN(parsedRating)) {
                query.rating = parsedRating;
            }
        }

        // Cursor pagination
        if (cursor && typeof cursor === 'string') {
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        // Fetch one extra doc to detect next page
        const entries = await JournalEntry.find(query)
                                          .sort({ _id: -1 })
                                          .limit(limit + 1)
                                          .lean();

        const hasNextPage = entries.length > limit;
        if (hasNextPage) entries.pop();

        const nextCursor = hasNextPage
            ? entries[entries.length - 1]._id.toString()
            : null;

        res.status(200)
           .json({
               status: 'success',
               data: {
                   entries,
                   nextCursor,
               },
           });
    } catch (err) {
        next(err);
    }
};

const getJournalEntryById = (req: Request, res: Response, next: NextFunction) => {
    res.status(200)
       .json({ message: 'get journal entry by id hit' });
};

const getJournalEntriesStatistics = (req: Request, res: Response, next: NextFunction) => {
    res.status(200)
       .json({ message: 'get statistics hit' });
};

const createJournalEntry = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req.user;

    try {
        const journalEntryContent = req.body; // Validated by Zod

        const newJournalEntry: IJournalEntry = await new JournalEntry({
            createdBy: userId,
            ...journalEntryContent,
        }).save();

        const response: ApiResponse<CreateJournalEntrySuccess> = {
            status: 'success',
            data: {
                message: 'New journal entry created.',
                content: newJournalEntry,
            },
        };

        res.status(StatusCodes.OK)
           .json(response);
    } catch (e) {
        next(e);
    }
};

const patchJournalEntry = (req: Request, res: Response, next: NextFunction) => {
    res.status(200)
       .json({ message: 'update entry hit' });
};

const deleteJournalEntry = (req: Request, res: Response, next: NextFunction) => {
    res.status(200)
       .json({ message: 'delete hit' });
};

export default {
    getJournalEntries,
    getJournalEntryById,
    getJournalEntriesStatistics,
    createJournalEntry,
    patchJournalEntry,
    deleteJournalEntry,
};