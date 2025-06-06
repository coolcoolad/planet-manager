import React from 'react';
import { Planet, PlanetStatus } from '../../types/api';

interface PlanetStatusCardProps {
  planet: Planet;
  onViewDetails: () => void;
}

export const PlanetStatusCard: React.FC<PlanetStatusCardProps> = ({ planet, onViewDetails }) => {
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
    switch (status) {
      case PlanetStatus.Active: return 'Active';
      case PlanetStatus.Inactive: return 'Inactive';
      case PlanetStatus.UnderReview: return 'Under Review';
      case PlanetStatus.Archived: return 'Archived';
      default: return 'Deleted';
    }
  };

  const getKeyMetrics = () => {
    if (!planet.factors || planet.factors.length === 0) {
      return [
        { label: 'No data available', value: '-' }
      ];
    }

    return planet.factors.slice(0, 3).map(factor => ({
      label: factor.factorName,
      value: factor.value?.toString() || JSON.parse(factor.valueJson || '{}')
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🪐</span>
          <h3 className="text-lg font-semibold text-gray-900">{planet.name}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(planet.status)}`}>
          {getStatusText(planet.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-gray-700">Key Metrics:</h4>
        {getKeyMetrics().map((metric, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-600">• {metric.label}:</span>
            <span className="font-medium">{metric.value}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Last Updated: {new Date(planet.updatedAt).toLocaleDateString()}
        </span>
        <button
          onClick={onViewDetails}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
