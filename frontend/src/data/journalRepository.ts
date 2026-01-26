import { dbPromise } from './db';
import type { OfflineJournalEntry } from './journalTypes';

export const journalRepository = {
    async getAll(): Promise<OfflineJournalEntry[]> {
        const db = await dbPromise;
        return db.getAll('entries');
    },

    async getById(id: string): Promise<OfflineJournalEntry | undefined> {
        const db = await dbPromise;
        return db.get('entries', id);
    },

    async upsert(entry: OfflineJournalEntry): Promise<void> {
        const db = await dbPromise;
        await db.put('entries', entry);
    },

    async delete(id: string): Promise<void> {
        const db = await dbPromise;
        await db.delete('entries', id);
    },
};
