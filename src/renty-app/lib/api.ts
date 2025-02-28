import { API_URL } from '@/constants/config';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';


const logout = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('biometricEnabled');

  router.replace('/(auth)');
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(error)
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { 
          refreshToken 
        });
        
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, user needs to login again
        await logout();
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);