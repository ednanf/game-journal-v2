import type { StatusType } from './entryForm.ts';

export type DateField = 'startDate' | 'endDate';

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
