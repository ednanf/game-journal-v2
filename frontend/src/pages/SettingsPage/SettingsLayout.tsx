// Settings need a separate layout because it has a nested account settings page
// This also allows for shared specific UI elements in the future

import { Outlet } from 'react-router-dom';

const SettingsLayout = () => {
    return (
        <>
            {/* shared settings UI can go here */}
            <Outlet />
        </>
    );
};

export default SettingsLayout;
