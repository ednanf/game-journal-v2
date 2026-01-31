import type { StatusType } from './entry.ts';

export type JournalEntryBase = {
    createdBy: string;
    title: string;
    entryDate: string;
    platform: string;
    status: StatusType;
    rating: number | null;
    createdAt: string;
    updatedAt: string;
};

// New type used for a different concern - storing to Indexed DB - needs a key
// to keep track if it was synced or not
export type OfflineJournalEntry = JournalEntryBase & {
    localId: string; // client-generated identity
    _id?: string; // backend identity (added after sync)
    synced: boolean;
    deleted?: boolean;
};

export type SyncedJournalEntry = OfflineJournalEntry & {
    _id: string;
    synced: true;
};
