import styles from './ItemCard.module.css';

type ItemCardProps = {
    title: string;
    value: number;
    color:
        | 'completed'
        | 'started'
        | 'revisited'
        | 'paused'
        | 'dropped'
        | 'defaultStatus';
};
const ItemCard = ({ title, value, color }: ItemCardProps) => {
    function statusColor(statusValue: string): string {
        switch (statusValue) {
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
    }

    return (
        <div className={styles.cardContainer}>
            <div className={`${styles.cardTitle} ${statusColor(color)}`}>
                {title}
            </div>
            <div className={`${styles.cardValue} ${statusColor(color)}`}>
                {value}
            </div>
        </div>
    );
};
export default ItemCard;
