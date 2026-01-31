import { getUnwrapped } from '../utils/axiosInstance';

import type { OfflineJournalEntry } from '../types/journalTypes.ts';
import type { SearchQueryParams, SearchResult } from '../types/search';

export async function searchEntries(
    params: SearchQueryParams,
): Promise<SearchResult> {
    const urlParams = new URLSearchParams();

    // Required
    urlParams.set('limit', String(params.limit));

    // Optional filters
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
}
