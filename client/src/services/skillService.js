import axios from 'axios';
import authService from './authService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSkillProfile = async () => {
    try {
        const response = await axios.get(`${API_BASE}/skills/profile`, {
            headers: getAuthHeaders()
        });
        return response.data.data;
    } catch (error) {
        console.error('[skillService] Error fetching skill profile:', error.response?.data || error.message);
        throw error;
    }
};

export const recalculateSkillProfile = async () => {
    try {
        const response = await axios.post(`${API_BASE}/skills/recalculate`, {}, {
            headers: getAuthHeaders()
        });
        return response.data.data;
    } catch (error) {
        console.error('[skillService] Error recalculating skill profile:', error.response?.data || error.message);
        throw error;
    }
};
