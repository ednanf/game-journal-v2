import React, { useState } from 'react';
import { VStack } from 'react-swiftstacks';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { useEntryForm } from '../../hooks/useEntryForm.ts';
import { postUnwrapped } from '../../utils/axiosInstance.ts';
import makeClearHandler from '../../utils/makeClearHandler.ts';

import InputField from '../../components/Forms/InputField/InputField';
import Selector from '../../components/Forms/Selector/Selector';
import Slider from '../../components/Forms/Slider/Slider';
import DateTimePicker from '../../components/Forms/DateTimePicker/DateTimePicker';
import StdButton from '../../components/Buttons/StdButton/StdButton';

import { API_BASE_URL } from '../../config/apiURL.ts';
import { gameStatus } from '../../data/status';
import { gamingPlatforms } from '../../data/platforms';

interface CreationResponse {
    message: string;
}

// TODO: ensure new entries do not have a rating, unless they are completed
// no default value - might have to change the backend

// TODO: ADD CLEAR BUTTONS AND HANDLERS TO ALL FIELDS IN THE PROJECT

const AddEntryPage: React.FC = () => {
    const {
        formData,
        setFormData,
        errors,
        handleChange,
        handleDateChange,
        validate,
    } = useEntryForm();

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const isFormReady =
        formData.title.trim() &&
        formData.platform &&
        formData.status &&
        formData.entryDate;

    // Convert rating to number (slider outputs a string)
    const payload = {
        ...formData,
        rating: Number(formData.rating),
    };

    const handleClearTitle = makeClearHandler(setFormData, 'title', '');

    const handleClearPlatform = makeClearHandler(setFormData, 'platform', null);

    const handleClearStatus = makeClearHandler(setFormData, 'status', null);

    const handleClearRating = makeClearHandler(setFormData, 'rating', null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Fix the errors first!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await postUnwrapped<CreationResponse>(
                `${API_BASE_URL}/entries`,
                payload,
            );

            toast.success(response.message);

            navigate('/journal');
        } catch (e) {
            toast.error((e as { message: string }).message);
        } finally {
            setIsLoading(false);
        }
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
                        onClear={handleClearTitle}
                        error={errors.title}
                    />

                    <Selector
                        label="Platform"
                        id="platform"
                        name="platform"
                        size={1}
                        value={formData.platform ?? ''}
                        values={gamingPlatforms}
                        placeholder="Select a platform..."
                        onChange={handleChange}
                        onClear={handleClearPlatform}
                        error={errors.platform}
                    />

                    <Selector
                        label="Status"
                        id="status"
                        name="status"
                        size={1}
                        value={formData.status ?? ''}
                        values={gameStatus}
                        placeholder="Select status..."
                        onChange={handleChange}
                        onClear={handleClearStatus}
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
                        onClear={handleClearRating}
                        disabled={formData.status !== 'completed'}
                    />

                    <VStack align="center" style={{ marginTop: '1rem' }}>
                        {!isLoading ? (
                            <StdButton
                                type="submit"
                                width="200px"
                                disabled={!isFormReady || isLoading}
                            >
                                Add Entry
                            </StdButton>
                        ) : (
                            <StdButton
                                type="submit"
                                width="200px"
                                disabled={!isFormReady || isLoading}
                            >
                                Saving...
                            </StdButton>
                        )}
                    </VStack>
                </VStack>
            </form>
        </VStack>
    );
};

export default AddEntryPage;
