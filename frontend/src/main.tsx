import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';

// Pages
import AppShell from './components/AppShell/AppShell.tsx';
import AddEntryPage from './pages/AddEntryPage/AddEntryPage.tsx';
import EntryDetailsPage from './pages/EntryDetailsPage/EntryDetailsPage.tsx';
import ErrorPage from './pages/ErrorPage/ErrorPage.tsx';
import JournalPage from './pages/JournalPage/JournalPage.tsx';
import LandingPage from './pages/LandingPage/LandingPage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage.tsx';
import SettingsPage from './pages/SettingsPage/SettingsPage.tsx';
import StatisticsPage from './pages/StatisticsPage/StatisticsPage.tsx';

import './index.css';
import SearchPage from './pages/SearchPage/SearchPage.tsx';

// "handle" is used in AppShell.tsx to pass props to the Header.tsx component
const router = createBrowserRouter([
    {
        path: '/',
        element: <AppShell />,
        children: [
            {
                index: true,
                element: <LandingPage />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            { path: 'register', element: <RegistrationPage /> },
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
            { path: 'details/:id', element: <EntryDetailsPage /> },
            {
                path: 'settings',
                element: <SettingsPage />,
                handle: { title: 'Settings' },
            },
            {
                path: 'search',
                element: <SearchPage />,
                handle: { title: 'Search' },
            },
            { path: '*', element: <ErrorPage /> },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
