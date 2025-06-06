import React, { useState, useEffect } from 'react';
import { Planet, User } from '../../types/api';
import { planetService } from '../../services';
import { PlanetCard } from './PlanetCard';

interface PlanetOverviewProps {
  user?: User;
  onNavigate: (route: string) => void;
}

export const PlanetOverview: React.FC<PlanetOverviewProps> = ({ user, onNavigate }) => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [filteredPlanets, setFilteredPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const data = await planetService.getAllPlanets();
        setPlanets(data);
        setFilteredPlanets(data);
      } catch (error) {
        console.error('Failed to fetch planets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanets();
  }, []);

  useEffect(() => {
    let filtered = planets;

    if (searchTerm) {
      filtered = filtered.filter(planet =>
        planet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planet.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(planet =>
        planet.status.toString() === statusFilter
      );
    }

    setFilteredPlanets(filtered);
  }, [planets, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Planets Overview</h1>
        {user && (
          <button
            onClick={() => onNavigate('/planets/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Add New Planet
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search planets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="0">Active</option>
            <option value="1">Inactive</option>
            <option value="2">Under Review</option>
            <option value="3">Archived</option>
          </select>

          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Planets Display */}
      {filteredPlanets.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl">🪐</span>
          <h3 className="text-xl font-medium text-gray-900 mt-4">No planets found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredPlanets.map(planet => (
            <PlanetCard
              key={planet.id}
              planet={planet}
              viewMode={viewMode}
              user={user}
              onViewDetails={() => onNavigate(`/planets/${planet.id}`)}
              onEdit={() => onNavigate(`/planets/${planet.id}/edit`)}
              onEvaluate={() => onNavigate(`/evaluation/new?planets=${planet.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
