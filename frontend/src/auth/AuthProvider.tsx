import React, { useState } from 'react';

import { AuthContext, type AuthState } from './AuthContext';

import { syncJournalEntries } from '../data/journalSync';
import { clearDb } from '../data/db.ts';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>(() => {
        const token = localStorage.getItem('token');
        return token ? { status: 'authenticated' } : { status: 'logged_out' };
    });

    const login = () => {
        setAuth({ status: 'authenticated' });
    };

    const logout = async () => {
        try {
            await syncJournalEntries({ force: true });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            alert(
                'You have unsynced changes and are currently offline. ' +
                    'Please connect to the internet before logging out.',
            );
            return; // abort logout
        }

        localStorage.removeItem('token');
        localStorage.removeItem('email');

        await clearDb();

        setAuth({ status: 'logged_out' });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
