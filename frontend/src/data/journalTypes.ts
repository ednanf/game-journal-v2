import type { JournalEntry as DomainJournalEntry } from '../types/entry';

// New type used for a different concern - storing to Indexed DB - needs a key
// to keep track if it was synced or not
export type OfflineJournalEntry = DomainJournalEntry & {
    localId: string; // client-generated, always exists
    _id?: string; //present only after sync
    synced: boolean; // whether the backend knows it
};
