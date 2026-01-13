import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HStack, VStack } from 'react-swiftstacks';

import { getUnwrapped } from '../../utils/axiosInstance.ts';

import LoadingCircle from '../../components/LoadingCircle/LoadingCircle.tsx';
import EntryCard from '../../components/EntryCard/EntryCard.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

import type { JournalEntry } from '../../types/entry.ts';

import styles from './SearchResultsPage.module.css';
import ActiveFilters from '../../components/ActiveFilters/ActiveFilters.tsx';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();

    const queryString = searchParams.toString();
    const pageParam = searchParams.get('page');
    const pageFromUrl = pageParam ? Number(pageParam) : 1;

    const navigate = useNavigate();
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(false);
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [page, setPage] = useState(pageFromUrl);
    const [error, setError] = useState<string | null>(null);

    const BACKEND_LIMIT = 10;

    const activeFilters = {
        title: searchParams.get('title'),
        platform: searchParams.get('platform'),
        status: searchParams.get('status'),
        rating: searchParams.get('rating'),
        startDate: searchParams.get('startDate'),
        endDate: searchParams.get('endDate'),
    };

    // Scroll back to top when changing pages without activating with other
    // rerenders
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.search]);

    // Filter out nulls
    const visibleFilters = Object.entries(activeFilters).filter(
        (entry): entry is [string, string] => entry[1] !== null,
    );

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

    // Maintain page number correctly synchronized
    useEffect(() => {
        const pageParam = searchParams.get('page');

        // Set page number to 1 if it's null/invalid/whatever
        const rawPage = pageParam ? Number(pageParam) : 1;

        const hasCursor = searchParams.has('cursor');

        let safePage = 1;

        // Avoid having a page number > 1 without cursor
        if (Number.isFinite(rawPage) && rawPage > 1 && hasCursor) {
            safePage = rawPage;
        }

        setPage(safePage);
    }, [searchParams]);

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

    const handleBack = () => {
        navigate(-1);
    };

    if (isLoading) {
        return (
            <div className="fullscreenLoader">
                <LoadingCircle />
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <VStack align="center" className={styles.body} gap={'xl'}>
                <ActiveFilters filters={visibleFilters} />
                <p className={styles.noResultsFoundText}>No entries found...</p>
                <StdButton onClick={handleBack}>Go Back</StdButton>
            </VStack>
        );
    }

    return (
        <VStack align="center" className={styles.body}>
            {visibleFilters.length > 0 && (
                <ActiveFilters filters={visibleFilters} />
            )}

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

            <HStack padding="md" gap="md">
                <StdButton
                    width="100px"
                    onClick={handlePrevious}
                    disabled={isLoading || !hasCursor}
                >
                    Previous
                </StdButton>

                <p className={styles.pageNumber}>Page {page}</p>

                <StdButton
                    width="100px"
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
