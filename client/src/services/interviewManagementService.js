import axios from 'axios';
import authService from './authService';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/admin/interviews`
});

// Automatically attach Authorization Bearer token
api.interceptors.request.use((config) => {
    const token = authService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

/**
 * Fetch paginated interviews list with search, filters, and sorting.
 */
export const getInterviews = async (params = {}) => {
    const { page = 1, limit = 10, search = '', status = 'all', difficulty = 'all', sortBy = 'newest' } = params;
    const response = await api.get('/', {
        params: { page, limit, search, status, difficulty, sortBy }
    });
    return response.data;
};

/**
 * Fetch detailed interview session telemetry for modal inspection.
 */
export const getInterviewById = async (interviewId) => {
    const response = await api.get(`/${interviewId}`);
    return response.data;
};

export default {
    getInterviews,
    getInterviewById
};
