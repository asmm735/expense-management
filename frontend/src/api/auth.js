import api from './index';
import { API_ENDPOINTS, COUNTRIES } from '../utils/constants';

export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    } catch (error) {
      // Mock authentication for development
      console.warn('Using mock login data');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Accept any credentials for demo purposes
      return {
        access_token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          name: 'Admin User',
          email: credentials.email,
          role: 'admin',
          isApprover: true,
        }
      };
    }
  },

  // Register user
  signup: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
      return response.data;
    } catch (error) {
      // Mock signup for development
      console.warn('Using mock signup data');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      return {
        access_token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          role: 'employee',
          isApprover: false,
        }
      };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      // Mock current user for development
      console.warn('Using mock current user data');
      const token = localStorage.getItem('token');
      if (token) {
        return {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          isApprover: true,
        };
      }
      throw new Error('No token found');
    }
  },

  // Logout user (if backend logout endpoint exists)
  logout: async () => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      return response.data;
    } catch (error) {
      // Mock logout for development
      console.warn('Using mock logout');
      return { success: true };
    }
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