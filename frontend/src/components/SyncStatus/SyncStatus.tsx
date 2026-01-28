import type { FC } from 'react';

import { useSyncStatus } from '../../hooks/useSyncStatus';

import styles from './SyncStatus.module.css';

const syncConfig = {
    'all-synced': {
        label: 'All changes synced',
        className: styles.synced,
    },
    pending: {
        label: 'Changes pending sync',
        className: styles.pending,
    },
    syncing: {
        label: 'Syncing…',
        className: styles.pending,
    },
    offline: {
        label: 'Offline — changes saved locally',
        className: styles.offline,
    },
    unreachable: {
        label: 'Server waking up — sync pending',
        className: styles.offline,
    },
} as const;

const SyncStatus: FC = () => {
    const syncStatus = useSyncStatus();
    const current = syncConfig[syncStatus];

    if (!current) return null;

    return (
        <div className={styles.wrapper}>
            <p className={styles.title}>Sync status</p>

            <div className={styles.row}>
                <span className={`${styles.dot} ${current.className}`} />
                <span>{current.label}</span>
            </div>
        </div>
    );
};

export default SyncStatus;
