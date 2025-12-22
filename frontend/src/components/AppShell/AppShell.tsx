import {
    Outlet,
    type UIMatch,
    useLocation,
    useMatches,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Header from './Header/Header.tsx';
import NavBar from './NavBar/NavBar.tsx';

import appLogo from '../../assets/logo.png';

import styles from './AppShell.module.css';

type RouteHandle = {
    title?: string;
};

// TODO: change toast theme conditionally with local storage's current theme
// TODO: change fonts to 16px to avoid zooming on iOS
// TODO: pin header to the top and make the content scroll behind it with some blur

const AppShell = () => {
    const location = useLocation();
    const matches = useMatches() as UIMatch<RouteHandle>[]; // will be used to grab the title in main.tsx

    // @ts-expect-error sometimes TS is fucking stupid like Microsoft
    const title = matches.findLast((m) => m.handle?.title)?.handle?.title; // pass the title as prop to the header

    // Paths where the header and navbar should be hidden
    const hiddenLayoutPaths = ['/', '/login', '/register'];
    const showLayout = !hiddenLayoutPaths.includes(location.pathname);

    return (
        <div className={styles.layout}>
            {showLayout && (
                <header>
                    <Header title={title}></Header>
                </header>
            )}

            <main className={styles.main}>
                <Outlet />
            </main>

            {showLayout && (
                <nav className={styles.nav}>
                    <NavBar />
                </nav>
            )}

            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                newestOnTop
                theme="light"
            />
        </div>
    );
};
export default AppShell;
