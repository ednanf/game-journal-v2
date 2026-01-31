import { Link } from 'react-router-dom';
import { HStack, VStack } from 'react-swiftstacks';

import { FaStar } from 'react-icons/fa6';
import { FaChevronRight } from 'react-icons/fa';

import styles from './EntryCard.module.css';

interface JournalEntry {
    title: string;
    platform: string;
    status: string;
    rating: number | null;
    entryDate: Date;
    to?: string;
}

const EntryCard = ({
    title,
    platform,
    status,
    rating,
    entryDate,
    to,
}: JournalEntry) => {
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

    // Component without navigation prop "to"
    const content = (
        <HStack gap={'md'} className={styles.cardContainer}>
            <VStack className={styles.content}>
                <h3 className={styles.title}>
                    {title}
                    {title.length > 31 && <span className={styles.titleFade} />}
                </h3>
                <p className={styles.platform}>{platform}</p>
                <HStack gap={'md'} align={'center'}>
                    <p
                        className={`${statusLabelStyle(status)} ${styles.statusBadge}`}
                    >
                        {status}
                    </p>
                    {status === 'completed' && (
                        <p className={styles.rating}>
                            <FaStar size={14} />
                            {rating} / 10
                        </p>
                    )}
                </HStack>
                <HStack justify={'end'} className={styles.date}>
                    <p>
                        {entryDate.toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                        })}
                    </p>
                </HStack>
            </VStack>
            <FaChevronRight className={styles.cardChevron} />
        </HStack>
    );

    return to ? (
        <Link to={to} className={styles.link}>
            {content}
        </Link>
    ) : (
        <div className={styles.link}>{content}</div>
    );
};

export default EntryCard;
