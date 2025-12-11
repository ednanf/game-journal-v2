import React from 'react';
import styles from './Slider.module.css';

type SliderProps = {
    label?: string;
    name: string;
    min: number;
    max: number;
    value: number;
    disabled?: boolean;
    error?: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function Slider({
    label,
    name,
    min = 0,
    max = 10,
    value = 5,
    disabled,
    error,
    onChange,
}: SliderProps) {
    return (
        <div className={styles.sliderContainer}>
            <label htmlFor={name} className={styles.label}>
                {label ?? name}
            </label>

            <input
                type="range"
                id={name}
                name={name}
                min={min}
                max={max}
                value={value}
                disabled={disabled}
                onChange={onChange}
                className={`${styles.sliderInput} ${error ? styles.sliderInputError : ''}`}
            />

            <span className={styles.sliderValue}>{value}</span>
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
}

export default Slider;
