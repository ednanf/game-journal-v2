import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import JournalEntry, { IJournalEntry } from '../models/JournalEntry.js';
import { AuthenticatedRequest } from '../types/express.js';
import {
    ApiResponse,
    CreateJournalEntrySuccess,
    DeleteJournalEntrySuccess,
    FindJournalEntryByIdSuccess,
    JournalEntryPatchBody,
    JournalStatsSuccess,
    PatchJournalEntrySuccess,
} from '../types/api.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors/index.js';

const getJournalEntries = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const { userId } = req.user; // Validated by authentication middleware

    try {
        // Extract query parameters
        const {
            limit: queryLimit,
            cursor,
            title,
            status,
            rating,
            platform,
            startDate,
            endDate,
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

        // Date range filtering based on entryDate (ISO instants)
        const entryDateFilter: Record<string, Date> = {};

        // startDate is the earliest moment in the timeline
        if (typeof startDate === 'string') {
            const parsedStartDate = new Date(startDate);
            if (!Number.isNaN(parsedStartDate.getTime())) {
                entryDateFilter.$gte = parsedStartDate;
            }
        }

        // endDate is a later moment in the timeline
        if (typeof endDate === 'string') {
            const parsedEndDate = new Date(endDate);
            if (!Number.isNaN(parsedEndDate.getTime())) {
                entryDateFilter.$lte = parsedEndDate;
            }
        }

        // Cursor pagination based on entryDate (chronological order)
        if (cursor && typeof cursor === 'string') {
            const cursorDate = new Date(cursor);
            if (!Number.isNaN(cursorDate.getTime())) {
                entryDateFilter.$lt = cursorDate;
            }
        }

        // Apply entryDate filters if any exist
        if (Object.keys(entryDateFilter).length > 0) {
            query.entryDate = entryDateFilter;
        }

        // Fetch one extra doc to detect next page
        const entries = await JournalEntry.find(query)
            .sort({ entryDate: -1, _id: -1 }) // stable, chronological sorting
            .limit(limit + 1)
            .lean();

        const hasNextPage = entries.length > limit;
        if (hasNextPage) entries.pop();

        const nextCursor = hasNextPage
            ? entries[entries.length - 1].entryDate.toISOString()
            : null;

        res.status(200).json({
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

const getJournalEntryById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
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

        res.status(StatusCodes.OK).json(response);
    } catch (e) {
        next(e);
    }
};

const getJournalEntriesStatistics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
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
                    year: { $year: '$entryDate' },
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

        res.status(StatusCodes.OK).json(response);
    } catch (e) {
        next(e);
    }
};

const createJournalEntry = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const { userId } = req.user; // Validated by authentication middleware

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

        res.status(StatusCodes.CREATED).json(response);
    } catch (e) {
        next(e);
    }
};

const patchJournalEntry = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const { userId } = req.user; // Validated by authentication middleware
    const entryId = req.params.id; // Validated by validateObjectId middleware
    const updatePayload: JournalEntryPatchBody = req.body; // Validated by Zod

    // Ensure only these fields are acceptable
    const allowedFields: (keyof JournalEntryPatchBody)[] = [
        'title',
        'platform',
        'status',
        'rating',
        'notes',
        'entryDate',
    ];

    try {
        // Create a safe payload to loop through
        const safeUpdatePayload: Partial<JournalEntryPatchBody> = {};

        // Grab the entry to be updated, if it exists
        const existingEntry = await JournalEntry.findOne({
            _id: entryId,
            createdBy: userId,
        });

        if (!existingEntry) {
            next(new NotFoundError('Journal entry was not found.'));
            return;
        }

        // Necessary to avoid having an entry with status updated to something
        // that's not completed, and still maintain a rating
        const nextStatus = updatePayload.status ?? existingEntry.status;
        const nextRating = updatePayload.rating ?? existingEntry.rating;

        if (nextStatus !== 'completed' && nextRating !== undefined) {
            next(
                new BadRequestError(
                    'Rating is only allowed when status is completed.',
                ),
            );
            return;
        }

        if (nextStatus === 'completed' && nextRating === undefined) {
            next(
                new BadRequestError(
                    'Rating is required when status is completed.',
                ),
            );
            return;
        }

        // Add only allowed properties to safeUpdatePayload
        for (const key of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(updatePayload, key)) {
                // @ts-expect-error - already validated by Zod
                safeUpdatePayload[key] = updatePayload[key];
            }
        }

        // If update payload does not contain any valid value
        if (Object.keys(safeUpdatePayload).length === 0) {
            next(new BadRequestError('No valid update data provided.'));
            return;
        }

        // Update entry in the DB
        const patchedJournalEntry = await JournalEntry.findOneAndUpdate(
            {
                _id: entryId,
                createdBy: userId,
            },
            safeUpdatePayload,
            { new: true, runValidators: true },
        );

        if (!patchedJournalEntry) {
            next(new NotFoundError('Journal entry was not found.'));
            return;
        }

        const response: ApiResponse<PatchJournalEntrySuccess> = {
            status: 'success',
            data: {
                message: 'Journal entry updated.',
                journalEntry: patchedJournalEntry,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (e) {
        next(e);
    }
};

const deleteJournalEntry = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const { userId } = req.user; // Validated by authentication middleware
    const entryId = req.params.id; // Validated by validateObjectId middleware

    try {
        const deletedJournalEntry = await JournalEntry.findByIdAndDelete({
            _id: entryId,
            createdBy: userId,
        });

        if (!deletedJournalEntry) {
            next(new NotFoundError('No journal entry found.'));
            return;
        }

        const response: ApiResponse<DeleteJournalEntrySuccess> = {
            status: 'success',
            data: {
                message: 'Deleted successfully.',
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (e) {
        next(e);
    }
};

export default {
    getJournalEntries,
    getJournalEntryById,
    getJournalEntriesStatistics,
    createJournalEntry,
    patchJournalEntry,
    deleteJournalEntry,
};
