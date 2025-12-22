import { Link } from 'react-router-dom';
import { HStack, VStack } from 'react-swiftstacks';

import { FaStar } from 'react-icons/fa6';
import { FaChevronRight } from 'react-icons/fa';

import styles from './EntryCard.module.css';

interface JournalEntry {
    title: string;
    platform: string;
    status: string;
    rating: number;
    entryDate: Date;
}

interface EntryCardProps {
    entry: JournalEntry;
    to: string;
}

const EntryCard = ({ entry, to }: EntryCardProps) => {
    const statusLabelStyle = (status: string) => {
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
        <Link to={to} className={styles.link}>
            <HStack gap={'md'} className={styles.cardContainer}>
                <VStack className={styles.content}>
                    <h3 className={styles.title}>
                        {entry.title}
                        {entry.title.length > 31 && (
                            <span className={styles.titleFade} />
                        )}
                    </h3>
                    <p className={styles.platform}>{entry.platform}</p>
                    <HStack gap={'md'}>
                        <p
                            className={`${statusLabelStyle(entry.status)} ${styles.statusBadge}`}
                        >
                            {entry.status}
                        </p>
                        {entry.status === 'completed' && (
                            <p className={styles.rating}>
                                <FaStar size={14} />
                                {entry.rating} / 10
                            </p>
                        )}
                    </HStack>
                    <HStack justify={'end'} className={styles.date}>
                        <p>
                            {entry.entryDate.toLocaleDateString('en-US', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric',
                            })}
                        </p>
                    </HStack>
                </VStack>
                <FaChevronRight className={styles.cardChevron} />
            </HStack>
        </Link>
    );
};

export default EntryCard;
