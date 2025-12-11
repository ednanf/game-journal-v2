import React from 'react';
import styles from './Selector.module.css';

type SelectOption = {
    label: string;
    value: string;
};

type SelectorProps = {
    label?: string;
    name: string;
    id: string;
    size: number;
    value: string;
    values: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
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
    error,
}: SelectorProps) => {
    return (
        <div className={styles.wrapper}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>

            <select
                name={name}
                id={id}
                size={size}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`${styles.selectField} ${error ? styles.selectFieldError : ''}`}
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

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};

export default Selector;
