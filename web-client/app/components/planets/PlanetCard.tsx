import React, { useState, useEffect } from 'react';
import { Planet, PlanetStatus, User } from '../../types/api';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { permissionService } from '../../services/permission.service';

interface PlanetCardProps {
  planet: Planet;
  viewMode: 'grid' | 'list';
  user?: User;
  onViewDetails: () => void;
  onEdit: () => void;
  onEvaluate: () => void;
  onDelete: () => void;
}

export const PlanetCard: React.FC<PlanetCardProps> = ({
  planet,
  viewMode,
  user,
  onViewDetails,
  onEdit,
  onEvaluate,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

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

  const getKeyMetrics = () => {
    if (!planet.factors || planet.factors.length === 0) {
      return [{ label: 'No data available', value: '-' }];
    }

    return planet.factors.slice(0, 3).map(factor => ({
      label: factor.factorName,
      value: factor.value?.toString() || 'N/A'
    }));
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setCanEdit(false);
        setCanDelete(false);
        setPermissionsLoading(false);
        return;
      }

      try {
        const [editPermission, deletePermission] = await Promise.all([
          permissionService.checkPermission({
            userId: user.id,
            resource: 'Planet',
            action: 'Update',
            resourceId: planet.id
          }),
          permissionService.checkPermission({
            userId: user.id,
            resource: 'Planet',
            action: 'Delete',
            resourceId: planet.id
          })
        ]);

        setCanEdit(editPermission.hasPermission);
        setCanDelete(deletePermission.hasPermission);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setCanEdit(false);
        setCanDelete(false);
      } finally {
        setPermissionsLoading(false);
      }
    };

    checkPermissions();
  }, [user, planet.id]);

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-3xl">🪐</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{planet.name}</h3>
              <p className="text-gray-600 text-sm">{planet.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(planet.status)}`}>
                  {getStatusText(planet.status)}
                </span>
                <span className="text-xs text-gray-500">
                  Updated: {new Date(planet.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onViewDetails}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              View Details
            </button>
            {user && (
              <button
                onClick={onEdit}
                disabled={permissionsLoading || !canEdit}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  permissionsLoading || !canEdit
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Edit
              </button>
            )}
            {user && (
              <button
                onClick={handleDeleteClick}
                disabled={permissionsLoading || !canDelete}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  permissionsLoading || !canDelete
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Delete
              </button>
            )}
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Planet"
          message={`Are you sure you want to delete "${planet.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          type="danger"
        />
      </>
    );
  }

  return (
    <>
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

        {planet.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{planet.description}</p>
        )}

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
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            View Details
          </button>
          {user && (
            <button
              onClick={onEdit}
              disabled={permissionsLoading || !canEdit}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                permissionsLoading || !canEdit
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              Edit
            </button>
          )}
          {user && (
            <button
              onClick={handleDeleteClick}
              disabled={permissionsLoading || !canDelete}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                permissionsLoading || !canDelete
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Planet"
        message={`Are you sure you want to delete "${planet.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </>
  );
};
