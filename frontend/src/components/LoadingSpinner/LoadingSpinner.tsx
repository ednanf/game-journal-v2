import styles from './LoadingSpinner.module.css';

const LoadingSpinner = () => {
    return (
        <div className={styles.loading}>
            <div className={styles.d1} />
            <div className={styles.d2} />
        </div>
    );
};

export default LoadingSpinner;
