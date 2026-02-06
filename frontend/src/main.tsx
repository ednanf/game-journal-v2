// PWA
import { registerSW } from 'virtual:pwa-register';

// Normal imports
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css'; // Required by dependency

// Auth protection
import { AuthProvider } from './auth/AuthProvider.tsx';
import { ProtectedRoute } from './auth/ProtectedRoute.tsx';

// Pages
import AppShell from './components/AppShell/AppShell.tsx';
import AddEntryPage from './pages/AddEntryPage/AddEntryPage.tsx';
import EntryDetailsPage from './pages/EntryDetailsPage/EntryDetailsPage.tsx';
import ErrorPage from './pages/ErrorPage/ErrorPage.tsx';
import JournalPage from './pages/JournalPage/JournalPage.tsx';
import LandingPage from './pages/LandingPage/LandingPage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage.tsx';
import StatisticsPage from './pages/StatisticsPage/StatisticsPage.tsx';
import SearchPage from './pages/SearchPage/SearchPage.tsx';
import {
    SettingsLayout,
    SettingsPage,
    AccountSettingsPage,
} from './pages/SettingsPage/index.ts';

import './index.css';


registerSW({
    onOfflineReady() {
        console.log('PWA ready for offline use');
    },
});

// "handle" is used in AppShell.tsx to pass props to the Header.tsx component
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
                path: 'addEntry',
                element: <AddEntryPage />,
                handle: { title: 'Create a new entry' },
            },
            {
                path: 'statistics',
                element: <StatisticsPage />,
                handle: { title: 'Statistics' },
            },
            {
                path: 'entries/:id',
                element: <EntryDetailsPage />,
                handle: { title: 'Entry details' },
            },
            {
                path: 'settings',
                element: <SettingsLayout />,
                handle: { title: 'Settings' },
                children: [
                    { index: true, element: <SettingsPage /> },
                    {
                        path: 'account',
                        element: <AccountSettingsPage />,
                        handle: { title: 'Account settings' },
                    },
                ],
            },
            {
                path: 'search',
                element: <SearchPage />,
                handle: { title: 'Search' },
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
