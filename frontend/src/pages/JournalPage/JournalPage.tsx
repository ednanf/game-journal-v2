import { useState, useRef, useCallback, useEffect } from 'react';
import { VStack } from 'react-swiftstacks';

import EntryCard from '../../components/EntryCard/EntryCard.tsx';
import { getUnwrapped } from '../../utils/axiosInstance.ts';
import { toast } from 'react-toastify';
import LoadingBar from '../../components/LoadingBar/LoadingBar.tsx';

// Backend sends a string that should be converted *before* going into as prop
// const entry = {
//     ...rawEntry,
//     entryDate: new Date(rawEntry.entryDate),
// };

type JournalEntry = {
    _id: string;
    createdBy: string;
    title: string;
    entryDate: string; // needs to be converted to ISO as shown above
    platform: string;
    status: 'started' | 'completed' | 'dropped' | 'revisited' | 'paused';
    rating: number;
    createdAt: string;
    updatedAt: string;
};

type PaginatedResponse = {
    message: string;
    entries: JournalEntry[];
    nextCursor: string | null;
};

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
        (node: HTMLDivElement) => {
            if (isLoading) return; // Prevent setting up observer if already loading
            if (observer.current) observer.current.disconnect(); // Disconnect previous observer if one already exists

            // Create a new IntersectionObserver instance to ensure it doesn't change on every render
            // Triggers fetchMoreEvents only when the loader is intersecting
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    void fetchMoreEntries;
                }

                if (node) observer.current?.observe(node);
            });
        },
        [isLoading, fetchMoreEntries],
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
            <p>Nothing to see here...</p>
            <LoadingBar />
        </VStack>
    );
};
export default JournalPage;
