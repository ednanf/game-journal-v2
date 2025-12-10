import React from 'react';
import { VStack } from 'react-swiftstacks';

interface HeaderProps {
    title: string;
    children: React.ReactNode;
}

// The title prop is set in main.tsx, where the router is located

const Header = ({ title, children }: HeaderProps) => {
    return (
        <VStack align={'center'} style={{ height: 'auto' }}>
            <span>{children}</span>
            <h2>{title}</h2>
        </VStack>
    );
};
export default Header;
