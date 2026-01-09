import React from 'react';
import styles from './Slider.module.css';
import { VStack } from 'react-swiftstacks';
import ClearSliderValueButton from '../ClearSliderValueButton/ClearSliderValueButton.tsx';

type SliderProps = {
    label?: string;
    name: string;
    min: number;
    max: number;
    value: number | null;
    disabled?: boolean;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: (e: React.MouseEvent) => void;
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
    onClear,
}: SliderProps) {
    const DEFAULT_RATING = 5;

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
                        value={value ?? DEFAULT_RATING}
                        disabled={disabled}
                        onChange={onChange}
                        className={`${styles.slider} ${
                            error ? styles.sliderError : ''
                        }`}
                    />

                    <span className={styles.value}>
                        {value === null ? '–' : value}
                    </span>

                    {value && !disabled && (
                        <ClearSliderValueButton onClick={onClear} />
                    )}
                </div>
            </VStack>

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
}

export default Slider;
