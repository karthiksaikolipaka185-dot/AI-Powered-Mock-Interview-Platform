import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`
});

// Inject token for all history requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getHistory = async (page = 1, limit = 10) => {
    console.log(`[historyService] Fetching history: page=${page}, limit=${limit}`);
    const response = await api.get(`/history?page=${page}&limit=${limit}`);
    console.log('[historyService] History response:', response.data);
    return response.data.data !== undefined ? response.data.data : response.data;
};

export const deleteHistoryItem = async (id) => {
    const response = await api.delete(`/history/${id}`);
    return response.data.data !== undefined ? response.data.data : response.data;
};

export const clearHistory = async () => {
    const response = await api.delete(`/history/clear`);
    return response.data.data !== undefined ? response.data.data : response.data;
};

export default {
    getHistory,
    deleteHistoryItem,
    clearHistory
};
