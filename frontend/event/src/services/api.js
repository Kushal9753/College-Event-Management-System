import axios from 'axios';
import { getToken } from '../utils/tokenHandler';

const api = axios.create({
  baseURL: '/api', // Proxied to backend via Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (e.g., token expiration)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Optionally handle generic 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if required here.
      console.error('Unauthorized, token failed or expired.');
    }
    return Promise.reject(error);
  }
);

export default api;
