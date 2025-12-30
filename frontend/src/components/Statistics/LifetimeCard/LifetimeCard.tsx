import ItemCard from './ItemCard.tsx';
import styles from './LifetimeCard.module.css';

type LifetimeCardProps = {
    title: string;
    started: number;
    completed: number;
    dropped: number;
    paused: number;
    revisited: number;
};

const LifetimeCard = ({
    title,
    started,
    completed,
    dropped,
    paused,
    revisited,
}: LifetimeCardProps) => (
    <div className={styles.cardContainer}>
        <div className={styles.cardHeader}>
            <h3>{title}</h3>
        </div>
        <div className={styles.cardContentGrid}>
            {/* First row */}
            <ItemCard
                title="Started"
                value={started > 0 ? started : 0}
                color="started"
            />
            <div className={styles.divider} />
            <ItemCard
                title="Completed"
                value={completed > 0 ? completed : 0}
                color="completed"
            />
            <div className={styles.divider} />
            <ItemCard
                title="Dropped"
                value={dropped > 0 ? dropped : 0}
                color="dropped"
            />
            {/* Second row */}
            <ItemCard
                title="Paused"
                value={paused > 0 ? paused : 0}
                color="paused"
            />
            <div className={styles.divider} />
            <ItemCard
                title="Revisited"
                value={revisited > 0 ? revisited : 0}
                color="revisited"
            />
            <div className={styles.divider} />
            {/* Empty cell at gridColumn: 5, gridRow: 2 */}
        </div>
    </div>
);

export default LifetimeCard;
