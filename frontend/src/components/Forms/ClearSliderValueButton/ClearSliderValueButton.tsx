import React from 'react';

import styles from './ClearSliderValueButton.module.css';

interface ClearSliderValueButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    width?: string | number;
}

const ClearSliderValueButton = ({ onClick }: ClearSliderValueButtonProps) => {
    return (
        <button
            type={'button'}
            aria-label={'Clear button'}
            className={styles.clearButton}
            onClick={onClick}
            tabIndex={-1}
        >
            ×
        </button>
    );
};
export default ClearSliderValueButton;
