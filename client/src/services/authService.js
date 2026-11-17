import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  register: async (registrationData) => {
    const res = await api.post('/auth/register', registrationData);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (token, passwords) => {
    const res = await api.post(`/auth/reset-password/${token}`, passwords);
    return res.data;
  },

  changePassword: async (passwords) => {
    const res = await api.put('/auth/change-password', passwords);
    return res.data;
  },

  checkHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },
};
