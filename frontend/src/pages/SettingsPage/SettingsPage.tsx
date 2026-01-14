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
import { useNavigate, Link } from 'react-router-dom';

import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

import styles from './SettingsPage.module.css';

const SettingsPage = () => {
    const navigate = useNavigate();

    const userEmail = localStorage.getItem('email');

    const handleAccountSettingsClick = () => {
        navigate('account');
    };

    return (
        <VStack>
            <VStack gap={'lg'} align={'center'}>
                <StdButton width={'200px'}>Toggle dark mode</StdButton>
                <StdButton width={'200px'} onClick={handleAccountSettingsClick}>
                    Account settings
                </StdButton>
                <StdButton width={'200px'}>Log out</StdButton>
            </VStack>

            <p className={styles.currentUser}>Logged in as: {userEmail}</p>

            <div className={styles.githubFooter}>
                <Link
                    to={'https://github.com/ednanf/game-journal-v2'}
                    target={'_blank'}
                    className={styles.githubLink}
                >
                    See this project on GitHub
                </Link>
            </div>
        </VStack>
    );
};
export default SettingsPage;
