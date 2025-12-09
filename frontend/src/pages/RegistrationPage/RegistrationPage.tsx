import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VStack } from 'react-swiftstacks';

import InputField from '../../components/Forms/InputField/InputField.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

import logo from '../../assets/logo.png';

import '../shared.css';
import {postUnwrapped} from '../../utils/axiosInstance.ts';
import { toast } from 'react-toastify';

type FormData = {
    email: string,
    password: string,
    confirmPassword: string,
}

type RegistrationResponse = {
    message: string,
    id: string,
    email: string,
    token: string,
}

type ApiError = {
    message: string,
}

const RegistrationPage = () => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Partial<FormData>>({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Check if form is filled -> returns true if so
    const isFormReady = () => {
        return (
            formData.email.trim() !== '' &&
            formData.password.trim() !== '' &&
            formData.confirmPassword.trim() !== ''
        );
    };

    const validateForm = (data: FormData) => {
        const newErrors: FormData = {
            email: '',
            password: '',
            confirmPassword: '',
        };

        if (!data.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!data.password) {
            newErrors.password = 'Password is required';
        }
        if (!data.confirmPassword) {
            newErrors.confirmPassword = 'Password confirmation is required';
        }
        if (data.password !== data.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate password confirmation
        if (name === 'password' || name === 'confirmPassword') {
            const password = name === 'password' ? value : formData.password;
            const confirmPassword =
                      name === 'confirmPassword' ? value : formData.confirmPassword;

            if (confirmPassword && password !== confirmPassword) {
                setErrors({
                    ...errors,
                    confirmPassword: 'Passwords do not match',
                });
            } else {
                setErrors({ ...errors, confirmPassword: '' });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Reset errors
        setErrors({
            email: '',
            password: '',
            confirmPassword: '',
        });

        // Basic validation - Zod will validate on the backend
        // This is just to provide immediate feedback to the user
        const validationErrors = validateForm(formData);
        if (
            validationErrors.email ||
            validationErrors.password ||
            validationErrors.confirmPassword
        ) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Send
            const data = await postUnwrapped<RegistrationResponse>(
                'auth/register',
                {
                    email: formData.email,
                    password: formData.password,
                },
            );

            localStorage.setItem('id', data.id);
            localStorage.setItem('email', data.email);
            localStorage.setItem('token', data.token);

            // Dispatch a custom event to notify other parts of the app about the local storage change
            // Needed for things like showing the correct nav bar options
            window.dispatchEvent(new Event('local-storage'));

            toast.success(data.message);

            navigate('/journal');
        } catch (e) {
            const apiError = e as ApiError;
            toast.error(
                apiError.message || 'Registration failed. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <VStack>

            <VStack align={'center'} style={{ marginTop: '1rem' }}>
                <img src={logo} style={{ height: '100px' }}
                     alt={'Game Journal logo'}></img>
                <h2>Create your account</h2>
            </VStack>

            <form onSubmit={handleSubmit}>

                <VStack gap={'lg'} style={{ maxWidth: '400px' }} padding={'md'}
                        className="formVStack">

                    <InputField type={'email'}
                                label={'Email'}
                                id={'email'}
                                name={'email'}
                                value={formData.email}
                                placeholder={'jon@doe.com'}
                                onChange={handleChange}
                                required={true}
                                error={errors.email}
                    />

                    <InputField type={'password'}
                                label={'Password'}
                                id={'password'}
                                name={'password'}
                                value={formData.password}
                                placeholder={'Minimum of 6 characters...'}
                                onChange={handleChange}
                                required={true}
                                error={errors.password}
                    />

                    <InputField type={'password'}
                                label={'Confirm Password'}
                                id={'confirmPassword'}
                                name={'confirmPassword'}
                                value={formData.confirmPassword}
                                placeholder={'Minimum of 6 characters...'}
                                onChange={handleChange}
                                required={true}
                                error={errors.confirmPassword}
                    />

                    <VStack align={'center'} style={{ marginTop: '1rem' }}>
                        <StdButton
                            width={'200px'}
                            type={'submit'}
                            disabled={isLoading || !isFormReady()}
                        >
                            Sign Up
                        </StdButton>
                    </VStack>

                </VStack>

            </form>

            <VStack align={'center'} style={{ marginTop: '3rem' }}>

                <p>
                    <Link to={'/login'} className="lplinks">
                        Already have an account? Log in here
                    </Link>
                </p>

            </VStack>

        </VStack>
    );
};
export default RegistrationPage;
