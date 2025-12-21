import React from 'react';
import DatePicker from 'react-datepicker';
import { VStack } from 'react-swiftstacks';

import styles from './DateTimePicker.module.css';

interface DateTimePickerProps {
    label?: string;
    id: string;
    name: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    showTime?: boolean;
    isInvalid?: boolean;
    errorMessage?: string;
}

// Prevent mobile keyboard
const PickerInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input ref={ref} {...props} readOnly inputMode="none" />);

PickerInput.displayName = 'PickerInput';

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
            <VStack gap={1}>
                {label && (
                    <label htmlFor={id} className={styles.inputLabel}>
                        {label}
                    </label>
                )}

                <DatePicker
                    id={id}
                    name={name}
                    selected={value}
                    onChange={onChange}
                    className={inputClasses}
                    customInput={<PickerInput />}
                    showTimeSelect={showTime}
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat={showTime ? 'Pp' : 'P'}
                    isClearable
                    popperPlacement="top"
                />
            </VStack>

            {isInvalid && (
                <span className={styles.errorText}>{errorMessage}</span>
            )}
        </div>
    );
};

export default DateTimePicker;
