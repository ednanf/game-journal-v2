import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HStack, VStack } from 'react-swiftstacks';

import { getUnwrapped } from '../../utils/axiosInstance.ts';

import LoadingBar from '../../components/LoadingBar/LoadingBar.tsx';
import EntryCard from '../../components/EntryCard/EntryCard.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

import type { JournalEntry } from '../../types/entry.ts';

import styles from './SearchResultsPage.module.css';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();

    const queryString = searchParams.toString();
    const pageParam = searchParams.get('page');
    const pageFromUrl = pageParam ? Number(pageParam) : 1;

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [page, setPage] = useState(pageFromUrl);
    const [error, setError] = useState<string | null>(null);

    const BACKEND_LIMIT = 5;

    // Used to show the "Previous" button. If there's no cursor param, it's in
    // page 1
    const hasCursor = searchParams.has('cursor');

    // Ensure a limit is always present, even without params
    const url = queryString
        ? `/entries?limit=${BACKEND_LIMIT}&${queryString}`
        : `/entries?limit=${BACKEND_LIMIT}`;

    // Fetch entries with the search parameters every time the url changes
    // The URL changes in 2 cases: form is sent or handleNext is triggered
    useEffect(() => {
        let ignore = false;

        const fetchEntries = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await getUnwrapped<{
                    entries: JournalEntry[];
                    nextCursor: string | null;
                }>(url);

                if (!ignore) {
                    setEntries(response.entries);
                    setNextCursor(response.nextCursor);
                }
            } catch (e: unknown) {
                if (!ignore) {
                    const message =
                        e instanceof Error
                            ? e.message
                            : 'Failed to fetch search results.';
                    setError(message);
                    toast.error(error);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        };

        void fetchEntries();

        return () => {
            ignore = true;
        };
    }, [url, error]);

    // Will navigate to a new URL, triggering a refresh/fetch
    const handleNext = () => {
        if (!nextCursor) return;

        const params = new URLSearchParams(searchParams);

        params.set('cursor', nextCursor);
        params.set('page', String(page + 1));

        navigate(`/search?${params.toString()}`);
    };

    const handlePrevious = () => {
        if (page <= 1) return;

        const params = new URLSearchParams(searchParams);

        const prevPage = page - 1;

        // Remove page and cursor from url to keep numbering logic correct
        if (prevPage === 1) {
            params.delete('page');
            params.delete('cursor');
        } else {
            params.set('page', String(prevPage));
        }

        navigate(-1);
    };

    // Handle page number synchronization
    useEffect(() => {
        const pageParam = searchParams.get('page');

        // Set page number to 1 if it's null/invalid/whatever
        const nextPage = pageParam ? Number(pageParam) : 1;

        setPage(Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1);
    }, [searchParams]);

    return (
        <VStack align={'center'} style={{ marginTop: '2rem' }}>
            {entries.length === 0 ? (
                <div className={'fullscreenLoader'}>
                    <LoadingBar />
                </div>
            ) : (
                <>
                    {entries.map((entry) => (
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
                </>
            )}

            <HStack padding={'md'} style={{ marginBottom: '1rem' }} gap={'md'}>
                <StdButton
                    width={'100px'}
                    onClick={handlePrevious}
                    disabled={isLoading || !hasCursor}
                >
                    Previous
                </StdButton>

                <p className={styles.pageNumber}> Page {page}</p>

                <StdButton
                    width={'100px'}
                    onClick={handleNext}
                    disabled={!nextCursor}
                >
                    Next
                </StdButton>
            </HStack>
        </VStack>
    );
};
export default SearchResultsPage;
