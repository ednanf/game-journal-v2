import React from 'react';
import styles from './Slider.module.css';
import { VStack } from 'react-swiftstacks';

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
    value,
    disabled,
    error,
    onChange,
}: SliderProps) {
    return (
        <div className={styles.sliderContainer}>
            <VStack gap={1}>
                {label && (
                    <label htmlFor={name} className={styles.label}>
                        {label}
                    </label>
                )}

                <div className={styles.sliderRow}>
                    <input
                        type="range"
                        id={name}
                        name={name}
                        min={min}
                        max={max}
                        value={value}
                        disabled={disabled}
                        onChange={onChange}
                        className={`${styles.slider} ${
                            error ? styles.sliderError : ''
                        }`}
                    />

                    <span className={styles.value}>{value}</span>
                </div>
            </VStack>

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
}

export default Slider;
