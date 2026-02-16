import { useEffect, useState } from 'react';
import { HStack, VStack } from 'react-swiftstacks';

import { getStatistics } from '../../services/statisticsServices';

import LifetimeCard from '../../components/Statistics/LifetimeCard/LifetimeCard';
import YearlyCard from '../../components/Statistics/YearlyCard/YearlyCard';
import InsetDivider from '../../components/InsetDivider/InsetDivider';

import type { Statistics } from '../../types/statistics';

type StatsSource = 'backend' | 'local' | 'waking-up';

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

    const sortedYearEntries = Object.entries(statistics.byYear).sort(
        ([yearA], [yearB]) => Number(yearB) - Number(yearA),
    );

    return (
        <VStack align={'center'} style={{ marginTop: '2rem' }}>
            {/* Backend asleep but reachable */}
            {source === 'waking-up' && (
                <HStack style={{ marginBottom: '1rem' }}>
                    <p>Backend is waking up — showing local statistics</p>
                </HStack>
            )}

            {/* True offline case */}
            {!navigator.onLine && (
                <HStack style={{ marginBottom: '1rem' }}>
                    <p>
                        Offline — statistics reflect locally available entries
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
        </VStack>
    );
};

export default StatisticsPage;
