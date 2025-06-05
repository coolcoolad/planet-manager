import { apiClient } from './api-client';
import { AuthResult, LoginRequest, RegisterRequest, RefreshTokenRequest } from '../types/api';

export class AuthService {
  async login(request: LoginRequest): Promise<AuthResult> {
    return apiClient.post<AuthResult>('/Auth/login', request);
  }

  async register(request: RegisterRequest): Promise<AuthResult> {
    return apiClient.post<AuthResult>('/Auth/register', request);
  }

  async refresh(request: RefreshTokenRequest): Promise<AuthResult> {
    return apiClient.post<AuthResult>('/Auth/refresh', request);
  }

  async logout(): Promise<void> {
    return apiClient.post<void>('/Auth/logout');
  }
}

export const authService = new AuthService();
