export type StatusType =
    | 'started'
    | 'completed'
    | 'paused'
    | 'dropped'
    | 'revisited';

export type EntryFormData = {
    title: string;
    platform: string;
    status: StatusType;
    rating: number;
    entryDate: Date | null;
};

export type EntryFormErrors = Partial<
    Record<keyof Omit<EntryFormData, 'rating'>, string>
>;
