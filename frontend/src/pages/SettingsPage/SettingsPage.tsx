import { useState } from 'react';
import { VStack } from 'react-swiftstacks';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext.tsx';
import type { ThemeOutletContext } from '../../types/theme.ts';

import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';
import { FaExternalLinkAlt } from 'react-icons/fa';

import SyncStatus from '../../components/SyncStatus/SyncStatus.tsx';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
    const [showUnsyncedModal, setShowUnsyncedModal] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const navigate = useNavigate();
    const { logout, forceLogout } = useAuth();

    const { toggleTheme, theme } = useOutletContext<ThemeOutletContext>();

    const userEmail = localStorage.getItem('email');

    const handleAccountSettingsClick = () => {
        navigate('account');
    };

    const handleLogoutClick = async () => {
        setLoggingOut(true);
        try {
            await logout();
        } catch (e) {
            if ((e as Error).message === 'UNSYNCED_DATA') {
                setShowUnsyncedModal(true);
            }
        } finally {
            setLoggingOut(false);
        }
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
                <SyncStatus />
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
            <ConfirmModal
                open={showUnsyncedModal}
                title="Unsynced changes"
                description={
                    <>
                        You have changes that haven't been synced yet.
                        <br />
                        Logging out now will permanently discard them.
                    </>
                }
                confirmLabel="Log out anyway"
                confirmColor="red"
                loading={loggingOut}
                onCancel={() => setShowUnsyncedModal(false)}
                onConfirm={async () => {
                    setLoggingOut(true);
                    try {
                        await forceLogout();
                        setShowUnsyncedModal(false);
                    } finally {
                        setLoggingOut(false);
                    }
                }}
            />
        </VStack>
    );
};
export default SettingsPage;
