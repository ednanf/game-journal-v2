import { Outlet, useLocation } from 'react-router-dom';
import {ToastContainer} from 'react-toastify';

import Header from './Header/Header.tsx';
import NavBar from './NavBar/NavBar.tsx';

// TODO: change toast theme conditionally with local storage's current theme

const AppShell = () => {
    const location = useLocation();

    // Paths where the header and navbar should be hidden
    const hiddenLayoutPaths = ['/', '/login', '/register'];
    const showLayout = !hiddenLayoutPaths.includes(location.pathname);

    // Derive a user-friendly location name from the current path
    const pathSegment = location.pathname.split('/')[1] || 'home';
    const locationName = pathSegment
        .replaceAll('-', ' ')
        .replace(/^\w/, (c) => c.toUpperCase());

    return (
        <>
            {showLayout && (
                <header>
                    <Header>{locationName}</Header>
                </header>
            )}

            <main>
                <Outlet/>
            </main>

            {showLayout && (
                <nav>
                    <NavBar/>
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
        </>
    );
};
export default AppShell;
