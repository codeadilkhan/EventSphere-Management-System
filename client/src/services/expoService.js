import api from './api';

export const expoService = {
  getExpos: async (params = {}) => {
    const res = await api.get('/expos', { params });
    return res.data;
  },

  getExpoById: async (id) => {
    const res = await api.get(`/expos/${id}`);
    return res.data;
  },

  createExpo: async (expoData) => {
    const res = await api.post('/expos', expoData);
    return res.data;
  },

  updateExpo: async (id, expoData) => {
    const res = await api.put(`/expos/${id}`, expoData);
    return res.data;
  },

  deleteExpo: async (id) => {
    const res = await api.delete(`/expos/${id}`);
    return res.data;
  },

  uploadBanner: async (file) => {
    const formData = new FormData();
    formData.append('banner', file);
    const res = await api.post('/expos/upload-banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
