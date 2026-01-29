import React, { useEffect } from 'react';
import { HStack } from 'react-swiftstacks';

import StdButton from '../Buttons/StdButton/StdButton';
import InsetDivider from '../InsetDivider/InsetDivider';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    description?: React.ReactElement;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: 'red' | 'green' | 'default';
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmColor = 'default',
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    // Close on ESC
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className={styles.backdrop} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>{title}</h3>

                {description && (
                    <p className={styles.description}>{description}</p>
                )}

                <InsetDivider />

                <HStack gap="md" justify="center" style={{ marginTop: '25px' }}>
                    <StdButton
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </StdButton>

                    <StdButton
                        type="button"
                        color={confirmColor}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing…' : confirmLabel}
                    </StdButton>
                </HStack>
            </div>
        </div>
    );
};

export default ConfirmModal;
