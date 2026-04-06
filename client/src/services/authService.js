import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/auth`
});

/**
 * Register a new user.
 */
export const register = async (userData) => {
    const response = await api.post('/register', userData);
    if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
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
 * Helper to get the JWT token.
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

export default {
    register,
    login,
    googleLogin,
    logout,
    getCurrentUser,
    isAuthenticated,
    getToken
};
