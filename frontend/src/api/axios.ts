import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // Proxy will handle redirecting this to localhost:8080
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      // We could redirect to login here, but usually the UI handles auth state changes 
      // better via the Zustand store or React Router protections.
    }
    return Promise.reject(error);
  }
);

export default api;

