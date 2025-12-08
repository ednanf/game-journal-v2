import React from 'react';
import { HStack } from 'react-swiftstacks';

import styles from './StdButton.module.css';

interface StdButtonProps {
    icon?: React.ReactNode;
    type: 'button' | 'submit' | 'reset';
    handleClick?: () => void;
    color?: 'default' | 'red' | 'green';
    width?: string | number;
    disabled?: boolean;
    children?: React.ReactNode;
}

const StdButton = ({
                       icon,
                       type,
                       handleClick,
                       color = 'default',
                       width,
                       disabled,
                       children,
                   }: StdButtonProps) => {
    return (
        <button
            type={type}
            onClick={handleClick}
            className={`${styles.button} ${styles[`${color}`]}`}
            style={{ width }}
            disabled={disabled}
        >
            <HStack align={'center'} justify={'center'} gap={'sm'}>
                {children}
                {/* Render icon if provided */}
                {icon && <span className={styles.icon}>{icon}</span>}{' '}
            </HStack>
        </button>
    );
};
export default StdButton;
