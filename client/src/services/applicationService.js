import api from './api';

export const applicationService = {
  submitApplication: async (applicationData) => {
    // If applicationData is a FormData instance with files
    const isFormData = applicationData instanceof FormData;
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};

    const res = await api.post('/applications', applicationData, config);
    return res.data;
  },

  getMyApplications: async () => {
    const res = await api.get('/applications/my');
    return res.data;
  },

  getAllApplications: async (params = {}) => {
    const res = await api.get('/applications', { params });
    return res.data;
  },

  reviewApplication: async (id, status, adminRemarks = '') => {
    const res = await api.put(`/applications/${id}/status`, { status, adminRemarks });
    return res.data;
  },
};
