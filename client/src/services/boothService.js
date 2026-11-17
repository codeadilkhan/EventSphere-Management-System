import api from './api';

export const boothService = {
  getBoothsByExpo: async (expoId) => {
    const res = await api.get(`/booths/expo/${expoId}`);
    return res.data;
  },

  createBooth: async (boothData) => {
    const res = await api.post('/booths', boothData);
    return res.data;
  },

  bulkGenerateBooths: async (config) => {
    const res = await api.post('/booths/bulk-generate', config);
    return res.data;
  },

  updateBooth: async (id, boothData) => {
    const res = await api.put(`/booths/${id}`, boothData);
    return res.data;
  },

  deleteBooth: async (id, force = false) => {
    const res = await api.delete(`/booths/${id}`, { params: { force } });
    return res.data;
  },

  allocateBooth: async (id, exhibitorId, notes = '') => {
    const res = await api.put(`/booths/${id}/allocate`, { exhibitorId, notes });
    return res.data;
  },

  releaseBooth: async (id) => {
    const res = await api.put(`/booths/${id}/release`);
    return res.data;
  },

  reserveBooth: async (id) => {
    const res = await api.put(`/booths/${id}/reserve`);
    return res.data;
  },
};
