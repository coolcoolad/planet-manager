import React, { useState, useEffect } from 'react';
import { Planet, FactorCategory, FactorType, AddFactorRequest, User } from '../../types/api';
import { planetService, factorService } from '../../services';

interface FactorFormProps {
  user?: User;
  preSelectedPlanetId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FactorForm: React.FC<FactorFormProps> = ({ 
  user, 
  preSelectedPlanetId, 
  onSuccess, 
  onCancel 
}) => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [formData, setFormData] = useState<AddFactorRequest>({
    factorName: '',
    category: FactorCategory.Physical,
    value: '',
    unit: '',
    dataType: FactorType.Numeric,
    weight: 5,
    description: ''
  });
  const [selectedPlanetId, setSelectedPlanetId] = useState<number | null>(preSelectedPlanetId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const data = await planetService.getAllPlanets();
        // Filter planets based on user permissions
        // const accessiblePlanets = data.filter(planet => {
        //   if (user?.role === 3) return true; // Super Admin
        //   if (user?.role === 2) return user.assignedPlanetId === planet.id; // Planet Admin
        //   return user?.assignedPlanetId === planet.id; // Viewer
        // });
        setPlanets(data);
      } catch (error) {
        console.error('Failed to fetch planets:', error);
        setError('Failed to load planets');
      }
    };

    fetchPlanets();
  }, [user]);

  const handleInputChange = (field: keyof AddFactorRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderValueInput = () => {
    switch (formData.dataType) {
      case FactorType.Numeric:
        return (
          <input
            type="number"
            step="any"
            value={formData.value as string}
            onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter numeric value"
            required
          />
        );
      
      case FactorType.Boolean:
        return (
          <select
            value={formData.value?.toString() || 'false'}
            onChange={(e) => handleInputChange('value', e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="true">Yes/True</option>
            <option value="false">No/False</option>
          </select>
        );
      
      case FactorType.String:
        return (
          <input
            type="text"
            value={formData.value as string}
            onChange={(e) => handleInputChange('value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text value"
            required
          />
        );
      
      case FactorType.Date:
        return (
          <input
            type="date"
            value={formData.value as string}
            onChange={(e) => handleInputChange('value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        );
      
      default:
        return (
          <textarea
            value={formData.value as string}
            onChange={(e) => handleInputChange('value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter JSON or complex data"
            required
          />
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlanetId) {
      setError('Please select a planet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await factorService.addFactor(selectedPlanetId, formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to add factor:', error);
      setError('Failed to add factor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Add Planet Factor</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Planet Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Planet: <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedPlanetId || ''}
            onChange={(e) => setSelectedPlanetId(parseInt(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!!preSelectedPlanetId}
          >
            <option value="">Select a planet</option>
            {planets.map(planet => (
              <option key={planet.id} value={planet.id}>
                {planet.name}
              </option>
            ))}
          </select>
        </div>

        {/* Factor Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Factor Category: <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value={FactorCategory.Physical}>Physical</option>
            <option value={FactorCategory.Chemical}>Chemical</option>
            <option value={FactorCategory.Biological}>Biological</option>
            <option value={FactorCategory.Environmental}>Environmental</option>
            <option value={FactorCategory.Other}>Other</option>
          </select>
        </div>

        {/* Factor Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Factor Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.factorName}
            onChange={(e) => handleInputChange('factorName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Oxygen Level, Temperature, etc."
            required
          />
        </div>

        {/* Data Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Type: <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.dataType}
            onChange={(e) => handleInputChange('dataType', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value={FactorType.Numeric}>Numeric</option>
            <option value={FactorType.Boolean}>Boolean (Yes/No)</option>
            <option value={FactorType.String}>Text</option>
            <option value={FactorType.Date}>Date</option>
            <option value={FactorType.Json}>JSON/Complex</option>
          </select>
        </div>

        {/* Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value: <span className="text-red-500">*</span>
          </label>
          {renderValueInput()}
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit:
          </label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => handleInputChange('unit', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., %, °C, km, etc."
          />
        </div>

        {/* Weight/Importance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight/Importance: <span className="text-red-500">*</span>
            <span className="ml-2 text-sm text-gray-500">({formData.weight}/10)</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low (1)</span>
            <span>Medium (5)</span>
            <span>High (10)</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description:
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Optional description or notes about this factor"
          />
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
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Factor'}
          </button>
        </div>
      </form>
    </div>
  );
};
