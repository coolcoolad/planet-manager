import { apiClient } from './api-client';
import { Evaluation, EvaluationRequest } from '../types/api';

export class EvaluationService {
  async createEvaluation(request: EvaluationRequest): Promise<Evaluation> {
    return apiClient.post<Evaluation>('/Evaluation', request);
  }

  async getAllEvaluations(): Promise<Evaluation[]> {
    return apiClient.get<Evaluation[]>('/Evaluation');
  }

  async getEvaluationById(id: number): Promise<Evaluation> {
    return apiClient.get<Evaluation>(`/Evaluation/${id}`);
  }
}

export const evaluationService = new EvaluationService();
