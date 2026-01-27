import { dbPromise } from './db';
import type { OfflineJournalEntry } from './journalTypes';

/**
 * Normalize entries before writing to IndexedDB.
 * This makes impossible to have entries in the local database without these
 * fields. Even if they were remotely fetched without them.
 */
function normalizeEntry(entry: OfflineJournalEntry): OfflineJournalEntry {
    return {
        ...entry,
        localId: entry.localId,
        synced: entry.synced ?? false,
        deleted: entry.deleted ?? false,
    };
}

export const journalRepository = {
    async getAll(): Promise<OfflineJournalEntry[]> {
        const db = await dbPromise;
        return db.getAll('entries');
    },

    async getById(localId: string): Promise<OfflineJournalEntry | undefined> {
        const db = await dbPromise;
        return db.get('entries', localId);
    },

    async upsert(entry: OfflineJournalEntry): Promise<void> {
        const db = await dbPromise;
        const normalized = normalizeEntry(entry);
        await db.put('entries', normalized);
    },

    async delete(localId: string): Promise<void> {
        const db = await dbPromise;
        await db.delete('entries', localId);
    },
};
