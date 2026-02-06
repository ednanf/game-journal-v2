import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HStack, VStack } from 'react-swiftstacks';

import { searchEntries } from '../../services/searchService';
import { ensureLocalEntry } from '../../data/ensureLocalEntry.ts';

import LoadingCircle from '../../components/LoadingCircle/LoadingCircle.tsx';
import EntryCard from '../../components/EntryCard/EntryCard.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';
import ActiveFilters from '../../components/ActiveFilters/ActiveFilters.tsx';

import type { StatusType } from '../../types/entry.ts';
import type { OfflineJournalEntry } from '../../types/journalTypes.ts';

import styles from './SearchResultsPage.module.css';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();

    const queryString = searchParams.toString();
    const pageParam = searchParams.get('page');
    const pageFromUrl = pageParam ? Number(pageParam) : 1;

    const navigate = useNavigate();
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(false);
    const [entries, setEntries] = useState<OfflineJournalEntry[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [page, setPage] = useState(pageFromUrl);
    const [error, setError] = useState<string | null>(null);

    // Search source states
    const [searchSource, setSearchSource] = useState<'remote' | 'local'>(
        'remote',
    );
    const [prevSearchSource, setPrevSearchSource] = useState<
        'remote' | 'local'
    >('remote');

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
                const statusParam = searchParams.get('status');

                const result = await searchEntries({
                    limit: BACKEND_LIMIT,
                    title: searchParams.get('title') ?? undefined,
                    platform: searchParams.get('platform') ?? undefined,
                    status: statusParam
                        ? (statusParam as StatusType)
                        : undefined,
                    rating: searchParams.get('rating')
                        ? Number(searchParams.get('rating'))
                        : undefined,
                    startDate: searchParams.get('startDate') ?? undefined,
                    endDate: searchParams.get('endDate') ?? undefined,
                    cursor: searchParams.get('cursor') ?? undefined,
                });

                if (!ignore) {
                    setEntries(result.entries);
                    setNextCursor(result.nextCursor);

                    // Detect source transition
                    setSearchSource((currentSource) => {
                        if (currentSource !== result.source) {
                            setPrevSearchSource(currentSource);

                            // Reset pagination by clearing cursor + page
                            const params = new URLSearchParams(searchParams);
                            params.delete('cursor');
                            params.delete('page');

                            navigate(`/search?${params.toString()}`, {
                                replace: true,
                            });

                            return result.source;
                        }

                        return currentSource;
                    });

                    setSearchSource(result.source);
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
    }, [url, error, searchParams, navigate]);

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

    // Ensure results' cards will have a working id to navigate
    const handleSelectEntry = async (entry: OfflineJournalEntry) => {
        try {
            // Already local → fast path
            if (entry.localId) {
                navigate(`/entries/${entry.localId}`);
                return;
            }

            // Remote-only → materialize lazily
            const localEntry = await ensureLocalEntry(entry);

            navigate(`/entries/${localEntry.localId}`);
        } catch (e) {
            const message =
                e instanceof Error ? e.message : 'Failed to open entry.';
            toast.error(message);
        }
    };

    // Will navigate to a new URL, triggering a refresh/fetch
    const handleNext = () => {
        if (!nextCursor) return;

        const params = new URLSearchParams(searchParams);

        // Dealing with online/offline changes during search
        const isSourceTransition = prevSearchSource !== searchSource;

        if (isSourceTransition) {
            // Reset pagination only once, on mode change
            params.delete('cursor');
            params.set('page', '1');
        } else {
            // Normal pagination (remote or local)
            params.set('cursor', nextCursor);
            params.set('page', String(page + 1));
        }

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
                <ActiveFilters
                    filters={visibleFilters}
                    infoChips={
                        searchSource === 'local' ? ['Local results'] : undefined
                    }
                />
            )}

            {entries.map((entry) => {
                const key = entry.localId ?? entry._id;

                // Avoid needing double clicks on cancel
                const handleClick = () => {
                    if (!entry.localId) {
                        void handleSelectEntry(entry);
                    }
                };

                return (
                    <div
                        key={key}
                        onClick={handleClick}
                        style={{
                            cursor: 'pointer',
                            width: '400px',
                        }}
                    >
                        <EntryCard
                            title={entry.title}
                            platform={entry.platform}
                            status={entry.status}
                            rating={entry.rating}
                            entryDate={new Date(entry.entryDate)}
                            to={
                                entry.localId
                                    ? `/entries/${entry.localId}`
                                    : undefined
                            }
                        />
                    </div>
                );
            })}

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
