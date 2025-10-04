import api from './index';
import { API_ENDPOINTS, COUNTRIES } from '../utils/constants';

export const authAPI = {
  // Login user
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  // Register user
  signup: async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  // Logout user (if backend logout endpoint exists)
  logout: async () => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  // Get countries for company setup
  getCountries: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.COUNTRIES);
      return response.data;
    } catch (error) {
      // Fallback to frontend constants if API is not available
      console.warn('Using fallback countries data');
      return COUNTRIES;
    }
  },
};