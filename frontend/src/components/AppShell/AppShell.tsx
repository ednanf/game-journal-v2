import {
    Outlet,
    type UIMatch,
    useLocation,
    useMatches,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { useTheme } from '../../hooks/useTheme.ts';
import { useAuth } from '../../auth/AuthContext.tsx';
import { useJournalSync } from '../../data/useJournalSync.ts';

import Header from './Header/Header.tsx';
import NavBar from './NavBar/NavBar.tsx';

import styles from './AppShell.module.css';

type RouteHandle = {
    title?: string;
};

const AppShell = () => {
    const location = useLocation();
    const matches = useMatches() as UIMatch<RouteHandle>[]; // will be used to grab the title in main.tsx
    const { theme, toggleTheme } = useTheme();

    // Activate syncing only when authenticated
    const { auth } = useAuth();
    useJournalSync(auth.status === 'authenticated');

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
