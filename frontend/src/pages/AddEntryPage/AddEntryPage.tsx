import React, { useState } from 'react';
import { VStack } from 'react-swiftstacks';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import InputField from '../../components/Forms/InputField/InputField';
import Selector from '../../components/Forms/Selector/Selector';
import Slider from '../../components/Forms/Slider/Slider';
import DateTimePicker from '../../components/Forms/DateTimePicker/DateTimePicker';
import StdButton from '../../components/Buttons/StdButton/StdButton';

import { gameStatus } from '../../data/status';
import { gamingPlatforms } from '../../data/platforms';

type FormData = {
    title: string;
    platform: string;
    status: string;
    rating: number;
    entryDate: Date | null;
};

type FormErrors = Partial<Record<keyof Omit<FormData, 'rating'>, string>>;

const AddEntryPage: React.FC = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [formData, setFormData] = useState<FormData>({
        title: '',
        platform: '',
        status: '',
        rating: 5,
        entryDate: new Date(),
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    // --- HANDLERS ---
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (date: Date | null) => {
        setFormData((prev) => ({
            ...prev,
            entryDate: date,
        }));
    };

    // --- VALIDATION ---
    const validate = (data: FormData): FormErrors => {
        const newErrors: FormErrors = {};

        if (!data.title.trim()) newErrors.title = 'Please enter a title';
        if (!data.platform) newErrors.platform = 'Please select a platform';
        if (!data.status) newErrors.status = 'Please select a status';
        if (!data.entryDate) newErrors.entryDate = 'Date and time are required';
        else if (isNaN(data.entryDate.getTime()))
            newErrors.entryDate = 'Invalid date';

        return newErrors;
    };

    const isFormReady =
        formData.title.trim() &&
        formData.platform &&
        formData.status &&
        formData.entryDate;

    // --- SUBMIT ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast.error('Fix the errors first');
            return;
        }

        setIsLoading(true);

        // Simulate submit
        setTimeout(() => {
            toast.success('Entry added');
            setIsLoading(false);
            navigate('/');
        }, 800);
    };

    return (
        <VStack>
            <form onSubmit={handleSubmit}>
                <VStack
                    gap="lg"
                    style={{ maxWidth: '400px' }}
                    padding="md"
                    className="formVStack"
                >
                    <InputField
                        label="Title"
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        placeholder="Enter a title..."
                        onChange={handleChange}
                        error={errors.title}
                    />

                    <Selector
                        label="Platform"
                        id="platform"
                        name="platform"
                        size={1}
                        value={formData.platform}
                        values={gamingPlatforms}
                        placeholder="Select a platform..."
                        onChange={handleChange}
                        error={errors.platform}
                    />

                    <Selector
                        label="Status"
                        id="status"
                        name="status"
                        size={1}
                        value={formData.status}
                        values={gameStatus}
                        placeholder="Select status..."
                        onChange={handleChange}
                        error={errors.status}
                    />

                    <DateTimePicker
                        label="Date"
                        id="entryDate"
                        name="entryDate"
                        value={formData.entryDate}
                        onChange={handleDateChange}
                        showTime
                        isInvalid={!!errors.entryDate}
                        errorMessage={errors.entryDate}
                    />

                    <Slider
                        label="Rating"
                        name="rating"
                        min={0}
                        max={10}
                        value={formData.rating}
                        onChange={handleChange}
                        disabled={formData.status !== 'completed'}
                    />

                    <VStack align="center" style={{ marginTop: '1rem' }}>
                        <StdButton
                            type="submit"
                            width="200px"
                            disabled={!isFormReady || isLoading}
                        >
                            Add Entry
                        </StdButton>
                    </VStack>
                </VStack>
            </form>
        </VStack>
    );
};

export default AddEntryPage;
