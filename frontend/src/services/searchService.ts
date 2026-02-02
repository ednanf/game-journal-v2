import { getUnwrapped } from '../utils/axiosInstance';

import { journalRepository } from '../data/journalRepository.ts';

import type { OfflineJournalEntry } from '../types/journalTypes.ts';
import type { SearchQueryParams, SearchResult } from '../types/search';

export async function searchEntries(
    params: SearchQueryParams,
): Promise<SearchResult> {
    try {
        const urlParams = new URLSearchParams();

        urlParams.set('limit', String(params.limit));

        if (params.title) urlParams.set('title', params.title);
        if (params.platform) urlParams.set('platform', params.platform);
        if (params.status) urlParams.set('status', params.status);
        if (params.rating !== undefined)
            urlParams.set('rating', String(params.rating));
        if (params.startDate) urlParams.set('startDate', params.startDate);
        if (params.endDate) urlParams.set('endDate', params.endDate);
        if (params.cursor) urlParams.set('cursor', params.cursor);

        const response = await getUnwrapped<{
            entries: OfflineJournalEntry[];
            nextCursor: string | null;
        }>(`/entries?${urlParams.toString()}`);

        return {
            entries: response.entries,
            nextCursor: response.nextCursor,
            source: 'remote',
        };
    } catch {
        // Fallback when offline
        return localSearch(params);
    }
}

async function localSearch(params: SearchQueryParams): Promise<SearchResult> {
    // Grab all local entries
    const allEntries: OfflineJournalEntry[] = await journalRepository.getAll();

    // Filter
    const filtered = allEntries.filter((entry) => {
        if (entry.deleted) return false;

        if (params.title) {
            // normalize text
            const titleMatch = entry.title
                .toLowerCase()
                .includes(params.title.toLowerCase());

            if (!titleMatch) return false;
        }

        if (params.platform && entry.platform !== params.platform) {
            return false;
        }

        if (params.status && entry.status !== params.status) {
            return false;
        }

        if (params.rating !== undefined && entry.rating !== params.rating) {
            return false;
        }

        if (params.startDate) {
            if (new Date(entry.entryDate) < new Date(params.startDate)) {
                return false;
            }
        }

        if (params.endDate) {
            if (new Date(entry.entryDate) > new Date(params.endDate)) {
                return false;
            }
        }

        return true;
    });

    // Sort
    const sorted = filtered.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Offline pagination offset if cursor exists
    const offset = params.cursor ? Number(params.cursor) : 0;

    const paginated = sorted.slice(offset, offset + params.limit);

    const nextOffset =
        offset + params.limit < sorted.length
            ? String(offset + params.limit)
            : null;

    return {
        entries: paginated,
        nextCursor: nextOffset,
        source: 'local',
    };
}
