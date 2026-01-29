import { createContext, useContext } from 'react';

export type AuthState = { status: 'authenticated' } | { status: 'logged_out' };

export type AuthContextValue = {
    auth: AuthState;
    login: () => void;
    logout: () => Promise<void>;
    forceLogout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
    auth: { status: 'logged_out' },
    login: () => {},
    logout: async () => {},
    forceLogout: async () => {},
});

export const useAuth = () => {
    return useContext(AuthContext);
};
