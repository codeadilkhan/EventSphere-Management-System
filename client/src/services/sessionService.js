import api from './api';

export const sessionService = {
  getSessionsByExpo: async (expoId, params = {}) => {
    const res = await api.get(`/sessions/expo/${expoId}`, { params });
    return res.data;
  },

  getSessionById: async (id) => {
    const res = await api.get(`/sessions/${id}`);
    return res.data;
  },

  createSession: async (sessionData) => {
    const res = await api.post('/sessions', sessionData);
    return res.data;
  },

  updateSession: async (id, sessionData) => {
    const res = await api.put(`/sessions/${id}`, sessionData);
    return res.data;
  },

  deleteSession: async (id) => {
    const res = await api.delete(`/sessions/${id}`);
    return res.data;
  },
};
