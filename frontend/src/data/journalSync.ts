import { journalRepository } from './journalRepository';

import {
    postUnwrapped,
    patchUnwrapped,
    deleteUnwrapped,
} from '../utils/axiosInstance';
import { API_BASE_URL } from '../config/apiURL';

type SyncOptions = {
    force?: boolean;
};

/**
 * Sync local IndexedDB journal entries to the backend.
 *
 * - Default behavior: best-effort (silent failure, retry later)
 * - force = true: must succeed or throw (used on logout)
 */
export async function syncJournalEntries(options?: SyncOptions): Promise<void> {
    const force = options?.force === true;

    // If offline
    if (!navigator.onLine) {
        if (force) {
            throw new Error('Offline: cannot sync journal entries');
        }
        return;
    }

    // Read from IndexedDB
    const entries = await journalRepository.getAll();

    // Only entries that need syncing
    const unsynced = entries.filter((e) => !e.synced);

    if (unsynced.length === 0) {
        return;
    }

    for (const entry of unsynced) {
        try {
            /**
             * Case 1: Entry was deleted locally AND already existed remotely
             */
            if (entry.deleted && entry._id) {
                await deleteUnwrapped(`${API_BASE_URL}/entries/${entry._id}`);

                // Remove locally after confirmed remote delete
                await journalRepository.delete(entry.localId);
                continue;
            }

            /**
             * Case 2: New local entry → POST
             */
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

                await journalRepository.upsert({
                    ...entry,
                    _id: response.content._id,
                    synced: true,
                });

                continue;
            }

            /**
             * Case 3: Existing remote entry → PATCH
             */
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

            await journalRepository.upsert({
                ...entry,
                synced: true,
            });
        } catch (error) {
            if (force) {
                // 🔥 Logout path: do NOT swallow errors
                throw error;
            }

            // Background sync: stop early, retry later
            console.warn('Sync failed, will retry later', error);
            return;
        }
    }
}
