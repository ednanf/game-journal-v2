import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { VStack } from 'react-swiftstacks';

import { journalRepository } from '../../data/journalRepository';
import { fetchNextJournalPage } from '../../data/journalFetcher.ts';
import type { OfflineJournalEntry } from '../../types/journalTypes.ts';

import EntryCard from '../../components/EntryCard/EntryCard';
import LoadingCircle from '../../components/LoadingCircle/LoadingCircle';
import LoadingDots from '../../components/LoadingDots/LoadingDots.tsx';

import styles from './JournalPage.module.css';

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

    // Prevent overlapping fetches
    const isFetchingRef = useRef(false);

    const loadNextPage = useCallback(async () => {
        const now = Date.now();

        // Simple debounce
        if (now - lastLoadTimeRef.current < 250) return;

        // Hard guards
        if (!hasMore || isFetchingRef.current) return;

        lastLoadTimeRef.current = now;
        isFetchingRef.current = true;
        setIsFetchingMore(true);

        try {
            // Fetch next page from backend
            const { nextCursor } = await fetchNextJournalPage(cursor);

            // Update pagination state
            setCursor(nextCursor);
            setHasMore(!!nextCursor);

            // Re-read everything from IndexedDB (source of truth)
            const entries = await journalRepository.getAll();
            const visibleEntries = entries.filter((e) => !e.deleted);

            // Sort
            const sorted = [...visibleEntries].sort(
                (a, b) =>
                    new Date(b.entryDate).getTime() -
                    new Date(a.entryDate).getTime(),
            );

            // Update UI
            setJournalEntries(sorted);
        } catch {
            toast.error('Failed to load more entries');
        } finally {
            isFetchingRef.current = false;
            setIsFetchingMore(false);
        }
    }, [cursor, hasMore]);

    // Pagination
    const loaderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            // Prevent layout trash
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const el = loaderRef.current;
                if (!el) {
                    ticking = false;
                    return;
                }

                const rect = el.getBoundingClientRect();

                // Trigger when loader is near viewport
                if (rect.top <= window.innerHeight + 200) {
                    void loadNextPage();
                }

                ticking = false;
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadNextPage]);

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

                    // Sort by entryDate (user-facing chronology)
                    const sorted = [...refreshedVisible].sort(
                        (a, b) =>
                            new Date(b.entryDate).getTime() -
                            new Date(a.entryDate).getTime(),
                    );

                    setJournalEntries(sorted);
                    return;
                }

                // Sort by entryDate (user-facing chronology)
                const sorted = [...visibleEntries].sort(
                    (a, b) =>
                        new Date(b.entryDate).getTime() -
                        new Date(a.entryDate).getTime(),
                );

                setJournalEntries(sorted);

                requestAnimationFrame(() => {
                    const el = loaderRef.current;
                    if (!el) return;

                    const rect = el.getBoundingClientRect();
                    if (rect.top <= window.innerHeight + 200) {
                        void loadNextPage();
                    }
                });
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
    }, [loadNextPage]);

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
                <p className={styles.noEntriesText}>No journal entries yet.</p>
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

            {/**
             * Loader element
             *
             * Important:
             * - Always keep it mounted
             * - Only change height/visibility
             * - Do NOT conditionally render it
             */}
            <div
                ref={loaderRef}
                style={{
                    margin: '2rem',
                    height: hasMore ? '40px' : '0px',
                    overflow: 'hidden',
                }}
            >
                {hasMore && isFetchingMore && <LoadingDots />}
            </div>
        </VStack>
    );
};

export default JournalPage;
