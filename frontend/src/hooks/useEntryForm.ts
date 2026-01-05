import React, { useState } from 'react';
import type { EntryFormData, EntryFormErrors } from '../types/entry';

export const useEntryForm = (initialData?: Partial<EntryFormData>) => {
    // State that covers both new entries and edited ones
    const [formData, setFormData] = useState<EntryFormData>({
        title: '',
        platform: '',
        status: 'started',
        rating: 5,
        entryDate: new Date(),
        ...initialData, // this allows EditEntryPage pre-fill
    });

    // Errors are optional and follow the EntryFormData shape
    const [errors, setErrors] = useState<EntryFormErrors>({});

    // Standard change handler
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Date change requires a separate handler because date picker doesn't emit a normal event
    const handleDateChange = (date: Date | null) => {
        setFormData((prev) => ({
            ...prev,
            entryDate: date,
        }));
    };

    // Validation encapsulated
    const validate = (): boolean => {
        const newErrors: EntryFormErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Please enter a title';
        if (!formData.platform) newErrors.platform = 'Please select a platform';
        if (!formData.status) newErrors.status = 'Please select a status';
        if (!formData.entryDate)
            newErrors.entryDate = 'Date and time are required';
        else if (isNaN(formData.entryDate.getTime()))
            newErrors.entryDate = 'Invalid date';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return {
        formData,
        setFormData,
        errors,
        handleChange,
        handleDateChange,
        validate,
    };
};
