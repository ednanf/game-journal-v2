import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { HStack, VStack } from 'react-swiftstacks';

import { getStatistics } from '../../services/statisticsServices.ts';

import LifetimeCard from '../../components/Statistics/LifetimeCard/LifetimeCard.tsx';
import YearlyCard from '../../components/Statistics/YearlyCard/YearlyCard.tsx';
import InsetDivider from '../../components/InsetDivider/InsetDivider.tsx';
import LoadingCircle from '../../components/LoadingCircle/LoadingCircle.tsx';

import type { Statistics } from '../../types/statistics.ts';

const StatisticsPage = () => {
    const [statistics, setStatistics] = useState<Statistics>({
        lifetime: {
            completed: 0,
            started: 0,
            paused: 0,
            revisited: 0,
            dropped: 0,
        },
        byYear: {},
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setIsLoading(true);
                const response = await getStatistics();
                setStatistics(response);
            } catch (e) {
                const message = (e as Error).message;
                toast.error(`Error fetching statistics: ${message}`);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchStatistics();

        // Ensure statistics are refreshed
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void fetchStatistics();
            }
        };

        window.addEventListener('focus', fetchStatistics);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', fetchStatistics);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, []);

    // Sort entries by year regardless of how the backend will send
    const sortedYearEntries = Object.entries(statistics.byYear).sort(
        ([yearA], [yearB]) => Number(yearB) - Number(yearA),
    );

    return (
        <VStack align={'center'} style={{ marginTop: '2rem' }}>
            {isLoading ? (
                <div className="fullscreenLoader">
                    <LoadingCircle />
                </div>
            ) : (
                <>
                    {!navigator.onLine && (
                        <HStack style={{ marginBottom: '2rem' }}>
                            <p>
                                Offline — statistics reflect locally available
                                entries
                            </p>
                        </HStack>
                    )}
                    <LifetimeCard
                        title={'Lifetime'}
                        started={statistics.lifetime.started}
                        completed={statistics.lifetime.completed}
                        dropped={statistics.lifetime.dropped}
                        paused={statistics.lifetime.paused}
                        revisited={statistics.lifetime.revisited}
                    />

                    <InsetDivider />

                    {sortedYearEntries.map(([year, stats]) => (
                        <YearlyCard
                            key={year}
                            title={year}
                            started={stats.started}
                            completed={stats.completed}
                            dropped={stats.dropped}
                            paused={stats.paused}
                            revisited={stats.revisited}
                        />
                    ))}
                </>
            )}
        </VStack>
    );
};
export default StatisticsPage;
