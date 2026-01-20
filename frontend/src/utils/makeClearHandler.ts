import React from 'react';

// Returns a function that clears one specific field in a form state.
const makeClearHandler =
    <T extends Record<string, unknown>>(
        setFormData: React.Dispatch<React.SetStateAction<T>>,
        field: keyof T,
        emptyValue: T[keyof T],
    ) =>
    () => {
        setFormData((prev) => ({
            ...prev,
            [field]: emptyValue,
        }));
    };

export default makeClearHandler;
