import api from './api';

export const analyticsService = {
  /**
   * Fetch high-level KPI overview
   * @param {string} expoId - optional expo ID
   */
  getOverview: async (expoId) => {
    const params = expoId && expoId !== 'ALL' ? { expoId } : {};
    const response = await api.get('/analytics/overview', { params });
    return response.data?.data || {};
  },

  /**
   * Fetch daily engagement time-series
   * @param {string} expoId - optional expo ID
   * @param {number} days - number of days (default 14)
   */
  getEngagement: async (expoId, days = 14) => {
    const params = { days };
    if (expoId && expoId !== 'ALL') params.expoId = expoId;
    const response = await api.get('/analytics/engagement', { params });
    return response.data?.data?.timeline || [];
  },

  /**
   * Fetch booth traffic rankings and category distribution
   * @param {string} expoId - optional expo ID
   * @param {number} limit - top N booths (default 10)
   */
  getBoothTraffic: async (expoId, limit = 10) => {
    const params = { limit };
    if (expoId && expoId !== 'ALL') params.expoId = expoId;
    const response = await api.get('/analytics/booth-traffic', { params });
    return response.data?.data || { topBooths: [], categoryDistribution: [] };
  },

  /**
   * Fetch session popularity and seat capacity utilization
   * @param {string} expoId - optional expo ID
   */
  getSessionPopularity: async (expoId) => {
    const params = expoId && expoId !== 'ALL' ? { expoId } : {};
    const response = await api.get('/analytics/session-popularity', { params });
    return response.data?.data?.sessions || [];
  },

  /**
   * Log an analytics interaction event (client-side)
   * @param {Object} eventData - { type, expoId, refId, refModel, metadata }
   */
  trackEvent: async (eventData) => {
    try {
      const response = await api.post('/analytics/track', eventData);
      return response.data;
    } catch {
      // Non-blocking
      return null;
    }
  },

  /**
   * Download CSV export
   * @param {string} expoId - optional expo ID
   * @param {string} type - 'overview' | 'engagement' | 'booths' | 'sessions'
   */
  downloadCsv: async (expoId, type = 'overview') => {
    const params = { type };
    if (expoId && expoId !== 'ALL') params.expoId = expoId;

    const response = await api.get('/analytics/export', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eventsphere-${type}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default analyticsService;
