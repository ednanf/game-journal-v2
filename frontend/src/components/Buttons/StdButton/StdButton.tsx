import React from 'react';
import { HStack } from 'react-swiftstacks';

import styles from './StdButton.module.css';

interface StdButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode;
    color?: 'default' | 'red' | 'green';
    width?: string | number;
}

const StdButton = ({
    icon,
    color = 'default',
    width,
    children,
    ...buttonProps
}: StdButtonProps) => {
    return (
        <button
            className={`${styles.button} ${styles[color]}`}
            style={{ width }}
            {...buttonProps}
        >
            <HStack align={'center'} justify={'center'} gap={'sm'}>
                {children}
                {icon && <span className={styles.icon}>{icon}</span>}
            </HStack>
        </button>
    );
};
export default StdButton;
