import { journalRepository } from './journalRepository';
import type { OfflineJournalEntry } from '../types/journalTypes';

export async function ensureLocalEntry(
    entry: OfflineJournalEntry,
): Promise<OfflineJournalEntry> {
    if (!entry._id) {
        throw new Error('ensureLocalEntry: entry is missing backend _id');
    }

    // 1. Load all local entries (Option 1: scan)
    // This only happens on explicit user interaction (click)
    const localEntries = await journalRepository.getAll();

    // 2. Try to find an existing local entry by backend _id
    const existing = localEntries.find((local) => local._id === entry._id);

    // Avoid duplicate creation by exiting early
    if (existing) {
        return existing;
    }

    // 3. Materialize a new local entry (full materialization)
    const localEntry: OfflineJournalEntry = {
        ...entry,
        localId: crypto.randomUUID(),
        synced: true,
        deleted: false,
    };

    // 4. Persist atomically
    await journalRepository.upsert(localEntry);

    return localEntry;
}
