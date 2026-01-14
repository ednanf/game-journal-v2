/*
 * Settings will contain:
 * - Toggle dark/light theme
 * - Account settings
 *   - Will take to another page with options to change email/password/delete acc
 * - Log out
 * - Current user logged in (email)
 * - GitHub link
 *
 * */

import { VStack } from 'react-swiftstacks';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const navigate = useNavigate();

    const handleAccountSettingsClick = () => {
        navigate('account');
    };

    return (
        <VStack gap={'lg'}>
            <StdButton width={'400px'}>Toggle dark mode</StdButton>
            <StdButton width={'400px'} onClick={handleAccountSettingsClick}>
                Account settings
            </StdButton>
            <StdButton width={'400px'}>Log out</StdButton>
        </VStack>
    );
};
export default SettingsPage;
