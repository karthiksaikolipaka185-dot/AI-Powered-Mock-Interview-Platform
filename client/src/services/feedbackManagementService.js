import axios from 'axios';
import authService from './authService';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/admin/feedback`
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
 * Fetch paginated feedback list with metrics, charts data, and review status alerts.
 */
export const getFeedbackList = async (params = {}) => {
    const { page = 1, limit = 10, search = '', rating = 'all', reviewStatus = 'all', sortBy = 'newest' } = params;
    const response = await api.get('', {
        params: { page, limit, search, rating, reviewStatus, sortBy }
    });
    return response.data;
};

/**
 * Fetch detailed feedback entry for side drawer telemetry.
 */
export const getFeedbackById = async (feedbackId) => {
    const response = await api.get(`/${feedbackId}`);
    return response.data;
};

/**
 * Mark a candidate feedback entry as Reviewed.
 */
export const markAsReviewed = async (feedbackId) => {
    const response = await api.patch(`/${feedbackId}/review`);
    return response.data;
};

export default {
    getFeedbackList,
    getFeedbackById,
    markAsReviewed
};
