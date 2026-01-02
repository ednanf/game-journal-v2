import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VStack, HStack } from 'react-swiftstacks';

import { useEntryForm } from '../../hooks/useEntryForm.ts';
import {
    deleteUnwrapped,
    getUnwrappedWithParams,
    patchUnwrapped,
} from '../../utils/axiosInstance.ts';

import InputField from '../../components/Forms/InputField/InputField.tsx';
import DateTimePicker from '../../components/Forms/DateTimePicker/DateTimePicker.tsx';
import Selector from '../../components/Forms/Selector/Selector.tsx';
import Slider from '../../components/Forms/Slider/Slider.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

import { gameStatus } from '../../data/status.ts';
import { gamingPlatforms } from '../../data/platforms.ts';

import type { EntryFormData } from '../../types/entry.ts';
import { API_BASE_URL } from '../../config/apiURL.ts';
import LoadingBar from '../../components/LoadingBar/LoadingBar.tsx';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.tsx';

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
        rating: number;
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

    const [initialLoading, setInitialLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Journal entry ID
    const { id } = useParams<{ id: string }>();

    const isFormReady =
        formData.title.trim() &&
        formData.platform &&
        formData.status &&
        formData.entryDate;

    const navigate = useNavigate();

    // Initial fetching
    useEffect(() => {
        if (!id) return;

        const fetchEntry = async () => {
            if (!initialLoading) setInitialLoading(true);

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
                    rating: entry.rating,
                    entryDate: new Date(entry.entryDate),
                });
            } catch (e) {
                toast.error((e as { message: string }).message);
            } finally {
                setInitialLoading(false);
            }
        };
        void fetchEntry();
    }, [id, setFormData]);

    // Convert rating to number (slider outputs a string)
    const payload = {
        ...formData,
        rating: Number(formData.rating),
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData) return;

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
            toast.error('No entry with give ID found.');
            return;
        }

        setIsSubmitting(true);

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

    return (
        <VStack>
            {initialLoading || !formData ? (
                <div className="fullscreenLoader">
                    <LoadingBar />
                </div>
            ) : (
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

                        <HStack
                            justify={'center'}
                            gap={'md'}
                            style={{ marginTop: '1rem' }}
                        >
                            <StdButton
                                type={'button'}
                                onClick={handleCancelClick}
                                width={'150px'}
                            >
                                Cancel
                            </StdButton>
                            {!isSubmitting ? (
                                <StdButton
                                    type="submit"
                                    disabled={!isFormReady || isSubmitting}
                                    width={'150px'}
                                    color={'green'}
                                >
                                    Save
                                </StdButton>
                            ) : (
                                <StdButton
                                    type="submit"
                                    disabled={!isFormReady || isSubmitting}
                                    width={'150px'}
                                >
                                    Saving...
                                </StdButton>
                            )}
                        </HStack>
                        <HStack justify={'center'}>
                            <StdButton
                                type={'button'}
                                onClick={() => setShowDeleteConfirm(true)}
                                color={'red'}
                                width={'150px'}
                            >
                                Delete
                            </StdButton>
                        </HStack>
                    </VStack>
                </form>
            )}

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
