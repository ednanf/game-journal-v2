import React, { useState } from 'react';
import { AuthContext, type AuthState } from './AuthContext';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>(() => {
        const token = localStorage.getItem('token');
        return token ? { status: 'authenticated' } : { status: 'logged_out' };
    });

    const login = () => {
        setAuth({ status: 'authenticated' });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setAuth({ status: 'logged_out' });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
