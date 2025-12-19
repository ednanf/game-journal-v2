import { HStack, VStack } from 'react-swiftstacks';

import styles from './EntryCard.module.css';

interface EntryCardProps {
    title: string;
    platform: string;
    status: string;
    rating?: number;
    date: Date;
}

const EntryCard = ({
    title,
    platform,
    status,
    rating,
    date,
}: EntryCardProps) => {
    const statusLabelColor = (status: string) => {
        switch (status) {
            case 'completed':
                return styles.completed;
            case 'started':
                return styles.started;
            case 'revisited':
                return styles.revisited;
            case 'paused':
                return styles.paused;
            case 'dropped':
                return styles.dropped;
            default:
                return styles.defaultStatus;
        }
    };

    return (
        <VStack className={styles.cardContainer}>
            <p>{title}</p>
            <p>{platform}</p>
            <p>{rating}</p>
            <HStack>
                <p>{status}</p>
                <p>
                    {date.toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                    })}
                </p>
            </HStack>
        </VStack>
    );
};
export default EntryCard;
