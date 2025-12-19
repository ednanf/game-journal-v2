import { HStack, VStack } from 'react-swiftstacks';

import { FaStar } from 'react-icons/fa6';

import styles from './EntryCard.module.css';

interface EntryCardProps {
    title: string;
    platform: string;
    status: 'completed' | 'started' | 'paused' | 'dropped' | 'revisited';
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

    // const maxTitleLength = 25;
    // const titleStart = title.slice(0, maxTitleLength);
    // const titleEnd =
    //     title.length > maxTitleLength ? title.slice(maxTitleLength) : '';

    return (
        <HStack gap={'md'} className={styles.cardContainer}>
            <VStack className={styles.content}>
                <h3 className={styles.title}>
                    {title}
                    {title.length > 31 && <span className={styles.titleFade} />}
                </h3>
                <p className={styles.platform}>{platform}</p>
                <HStack gap={'md'}>
                    <p className={`${statusLabelColor(status)}`}>{status}</p>
                    {status === 'completed' && (
                        <p className={styles.rating}>
                            <FaStar
                                color="var(--color-accent-yellow)"
                                size={14}
                            />
                            {rating} / 10
                        </p>
                    )}
                </HStack>
                <HStack justify={'end'} className={styles.date}>
                    <p>
                        {date.toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                        })}
                    </p>
                </HStack>
            </VStack>
        </HStack>
    );
};
export default EntryCard;
