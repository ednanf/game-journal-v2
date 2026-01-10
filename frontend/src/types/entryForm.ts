import type { StatusType } from './entry.ts';

export type EntryFormData = {
    title: string;
    platform: string | null;
    status: StatusType | null;
    rating: number | null;
    entryDate: Date | null;
};

export type EntryFormErrors = Partial<
    Record<keyof Omit<EntryFormData, 'rating'>, string>
>;
