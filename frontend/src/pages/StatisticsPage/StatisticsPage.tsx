import { useEffect, useState } from 'react';
import { HStack, VStack } from 'react-swiftstacks';

import { getStatistics } from '../../services/statisticsServices';

import LifetimeCard from '../../components/Statistics/LifetimeCard/LifetimeCard';
import YearlyCard from '../../components/Statistics/YearlyCard/YearlyCard';
import InsetDivider from '../../components/InsetDivider/InsetDivider';

import type { Statistics } from '../../types/statistics';
import LoadingDots from '../../components/LoadingDots/LoadingDots.tsx';

type StatsSource = 'backend' | 'local' | 'waking-up';

type Banner = 'offline' | 'waking-up' | null;

const EMPTY_STATS: Statistics = {
    lifetime: {
        completed: 0,
        started: 0,
        paused: 0,
        revisited: 0,
        dropped: 0,
    },
    byYear: {},
};

const StatisticsPage = () => {
    // Statistics values
    const [statistics, setStatistics] = useState<Statistics>(EMPTY_STATS);

    // Where the statistics currently come from
    const [source, setSource] = useState<StatsSource>('local');

    useEffect(() => {
        let cancelled = false;

        const fetchStatistics = async () => {
            // getStatistics() returns one of the 3 sources,
            // along with the stats
            const result = await getStatistics();

            if (!cancelled) {
                setStatistics(result.stats);
                setSource(result.source);
            }
        };

        // Fire once on mount — render local stats immediately,
        // poke backend in the background
        void fetchStatistics();

        return () => {
            cancelled = true;
        };
    }, []);

    const banner: Banner = !navigator.onLine
        ? 'offline'
        : source === 'waking-up'
          ? 'waking-up'
          : null;

    // Show dots only when we already have yearly data,
    // and the backend is waking up (upgrade-in-progress)
    const showLoadingDots =
        Object.keys(statistics.byYear).length > 0 && banner === 'waking-up';

    const sortedYearEntries = Object.entries(statistics.byYear).sort(
        ([yearA], [yearB]) => Number(yearB) - Number(yearA),
    );

    return (
        <VStack align={'center'} style={{ marginTop: '2rem' }}>
            {banner === 'offline' && (
                <HStack style={{ marginBottom: '1rem' }}>
                    <p>
                        Offline — statistics reflect locally available entries
                    </p>
                </HStack>
            )}

            {banner === 'waking-up' && (
                <HStack style={{ marginBottom: '1rem' }}>
                    <p>Backend is waking up — showing local statistics</p>
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

            {showLoadingDots ? (
                <LoadingDots />
            ) : (
                sortedYearEntries.map(([year, stats]) => (
                    <YearlyCard
                        key={year}
                        title={year}
                        started={stats.started}
                        completed={stats.completed}
                        dropped={stats.dropped}
                        paused={stats.paused}
                        revisited={stats.revisited}
                    />
                ))
            )}
        </VStack>
    );
};

export default StatisticsPage;
