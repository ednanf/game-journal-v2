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
    const existingEntries = await journalRepository.getAll();

    // Remote data must never override:
    // localId, deleted, synced (when false)
    const normalized: OfflineJournalEntry[] = response.entries.map((entry) => {
        // Avoid duplication
        const existing = existingEntries.find(
            (local) => local._id === entry._id,
        );

        return {
            localId: existing ? existing.localId : entry._id, // Avoid duplication
            _id: entry._id,
            createdBy: entry.createdBy,
            title: entry.title,
            platform: entry.platform,
            status: entry.status,
            entryDate: entry.entryDate,
            rating: entry.rating ?? undefined,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            synced: true,
            deleted: existing ? existing.deleted : false, // Preserve local deleted if exists
        };
    });

    // Add remote entries to Indexed DB
    await Promise.all(
        normalized.map((entry) => journalRepository.upsert(entry)),
    );

    return { nextCursor: response.nextCursor, entries: normalized };
}
