import React from 'react';
import { HStack } from 'react-swiftstacks';

interface HeaderProps {
    children: React.ReactNode;
}

const Header = ({ children }: HeaderProps) => {

    return (
        <HStack>
            <h1>{children}</h1>
        </HStack>
    );
};
export default Header;
