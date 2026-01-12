export type StatusType =
    | 'started'
    | 'completed'
    | 'paused'
    | 'dropped'
    | 'revisited';

export type JournalEntry = {
    _id: string;
    createdBy: string;
    title: string;
    entryDate: string; // needs to be converted to ISO as shown above
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
