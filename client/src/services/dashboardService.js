import axios from 'axios';
import authService from './authService';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/dashboard`
});

// Interceptor to attach Authorization Bearer token
api.interceptors.request.use((config) => {
    const token = authService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

/**
 * Fetch Admin Dashboard Analytics data.
 */
export const getAdminAnalytics = async (params = {}) => {
    const { timeframe = 'all', search = '' } = params;
    const response = await api.get('/admin', {
        params: { timeframe, search }
    });
    return response.data;
};

export default {
    getAdminAnalytics
};
