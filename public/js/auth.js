// Authentication Helper Functions
import { authAPI, usersAPI } from './api.js';

export async function login(email, password) {
  try {
    const response = await authAPI.login(email, password);
    
    if (response.success) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    }
    
    throw new Error(response.error || 'Login failed');
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
}

export async function register(email, password, name) {
  try {
    const response = await authAPI.register(email, password, name);
    
    if (response.success) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    }
    
    throw new Error(response.error || 'Registration failed');
  } catch (error) {
    console.error('Registration error:', error.message);
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/';
}

export function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

export function getCurrentUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export async function getCurrentUserProfile() {
  try {
    const response = await usersAPI.getProfile();
    if (response.success) {
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    // If 401, token is expired
    if (error.message.includes('401')) {
      logout();
    }
  }
}

export function redirectIfNotAuthenticated() {
  if (!isAuthenticated()) {
    window.location.href = '/';
  }
}

export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = '/dashboard';
  }
}
