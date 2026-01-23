import { useEffect } from 'react';
import {
    Outlet,
    type UIMatch,
    useLocation,
    useMatches,
    useNavigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { useTheme } from '../../hooks/useTheme.ts';

import Header from './Header/Header.tsx';
import NavBar from './NavBar/NavBar.tsx';

import styles from './AppShell.module.css';

type RouteHandle = {
    title?: string;
};

// TODO: change toast theme conditionally with local storage's current theme

const AppShell = () => {
    const location = useLocation();
    const matches = useMatches() as UIMatch<RouteHandle>[]; // will be used to grab the title in main.tsx
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Prevent access to protected routes if not authenticated
    const isAuthenticated = !!localStorage.getItem('token');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // @ts-expect-error sometimes TS is fucking stupid like Microsoft
    const title = matches.findLast((m) => m.handle?.title)?.handle?.title; // pass the title as prop to the header

    // Paths where the header and navbar should be hidden
    const hiddenLayoutPaths = ['/', '/login', '/register'];
    const showLayout = !hiddenLayoutPaths.includes(location.pathname);

    return (
        <div className={styles.layout}>
            {showLayout && (
                <header>
                    <Header title={title} children={undefined}></Header>
                </header>
            )}

            <main className={styles.main}>
                <Outlet context={{ theme, toggleTheme }} />
            </main>

            {showLayout && (
                <nav className={styles.nav}>
                    <NavBar />
                </nav>
            )}

            <ToastContainer
                theme={theme}
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                newestOnTop
            />
        </div>
    );
};
export default AppShell;
