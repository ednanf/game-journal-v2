import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HStack, VStack } from 'react-swiftstacks';

import makeClearHandler from '../../utils/makeClearHandler.ts';
import {
    deleteUnwrapped,
    getUnwrapped,
    patchUnwrapped,
} from '../../utils/axiosInstance';

import InputField from '../../components/Forms/InputField/InputField';
import StdButton from '../../components/Buttons/StdButton/StdButton';
import LoadingCircle from '../../components/LoadingCircle/LoadingCircle.tsx';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.tsx';

import '../shared.css';

type EditAccountFormData = {
    email: string;
    newPassword: string;
    confirmNewPassword: string;
};

type AccountDataApiResponse = {
    message: string;
    id: string;
    email: string;
};

type UpdateAccountPayload = {
    email?: string;
    password?: string;
};

const AccountSettingsPage = () => {
    const [formData, setFormData] = useState<EditAccountFormData>({
        email: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [initialEmail, setInitialEmail] = useState('');
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();

    const isOffline = !navigator.onLine;

    // Trim email to evaluate changes and to prepare to send to the backend
    const trimmedEmail = formData.email.trim();

    // Check if there were any changes – used for toast feedback
    const emailChanged =
        trimmedEmail.length > 0 && trimmedEmail !== initialEmail;

    // Initial loading
    useEffect(() => {
        const fetchUserDetails = async () => {
            setIsInitialLoading(true);

            try {
                const response =
                    await getUnwrapped<AccountDataApiResponse>('/user/');

                setFormData((prev) => ({
                    ...prev,
                    email: response.email,
                }));

                // Set initial email to compare if there were any changes
                setInitialEmail(response.email);
            } catch (e) {
                toast.error((e as { message: string }).message);
            } finally {
                setIsInitialLoading(false);
            }
        };

        void fetchUserDetails();
    }, []);

    // Generic handler for keystrokes in all input fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Ensure to TS that key will be one of the keys in EditAccountFormData
        const key = name as keyof EditAccountFormData;

        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleClearEmail = makeClearHandler(setFormData, 'email', '');

    const handleClearNewPassword = makeClearHandler(
        setFormData,
        'newPassword',
        '',
    );

    const handleClearConfirmNewPassword = makeClearHandler(
        setFormData,
        'confirmNewPassword',
        '',
    );

    const handleBackClick = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/settings');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevents submitting before the previous one is done
        if (isSubmitting) return;

        // Ensures both password inputs are filled if one is typed in
        const wantsPasswordChange =
            formData.newPassword || formData.confirmNewPassword;

        if (wantsPasswordChange) {
            if (!formData.newPassword || !formData.confirmNewPassword) {
                toast.error('Please fill in both password fields.');
                return;
            }

            if (formData.newPassword !== formData.confirmNewPassword) {
                toast.error('Passwords do not match.');
                return;
            }
        }

        // Builds the payload with trimmed email and updated password
        const payload: UpdateAccountPayload = {
            ...(emailChanged && { email: trimmedEmail }),
            ...(wantsPasswordChange && {
                password: formData.newPassword,
            }),
        };

        // Feedback when no change was detected
        if (Object.keys(payload).length === 0) {
            toast.info('No changes to save.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await patchUnwrapped<{ message: string }>(
                '/user/',
                payload,
            );

            toast.success(response.message);

            // Update baseline and clear sensitive fields
            if (emailChanged) {
                setInitialEmail(trimmedEmail);
            }

            setFormData((prev) => ({
                ...prev,
                newPassword: '',
                confirmNewPassword: '',
            }));
        } catch (e) {
            toast.error((e as { message: string }).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = async () => {
        setIsDeleting(true);

        try {
            const response =
                await deleteUnwrapped<AccountDataApiResponse>('/user');

            toast.success(response.message);

            navigate('/');
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
        <form onSubmit={handleSubmit}>
            <VStack gap={'md'} padding={'md'} className="formVStack">
                {isOffline && (
                    <HStack justify={'center'}>
                        <p>Offline — changes are currently disabled </p>
                    </HStack>
                )}

                <InputField
                    label={'Email'}
                    type={'email'}
                    id={'email'}
                    name={'email'}
                    value={formData.email}
                    placeholder={'Enter your email address....'}
                    onChange={handleChange}
                    onClear={handleClearEmail}
                />

                <InputField
                    label={'New password'}
                    type={'password'}
                    id={'newPassword'}
                    name={'newPassword'}
                    value={formData.newPassword}
                    placeholder={'Enter a new password...'}
                    onChange={handleChange}
                    onClear={handleClearNewPassword}
                />

                <InputField
                    label={'Confirm new password'}
                    type={'password'}
                    id={'confirmNewPassword'}
                    name={'confirmNewPassword'}
                    value={formData.confirmNewPassword}
                    placeholder={'Confirm your new password...'}
                    onChange={handleChange}
                    onClear={handleClearConfirmNewPassword}
                />

                <HStack
                    justify={'center'}
                    gap={'md'}
                    style={{ marginTop: '1rem' }}
                >
                    <StdButton
                        type={'button'}
                        onClick={handleBackClick}
                        width={'150px'}
                    >
                        Back
                    </StdButton>

                    {!isSubmitting ? (
                        <StdButton
                            type={'submit'}
                            width={'150px'}
                            color={'green'}
                            disabled={isOffline}
                        >
                            Save
                        </StdButton>
                    ) : (
                        <StdButton
                            type={'submit'}
                            width={'150px'}
                            color={'green'}
                            disabled={isSubmitting}
                        >
                            Saving...
                        </StdButton>
                    )}
                </HStack>

                <HStack justify={'center'} style={{ marginTop: '2rem' }}>
                    <StdButton
                        type={'button'}
                        width={'250px'}
                        color={'red'}
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isOffline}
                    >
                        Delete Account
                    </StdButton>
                </HStack>
            </VStack>

            <ConfirmModal
                open={showDeleteConfirm}
                title={'Delete Account'}
                description={'Warning: This action cannot be undone.'}
                confirmLabel={'Delete'}
                confirmColor={'red'}
                loading={isDeleting}
                onConfirm={handleDeleteClick}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </form>
    );
};

export default AccountSettingsPage;
