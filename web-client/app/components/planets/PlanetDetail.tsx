import React, { useState, useEffect } from 'react';
import { Planet, PlanetFactor, EvaluationResult, User, PlanetStatus, FactorCategory } from '../../types/api';
import { planetService, factorService } from '../../services';
import { permissionService } from '../../services/permission.service';

interface PlanetDetailProps {
  user?: User;
  planetId: string;
  onNavigate: (route: string) => void;
}

export const PlanetDetail: React.FC<PlanetDetailProps> = ({ user, planetId, onNavigate }) => {
  const [planet, setPlanet] = useState<Planet | null>(null);
  const [factors, setFactors] = useState<PlanetFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'factors' | 'evaluations'>('overview');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  useEffect(() => {
    const fetchPlanetData = async () => {
      try {
        setLoading(true);
        const id = parseInt(planetId);
        if (isNaN(id)) {
          setError('Invalid planet ID');
          return;
        }

        const [planetData, factorsData] = await Promise.all([
          planetService.getPlanetById(id),
          factorService.getFactorsByPlanet(id)
        ]);

        setPlanet(planetData);
        setFactors(factorsData);
      } catch (err) {
        setError('Failed to load planet data');
        console.error('Error fetching planet data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanetData();
  }, [planetId]);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user || !planet) return;
      
      try {
        setPermissionsLoading(true);
        const planetIdNum = parseInt(planetId);
        
        const [updatePermission, deletePermission] = await Promise.all([
          permissionService.checkPermission({
            userId: user.id,
            resource: 'Planet',
            action: 'Update',
            resourceId: planetIdNum
          }),
          permissionService.checkPermission({
            userId: user.id,
            resource: 'Planet',
            action: 'Delete',
            resourceId: planetIdNum
          })
        ]);

        setCanUpdate(updatePermission.hasPermission);
        setCanDelete(deletePermission.hasPermission);
      } catch (err) {
        console.error('Error checking permissions:', err);
        // Default to false on error
        setCanUpdate(false);
        setCanDelete(false);
      } finally {
        setPermissionsLoading(false);
      }
    };

    checkPermissions();
  }, [user, planet, planetId]);

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

  const getCategoryName = (category: FactorCategory) => {
    const categoryMap = {
      [FactorCategory.Physical]: 'Physical',
      [FactorCategory.Chemical]: 'Chemical',
      [FactorCategory.Biological]: 'Biological',
      [FactorCategory.Environmental]: 'Environmental',
      [FactorCategory.Other]: 'Other'
    };
    return categoryMap[category] || 'Unknown';
  };

  const groupFactorsByCategory = () => {
    return factors.reduce((acc, factor) => {
      const category = getCategoryName(factor.category);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(factor);
      return acc;
    }, {} as Record<string, PlanetFactor[]>);
  };

  const handleDelete = async () => {
    if (!planet || deleting || !canDelete) return;
    
    try {
      setDeleting(true);
      await planetService.deletePlanet(planet.id);
      onNavigate('/planets');
    } catch (err) {
      setError('Failed to delete planet');
      console.error('Error deleting planet:', err);
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !planet) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl">❌</span>
        <h3 className="text-xl font-medium text-gray-900 mt-4">{error || 'Planet not found'}</h3>
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
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            {/* <button
              onClick={() => onNavigate('/planets')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button> */}
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🪐</span>
                <h1 className="text-2xl font-bold text-gray-900">{planet.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(planet.status)}`}>
                  {getStatusText(planet.status)}
                </span>
              </div>
              {planet.description && (
                <p className="text-gray-600 mt-2">{planet.description}</p>
              )}
            </div>
          </div>
          
          {user && (
            <div className="flex space-x-2">
              <button
                onClick={() => onNavigate(`/planets/${planet.id}/edit`)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  canUpdate && !permissionsLoading
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canUpdate || permissionsLoading}
                title={!canUpdate ? 'You do not have permission to edit this planet' : ''}
              >
                {permissionsLoading ? 'Loading...' : 'Edit'}
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  canDelete && !permissionsLoading && !deleting
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canDelete || deleting || permissionsLoading}
                title={!canDelete ? 'You do not have permission to delete this planet' : ''}
              >
                {deleting ? 'Deleting...' : permissionsLoading ? 'Loading...' : 'Delete'}
              </button>
              {/* <button
                onClick={() => onNavigate(`/Factors?planetId=${planet.id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Add Factor
              </button>
              <button
                onClick={() => onNavigate(`/evaluation/new?planets=${planet.id}`)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Evaluate
              </button> */}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Location:</span>
            <span className="ml-2 font-medium">{planet.location || 'Unknown'}</span>
          </div>
          <div>
            <span className="text-gray-500">Discovered:</span>
            <span className="ml-2 font-medium">{new Date(planet.discoveredDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>
            <span className="ml-2 font-medium">{new Date(planet.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'factors', label: `Factors (${factors.length})` },
              { key: 'evaluations', label: 'Evaluations' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Planet Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Total Factors:</dt>
                        <dd className="font-medium">{factors.length}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Status:</dt>
                        <dd className="font-medium">{getStatusText(planet.status)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Created:</dt>
                        <dd className="font-medium">{new Date(planet.createdAt).toLocaleDateString()}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Factor Categories</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(groupFactorsByCategory()).map(([category, categoryFactors]) => (
                        <div key={category} className="flex justify-between">
                          <span className="text-gray-500">{category}:</span>
                          <span className="font-medium">{categoryFactors.length}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'factors' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Planet Factors</h3>
                {/* {user && (
                  <button
                    onClick={() => onNavigate(`/Factors?planetId=${planet.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Add New Factor
                  </button>
                )} */}
              </div>

              {factors.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl">📊</span>
                  <h4 className="text-lg font-medium text-gray-900 mt-2">No factors recorded</h4>
                  <p className="text-gray-500">Add some factors to start analyzing this planet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupFactorsByCategory()).map(([category, categoryFactors]) => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-900 mb-3">{category} Factors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryFactors.map((factor) => (
                          <div key={factor.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900">{factor.factorName}</h5>
                              <span className="text-sm text-gray-500">Weight: {factor.weight}</span>
                            </div>
                            <div className="text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Value:</span>
                                <span className="font-medium">
                                  {factor.value?.toString() || 'N/A'} {factor.unit && `${factor.unit}`}
                                </span>
                              </div>
                              {factor.description && (
                                <p className="text-gray-600 mt-2">{factor.description}</p>
                              )}
                              <div className="text-xs text-gray-400 mt-2">
                                Recorded: {new Date(factor.recordedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Evaluation Results</h3>
                {/* {user && (
                  <button
                    onClick={() => onNavigate(`/evaluation/new?planets=${planet.id}`)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Start New Evaluation
                  </button>
                )} */}
              </div>

              {(!planet.evaluationResults || planet.evaluationResults.length === 0) ? (
                <div className="text-center py-8">
                  <span className="text-4xl">📈</span>
                  <h4 className="text-lg font-medium text-gray-900 mt-2">No evaluations yet</h4>
                  <p className="text-gray-500">Start an evaluation to see analysis results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {planet.evaluationResults.map((result) => (
                    <div key={result.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">Evaluation #{result.evaluationId}</h5>
                          <p className="text-sm text-gray-600">Rank: #{result.rank}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{result.totalScore.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">Total Score</div>
                        </div>
                      </div>
                      {result.recommendation && (
                        <p className="text-sm text-gray-700 mt-2">{result.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Planet</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{planet?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`px-4 py-2 rounded-md transition-colors ${
                  canDelete && !deleting
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canDelete || deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
