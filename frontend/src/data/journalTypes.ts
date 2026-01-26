import type { JournalEntry as DomainJournalEntry } from '../types/entry';

// New type used for a different concern - storing to Indexed DB - needs a key
// to keep track if it was synced or not
export type OfflineJournalEntry = DomainJournalEntry & {
    synced: boolean;
};
