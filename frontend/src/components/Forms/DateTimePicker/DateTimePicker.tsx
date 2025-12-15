// src/components/Forms/DateTimePicker/DateTimePicker.tsx

import React from 'react';
import DatePicker from 'react-datepicker';
// Import the styles module
import styles from './DateTimePicker.module.css';

// Remember to import the global react-datepicker CSS once in your project:
// import 'react-datepicker/dist/react-datepicker.css';

interface DateTimePickerProps {
    label: string;
    id: string;
    name: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    showTime?: boolean;
    // Added for consistent error display
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
    // Combine base class with error class if needed
    const inputClasses = [
        styles.inputField,
        isInvalid ? styles.inputFieldError : '',
    ].join(' ');

    return (
        // 1. Container (Applying .textInput)
        <div className={styles.textInput}>
            {/* 2. Label (Applying .inputLabel) */}
            <label htmlFor={id} className={styles.inputLabel}>
                {label}
            </label>

            {/* 3. DatePicker */}
            <DatePicker
                id={id}
                name={name}
                selected={value}
                onChange={onChange}
                // CRUCIAL: Applying our styled input class
                className={inputClasses}
                // Configuration
                showTimeSelect={showTime}
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat={showTime ? 'Pp' : 'P'}
                // Allows the user to clear the input
                isClearable
            />

            {/* 4. Error Text (Applying .errorText) */}
            {isInvalid && (
                <span className={styles.errorText}>{errorMessage}</span>
            )}
        </div>
    );
};

export default DateTimePicker;
