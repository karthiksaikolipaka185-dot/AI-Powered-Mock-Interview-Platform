import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const AdminRoute = ({ children }) => {
    const isAuth = authService.isAuthenticated();
    const isUserAdmin = authService.isAdmin();

    if (!isAuth) {
        return <Navigate to="/auth" replace />;
    }

    if (!isUserAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
