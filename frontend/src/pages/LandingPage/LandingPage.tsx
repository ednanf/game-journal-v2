import { Link } from 'react-router-dom';
import { VStack, HStack } from 'react-swiftstacks';

import appIcon from '../../assets/logo.png';
import { FaGithubSquare } from 'react-icons/fa';

import styles from './LandingPage.module.css';
import '../shared.css';

const LandingPage = () => {
    return (
        <VStack align={'center'} justify={'center'}
                style={{ margin: '7rem 0 auto' }}>

            <img src={appIcon} className={styles.appLogo}
                 alt={'Game Journal Logo'}></img>

            <h2>Welcome to Game Journal!</h2>
            <p>Keep track of games you played</p>

            <HStack align={'center'}>
                <Link to={'/register'} className="lplinks">Sign up</Link>{' '}
                <p>or</p>{' '}
                <Link to={'/login'} className="lplinks">login</Link>
                <p>to get started</p>
            </HStack>

            <div className={styles.footer}>
                <a
                    href="https://github.com/ednanf/game-journal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.githubLink}
                >
                    <FaGithubSquare size={20} className={styles.icon}/> See on
                    GitHub
                </a>
            </div>
        </VStack>
    );
};
export default LandingPage;
