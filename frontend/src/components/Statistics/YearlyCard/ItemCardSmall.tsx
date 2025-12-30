import styles from './ItemCardSmall.module.css';

type ItemCardSmallProps = {
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
const ItemCardSmall = ({ title, value, color }: ItemCardSmallProps) => {
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
export default ItemCardSmall;
