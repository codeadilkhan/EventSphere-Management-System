import api from './api';

export const userService = {
  /**
   * Fetch current user profile with consent and GDPR metadata
   */
  getProfile: async () => {
    const res = await api.get('/users/me');
    return res.data?.data?.user;
  },

  /**
   * Update name or contact phone
   */
  updateProfile: async (data) => {
    const res = await api.patch('/users/me', data);
    return res.data?.data?.user;
  },

  /**
   * GDPR Article 20: Download full personal archive in JSON format
   */
  downloadUserData: async () => {
    const response = await api.get('/users/me/export-data?download=true', {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eventsphere-personal-data-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * GDPR Article 17: Right to Erasure / Permanently Delete Account
   */
  deleteAccount: async (password) => {
    const res = await api.delete('/users/me', {
      data: { password },
    });
    return res.data;
  },
};

export default userService;
