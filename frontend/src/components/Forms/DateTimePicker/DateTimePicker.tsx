import React from 'react';
import DatePicker from 'react-datepicker';

import styles from './DateTimePicker.module.css';

interface DateTimePickerProps {
    label: string;
    id: string;
    name: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    showTime?: boolean;
    isInvalid?: boolean;
    errorMessage?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
    label,
    id,
    name,
    value,
    onChange,
    showTime = true,
    isInvalid = false,
    errorMessage = 'Invalid date format.',
}) => {
    const inputClasses = [
        styles.inputField,
        isInvalid ? styles.inputFieldError : '',
    ].join(' ');

    return (
        <div className={styles.textInput}>
            <label htmlFor={id} className={styles.inputLabel}>
                {label}
            </label>

            <DatePicker
                id={id}
                name={name}
                selected={value}
                onChange={onChange}
                className={inputClasses}
                // Configuration
                showTimeSelect={showTime}
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat={showTime ? 'Pp' : 'P'}
                // Allows the user to clear the input
                isClearable
            />

            {/* Error Text (Applying .errorText) */}
            {isInvalid && (
                <span className={styles.errorText}>{errorMessage}</span>
            )}
        </div>
    );
};

export default DateTimePicker;
