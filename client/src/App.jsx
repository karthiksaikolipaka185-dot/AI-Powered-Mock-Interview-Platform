import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Services & Utils
import authService from './services/authService';

// View pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewPage from './pages/InterviewPage';
import FeedbackPage from './pages/FeedbackPage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminInterviewsPage from './pages/AdminInterviewsPage';
import AdminFeedbackPage from './pages/AdminFeedbackPage';

// Layout & Protection Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-background text-text-main">
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

                    {/* Email Verification Link Route */}
                    <Route
                        path="/verify-email/:token"
                        element={<VerifyEmailPage />}
                    />

                    {/* Protected Home Route */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Interview Setup Route */}
                    <Route
                        path="/setup"
                        element={
                            <ProtectedRoute>
                                <InterviewSetupPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Active Interview Session Route */}
                    <Route
                        path="/interview/:id"
                        element={
                            <ProtectedRoute>
                                <InterviewPage />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* Feedback Route */}
                    <Route
                        path="/feedback/:id"
                        element={
                            <ProtectedRoute>
                                <FeedbackPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Interview History Route */}
                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <HistoryPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Phase 1: Secure Admin Analytics Dashboard Route */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboardPage />
                            </AdminRoute>
                        }
                    />

                    {/* Phase 2: Secure Admin User Management Route */}
                    <Route
                        path="/admin/users"
                        element={
                            <AdminRoute>
                                <AdminUsersPage />
                            </AdminRoute>
                        }
                    />

                    {/* Phase 3: Secure Admin Interview Management Route */}
                    <Route
                        path="/admin/interviews"
                        element={
                            <AdminRoute>
                                <AdminInterviewsPage />
                            </AdminRoute>
                        }
                    />

                    {/* Phase 4: Secure Admin Feedback Center Route */}
                    <Route
                        path="/admin/feedback"
                        element={
                            <AdminRoute>
                                <AdminFeedbackPage />
                            </AdminRoute>
                        }
                    />
                    
                    {/* Catch-all global route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
