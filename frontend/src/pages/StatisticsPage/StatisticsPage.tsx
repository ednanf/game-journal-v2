import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { VStack } from 'react-swiftstacks';

import { getUnwrapped } from '../../utils/axiosInstance.ts';

import LifetimeCard from '../../components/Statistics/LifetimeCard/LifetimeCard.tsx';
import YearlyCard from '../../components/Statistics/YearlyCard/YearlyCard.tsx';
import InsetDivider from '../../components/InsetDivider/InsetDivider.tsx';
import LoadingBar from '../../components/LoadingBar/LoadingBar.tsx';

type Statistics = {
    lifetime: {
        completed: number;
        started: number;
        paused: number;
        revisited: number;
        dropped: number;
    };
    byYear: {
        [year: string]: {
            completed: number;
            started: number;
            paused: number;
            revisited: number;
            dropped: number;
        };
    };
};

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

    const [_error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            setIsLoading(true);

            try {
                const response = await getUnwrapped<Statistics>(
                    '/entries/statistics',
                );

                setStatistics(response);
            } catch (e) {
                const message = (e as Error).message;
                setError(message);
                toast.error(`Error fetching statistics: ${message}`);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchStatistics();
    }, []);

    // Sort entries by year regardless of how the backend will send
    const sortedYearEntries = Object.entries(statistics.byYear).sort(
        ([yearA], [yearB]) => Number(yearB) - Number(yearA),
    );

    return (
        <VStack align={'center'} style={{ marginTop: '2rem' }}>
            {isLoading ? (
                <div className="fullscreenLoader">
                    <LoadingBar />
                </div>
            ) : (
                <>
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
