import { useEffect } from 'react';
import { syncJournalEntries } from './journalSync';

/**
 * useJournalSync
 *
 * Centralized background sync for journal entries.
 *
 * This hook is intentionally designed to run at the *application level*
 * (e.g. AppShell), NOT per-page.
 *
 * The `enabled` flag acts as a lifecycle gate:
 * - When `enabled === true`, syncing is activated
 * - When `enabled === false`, syncing is completely disabled
 *
 * In this app, syncing should ONLY happen when the user is authenticated.
 */
export function useJournalSync(enabled: boolean) {
    useEffect(() => {
        // If syncing is not enabled, do nothing.
        if (!enabled) return;

        // Best-effort background sync when syncing becomes enabled.
        void syncJournalEntries();

        // Re-sync automatically when the browser regains connectivity.
        const handleOnline = () => {
            void syncJournalEntries();
        };

        window.addEventListener('online', handleOnline);

        // Cleanup when syncing is disabled or the component unmounts.
        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, [enabled]); // Re-run ONLY when the enabled state changes
}
