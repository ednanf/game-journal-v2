import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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

const router = createBrowserRouter([
    {
        path: '/',
        element: <AppShell/>,
        children: [
            { index: true, element: <LandingPage/> },
            { path: 'login', element: <LoginPage/> },
            { path: 'register', element: <RegistrationPage/> },
            { path: 'journal', element: <JournalPage/> },
            { path: 'addEntry', element: <AddEntryPage/> },
            { path: 'statistics', element: <StatisticsPage/> },
            { path: 'details/:id', element: <EntryDetailsPage/> },
            { path: 'settings', element: <SettingsPage/> },
            { path: '*', element: <ErrorPage/> },
        ],
    },
]);

createRoot(document.getElementById('root')!)
    .render(
        <StrictMode>
            <RouterProvider router={router}/>
        </StrictMode>,
    );
