import React from 'react';
import { NavLink } from 'react-router-dom';

import styles from './NavBarButton.module.css';

type NavBarButtonProps = {
    to: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
};

function NavBarButton({ to, icon, children }: NavBarButtonProps) {
    return (
        // NavLink automatically applies an isActive prop to the className
        // function when the link is active.
        // It uses the "to" prop to determine whether it is active or not.
        <NavLink
            to={to}
            className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
            }
        >
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className={styles.text}>{children}</span>
        </NavLink>
    );
}
export default NavBarButton;
