import React, { useState, useEffect } from 'react';
import { Planet, EvaluationAlgorithm, EvaluationRequest, FactorCategory } from '../../types/api';
import { planetService, evaluationService } from '../../services';

interface EvaluationFormProps {
  onSuccess: (evaluationId: number) => void;
  onCancel: () => void;
  preSelectedPlanetIds?: number[];
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ 
  onSuccess, 
  onCancel, 
  preSelectedPlanetIds = [] 
}) => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [selectedPlanetIds, setSelectedPlanetIds] = useState<number[]>(preSelectedPlanetIds);
  const [algorithm, setAlgorithm] = useState<EvaluationAlgorithm>(EvaluationAlgorithm.SimpleWeighted);
  const [weights, setWeights] = useState<Record<string, number>>({
    Environmental: 25,
    Geological: 30,
    Biological: 20,
    Technical: 25
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const data = await planetService.getAllPlanets();
        setPlanets(data.filter(p => p.status === 0)); // Only active planets
      } catch (error) {
        console.error('Failed to fetch planets:', error);
        setError('Failed to load planets');
      }
    };

    fetchPlanets();
  }, []);

  const handlePlanetToggle = (planetId: number) => {
    setSelectedPlanetIds(prev =>
      prev.includes(planetId)
        ? prev.filter(id => id !== planetId)
        : [...prev, planetId]
    );
  };

  const handleWeightChange = (category: string, value: number) => {
    setWeights(prev => ({ ...prev, [category]: value }));
  };

  const normalizeWeights = () => {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (total === 100) return weights;
    
    const normalized: Record<string, number> = {};
    Object.entries(weights).forEach(([category, weight]) => {
      normalized[category] = Math.round((weight / total) * 100);
    });
    return normalized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPlanetIds.length < 2) {
      setError('Please select at least 2 planets for comparison');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: EvaluationRequest = {
        planetIds: selectedPlanetIds,
        algorithm,
        weights: normalizeWeights()
      };

      const evaluation = await evaluationService.createEvaluation(request);
      onSuccess(evaluation.id);
    } catch (error) {
      console.error('Failed to create evaluation:', error);
      setError('Failed to create evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Evaluation</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Planet Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Select Planets to Compare:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {planets.map(planet => (
              <label
                key={planet.id}
                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPlanetIds.includes(planet.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPlanetIds.includes(planet.id)}
                  onChange={() => handlePlanetToggle(planet.id)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">{planet.name}</div>
                  <div className="text-sm text-gray-500">{planet.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Algorithm Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Evaluation Algorithm:</h3>
          <div className="space-y-2">
            {Object.entries({
              [EvaluationAlgorithm.SimpleWeighted]: { 
                name: 'Simple Weighted Average', 
                description: 'Basic weighted scoring system' 
              },
              [EvaluationAlgorithm.ComplexWeighted]: { 
                name: 'Complex Weighted Analysis', 
                description: 'Advanced multi-criteria decision analysis' 
              },
              [EvaluationAlgorithm.MachineLearning]: { 
                name: 'Machine Learning', 
                description: 'AI-powered evaluation model' 
              }
            }).map(([value, { name, description }]) => (
              <label key={value} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="algorithm"
                  value={value}
                  checked={algorithm === parseInt(value)}
                  onChange={(e) => setAlgorithm(parseInt(e.target.value) as EvaluationAlgorithm)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{name}</div>
                  <div className="text-sm text-gray-500">{description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Weight Configuration */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Factor Weights Configuration:
            <span className={`ml-2 text-sm ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
              (Total: {totalWeight}%)
            </span>
          </h3>
          <div className="space-y-4">
            {Object.entries(weights).map(([category, weight]) => (
              <div key={category} className="flex items-center space-x-4">
                <label className="w-24 text-sm font-medium text-gray-700">
                  {category}:
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weight}
                  onChange={(e) => handleWeightChange(category, parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-sm font-medium text-gray-900">
                  {weight}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || selectedPlanetIds.length < 2}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Run Evaluation'}
          </button>
        </div>
      </form>
    </div>
  );
};
