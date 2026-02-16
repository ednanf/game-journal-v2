// statisticsServices.ts

import axios from 'axios';
import { getUnwrapped } from '../utils/axiosInstance';
import { journalRepository } from '../data/journalRepository';

import type { Statistics, StatusCounts } from '../types/statistics';

type StatsSource = 'backend' | 'local' | 'waking-up';

type InterceptorError = {
    message: string;
    raw: unknown;
};

export async function getStatistics(
    timeoutMs = 2000,
): Promise<{ stats: Statistics; source: StatsSource }> {
    // Case 1: Browser explicitly reports offline.
    if (!navigator.onLine) {
        return {
            stats: await computeLocalStatistics(),
            source: 'local',
        };
    }

    // Case 2: Browser is online.
    // The backend *might* still be sleeping (free tier).
    try {
        const controller = new AbortController();

        // Hard timeout to avoid monopolizing the browser's connection pool
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const stats = await getUnwrapped<Statistics>(
                '/entries/statistics',
                { signal: controller.signal },
            );

            // Backend responded quickly → authoritative stats
            return { stats, source: 'backend' };
        } finally {
            clearTimeout(timeoutId);
        }
    } catch (e) {
        // NOTE: Axios cancellation is NOT a DOM AbortError.
        // It is surfaced as an AxiosError with code === 'ERR_CANCELED'.

        // Errors thrown by getUnwrapped are NOT native Errors.
        // They are objects created by my Axios interceptor:
        const interceptorError = e as InterceptorError;

        /**
         * Detect timeout-induced cancellation.
         *
         * When AbortController aborts an Axios request:
         * - Axios throws an AxiosError
         * - error.code === 'ERR_CANCELED'
         *
         * The interceptor wraps that AxiosError under `raw`,
         * so `interceptorError.raw` should be inspected, NOT `e` itself.
         */
        if (
            typeof interceptorError === 'object' &&
            interceptorError !== null &&
            axios.isAxiosError(interceptorError.raw) &&
            interceptorError.raw.code === 'ERR_CANCELED'
        ) {
            return {
                stats: await computeLocalStatistics(),
                source: 'waking-up',
            };
        }

        // Any other error:
        return {
            stats: await computeLocalStatistics(),
            source: 'local',
        };
    }
}

const emptyCounts = (): StatusCounts => ({
    completed: 0,
    started: 0,
    paused: 0,
    revisited: 0,
    dropped: 0,
});

// Compute statistics purely from IndexedDB.
// These stats are *intentionally partial*.
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
