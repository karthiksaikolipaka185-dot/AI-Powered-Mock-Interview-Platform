import axios from 'axios';
import authService from './authService';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/admin/users`
});

// Attach Authorization header automatically
api.interceptors.request.use((config) => {
    const token = authService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

/**
 * Fetch paginated users list with search & filters.
 */
export const getUsers = async (params = {}) => {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc', filterStatus = 'all' } = params;
    const response = await api.get('', {
        params: { page, limit, search, sortBy, sortOrder, filterStatus }
    });
    return response.data;
};

/**
 * Fetch single user complete details for the profile drawer.
 */
export const getUserById = async (userId) => {
    const response = await api.get(`/${userId}`);
    return response.data;
};

export default {
    getUsers,
    getUserById
};
