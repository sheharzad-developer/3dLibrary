import { api } from './client';
import type { LoginCredentials, RegisterData, AuthTokens, User } from '../types';

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface RegisterResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
  message?: string;
}

/**
 * Authentication API service
 */
export const authApi = {
  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register/', userData);
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/refresh/');
    return response.data;
  },

  /**
   * Logout user (invalidate tokens)
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout/');
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/user/');
    return response.data;
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/verify-email/', { token });
    return response.data;
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/password-reset/', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/password-reset/confirm/', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};