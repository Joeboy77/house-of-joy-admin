import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { notifications } from '@mantine/notifications';

const api = axios.create({
  baseURL: 'https://e-ticket-server-afxw.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const authStore = useAuthStore.getState();
      authStore.logout();
      
      // Show notification
      notifications.show({
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again.',
        color: 'orange',
        autoClose: 3000,
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default api; 