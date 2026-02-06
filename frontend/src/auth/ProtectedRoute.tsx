import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { auth } = useAuth();

    if (auth.status === 'logged_out') {
        return <Navigate to="/" replace />;
    }

    return children;
};
