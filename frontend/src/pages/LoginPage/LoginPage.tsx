import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VStack } from 'react-swiftstacks';

import {useAuth} from '../../auth/AuthContext.tsx';

import InputField from '../../components/Forms/InputField/InputField.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

import logo from '../../assets/logo-icon.png';

import { postUnwrapped } from '../../utils/axiosInstance.ts';
import makeClearHandler from '../../utils/makeClearHandler.ts';

import '../shared.css';

type FormData = {
    email: string;
    password: string;
};

type RegistrationResponse = {
    message: string;
    id: string;
    email: string;
    token: string;
};

type ApiError = {
    message: string;
};

const LoginPage = () => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<Partial<FormData>>({
        email: '',
        password: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const { login } = useAuth();

    // Check if form is filled -> returns true if so
    const isFormReady = () => {
        return formData.email.trim() !== '' && formData.password.trim() !== '';
    };

    const validateForm = (data: FormData) => {
        const newErrors: FormData = {
            email: '',
            password: '',
        };

        if (!data.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!data.password) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleClearEmail = makeClearHandler(setFormData, 'email', '');

    const handleClearPassword = makeClearHandler(setFormData, 'password', '');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Reset errors
        setErrors({
            email: '',
            password: '',
        });

        // Basic validation - Zod will validate on the backend
        // This is just to provide immediate feedback to the user
        const validationErrors = validateForm(formData);
        if (validationErrors.email || validationErrors.password) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Send
            const response = await postUnwrapped<RegistrationResponse>(
                'auth/login',
                {
                    email: formData.email,
                    password: formData.password,
                },
            );

            localStorage.setItem('id', response.id);
            localStorage.setItem('email', response.email);
            localStorage.setItem('token', response.token);

            login(); // tell AuthContext the user is authenticated

            toast.success(response.message);

            navigate('/journal');
        } catch (e) {
            const apiError = e as ApiError;
            toast.error(apiError.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <VStack>
            <VStack align={'center'} style={{ marginTop: '1rem' }}>
                <img
                    src={logo}
                    style={{ height: '100px' }}
                    alt={'Game Journal logo'}
                ></img>
                <h2>Sign in to your account</h2>
            </VStack>

            <form onSubmit={handleSubmit}>
                <VStack
                    gap={'lg'}
                    style={{ maxWidth: '400px' }}
                    padding={'md'}
                    className="formVStack"
                >
                    <InputField
                        type={'email'}
                        label={'Email'}
                        id={'email'}
                        name={'email'}
                        value={formData.email}
                        placeholder={'jon@doe.com'}
                        onChange={handleChange}
                        onClear={handleClearEmail}
                        required={true}
                        error={errors.email}
                    />

                    <InputField
                        type={'password'}
                        label={'Password'}
                        id={'password'}
                        name={'password'}
                        value={formData.password}
                        placeholder={'Your password goes here...'}
                        onChange={handleChange}
                        onClear={handleClearPassword}
                        required={true}
                        error={errors.password}
                    />

                    <VStack align={'center'} style={{ marginTop: '1rem' }}>
                        <StdButton
                            width={'200px'}
                            type={'submit'}
                            disabled={isLoading || !isFormReady()}
                        >
                            Log in
                        </StdButton>
                    </VStack>
                </VStack>
            </form>

            <VStack align={'center'} style={{ marginTop: '3rem' }}>
                <p>
                    <Link to={'/register'} className="lplinks">
                        Don't have an account? Sign up here
                    </Link>
                </p>
            </VStack>
        </VStack>
    );
};
export default LoginPage;
