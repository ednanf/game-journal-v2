import { journalRepository } from './journalRepository';
import type { OfflineJournalEntry } from './journalTypes';
import {
    postUnwrapped,
    patchUnwrapped,
    deleteUnwrapped,
} from '../utils/axiosInstance';
import { API_BASE_URL } from '../config/apiURL';

export async function syncJournalEntries(): Promise<void> {
    // Don’t even try if offline
    if (!navigator.onLine) return;

    // Grab entries from Indexed DB
    const entries = await journalRepository.getAll();

    // Filter entries that are not synced
    const unsynced = entries.filter((e) => !e.synced);

    // Loop through unsynced entries to either POST or PATCH according to the
    // presence of mongoDB's _id
    for (const entry of unsynced) {
        try {
            // If entry is marked as deleted and was synced (_id exists)
            if (entry.deleted && entry._id) {
                await deleteUnwrapped(`${API_BASE_URL}/entries/${entry._id}`);
                await journalRepository.delete(entry.localId);
                continue;
            }

            // If it's an entry with no _id → POST
            if (!entry._id) {
                const payload: Record<string, unknown> = {
                    title: entry.title,
                    platform: entry.platform,
                    status: entry.status,
                    entryDate: entry.entryDate,
                };

                if (entry.rating !== null) {
                    payload.rating = entry.rating;
                }

                const response = await postUnwrapped<{
                    content: { _id: string };
                }>(`${API_BASE_URL}/entries`, payload);

                // Set synced to true and add mongoDB's _id
                const syncedEntry: OfflineJournalEntry = {
                    ...entry,
                    _id: response.content._id,
                    synced: true,
                };

                // Insert into Indexed DB
                await journalRepository.upsert(syncedEntry);
            }

            // If it's an entry with _id → PATCH
            else {
                const payload: Record<string, unknown> = {
                    title: entry.title,
                    platform: entry.platform,
                    status: entry.status,
                    entryDate: entry.entryDate,
                };

                if (entry.rating !== null) {
                    payload.rating = entry.rating;
                }

                await patchUnwrapped(
                    `${API_BASE_URL}/entries/${entry._id}`,
                    payload,
                );

                // Set synced to true
                await journalRepository.upsert({
                    ...entry,
                    synced: true,
                });
            }
        } catch (e) {
            // Stop syncing on first failure
            // Remaining entries will retry later
            console.warn('Sync failed, will retry later', e);
            return;
        }
    }
}
