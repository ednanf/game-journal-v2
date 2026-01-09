import React from 'react';
import styles from './Selector.module.css';
import { VStack } from 'react-swiftstacks';
import ClearFormButton from '../ClearFormButton/ClearFormButton.tsx';

type SelectOption = {
    label: string;
    value: string;
};

type SelectorProps = {
    label?: string;
    id: string;
    name: string;
    size: number;
    value: string; // Selectors treat null values as empty string
    values: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onClear: (e: React.MouseEvent) => void;
    error?: string;
};

const Selector = ({
    label,
    name,
    id,
    size,
    value,
    values,
    placeholder,
    disabled,
    onChange,
    onClear,
    error,
}: SelectorProps) => {
    return (
        <div className={styles.selectWrapper}>
            <VStack gap={1}>
                {label && (
                    <label htmlFor={id} className={styles.label}>
                        {label}
                    </label>
                )}

                <div className={styles.selectContainer}>
                    <select
                        id={id}
                        name={name}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        size={size}
                        className={`${styles.selectField} ${
                            error ? styles.selectFieldError : ''
                        }`}
                    >
                        {placeholder && (
                            <option value="" disabled hidden>
                                {placeholder}
                            </option>
                        )}

                        {values.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <span className={styles.arrow} />

                    {value && !disabled && (
                        <ClearFormButton onClick={onClear} />
                    )}
                </div>
            </VStack>

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};

export default Selector;
