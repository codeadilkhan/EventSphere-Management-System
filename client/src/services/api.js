import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const savedToken = localStorage.getItem('eventsphere_token');
    if (savedToken) {
      config.headers.Authorization = `Bearer ${savedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle auth expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login check itself
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // clear expired token
        // localStorage.removeItem('eventsphere_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
