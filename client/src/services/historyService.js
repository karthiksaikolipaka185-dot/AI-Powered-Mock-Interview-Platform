import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`
});

export const getHistory = async (page = 1, limit = 10) => {
    const response = await api.get(`/history?page=${page}&limit=${limit}`);
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
