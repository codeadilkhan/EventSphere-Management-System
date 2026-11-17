import api from './api';

export const registrationService = {
  registerForExpo: async (expoId) => {
    const res = await api.post('/registrations/expo', { expoId });
    return res.data;
  },

  cancelExpoRegistration: async (expoId) => {
    const res = await api.delete(`/registrations/expo/${expoId}`);
    return res.data;
  },

  registerForSession: async (sessionId) => {
    const res = await api.post('/registrations', { sessionId });
    return res.data;
  },

  cancelRegistration: async (sessionId) => {
    const res = await api.delete(`/registrations/session/${sessionId}`);
    return res.data;
  },

  toggleBookmark: async (sessionId) => {
    const res = await api.post(`/registrations/bookmark/${sessionId}`);
    return res.data;
  },

  getMyRegistrations: async () => {
    const res = await api.get('/registrations/me');
    return res.data;
  },
};
