import { Link, Navigate } from 'react-router-dom';
import { VStack, HStack } from 'react-swiftstacks';

import Logo from '../../assets/logo-icon.png';
import { FaGithubSquare } from 'react-icons/fa';

import styles from './LandingPage.module.css';
import '../shared.css';
import { useAuth } from '../../auth/AuthContext.tsx';

const LandingPage = () => {
    const { auth } = useAuth();

    if (auth.status === 'authenticated') {
        return <Navigate to="/journal" replace />;
    }

    return (
        <VStack
            align={'center'}
            justify={'center'}
            style={{ margin: '7rem 0 auto' }}
        >
            <img
                src={Logo}
                className={styles.appLogo}
                alt={'Game Journal Logo'}
            ></img>

            <h2>Welcome to Game Journal!</h2>
            <p className={styles.subheader}>Keep track of games you played</p>

            <HStack align={'center'}>
                <Link to={'/register'} className="lplinks">
                    Sign up
                </Link>{' '}
                <p className={styles.subheader}>or</p>{' '}
                <Link to={'/login'} className="lplinks">
                    login
                </Link>
                <p className={styles.subheader}>to get started</p>
            </HStack>

            <div className={styles.footer}>
                <a
                    href="https://github.com/ednanf/game-journal-v2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.githubLink}
                >
                    <FaGithubSquare size={20} className={styles.icon} /> See on
                    GitHub
                </a>
            </div>
        </VStack>
    );
};
export default LandingPage;
