import { apiClient } from './api-client';
import { PlanetFactor, AddFactorRequest, UpdateFactorRequest } from '../types/api';

export class FactorService {
  async getFactorsByPlanet(planetId: number): Promise<PlanetFactor[]> {
    return apiClient.get<PlanetFactor[]>(`/planets/${planetId}/Factor`);
  }

  async addFactor(planetId: number, request: AddFactorRequest): Promise<PlanetFactor> {
    return apiClient.post<PlanetFactor>(`/planets/${planetId}/Factor`, request);
  }

  async updateFactor(
    planetId: number,
    factorId: number,
    request: UpdateFactorRequest
  ): Promise<PlanetFactor> {
    return apiClient.put<PlanetFactor>(`/planets/${planetId}/Factor/${factorId}`, request);
  }

  async deleteFactor(planetId: number, factorId: number): Promise<void> {
    return apiClient.delete<void>(`/planets/${planetId}/Factor/${factorId}`);
  }

  async addFactorsBatch(
    planetId: number,
    requests: AddFactorRequest[]
  ): Promise<PlanetFactor[]> {
    return apiClient.post<PlanetFactor[]>(`/planets/${planetId}/Factor/batch`, requests);
  }
}

export const factorService = new FactorService();
