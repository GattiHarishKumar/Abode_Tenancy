import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://abode-tenancy-backend.onrender.com/api/v1' : 'http://localhost:8080/api/v1');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('abode_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('abode_token');
      localStorage.removeItem('abode_auth');
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/p/')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
