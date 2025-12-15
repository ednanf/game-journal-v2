import { z } from 'zod';

const createJournalEntryBodySchema = z
    .object({
        title: z
            .string({ message: 'Title must be a string.' })
            .trim()
            .min(1, { message: 'Title is required and cannot be empty.' })
            .max(100, { message: 'Title cannot exceed 100 characters.' }),

        platform: z
            .string({ message: 'Title must be a string' })
            .trim()
            .min(1, { message: 'Platform cannot be empty.' }),

        status: z.enum([
            'started',
            'completed',
            'revisited',
            'paused',
            'dropped',
        ]),

        rating: z
            .number()
            .min(0, { message: 'Minimum value cannot be lower than 0.' })
            .max(10, { message: 'Maximum value cannot be higher than 10' })
            .optional(),

        notes: z
            .string({ message: 'Notes must be a string.' })
            .trim()
            .max(1000, { message: 'Notes cannot exceed 1000 characters.' })
            .optional(),

        entryDate: z.iso.datetime({
            message: 'Date must be a valid ISO datetime string.',
        }),
    })
    .strict();

const patchJournalEntryBodySchema = createJournalEntryBodySchema
    .partial()
    .strict();

export { createJournalEntryBodySchema, patchJournalEntryBodySchema };
