import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api';

const api = axios.create({
    baseURL: BASE_URL
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const submitFeedback = async ({ rating, favoriteFeature, suggestion }) => {
    console.log('[feedbackService] Submitting candidate feedback to /api/feedback...');
    const response = await api.post('/feedback', { rating, favoriteFeature, suggestion });
    console.log('[feedbackService] Received response:', response.data);
    return response.data;
};

export default {
    submitFeedback
};
