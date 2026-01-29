import React, { useState } from 'react';

import { AuthContext, type AuthState } from './AuthContext';

import { journalRepository } from '../data/journalRepository.ts';
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
        const entries = await journalRepository.getAll();
        const hasUnsynced = entries.some((e) => !e.synced);

        // If there is unsynced data, require a forced sync
        if (hasUnsynced) {
            try {
                await syncJournalEntries({ force: true });
            } catch {
                throw new Error('UNSYNCED_DATA');
            }
        }

        await forceLogout();
    };

    const forceLogout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');

        await clearDb();

        setAuth({ status: 'logged_out' });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout, forceLogout }}>
            {children}
        </AuthContext.Provider>
    );
};
