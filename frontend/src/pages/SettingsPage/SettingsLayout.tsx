// Settings need a separate layout because it has a nested account settings page
// This also allows for shared specific UI elements in the future

import { VStack } from 'react-swiftstacks';
import { Outlet } from 'react-router-dom';

const SettingsLayout = () => {
    return (
        <VStack padding={'md'} align={'center'} style={{ marginTop: '2rem' }}>
            {/* shared settings UI can go here */}
            <Outlet />
        </VStack>
    );
};

export default SettingsLayout;
