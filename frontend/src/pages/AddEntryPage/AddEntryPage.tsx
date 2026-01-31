import React, { useState } from 'react';
import { VStack } from 'react-swiftstacks';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { useEntryForm } from '../../hooks/useEntryForm.ts';
import makeClearHandler from '../../utils/makeClearHandler.ts';

import { journalRepository } from '../../data/journalRepository.ts';
import type { OfflineJournalEntry } from '../../types/journalTypes.ts';

import InputField from '../../components/Forms/InputField/InputField';
import Selector from '../../components/Forms/Selector/Selector';
import Slider from '../../components/Forms/Slider/Slider';
import DateTimePicker from '../../components/Forms/DateTimePicker/DateTimePicker';
import StdButton from '../../components/Buttons/StdButton/StdButton';

import { gameStatus } from '../../components/Forms/Selector/status.ts';
import { gamingPlatforms } from '../../components/Forms/Selector/platforms.ts';

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

    const userId = localStorage.getItem('id');

    const requiresRating = formData.status === 'completed';
    const hasRating = formData.rating !== null && formData.rating !== undefined;

    const isFormReady =
        formData.title.trim() &&
        formData.platform &&
        formData.status &&
        formData.entryDate &&
        (!requiresRating || hasRating);

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

        if (!userId) {
            toast.error('User not authenticated');
            return;
        }

        if (!formData.platform || !formData.status || !formData.entryDate) {
            toast.error('Invalid form state');
            return;
        }

        setIsLoading(true);

        const now = new Date().toISOString();

        const offlineEntry: OfflineJournalEntry = {
            localId: crypto.randomUUID(),
            createdBy: userId,
            title: formData.title,
            platform: formData.platform,
            status: formData.status,
            entryDate: new Date(formData.entryDate).toISOString(),
            rating:
                formData.status === 'completed'
                    ? Number(formData.rating)
                    : null,
            createdAt: now,
            updatedAt: now,
            synced: false,
            deleted: false,
        };

        await journalRepository.upsert(offlineEntry);

        if (navigator.onLine) {
            toast.success('Entry saved.');
        } else {
            toast.info('Entry saved. Will sync when you’re back online.');
        }

        navigate('/journal');

        setIsLoading(false);
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
                        isInvalid={!!errors.entryDate}
                        errorMessage={errors.entryDate}
                        placeholder="Select the date this entry applies to..."
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
                        <StdButton
                            type="submit"
                            width="200px"
                            disabled={!isFormReady || isLoading}
                        >
                            {isLoading ? 'Saving…' : 'Add Entry'}
                        </StdButton>
                    </VStack>
                </VStack>
            </form>
        </VStack>
    );
};

export default AddEntryPage;
