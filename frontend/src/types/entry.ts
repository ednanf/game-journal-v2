// src/types/entry.ts

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
