import api from './api';

export const feedbackService = {
  // Submit feedback ticket (Any user)
  submitFeedback: async (data) => {
    const res = await api.post('/feedback', data);
    return res.data;
  },

  // Get user's own feedback submissions
  getMyFeedback: async () => {
    const res = await api.get('/feedback/me');
    return res.data;
  },

  // Get all feedback tickets (Admin)
  getAllFeedback: async (params = {}) => {
    const res = await api.get('/feedback', { params });
    return res.data;
  },

  // Update status (Admin)
  updateStatus: async (id, status) => {
    const res = await api.patch(`/feedback/${id}/status`, { status });
    return res.data;
  },

  // Reply to ticket (Admin)
  replyToFeedback: async (id, reply, status = 'resolved') => {
    const res = await api.post(`/feedback/${id}/reply`, { reply, status });
    return res.data;
  },
};
