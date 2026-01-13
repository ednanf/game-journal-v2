import React from 'react';
import styles from './LoadingDots.module.css';

const LoadingDots = () => {
    return (
        <div className={styles.container} aria-label="Loading">
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
        </div>
    );
};

export default LoadingDots;
