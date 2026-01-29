import React, { useState } from 'react';

import { AuthContext, type AuthState } from './AuthContext';

import {clearDb} from '../data/db.ts';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>(() => {
        const token = localStorage.getItem('token');
        return token ? { status: 'authenticated' } : { status: 'logged_out' };
    });

    const login = () => {
        setAuth({ status: 'authenticated' });
    };

    const logout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');

        await clearDb(); // Clear data, keep schema/version

        setAuth({ status: 'logged_out' });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
