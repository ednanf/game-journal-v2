import { useEffect, useState } from 'react';

import { getUnwrapped } from '../utils/axiosInstance';
import {API_BASE_URL} from '../config/apiURL.ts';

import { journalRepository } from '../data/journalRepository';

import type { SyncStatus } from '../types/sync';

export function useSyncStatus() {
    const [status, setStatus] = useState<SyncStatus>('all-synced');

    useEffect(() => {
        let cancelled = false;

        const evaluateStatus = async () => {
            // 1. Browser offline → definitive
            if (!navigator.onLine) {
                setStatus('offline');
                return;
            }

            // 2. Check for pending local changes
            const entries = await journalRepository.getAll();
            const hasPending = entries.some((e) => !e.synced || e.deleted);

            if (!hasPending) {
                setStatus('all-synced');
                return;
            }

            // 3. If there are Pending changes and browser is online
            // Try a lightweight backend probe
            try {
                await getUnwrapped(`${API_BASE_URL}/user`, {
                    timeout: 4000, // important: short timeout
                });

                if (!cancelled) {
                    setStatus('pending');
                }
            } catch {
                if (!cancelled) {
                    // backend reachable but not responding yet
                    setStatus('unreachable');
                }
            }
        };

        void evaluateStatus();

        return () => {
            cancelled = true;
        };
    }, []);

    return status;
}
