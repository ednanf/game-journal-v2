import { Outlet, useLocation } from 'react-router-dom';

import Header from './Header/Header.tsx';
import NavBar from './NavBar/NavBar.tsx';

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
        </>
    );
};
export default AppShell;
