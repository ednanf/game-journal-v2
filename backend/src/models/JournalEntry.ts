import mongoose, { Schema, model, Document } from 'mongoose';

export interface IJournalEntry extends Document {
    _id: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    platform: string;
    status: 'started' | 'completed' | 'dropped' | 'revisited' | 'paused';
    playedAt: Date;
    rating?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const journalEntrySchema = new Schema<IJournalEntry>(
    {
        createdBy: {
            type: mongoose.Types.ObjectId,
            required: [true, 'User ID is required.'],
            ref: 'User',
        },
        title: {
            type: String,
            required: [true, 'Entry must contain a title.'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters.'],
        },
        platform: {
            type: String,
            required: [true, 'Please select a platform.'],
        },
        status: {
            type: String,
            required: [true, 'Please add a status.'],
            enum: ['started', 'completed', 'revisited', 'paused', 'dropped'],
            default: 'started',
        },
        playedAt: {
            type: Date,
            required: [true, 'Please select a date for this entry.'],
        },
        rating: {
            type: Number,
            min: [0, 'Rating cannot be less than 0.'],
            max: [10, 'Rating cannot be greater than 10.'],
            default: 5,
        },
        notes: {
            type: String,
            maxlength: [1000, 'Notes cannot exceed 1000 characters.'],
        },
    },
    { timestamps: true },
);

// Indexing to improve performance on frequent queries
journalEntrySchema.index({ createdBy: 1 });
journalEntrySchema.index({ createdAt: 1 });
journalEntrySchema.index({ status: 1 }); // This will be used for filtering by status
journalEntrySchema.index({ createdBy: 1, createdAt: 1, status: 1 }); // This will be used for the statistics tab

const JournalEntry =
          mongoose.models.JournalEntry ||
          model<IJournalEntry>('JournalEntry', journalEntrySchema);

export default JournalEntry;
