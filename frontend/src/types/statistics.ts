export type StatusCounts = {
    completed: number;
    started: number;
    paused: number;
    revisited: number;
    dropped: number;
};

export type Statistics = {
    lifetime: StatusCounts;
    byYear: Record<string, StatusCounts>;
};
