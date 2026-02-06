import { getUnwrapped } from '../utils/axiosInstance';
import { journalRepository } from '../data/journalRepository';

import type { Statistics, StatusCounts } from '../types/statistics';

export async function getStatistics(): Promise<Statistics> {
    // If offline, skip backend entirely (avoid SW cache)
    if (!navigator.onLine) {
        return computeLocalStatistics();
    }

    try {
        return await getUnwrapped<Statistics>('/entries/statistics');
    } catch {
        return computeLocalStatistics();
    }
}

const emptyCounts = (): StatusCounts => ({
    completed: 0,
    started: 0,
    paused: 0,
    revisited: 0,
    dropped: 0,
});

async function computeLocalStatistics(): Promise<Statistics> {
    const entries = await journalRepository.getAll();

    const lifetime = emptyCounts();
    const byYear: Record<string, StatusCounts> = {};

    for (const entry of entries) {
        if (entry.deleted) continue;

        const year = new Date(entry.entryDate).getFullYear().toString();
        const status = entry.status;

        lifetime[status]++;

        if (!byYear[year]) {
            byYear[year] = emptyCounts();
        }

        byYear[year][status]++;
    }

    return { lifetime, byYear };
}
