import React from 'react';
import styles from './InputField.module.css';
import { VStack } from 'react-swiftstacks';
import ClearFormButton from '../ClearFormButton/ClearFormButton.tsx';

type InputFieldProps = {
    label?: string;
    type: 'text' | 'email' | 'password';
    id: string;
    name: string;
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: (e: React.MouseEvent) => void;
    required?: boolean;
    error?: string;
    disabled?: boolean;
};

const InputField = ({
    label,
    type,
    id,
    name,
    value,
    placeholder,
    onChange,
    onClear,
    required,
    error,
    disabled,
}: InputFieldProps) => {
    return (
        <div className={styles.textInput}>
            <VStack gap={1}>
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>

                <div className={styles.inputWrapper}>
                    <input
                        type={type}
                        id={id}
                        name={name}
                        value={value}
                        placeholder={placeholder}
                        onChange={onChange}
                        autoComplete="on"
                        required={!!required}
                        className={`${styles.inputField} ${error ? styles.inputFieldError : ''}`}
                        disabled={disabled}
                    />

                    {value && !disabled && (
                        <ClearFormButton onClick={onClear} />
                    )}
                </div>
            </VStack>
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};
export default InputField;
