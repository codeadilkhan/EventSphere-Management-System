import api from './api';

export const exhibitorService = {
  getMyProfile: async () => {
    const res = await api.get('/exhibitors/me');
    return res.data;
  },

  updateMyProfile: async (profileData) => {
    const res = await api.put('/exhibitors/me', profileData);
    return res.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await api.post('/exhibitors/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getPublicProfile: async (id) => {
    const res = await api.get(`/exhibitors/${id}`);
    return res.data;
  },

  searchExhibitors: async (params = {}) => {
    const res = await api.get('/exhibitors', { params });
    return res.data;
  },
};
