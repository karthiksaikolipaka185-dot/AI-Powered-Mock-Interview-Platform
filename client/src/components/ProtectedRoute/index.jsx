import authService from '../../services/authService';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div className="min-h-screen bg-background font-sans text-text-main selection:bg-primary-100 selection:text-primary-900">
            {children}
        </div>
    );
};

export default ProtectedRoute;
