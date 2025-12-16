import { HStack } from 'react-swiftstacks';

import NavBarButton from './NavBarButton/NavBarButton.tsx';

import { BsJournalBookmarkFill, BsBarChartFill } from 'react-icons/bs';
import { GoPlus } from 'react-icons/go';

import styles from './NavBar.module.css';

const NavBar = () => {
    return (
        <HStack justify={'between'} className={styles.navBarHStack}>
            <div className={styles.navBar}>
                <NavBarButton to={'journal'} icon={<BsJournalBookmarkFill />}>
                    Journal
                </NavBarButton>

                <NavBarButton to={'addEntry'} icon={<GoPlus />}>
                    Add Entry
                </NavBarButton>

                <NavBarButton to={'statistics'} icon={<BsBarChartFill />}>
                    Statistics
                </NavBarButton>
            </div>
        </HStack>
    );
};
export default NavBar;
