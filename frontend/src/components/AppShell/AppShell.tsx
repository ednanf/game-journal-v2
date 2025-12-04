import { Outlet } from 'react-router-dom';

import Header from './Header/Header.tsx';
import NavBar from './NavBar/NavBar.tsx';

const AppShell = () => {
    return (
        <>
            <header>
                <Header/>
            </header>
            <main>
                <Outlet/>
            </main>
            <nav>
                <NavBar/>
            </nav>
        </>
    );
};
export default AppShell;
