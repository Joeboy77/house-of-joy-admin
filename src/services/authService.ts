import api from './api';
import type { LoginRequest } from '../types';

export const login = async (credentials: LoginRequest) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}; 