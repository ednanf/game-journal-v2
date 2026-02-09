// PWA
import { registerSW } from 'virtual:pwa-register';

// Normal imports
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css'; // Required by dependency

import LoadingCircle from './components/LoadingCircle/LoadingCircle.tsx';

// Auth protection
import { AuthProvider } from './auth/AuthProvider.tsx';
import { ProtectedRoute } from './auth/ProtectedRoute.tsx';

// Pages
import AppShell from './components/AppShell/AppShell.tsx';
const AddEntryPage = lazy(
    () => import('./pages/AddEntryPage/AddEntryPage.tsx'),
);
const SearchPage = lazy(() => import('./pages/SearchPage/SearchPage.tsx'));
const EntryDetailsPage = lazy(
    () => import('./pages/EntryDetailsPage/EntryDetailsPage.tsx'),
);
import ErrorPage from './pages/ErrorPage/ErrorPage.tsx';
import JournalPage from './pages/JournalPage/JournalPage.tsx';
import LandingPage from './pages/LandingPage/LandingPage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage.tsx';
const StatisticsPage = lazy(
    () => import('./pages/StatisticsPage/StatisticsPage.tsx'),
);
const SettingsPage = lazy(
    () => import('./pages/SettingsPage/SettingsPage.tsx'),
);
const AccountSettingsPage = lazy(
    () => import('./pages/SettingsPage/AccountSettingsPage.tsx'),
);
import { SettingsLayout } from './pages/SettingsPage/index.ts';

import './index.css';

registerSW({
    onOfflineReady() {
        console.log('PWA ready for offline use');
    },
});

// "handle" is used in AppShell.tsx to pass props to the Header.tsx component
// DO NOT use Suspense on AppShell, auth-related or data-layers
const router = createBrowserRouter([
    // Public routes
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegistrationPage />,
    },

    // Protected routes
    {
        element: (
            <ProtectedRoute>
                <AppShell />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'journal',
                element: <JournalPage />,
                handle: { title: 'Journal' },
            },
            {
                path: 'search',
                element: (
                    <Suspense fallback={<LoadingCircle />}>
                        <SearchPage />
                    </Suspense>
                ),
                handle: { title: 'Search' },
            },
            {
                path: 'addEntry',
                element: (
                    <Suspense fallback={<LoadingCircle />}>
                        <AddEntryPage />
                    </Suspense>
                ),
                handle: { title: 'Create a new entry' },
            },
            {
                path: 'statistics',
                element: (
                    <Suspense fallback={<LoadingCircle />}>
                        <StatisticsPage />
                    </Suspense>
                ),
                handle: { title: 'Statistics' },
            },
            {
                path: 'entries/:id',
                element: (
                    <Suspense fallback={<LoadingCircle />}>
                        <EntryDetailsPage />
                    </Suspense>
                ),
                handle: { title: 'Entry details' },
            },
            {
                path: 'settings',
                element: <SettingsLayout />,
                handle: { title: 'Settings' },
                children: [
                    {
                        index: true,
                        element: (
                            <Suspense fallback={<LoadingCircle />}>
                                <SettingsPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: 'account',
                        element: (
                            <Suspense fallback={<LoadingCircle />}>
                                <AccountSettingsPage />
                            </Suspense>
                        ),
                        handle: { title: 'Account settings' },
                    },
                ],
            },
        ],
    },

    // Catch-all
    { path: '*', element: <ErrorPage /> },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </StrictMode>,
);
