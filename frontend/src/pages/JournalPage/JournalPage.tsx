import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getUnwrapped } from '../../utils/axiosInstance.ts';
import { VStack } from 'react-swiftstacks';

import EntryCard from '../../components/EntryCard/EntryCard.tsx';
import LoadingBar from '../../components/LoadingBar/LoadingBar.tsx';

import type { JournalEntry, PaginatedResponse } from '../../types/entry.ts';

// Backend sends a string that should be converted *before* going into as prop
// const entry = {
//     ...rawEntry,
//     entryDate: new Date(rawEntry.entryDate),
// };

const JournalPage = () => {
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [_error, setError] = useState<string | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);

    const fetchMoreEntries = useCallback(async () => {
        if (isLoading || !hasMore || !cursor) return;

        try {
            // Create params variable and attach default values
            const params = new URLSearchParams();
            params.append('limit', '10');
            params.append('cursor', cursor);

            const response = await getUnwrapped<PaginatedResponse>(
                `/entries?${params.toString()}`,
            );

            setJournalEntries((prevEntries) => [
                ...prevEntries,
                ...response.entries,
            ]);

            setCursor(response.nextCursor);

            setHasMore(!!response.nextCursor);
        } catch (e: unknown) {
            const message =
                e instanceof Error
                    ? e.message
                    : 'An unexpected error occurred.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, cursor]);

    const loaderRef = useCallback(
        (node: HTMLDivElement | null) => {
            // No observer work if we are already loading or there's nothing left to load
            if (isLoading || !hasMore) return;

            // Clean up any existing observer before creating a new one
            if (observer.current) observer.current.disconnect();

            // Create a new IntersectionObserver instance to detect when the loader enters the viewport.
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    // 'void' is intentional to silence the unhandled promise lint warning.
                    void fetchMoreEntries();
                }
            });

            if (node) observer.current.observe(node);
        },
        [isLoading, hasMore, fetchMoreEntries],
    );

    // Initial fetch
    useEffect(() => {
        let ignore = false;

        // Initialize loading states and error
        setIsLoading(true);
        setInitialLoading(true);
        setError(null);

        const fetchInitialPosts = async () => {
            try {
                const params = new URLSearchParams();
                params.append('limit', '10');

                const response = await getUnwrapped<PaginatedResponse>(
                    `/entries?${params.toString()}`,
                );

                if (!ignore) {
                    setJournalEntries(response.entries);
                    setCursor(response.nextCursor);
                    setHasMore(!!response.nextCursor);
                }
            } catch (e: unknown) {
                if (!ignore) {
                    const message =
                        e instanceof Error
                            ? e.message
                            : 'Failed to fetch entries.';
                    setError(message);
                    toast.error(message);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                    setInitialLoading(false);
                }
            }
        };

        void fetchInitialPosts();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <VStack align={'center'} style={{ marginTop: '2rem' }}>
            {journalEntries.length === 0 && initialLoading ? (
                <div className="fullscreenLoader">
                    <LoadingBar />
                </div>
            ) : (
                <>
                    {journalEntries.map((entry) => (
                        <EntryCard
                            key={entry._id}
                            title={entry.title}
                            platform={entry.platform}
                            status={entry.status}
                            rating={entry.rating}
                            entryDate={new Date(entry.entryDate)}
                            to={`/entries/${entry._id}`}
                        />
                    ))}
                    {hasMore && (
                        <div ref={loaderRef}>
                            <VStack
                                justify={'center'}
                                align={'center'}
                                style={{ marginBottom: '2rem' }}
                            >
                                <LoadingBar />
                            </VStack>
                        </div>
                    )}
                </>
            )}
        </VStack>
    );
};
export default JournalPage;
