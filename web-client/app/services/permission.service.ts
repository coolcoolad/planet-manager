import { apiClient } from './api-client';
import { 
  Permission, 
  CreatePermissionRequest, 
  UpdatePermissionRequest, 
  CheckPermissionRequest,
  CheckPermissionResponse
} from '../types/api';

export class PermissionService {
  async getAllPermissions(): Promise<Permission[]> {
    return apiClient.get<Permission[]>('/Permission');
  }

  async getPermissionById(id: number): Promise<Permission> {
    return apiClient.get<Permission>(`/Permission/${id}`);
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    return apiClient.get<Permission[]>(`/Permission/user/${userId}`);
  }

  async createPermission(request: CreatePermissionRequest): Promise<Permission> {
    return apiClient.post<Permission>('/Permission', request);
  }

  async updatePermission(id: number, request: UpdatePermissionRequest): Promise<Permission> {
    return apiClient.put<Permission>(`/Permission/${id}`, request);
  }

  async deletePermission(id: number): Promise<void> {
    return apiClient.delete<void>(`/Permission/${id}`);
  }

  async checkPermission(request: CheckPermissionRequest): Promise<CheckPermissionResponse> {
    return apiClient.post<CheckPermissionResponse>('/Permission/check', request);
  }
}

export const permissionService = new PermissionService();
