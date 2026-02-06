import type { StatusType } from './entry.ts';
import type { OfflineJournalEntry } from './journalTypes.ts';

export type DateField = 'startDate' | 'endDate';

// Used by the UI layer
export type SearchFormData = {
    title: string;
    platform: string | null;
    status: StatusType | null;
    rating: number | null;
    startDate: Date | null; // earliest date
    endDate: Date | null; // latest date
};

export type SearchFormErrors = Partial<
    Record<keyof Omit<SearchFormData, 'rating'>, string>
>;

// Used by the service layer (normalized, backend-ready)
export type SearchQueryParams = {
    title?: string;
    platform?: string;
    status?: StatusType;
    rating?: number;
    startDate?: string; // ISO string
    endDate?: string; // ISO string
    cursor?: string;
    limit: number;
};

export type SearchResult = {
    entries: OfflineJournalEntry[];
    nextCursor: string | null;
    source: 'remote' | 'local';
};
