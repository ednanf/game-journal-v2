import React from 'react';

import styles from './ClearFormButton.module.css';

interface ClearFormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    width?: string | number;
}

const ClearFormButton = ({ onClick }: ClearFormButtonProps) => {
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
export default ClearFormButton;
