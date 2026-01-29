import { useEffect } from 'react';
import { syncJournalEntries } from './journalSync';

export function useJournalSync(enabled: boolean) {
    useEffect(() => {
        if (!enabled) return;

        void syncJournalEntries();

        const handleOnline = () => {
            void syncJournalEntries();
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [enabled]);
}
