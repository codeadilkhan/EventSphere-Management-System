import api from './api';

export const messageService = {
  // Fetch active conversation threads
  getConversations: async () => {
    const res = await api.get('/messages/conversations');
    return res.data;
  },

  // Fetch message history with a specific contact
  getMessagesWithUser: async (userId, expoId) => {
    const url = expoId ? `/messages/${userId}?expoId=${expoId}` : `/messages/${userId}`;
    const res = await api.get(url);
    return res.data;
  },

  // Send a direct message
  sendMessage: async ({ receiverId, expoId, content }) => {
    const res = await api.post('/messages', { receiverId, expoId, content });
    return res.data;
  },

  // Mark all unread messages from a contact as read
  markAsRead: async (senderId) => {
    const res = await api.patch(`/messages/read/${senderId}`);
    return res.data;
  },

  // Get total unread badge count
  getUnreadCount: async () => {
    const res = await api.get('/messages/unread-count');
    return res.data;
  },
};
