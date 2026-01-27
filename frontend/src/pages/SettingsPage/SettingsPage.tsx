import { VStack } from 'react-swiftstacks';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';

import type { ThemeOutletContext } from '../../types/theme.ts';
import { useSyncStatus } from '../../hooks/useSyncStatus.ts';

import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';
import { FaExternalLinkAlt } from 'react-icons/fa';

import styles from './SettingsPage.module.css';

const SettingsPage = () => {
    const navigate = useNavigate();

    const syncStatus = useSyncStatus();

    const { toggleTheme, theme } = useOutletContext<ThemeOutletContext>();

    const userEmail = localStorage.getItem('email');

    const handleAccountSettingsClick = () => {
        navigate('account');
    };

    const handleLogoutClick = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');

        // Force re-check of token, updating the UI
        window.dispatchEvent(new Event('local-storage'));

        navigate('/');
    };

    return (
        <VStack
            padding={'md'}
            align={'center'}
            style={{ maxWidth: '400px', marginTop: '2rem' }}
            className="formVStack"
        >
            <VStack gap={'lg'} align={'center'}>
                <StdButton width={'200px'} onClick={toggleTheme}>
                    Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
                </StdButton>

                <StdButton width={'200px'} onClick={handleAccountSettingsClick}>
                    Account Settings
                </StdButton>

                <StdButton width={'200px'} onClick={handleLogoutClick}>
                    Log Out
                </StdButton>
            </VStack>

            <p className={styles.currentUser}>Logged in as: {userEmail}</p>

            <VStack gap="xs" align="center" style={{ marginTop: '1.5rem' }}>
                <strong>Sync status</strong>

                {syncStatus === 'all-synced' && (
                    <span>✓ All changes synced</span>
                )}

                {syncStatus === 'pending' && <span>Changes pending sync</span>}

                {syncStatus === 'syncing' && <span>Syncing…</span>}

                {syncStatus === 'offline' && (
                    <span>Offline — changes saved locally</span>
                )}

                {syncStatus === 'unreachable' && (
                    <span>Server waking up — sync pending</span>
                )}
            </VStack>

            <div className={styles.githubFooter}>
                <Link
                    to={'https://github.com/ednanf/game-journal-v2'}
                    target={'_blank'}
                    className={styles.githubLink}
                >
                    See this project on GitHub <FaExternalLinkAlt size={10} />
                </Link>
            </div>
        </VStack>
    );
};
export default SettingsPage;
