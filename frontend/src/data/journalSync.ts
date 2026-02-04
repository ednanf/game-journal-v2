import type { AxiosError } from 'axios';
import { journalRepository } from './journalRepository';
import {
    deleteUnwrapped,
    patchUnwrapped,
    postUnwrapped,
} from '../utils/axiosInstance';
import { API_BASE_URL } from '../config/apiURL';

type SyncOptions = {
    force?: boolean;
};

// This stops multiple synchronizations happening at once
let syncInProgress = false;

export async function syncJournalEntries(options?: SyncOptions): Promise<void> {
    if (syncInProgress) {
        return;
    }

    syncInProgress = true;

    try {
        const force = options?.force === true;

        if (!navigator.onLine) {
            if (force) {
                throw new Error('Offline: cannot sync journal entries');
            }
            return;
        }

        const entries = await journalRepository.getAll();
        const unsynced = entries.filter((e) => !e.synced);

        for (const entry of unsynced) {
            /**
             * CASE 1: Local delete
             */
            if (entry.deleted) {
                // Never existed remotely
                if (!entry._id) {
                    await journalRepository.delete(entry.localId);
                    continue;
                }

                try {
                    await deleteUnwrapped(
                        `${API_BASE_URL}/entries/${entry._id}`,
                    );
                } catch (error) {
                    const axiosError = error as AxiosError;

                    // 404 = already deleted → success
                    if (axiosError.response?.status !== 404) {
                        console.warn(
                            'Delete sync failed, will retry later',
                            error,
                        );
                        return;
                    }
                }

                await journalRepository.delete(entry.localId);
                continue;
            }

            /**
             * CASE 2: New entry → POST
             */
            if (!entry._id) {
                try {
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
                } catch (error) {
                    console.warn('Create sync failed, will retry later', error);
                    return;
                }

                continue;
            }

            /**
             * CASE 3: Update → PATCH
             */
            try {
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
                console.warn('Update sync failed, will retry later', error);
                return;
            }
        }
    } finally {
        syncInProgress = false;
    }
}
