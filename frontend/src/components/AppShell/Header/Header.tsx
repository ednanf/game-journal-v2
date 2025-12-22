import React from 'react';
import { HStack } from 'react-swiftstacks';

import styles from './Header.module.css';

interface HeaderProps {
    title: string;
    children: React.ReactNode;
}

// The title prop is set in main.tsx, where the router is located

const Header = ({ title, children }: HeaderProps) => {
    return (
        <HStack justify={'center'} className={styles.headerBody}>
            <span>{children}</span>
            <h2>{title}</h2>
        </HStack>
    );
};
export default Header;
