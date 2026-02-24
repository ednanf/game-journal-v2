import { journalRepository } from './journalRepository';
import type { OfflineJournalEntry } from '../types/journalTypes.ts';
import { getUnwrappedWithParams } from '../utils/axiosInstance';
import { API_BASE_URL } from '../config/apiURL';
import type { PaginatedResponse } from '../types/entry';

export async function fetchNextJournalPage(
    cursor: string | null,
): Promise<{ nextCursor: string | null; entries: OfflineJournalEntry[] }> {
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
        rating: entry.rating ?? undefined,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        synced: true, // REQUIRED
        deleted: false, // REQUIRED
    }));

    // Add remote entries to Indexed DB
    await Promise.all(
        normalized.map((entry) => journalRepository.upsert(entry)),
    );

    return { nextCursor: response.nextCursor, entries: normalized };
}
