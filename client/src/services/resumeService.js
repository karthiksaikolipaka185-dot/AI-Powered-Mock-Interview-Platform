import api from './api';

export const uploadResume = async (file, role = 'Full Stack Engineer') => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('role', role);

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
