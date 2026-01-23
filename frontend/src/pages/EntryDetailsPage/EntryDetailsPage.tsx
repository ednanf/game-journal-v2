import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VStack, HStack } from 'react-swiftstacks';

import { useEntryForm } from '../../hooks/useEntryForm';
import {
    deleteUnwrapped,
    getUnwrappedWithParams,
    patchUnwrapped,
} from '../../utils/axiosInstance';

import InputField from '../../components/Forms/InputField/InputField';
import DateTimePicker from '../../components/Forms/DateTimePicker/DateTimePicker';
import Selector from '../../components/Forms/Selector/Selector';
import Slider from '../../components/Forms/Slider/Slider';
import StdButton from '../../components/Buttons/StdButton/StdButton';

import { gameStatus } from '../../components/Forms/Selector/status.ts';
import { gamingPlatforms } from '../../components/Forms/Selector/platforms.ts';

import type { EntryFormData } from '../../types/entryForm';
import { API_BASE_URL } from '../../config/apiURL';
import LoadingCircle from '../../components/LoadingCircle/LoadingCircle';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import makeClearHandler from '../../utils/makeClearHandler';

interface PatchResponse {
    message: string;
}

type EntryDetailsApiResponse = {
    message: string;
    content: {
        _id: string;
        title: string;
        platform: string;
        status: EntryFormData['status'];
        entryDate: string;
        rating?: number;
    };
};

const EntryDetailsPage = () => {
    const {
        formData,
        setFormData,
        errors,
        handleChange,
        handleDateChange,
        validate,
    } = useEntryForm();

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const requiresRating = formData.status === 'completed';
    const hasRating = formData.rating !== null && formData.rating !== undefined;

    const isFormReady =
        formData.title.trim() &&
        formData.platform &&
        formData.status &&
        formData.entryDate &&
        (!requiresRating || hasRating);

    useEffect(() => {
        if (!id) return;

        const fetchEntry = async () => {
            setIsInitialLoading(true);

            try {
                const response =
                    await getUnwrappedWithParams<EntryDetailsApiResponse>(
                        `/entries/${id}`,
                    );

                const entry = response.content;

                setFormData({
                    title: entry.title,
                    platform: entry.platform,
                    status: entry.status,
                    rating: entry.rating ?? null,
                    entryDate: new Date(entry.entryDate),
                });
            } catch (e) {
                toast.error((e as { message: string }).message);
            } finally {
                setIsInitialLoading(false);
            }
        };

        void fetchEntry();
    }, [id, setFormData]);

    const payload = {
        ...(formData.title && { title: formData.title }),
        ...(formData.platform && { platform: formData.platform }),
        ...(formData.status && { status: formData.status }),
        ...(formData.entryDate && { entryDate: formData.entryDate }),
        ...(formData.rating != null && {
            rating: Number(formData.rating),
        }),
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

        setIsSubmitting(true);

        try {
            const response = await patchUnwrapped<PatchResponse>(
                `${API_BASE_URL}/entries/${id}`,
                payload,
            );

            toast.success(response.message);
            navigate('/journal');
        } catch (e) {
            toast.error((e as { message: string }).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelClick = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/journal');
        }
    };

    const handleDeleteClick = async () => {
        if (!id) {
            toast.error('No entry with given ID found.');
            return;
        }

        setIsDeleting(true);

        try {
            const response = await deleteUnwrapped<EntryDetailsApiResponse>(
                `/entries/${id}`,
            );

            toast.success(response.message);
            navigate('/journal');
        } catch (e) {
            toast.error((e as { message: string }).message);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

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
                        placeholder={'Select the date this entry applies to...'}
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

                    <HStack
                        justify="center"
                        gap="md"
                        style={{ marginTop: '1rem' }}
                    >
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
