import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VStack, HStack } from 'react-swiftstacks';

import { journalRepository } from '../../data/journalRepository';
import type { OfflineJournalEntry } from '../../types/journalTypes.ts';

import { useEntryForm } from '../../hooks/useEntryForm';
import { patchUnwrapped } from '../../utils/axiosInstance';
import { syncJournalEntries } from '../../data/journalSync.ts';
import makeClearHandler from '../../utils/makeClearHandler';

import InputField from '../../components/Forms/InputField/InputField';
import DateTimePicker from '../../components/Forms/DateTimePicker/DateTimePicker';
import Selector from '../../components/Forms/Selector/Selector';
import Slider from '../../components/Forms/Slider/Slider';
import StdButton from '../../components/Buttons/StdButton/StdButton';
import LoadingCircle from '../../components/LoadingCircle/LoadingCircle';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

import { gameStatus } from '../../components/Forms/Selector/status';
import { gamingPlatforms } from '../../components/Forms/Selector/platforms';
import { API_BASE_URL } from '../../config/apiURL';

const EntryDetailsPage = () => {
    const {
        formData,
        setFormData,
        errors,
        handleChange,
        handleDateChange,
        validate,
    } = useEntryForm();

    const { id: localId } = useParams<{ id: string }>(); // ← ROUTING USES localId
    const navigate = useNavigate();

    const [entry, setEntry] = useState<OfflineJournalEntry | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const requiresRating = formData.status === 'completed';
    const hasRating = formData.rating !== null && formData.rating !== undefined;

    const isFormReady =
        formData.title.trim() &&
        formData.platform &&
        formData.status &&
        formData.entryDate &&
        (!requiresRating || hasRating);

    /**
     * LOAD ENTRY (LOCAL SOURCE OF TRUTH)
     */
    useEffect(() => {
        if (!localId) return;

        const loadEntry = async () => {
            try {
                const storedEntry = await journalRepository.getById(localId);

                if (!storedEntry) {
                    toast.error('Entry not found');
                    navigate('/journal');
                    return;
                }

                setEntry(storedEntry);
                setFormData({
                    title: storedEntry.title,
                    platform: storedEntry.platform,
                    status: storedEntry.status,
                    rating: storedEntry.rating ?? null,
                    entryDate: new Date(storedEntry.entryDate),
                });
            } catch {
                toast.error('Failed to load entry');
            } finally {
                setIsInitialLoading(false);
            }
        };

        void loadEntry();
    }, [localId, navigate, setFormData]);

    /**
     * UPDATE (LOCAL FIRST, BACKEND OPTIONAL)
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Fix the errors first!');
            return;
        }

        if (!entry) {
            toast.error('Entry not loaded');
            return;
        }

        setIsSubmitting(true);

        try {
            const now = new Date().toISOString();

            // Rating MUST be a number or undefined.
            const updatedEntry: OfflineJournalEntry = {
                ...entry,
                title: formData.title,
                platform: formData.platform!,
                status: formData.status!,
                entryDate: new Date(formData.entryDate!).toISOString(),
                rating:
                    formData.rating === null || formData.rating === undefined
                        ? undefined
                        : Number(formData.rating),
                updatedAt: now,
                synced: false,
            };

            // Always update locally
            await journalRepository.upsert(updatedEntry);

            // Give a nudge to sync
            if (navigator.onLine) {
                void syncJournalEntries();
            }

            // Backend update ONLY if Mongo _id exists
            if (entry._id) {
                try {
                    const patchPayload: Record<string, unknown> = {
                        title: updatedEntry.title,
                        platform: updatedEntry.platform,
                        status: updatedEntry.status,
                        entryDate: updatedEntry.entryDate,
                    };

                    if (
                        updatedEntry.rating !== null &&
                        updatedEntry.rating !== undefined
                    ) {
                        patchPayload.rating = Number(updatedEntry.rating);
                    }

                    await patchUnwrapped(
                        `${API_BASE_URL}/entries/${entry._id}`,
                        patchPayload,
                    );
                    toast.success('Entry updated');
                } catch {
                    toast.info('Updated offline. Will sync later.');
                }
            } else {
                toast.info('Updated offline. Will sync later.');
            }

            navigate('/journal');
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * DELETE (LOCAL FIRST, BACKEND OPTIONAL)
     */
    const handleDeleteClick = async () => {
        if (!entry) return;

        setIsDeleting(true);

        try {
            // Mark as deleted locally
            await journalRepository.upsert({
                ...entry,
                deleted: true,
                synced: false,
            });

            toast.success('Entry deleted');
            navigate('/journal');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleCancelClick = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/journal');
        }
    };

    const handleClearTitle = makeClearHandler(setFormData, 'title', '');
    const handleClearPlatform = makeClearHandler(setFormData, 'platform', null);
    const handleClearStatus = makeClearHandler(setFormData, 'status', null);
    const handleClearRating = makeClearHandler(setFormData, 'rating', null);

    if (isInitialLoading) {
        return (
            <div className="fullscreenLoader">
                <LoadingCircle />
            </div>
        );
    }

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

                    <HStack justify="center" gap="md">
                        <StdButton
                            type="button"
                            onClick={handleCancelClick}
                            width="150px"
                        >
                            Cancel
                        </StdButton>

                        <StdButton
                            type="submit"
                            disabled={!isFormReady || isSubmitting}
                            width="150px"
                            color="green"
                        >
                            {isSubmitting ? 'Saving…' : 'Save'}
                        </StdButton>
                    </HStack>

                    <HStack justify="center">
                        <StdButton
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            color="red"
                            width="150px"
                        >
                            Delete
                        </StdButton>
                    </HStack>
                </VStack>
            </form>

            <ConfirmModal
                open={showDeleteConfirm}
                title="Delete entry?"
                description="This action cannot be undone."
                confirmLabel="Delete"
                confirmColor="red"
                loading={isDeleting}
                onCancel={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteClick}
            />
        </VStack>
    );
};

export default EntryDetailsPage;
