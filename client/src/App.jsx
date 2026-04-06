import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Services & Utils
import authService from './services/authService';

// Import newly scaffolded view pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewPage from './pages/InterviewPage';
import FeedbackPage from './pages/FeedbackPage';
import HistoryPage from './pages/HistoryPage';

// Layout & Protection Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                {/* Public Authentication Route */}
                <Route
                    path="/auth"
                    element={
                        authService.isAuthenticated() ? (
                            <Navigate to="/" replace />
                        ) : (
                            <AuthPage />
                        )
                    }
                />

                {/* Protected Home component explicitly rendered in Route bound wrapper context */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />

                {/* Wizard UI Flow rendered directly nested within safety context  */}
                <Route
                    path="/setup"
                    element={
                        <ProtectedRoute>
                            <InterviewSetupPage />
                        </ProtectedRoute>
                    }
                />

                {/* Active Session Interview Context Mapping */}
                <Route
                    path="/interview/:id"
                    element={
                        <ProtectedRoute>
                            <InterviewPage />
                        </ProtectedRoute>
                    }
                />
                
                {/* Embedded Review & Grading Evaluation Environment  */}
                <Route
                    path="/feedback/:id"
                    element={
                        <ProtectedRoute>
                            <FeedbackPage />
                        </ProtectedRoute>
                    }
                />

                {/* Secure Vault Activity Layout Map  */}
                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <HistoryPage />
                        </ProtectedRoute>
                    }
                />
                
                {/* Catch-all global mapping block */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
