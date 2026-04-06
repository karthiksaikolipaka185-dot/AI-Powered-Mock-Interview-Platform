import authService from '../../services/authService';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-primary-100 selection:text-primary-900">
            {children}
        </div>
    );
};

export default ProtectedRoute;
