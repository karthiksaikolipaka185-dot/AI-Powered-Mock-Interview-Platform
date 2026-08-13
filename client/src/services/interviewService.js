import axios from 'axios';

// Assuming an axios instance base configured for API proxying if required globally.
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`
});

// Inject token for all interview requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const uploadResume = async (file, role) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', role); // Send role for context creation
    
    const response = await api.post('/resume/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data;
};

export const getResume = async () => {
    const response = await api.get('/resume');
    return response.data;
};

export const startInterview = async (interviewId, role, resumeText, totalQuestions, difficulty = 'Medium') => {
    if (!interviewId) throw new Error('Cannot start interview without a valid ID. Please re-upload resume.');
    
    console.log('Starting interview with ID:', interviewId, 'Difficulty:', difficulty);

    const response = await api.post(`/interview/start/${interviewId}`, {
        role,
        resumeText,
        totalQuestions,
        difficulty
    });
    
    // Explicitly handle failure based on success flag
    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to initialize interview');
    }

    return response.data.data;
};

export const submitTextAnswer = async (interviewId, answer) => {
    const response = await api.post(`/interview/${interviewId}/answer`, { answer });
    return response.data.data !== undefined ? response.data.data : response.data;
};

export const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    // Use 'file' as the primary field name for consistency with backend uploadAudio middleware
    formData.append('file', audioBlob, 'answer.webm');
    
    console.log('[interviewService] Uploading audio for transcription...');
    const response = await api.post('/interview/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data.data !== undefined ? response.data.data : response.data;
};

export const submitVoiceAnswer = async (interviewId, audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'answer.webm');
    
    console.log(`[interviewService] Submitting voice answer for interview ${interviewId}...`);
    const response = await api.post(`/interview/${interviewId}/voice-answer`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data.data !== undefined ? response.data.data : response.data;
};

export const submitCode = async (interviewId, code, language) => {
    const response = await api.post(`/interview/${interviewId}/code`, { code, language });
    return response.data.data !== undefined ? response.data.data : response.data;
};

export const endInterview = async (interviewId) => {
    const response = await api.post(`/interview/${interviewId}/end`);
    return response.data.data !== undefined ? response.data.data : response.data;
};

export const getInterview = async (interviewId) => {
    const response = await api.get(`/interview/${interviewId}`);
    return response.data.data !== undefined ? response.data.data : response.data;
};

// Export all wrapped functions cleanly
export default {
    uploadResume,
    getResume,
    startInterview,
    submitTextAnswer,
    transcribeAudio,
    submitVoiceAnswer,
    submitCode,
    endInterview,
    getInterview
};
