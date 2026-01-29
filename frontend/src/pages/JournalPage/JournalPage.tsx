import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { VStack } from 'react-swiftstacks';

import { journalRepository } from '../../data/journalRepository';
import { fetchNextJournalPage } from '../../data/journalFetcher.ts';
import type { OfflineJournalEntry } from '../../data/journalTypes';

import EntryCard from '../../components/EntryCard/EntryCard';
import LoadingCircle from '../../components/LoadingCircle/LoadingCircle';
import LoadingDots from '../../components/LoadingDots/LoadingDots.tsx';
import { syncJournalEntries } from '../../data/journalSync.ts';

const JournalPage = () => {
    // States
    const [journalEntries, setJournalEntries] = useState<OfflineJournalEntry[]>(
        [],
    );
    const [initialLoading, setInitialLoading] = useState<boolean>(false);

    // Pagination states
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // Debounce
    const lastLoadTimeRef = useRef<number>(0);

    // Sync
    useEffect(() => {
        void syncJournalEntries();
    }, []);

    // Sync when back online
    useEffect(() => {
        const handleOnline = () => {
            void syncJournalEntries();
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    useEffect(() => {
        let ignore = false;

        const loadLocalEntries = async () => {
            try {
                setInitialLoading(true);

                const entries = await journalRepository.getAll();
                const visibleEntries = entries.filter((e) => !e.deleted);

                // Cold start bootstrap
                if (visibleEntries.length === 0) {
                    const { nextCursor } = await fetchNextJournalPage(null);

                    if (ignore) return;

                    setCursor(nextCursor);
                    setHasMore(!!nextCursor);

                    // Get entries in IndexedDB
                    const refreshedEntries = await journalRepository.getAll();
                    const refreshedVisible = refreshedEntries.filter(
                        (e) => !e.deleted,
                    );

                    // Sort entries
                    const sorted = [...refreshedVisible].sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                    );

                    setJournalEntries(sorted);
                    return;
                }

                // Normal path (existing behavior)
                const sorted = [...visibleEntries].sort(
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

    // *Always* read from IndexedDB and never append backend results directly
    const loadNextPage = useCallback(async () => {
        const now = Date.now();

        // Soft debounce (cooldown)
        if (now - lastLoadTimeRef.current < 250) {
            return;
        }

        if (!hasMore || isFetchingMore) return;

        lastLoadTimeRef.current = now;
        setIsFetchingMore(true);

        try {
            const { nextCursor } = await fetchNextJournalPage(cursor);

            setCursor(nextCursor);
            setHasMore(!!nextCursor);

            const entries = await journalRepository.getAll();
            const visibleEntries = entries.filter((e) => !e.deleted);

            const sorted = [...visibleEntries].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            );

            setJournalEntries(sorted);
        } catch {
            toast.error('Failed to load more entries');
        } finally {
            setIsFetchingMore(false);
        }
    }, [cursor, hasMore, isFetchingMore]);

    // Pagination trigger
    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    void loadNextPage();
                }
            },
            { threshold: 1 },
        );

        const element = document.getElementById('journal-loader');
        if (element) observer.observe(element);

        return () => observer.disconnect();
    }, [cursor, hasMore, loadNextPage]);

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
            {hasMore && (
                <div id="journal-loader" style={{ margin: '2rem' }}>
                    {isFetchingMore && <LoadingDots />}
                </div>
            )}
        </VStack>
    );
};

export default JournalPage;
