import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { VStack } from 'react-swiftstacks';

import { journalRepository } from '../../data/journalRepository';
import type { OfflineJournalEntry } from '../../data/journalTypes';

import EntryCard from '../../components/EntryCard/EntryCard';
import LoadingCircle from '../../components/LoadingCircle/LoadingCircle';

const JournalPage = () => {
    const [journalEntries, setJournalEntries] = useState<OfflineJournalEntry[]>(
        [],
    );
    const [initialLoading, setInitialLoading] = useState<boolean>(false);

    useEffect(() => {
        let ignore = false;

        const loadLocalEntries = async () => {
            try {
                setInitialLoading(true);

                const entries = await journalRepository.getAll();

                if (ignore) return;

                const sorted = [...entries].sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                );

                setJournalEntries(sorted);
            } catch {
                if (!ignore) {
                    toast.error('Failed to load journal entries');
                }
            } finally {
                if (!ignore) {
                    setInitialLoading(false);
                }
            }
        };

        void loadLocalEntries();

        return () => {
            ignore = true;
        };
    }, []);

    if (initialLoading) {
        return (
            <div className="fullscreenLoader">
                <LoadingCircle />
            </div>
        );
    }

    return (
        <VStack align="center" style={{ marginTop: '2rem' }}>
            {journalEntries.length === 0 ? (
                <p>No journal entries yet.</p>
            ) : (
                journalEntries.map((entry) => (
                    <EntryCard
                        key={entry.localId}
                        title={entry.title}
                        platform={entry.platform}
                        status={entry.status}
                        rating={entry.rating}
                        entryDate={new Date(entry.entryDate)}
                        to={`/entries/${entry.localId}`}
                    />
                ))
            )}
        </VStack>
    );
};

export default JournalPage;
