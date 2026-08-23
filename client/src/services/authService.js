import axios from 'axios';

const getApiBaseUrl = () => {
    const rawUrl = import.meta.env.VITE_API_BASE_URL;
    if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== '' && rawUrl !== 'undefined') {
        return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    }
    return 'http://localhost:5000';
};

const api = axios.create({
    baseURL: `${getApiBaseUrl()}/api/auth`
});

/**
 * Register a new user with email verification requirement.
 */
export const register = async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
};

/**
 * Verify candidate email token link.
 */
export const verifyEmailToken = async (token) => {
    const response = await api.get(`/verify-email/${token}`);
    return response.data;
};

/**
 * Resend verification email to user.
 */
export const resendVerificationEmail = async (email) => {
    const response = await api.post('/resend-verification', { email });
    return response.data;
};

/**
 * Login a user.
 */
export const login = async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
};

/**
 * Google OAuth Login.
 */
export const googleLogin = async (credential) => {
    const response = await api.post('/google', { credential });
    if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
};

/**
 * Logout the current user session (frontend + backend).
 */
export const logout = async () => {
    try {
        await api.post('/logout', {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    } catch (err) {
        console.error('Logout error:', err.message);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    }
};

/**
 * Get the currently logged in user from localStorage.
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if the user is authenticated.
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

/**
 * Check if the currently authenticated user is the designated admin.
 */
export const isAdmin = () => {
    const user = getCurrentUser();
    const adminEmail = 'karthiksaikolipaka185@gmail.com';
    return user && user.email && user.email.toLowerCase() === adminEmail.toLowerCase();
};

/**
 * Helper to get the JWT token.
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

export default {
    register,
    verifyEmailToken,
    resendVerificationEmail,
    login,
    googleLogin,
    logout,
    getCurrentUser,
    isAuthenticated,
    isAdmin,
    getToken
};

