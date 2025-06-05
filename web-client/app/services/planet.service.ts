import { apiClient } from './api-client';
import { Planet, CreatePlanetRequest, UpdatePlanetRequest } from '../types/api';

export class PlanetService {
  async getAllPlanets(): Promise<Planet[]> {
    return apiClient.get<Planet[]>('/Planet');
  }

  async getPlanetById(id: number): Promise<Planet> {
    return apiClient.get<Planet>(`/Planet/${id}`);
  }

  async createPlanet(request: CreatePlanetRequest): Promise<Planet> {
    return apiClient.post<Planet>('/Planet', request);
  }

  async updatePlanet(id: number, request: UpdatePlanetRequest): Promise<Planet> {
    return apiClient.put<Planet>(`/Planet/${id}`, request);
  }

  async deletePlanet(id: number): Promise<void> {
    return apiClient.delete<void>(`/Planet/${id}`);
  }
}

export const planetService = new PlanetService();
