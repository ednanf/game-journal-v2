import React from 'react';
import { HStack } from 'react-swiftstacks';

import styles from './ActiveFilters.module.css';

interface ActiveFiltersProps {
    filters: [string, string][];
}

const ActiveFilters = ({ filters }: ActiveFiltersProps) => {
    // Remove the time and format the iso date to locale
    const formatFilterValue = (key: string, value: string) => {
        if (key === 'startDate' || key === 'endDate') {
            return new Date(value).toLocaleDateString();
        }

        return value;
    };

    // Rename keys to match the UI
    const FILTER_LABELS: Record<string, string> = {
        startDate: 'From',
        endDate: 'To',
        platform: 'Platform',
        status: 'Status',
        rating: 'Rating',
        title: 'Title',
    };

    const formatFilterLabel = (key: string) => FILTER_LABELS[key] ?? key;

    return (
        <HStack justify={'center'} gap={'sm'} className={styles.container} wrap>
            {filters.map(([key, value]) => (
                <span key={key} className={styles.resultChip}>
                    {formatFilterLabel(key)}: {formatFilterValue(key, value)}
                </span>
            ))}
        </HStack>
    );
};
export default ActiveFilters;
