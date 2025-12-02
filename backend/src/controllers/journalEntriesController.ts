import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import JournalEntry, { IJournalEntry } from '../models/JournalEntry.js';
import { AuthenticatedRequest } from '../types/express.js';
import {
    ApiResponse,
    CreateJournalEntrySuccess, FindJournalEntryByIdSuccess, JournalStatsSuccess,
} from '../types/api.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js';

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

const getJournalEntryById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req.user; // Validated by authentication middleware
    const entryId = req.params.id; // Validated by validateObjectId middleware

    try {
        const journalEntry = await JournalEntry.findOne({
            _id: entryId,
            createdBy: userId,
        });
        if (!journalEntry) {
            next(new NotFoundError('Journal entry not found.'));
            return;
        }

        const response: ApiResponse<FindJournalEntryByIdSuccess> = {
            status: 'success',
            data: {
                message: 'Journal entry found.',
                content: journalEntry,
            },
        };

        res.status(StatusCodes.OK)
           .json(response);
    } catch (e) {
        next(e);
    }
};

const getJournalEntriesStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Needs to cast userId to ObjectId for MongoDB queries
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    try {
        // Lifetime stats - count by all possible statuses
        const lifetimeStats = await JournalEntry.aggregate([
            { $match: { createdBy: userId } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Year-by-year stats - count by year + status
        const yearlyStats = await JournalEntry.aggregate([
            { $match: { createdBy: userId } },
            {
                $project: {
                    year: { $year: '$createdAt' },
                    status: 1,
                },
            },
            {
                $group: {
                    _id: { year: '$year', status: '$status' },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Format lifetime stats
        const lifetime: Record<string, number> = {};

        lifetimeStats.forEach((stat) => {
            lifetime[stat._id] = stat.count;
        });

        // Format yearly stats
        const byYear: Record<string, Record<string, number>> = {};

        yearlyStats.forEach((stat) => {
            const { year, status } = stat._id;

            if (!byYear[year]) byYear[year] = {};

            byYear[year][status] = stat.count;
        });

        const response: ApiResponse<JournalStatsSuccess> = {
            status: 'success',
            data: {
                message: 'Statistics retrieved successfully.',
                lifetime,
                byYear,
            },
        };

        res.status(StatusCodes.OK)
           .json(response);
    } catch (e) {
        next(e);
    }
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