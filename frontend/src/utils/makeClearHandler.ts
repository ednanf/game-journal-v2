import React from 'react';

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
