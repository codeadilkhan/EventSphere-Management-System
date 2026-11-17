import api from './api';

export const notificationService = {
  // Get notifications (paginated + unreadCount)
  getNotifications: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  // Clear all notifications
  clearAll: async () => {
    const res = await api.delete('/notifications/clear-all');
    return res.data;
  },
};
