import { Outlet } from 'react-router-dom';

const AppShell = () => {
    return (
        <>
            <header>
                <h1>Header</h1>
            </header>
            <main>
                <Outlet/>
            </main>
            <nav>
                <p>Navigation</p>
            </nav>
        </>
    );
};
export default AppShell;
