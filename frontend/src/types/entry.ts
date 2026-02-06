export type StatusType =
    | 'started'
    | 'completed'
    | 'paused'
    | 'dropped'
    | 'revisited';

export type JournalEntry = {
    _id: string; // backend-only identity
    createdBy: string;
    title: string;
    entryDate: string;
    platform: string;
    status: StatusType;
    rating: number | null;
    createdAt: string;
    updatedAt: string;
};

export type PaginatedResponse = {
    message: string;
    entries: JournalEntry[];
    nextCursor: string | null;
};
