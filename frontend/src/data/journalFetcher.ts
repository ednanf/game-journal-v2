import { journalRepository } from './journalRepository';
import type { OfflineJournalEntry } from './journalTypes';
import { getUnwrappedWithParams } from '../utils/axiosInstance';
import { API_BASE_URL } from '../config/apiURL';
import type { PaginatedResponse } from '../types/entry';

export async function fetchNextJournalPage(
    cursor: string | null,
): Promise<{ nextCursor: string | null }> {
    const response = await getUnwrappedWithParams<PaginatedResponse>(
        `${API_BASE_URL}/entries`,
        cursor ? { cursor } : undefined,
    );

    // Normalize entry by adding local properties
    const normalized: OfflineJournalEntry[] = response.entries.map((entry) => ({
        localId: entry._id, // REQUIRED - primary identity
        _id: entry._id, // backend id - secondary identity
        createdBy: entry.createdBy,
        title: entry.title,
        platform: entry.platform,
        status: entry.status,
        entryDate: entry.entryDate,
        rating: entry.rating ?? null,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        synced: true, // REQUIRED
        deleted: false, // REQUIRED
    }));

    // Add remote entries to Indexed DB
    for (const entry of normalized) {
        const allEntries = await journalRepository.getAll();

        const alreadyExists = allEntries.find((e) => e._id === entry._id);

        if (alreadyExists) {
            // Entry already exists locally (likely promoted by sync)
            continue;
        }

        await journalRepository.upsert(entry);
    }

    return { nextCursor: response.nextCursor };
}
