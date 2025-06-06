export { authService } from './auth.service';
export { apiClient } from './api-client';

// Create placeholder services for now
class PlanetService {
  async getAllPlanets() {
    // Mock data for now
    return [
      {
        id: 1,
        name: 'Kepler-442b',
        description: 'Earth-like exoplanet with potential for human habitation',
        location: 'Lyra constellation',
        discoveredDate: '2015-01-06',
        status: 0, // Active
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        factors: [
          {
            id: 1,
            planetId: 1,
            factorName: 'Oxygen Level',
            category: 1,
            valueJson: '21',
            unit: '%',
            dataType: 0,
            weight: 9,
            description: 'Atmospheric oxygen percentage',
            recordedAt: new Date().toISOString(),
            value: 21
          }
        ]
      }
    ];
  }
}

class EvaluationService {
  async getAllEvaluations() {
    // Mock data for now
    return [];
  }
}

class FactorService {
  async addFactor(planetId: number, factor: any) {
    // Mock implementation
    console.log('Adding factor:', planetId, factor);
    return { success: true };
  }
}

export const planetService = new PlanetService();
export const evaluationService = new EvaluationService();
export const factorService = new FactorService();
