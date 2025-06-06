import React, { useState } from 'react';
import { CreatePlanetRequest, User } from '../../types/api';
import { planetService } from '../../services';

interface PlanetNewFormProps {
  user?: User;
  onNavigate: (route: string) => void;
}

export const PlanetNewForm: React.FC<PlanetNewFormProps> = ({ user, onNavigate }) => {
  const [formData, setFormData] = useState<CreatePlanetRequest>({
    name: '',
    description: '',
    location: '',
    discoveredDate: new Date().toISOString().split('T')[0] // Default to today
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreatePlanetRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      setError('Planet name is required');
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError('Planet name must be at least 2 characters long');
      return false;
    }

    if (!formData.discoveredDate) {
      setError('Discovery date is required');
      return false;
    }

    const discoveredDate = new Date(formData.discoveredDate);
    const today = new Date();
    if (discoveredDate > today) {
      setError('Discovery date cannot be in the future');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const newPlanet = await planetService.createPlanet({
        ...formData,
        name: formData.name?.trim(),
        description: formData.description?.trim() || undefined,
        location: formData.location?.trim() || undefined
      });
      
      // Navigate to the newly created planet's detail page
      onNavigate(`/planets/${newPlanet.id}`);
    } catch (error) {
      console.error('Failed to create planet:', error);
      setError('Failed to create planet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      onNavigate('/planets');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          {/* <button
            onClick={() => onNavigate('/planets')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to Planets
          </button> */}
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🪐</span>
              <h1 className="text-2xl font-bold text-gray-900">Add New Planet</h1>
            </div>
            <p className="text-gray-600 mt-2">Enter the basic information for the new planet</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Planet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planet Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the planet name (e.g., Kepler-442b, HD 40307g)"
              required
              maxLength={100}
            />
            <p className="text-sm text-gray-500 mt-1">
              Choose a clear, descriptive name for the planet
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Provide a brief description of the planet, including any notable characteristics or observations..."
              maxLength={1000}
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional: Add details about the planet's characteristics, composition, or significance
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Kepler-442 system, Proxima Centauri b, HD 40307 system"
              maxLength={200}
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional: Specify the star system, constellation, or astronomical coordinates
            </p>
          </div>

          {/* Discovery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discovery Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.discoveredDate}
              onChange={(e) => handleInputChange('discoveredDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              max={new Date().toISOString().split('T')[0]} // Can't be future date
            />
            <p className="text-sm text-gray-500 mt-1">
              When was this planet first discovered or confirmed?
            </p>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 text-xl">ℹ️</span>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Next Steps</h4>
                <p className="text-sm text-blue-700">
                  After creating the planet, you'll be able to add detailed factors such as:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                  <li>• Physical properties (mass, radius, temperature)</li>
                  <li>• Chemical composition (atmosphere, surface materials)</li>
                  <li>• Biological indicators (biosignatures, habitability factors)</li>
                  <li>• Environmental conditions (radiation, magnetic field)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name?.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{saving ? 'Creating...' : 'Create Planet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
