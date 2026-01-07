import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HStack, VStack } from 'react-swiftstacks';

import { getUnwrapped } from '../../utils/axiosInstance.ts';

import LoadingBar from '../../components/LoadingBar/LoadingBar.tsx';
import EntryCard from '../../components/EntryCard/EntryCard.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

import type { JournalEntry } from '../../types/entry.ts';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const BACKEND_LIMIT = 5;

    const queryString = searchParams.toString();

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

        navigate(`/search?${params.toString()}`);
    };

    const handlePrevious = () => {
        navigate(-1);
    };

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
                {hasCursor && (
                    <StdButton width={'100px'} onClick={handlePrevious}>
                        Previous
                    </StdButton>
                )}

                {nextCursor && !isLoading && (
                    <StdButton width={'100px'} onClick={handleNext}>
                        Next
                    </StdButton>
                )}
            </HStack>
        </VStack>
    );
};
export default SearchResultsPage;
