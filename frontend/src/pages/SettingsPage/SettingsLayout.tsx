// Settings need a separate layout because it has a nested account settings page
// This also allows for shared specific UI elements in the future

import { Outlet, useOutletContext } from 'react-router-dom';
import type { ThemeOutletContext } from '../../types/theme.ts';

const SettingsLayout = () => {
    const context = useOutletContext<ThemeOutletContext>();

    if (!context) {
        throw new Error('SettingsLayout must be rendered under AppShell');
    }

    return (
        <>
            {/* shared settings UI can go here */}
            <Outlet context={context} />
        </>
    );
};

export default SettingsLayout;
