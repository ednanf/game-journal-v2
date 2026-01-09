// startDate and endDate must be full ISO timestamps (UTC)

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { VStack } from 'react-swiftstacks';

import InputField from '../../components/Forms/InputField/InputField.tsx';
import Selector from '../../components/Forms/Selector/Selector.tsx';
import DateTimePicker from '../../components/Forms/DateTimePicker/DateTimePicker.tsx';
import Slider from '../../components/Forms/Slider/Slider.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

import { gamingPlatforms } from '../../data/platforms.ts';
import { gameStatus } from '../../data/status.ts';

import type { DateField, SearchFormData } from '../../types/search.ts';

import '../shared.css';
import SearchResultsPage from '../SearchResultsPage/SearchResultsPage.tsx';

// TODO: clear search filters UI

const SearchPage = () => {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState<SearchFormData>({
        title: '', // Empty string will be trimmed and ignored
        platform: null,
        status: null,
        rating: null,
        startDate: null,
        endDate: null,
    });

    // Switch between "form mode" and "results mode" if the URL has parameters or not
    const hasSearchParams = searchParams.size > 0;

    // Cosmetic value that does not go to the database/query
    const DEFAULT_RATING = 5;

    const isFormReady =
        formData.title.trim() ||
        formData.platform ||
        formData.status ||
        formData.startDate ||
        formData.endDate ||
        formData.rating !== null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            // Data normalization with a switch to ensure empty strings become null
            switch (name) {
                case 'platform':
                case 'status':
                    return {
                        ...prev,
                        [name]: value === '' ? null : value,
                    };

                case 'rating':
                    return {
                        ...prev,
                        rating: value === '' ? null : Number(value),
                    };

                default:
                    return {
                        ...prev,
                        [name]: value,
                    };
            }
        });
    };

    const handleDateChange = (field: DateField, date: Date | null) => {
        // Normalization is not needed because it's already handled by the picker
        setFormData((prev) => ({
            ...prev,
            [field]: date,
        }));
    };

    const handleClearTitle = () => {
        setFormData((prev) => ({
            ...prev,
            title: '',
        }));
    };

    const handleClearPlatform = () => {
        setFormData((prev) => ({
            ...prev,
            platform: null,
        }));
    };

    const handleClearStatus = () => {
        setFormData((prev) => ({
            ...prev,
            status: null,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams();

        // Add all parameters present in the form to the URL
        if (formData.title.trim()) {
            params.set('title', formData.title.trim());
        }

        if (formData.platform) {
            params.set('platform', formData.platform);
        }

        if (formData.status) {
            params.set('status', formData.status);
        }

        if (formData.rating !== null) {
            params.set('rating', String(formData.rating));
        }

        if (formData.startDate) {
            params.set('startDate', formData.startDate.toISOString());
        }

        if (formData.endDate) {
            params.set('endDate', formData.endDate.toISOString());
        }

        // Navigate to the newly formed URL, triggering SearchResultsPage render
        // because now the URL has parameters
        navigate(`/search?${params.toString()}`);
    };

    // Render results instead of the form
    if (hasSearchParams) {
        return <SearchResultsPage />;
    }

    return (
        <VStack>
            <form onSubmit={handleSubmit}>
                <VStack
                    gap={'lg'}
                    style={{ maxWidth: '400px' }}
                    padding={'md'}
                    className="formVStack"
                >
                    <InputField
                        type={'text'}
                        label={'Title'}
                        id={'title'}
                        name={'title'}
                        value={formData.title}
                        placeholder={'Search by name...'}
                        onChange={handleChange}
                        onClear={handleClearTitle}
                    />

                    <Selector
                        label={'Platform'}
                        id={'platform'}
                        name={'platform'}
                        size={1}
                        placeholder={'Filter by platform...'}
                        value={formData.platform ?? ''} // ?? '' needed for ui
                        values={gamingPlatforms}
                        onChange={handleChange}
                        onClear={handleClearPlatform}
                    />

                    <Selector
                        label={'Status'}
                        id={'status'}
                        name={'status'}
                        size={1}
                        placeholder={'Filter by status...'}
                        value={formData.status ?? ''} // ?? '' needed for ui
                        values={gameStatus}
                        onChange={handleChange}
                        onClear={handleClearStatus}
                    />

                    <DateTimePicker
                        label="From"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={(date) => handleDateChange('startDate', date)}
                        showTime
                    />

                    <DateTimePicker
                        label="To"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={(date) => handleDateChange('endDate', date)}
                        showTime
                    />

                    <Slider
                        label={'Rating'}
                        name={'rating'}
                        min={0}
                        max={10}
                        value={formData.rating ?? DEFAULT_RATING}
                        onChange={handleChange}
                    />

                    <VStack align={'center'} style={{ marginTop: '1rem' }}>
                        <StdButton
                            type={'submit'}
                            width={'200px'}
                            disabled={!isFormReady}
                        >
                            Search
                        </StdButton>
                    </VStack>
                </VStack>
            </form>
        </VStack>
    );
};
export default SearchPage;
