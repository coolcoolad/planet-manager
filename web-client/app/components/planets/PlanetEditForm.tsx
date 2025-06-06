import React, { useState, useEffect } from 'react';
import { Planet, UpdatePlanetRequest, PlanetStatus, User } from '../../types/api';
import { planetService } from '../../services';

interface PlanetEditFormProps {
  user?: User;
  planetId: string;
  onNavigate: (route: string) => void;
}

export const PlanetEditForm: React.FC<PlanetEditFormProps> = ({ user, planetId, onNavigate }) => {
  const [planet, setPlanet] = useState<Planet | null>(null);
  const [formData, setFormData] = useState<UpdatePlanetRequest>({
    name: '',
    description: '',
    location: '',
    status: PlanetStatus.Active
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanet = async () => {
      try {
        setLoading(true);
        const id = parseInt(planetId);
        if (isNaN(id)) {
          setError('Invalid planet ID');
          return;
        }

        const planetData = await planetService.getPlanetById(id);
        setPlanet(planetData);
        setFormData({
          name: planetData.name,
          description: planetData.description || '',
          location: planetData.location || '',
          status: planetData.status
        });
      } catch (err) {
        setError('Failed to load planet data');
        console.error('Error fetching planet:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanet();
  }, [planetId]);

  const handleInputChange = (field: keyof UpdatePlanetRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: PlanetStatus) => {
    switch (status) {
      case PlanetStatus.Active: return 'bg-green-100 text-green-800';
      case PlanetStatus.Inactive: return 'bg-gray-100 text-gray-800';
      case PlanetStatus.UnderReview: return 'bg-yellow-100 text-yellow-800';
      case PlanetStatus.Archived: return 'bg-blue-100 text-blue-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: PlanetStatus) => {
    const statusMap = {
      [PlanetStatus.Active]: 'Active',
      [PlanetStatus.Inactive]: 'Inactive',
      [PlanetStatus.UnderReview]: 'Under Review',
      [PlanetStatus.Archived]: 'Archived',
      [PlanetStatus.Deleted]: 'Deleted'
    };
    return statusMap[status] || 'Unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!planet) return;
    
    if (!formData.name?.trim()) {
      setError('Planet name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedPlanet = await planetService.updatePlanet(planet.id, formData);
      onNavigate(`/planets/${updatedPlanet.id}`);
    } catch (error) {
      console.error('Failed to update planet:', error);
      setError('Failed to update planet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !planet) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl">❌</span>
        <h3 className="text-xl font-medium text-gray-900 mt-4">{error}</h3>
        {/* <button
          onClick={() => onNavigate('/planets')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Planets
        </button> */}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          {/* <button
            onClick={() => onNavigate(`/planets/${planetId}`)}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to Planet
          </button> */}
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🪐</span>
              <h1 className="text-2xl font-bold text-gray-900">Edit Planet: {planet?.name}</h1>
            </div>
            <p className="text-gray-600 mt-2">Update planet information and settings</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
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
              Planet Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter planet name"
              required
            />
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
              rows={4}
              placeholder="Enter planet description"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location:
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Kepler-442 system, Proxima Centauri b"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status:
            </label>
            <div className="space-y-2">
              {Object.values(PlanetStatus).filter(status => typeof status === 'number').map((status) => (
                <label key={status} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={(e) => handleInputChange('status', parseInt(e.target.value))}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status as PlanetStatus)}`}>
                      {getStatusText(status as PlanetStatus)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {status === PlanetStatus.Active && 'Planet is actively being monitored and evaluated'}
                      {status === PlanetStatus.Inactive && 'Planet monitoring is paused'}
                      {status === PlanetStatus.UnderReview && 'Planet data is being reviewed for accuracy'}
                      {status === PlanetStatus.Archived && 'Planet data is archived for historical reference'}
                      {status === PlanetStatus.Deleted && 'Planet is marked for deletion'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Planet Info Summary */}
          {planet && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Planet Information</h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Created:</dt>
                  <dd className="font-medium">{new Date(planet.createdAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last Updated:</dt>
                  <dd className="font-medium">{new Date(planet.updatedAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Discovered:</dt>
                  <dd className="font-medium">{new Date(planet.discoveredDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Total Factors:</dt>
                  <dd className="font-medium">{planet.factors?.length || 0}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onNavigate(`/planets/${planetId}`)}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};