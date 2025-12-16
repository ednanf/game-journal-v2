import { HStack } from 'react-swiftstacks';

import NavBarButton from './NavBarButton/NavBarButton.tsx';

import { BsJournalBookmarkFill, BsBarChartFill } from 'react-icons/bs';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { HiOutlineCog } from 'react-icons/hi';
import { GoPlus } from 'react-icons/go';

import styles from './NavBar.module.css';

const NavBar = () => {
    return (
        <HStack justify={'between'} className={styles.navBarHStack}>
            <div className={styles.navBar}>
                <NavBarButton to={'journal'} icon={<BsJournalBookmarkFill />}>
                    Journal
                </NavBarButton>

                <NavBarButton to={'search'} icon={<FaMagnifyingGlass />}>
                    Search
                </NavBarButton>

                <NavBarButton to={'addEntry'} icon={<GoPlus />}>
                    Add Entry
                </NavBarButton>

                <NavBarButton to={'statistics'} icon={<BsBarChartFill />}>
                    Statistics
                </NavBarButton>

                <NavBarButton to={'settings'} icon={<HiOutlineCog />}>
                    Settings
                </NavBarButton>
            </div>
        </HStack>
    );
};
export default NavBar;
