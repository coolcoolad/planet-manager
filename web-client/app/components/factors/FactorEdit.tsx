import React, { useState, useEffect } from 'react';
import { PlanetFactor, FactorCategory, FactorType, User } from '../../types/api';
import { factorService } from '../../services';

interface FactorEditProps {
  user?: User;
  factorId: string;
  planetId?: string;
  onNavigate: (route: string) => void;
  onSave?: (factor: PlanetFactor) => void;
}

export const FactorEdit: React.FC<FactorEditProps> = ({ 
  user, 
  factorId, 
  planetId, 
  onNavigate, 
  onSave 
}) => {
  const [factor, setFactor] = useState<PlanetFactor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    factorName: '',
    category: FactorCategory.Physical,
    value: '',
    unit: '',
    dataType: FactorType.Numeric,
    weight: 1.0,
    description: '',
    recordedBy: user?.username || ''
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchFactor = async () => {
      try {
        setLoading(true);
        const id = parseInt(factorId);
        const pId = planetId ? parseInt(planetId) : 0;
        
        if (isNaN(id) || isNaN(pId)) {
          setError('Invalid factor or planet ID');
          return;
        }

        // Since there's no direct getFactor endpoint, we need to get all factors and find the one we want
        const factors = await factorService.getFactorsByPlanet(pId);
        const foundFactor = factors.find(f => f.id === id);
        
        if (!foundFactor) {
          setError('Factor not found');
          return;
        }

        setFactor(foundFactor);
        setFormData({
          factorName: foundFactor.factorName,
          category: foundFactor.category,
          value: foundFactor.value?.toString() || foundFactor.valueJson || '',
          unit: foundFactor.unit || '',
          dataType: foundFactor.dataType,
          weight: foundFactor.weight,
          description: foundFactor.description || '',
          recordedBy: foundFactor.recordedBy || user?.username || ''
        });
      } catch (err) {
        setError('Failed to load factor');
        console.error('Error fetching factor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFactor();
  }, [factorId, planetId, user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!factor || !planetId) return;
    
    try {
      setSaving(true);
      setError(null);

      // Prepare the request data
      let processedValue: any = formData.value;
      
      // Handle different data types
      if (formData.dataType === FactorType.Numeric) {
        const numValue = parseFloat(formData.value);
        if (!isNaN(numValue)) {
          processedValue = numValue;
        }
      } else if (formData.dataType === FactorType.Boolean) {
        processedValue = formData.value.toLowerCase() === 'true' || formData.value === '1';
      } else if (formData.dataType === FactorType.Json) {
        try {
          JSON.parse(formData.value); // Validate JSON
          processedValue = formData.value;
        } catch {
          setError('Invalid JSON format');
          return;
        }
      }

      const updateRequest = {
        factorName: formData.factorName,
        category: formData.category,
        value: processedValue,
        unit: formData.unit,
        dataType: formData.dataType,
        weight: formData.weight,
        description: formData.description,
        recordedBy: formData.recordedBy
      };

      const updatedFactor = await factorService.updateFactor(
        parseInt(planetId),
        factor.id,
        updateRequest
      );

      onSave?.(updatedFactor);
      onNavigate(`/planets/${planetId}`);
    } catch (err) {
      setError('Failed to update factor');
      console.error('Error updating factor:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!factor || !planetId || deleting) return;
    
    try {
      setDeleting(true);
      await factorService.deleteFactor(parseInt(planetId), factor.id);
      onNavigate(`/planets/${planetId}`);
    } catch (err) {
      setError('Failed to delete factor');
      console.error('Error deleting factor:', err);
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const getCategoryOptions = () => [
    { value: FactorCategory.Physical, label: 'Physical' },
    { value: FactorCategory.Chemical, label: 'Chemical' },
    { value: FactorCategory.Biological, label: 'Biological' },
    { value: FactorCategory.Environmental, label: 'Environmental' },
    { value: FactorCategory.Other, label: 'Other' }
  ];

  const getDataTypeOptions = () => [
    { value: FactorType.Numeric, label: 'Numeric' },
    { value: FactorType.Boolean, label: 'Boolean' },
    { value: FactorType.String, label: 'String' },
    { value: FactorType.Date, label: 'Date' },
    { value: FactorType.Json, label: 'JSON' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !factor) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl">❌</span>
        <h3 className="text-xl font-medium text-gray-900 mt-4">{error || 'Factor not found'}</h3>
        <button
          onClick={() => onNavigate(`/planets/${planetId}`)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Planet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Factor</h1>
            <p className="text-gray-600 mt-1">Update factor information</p>
          </div>
          <button
            onClick={() => onNavigate(`/planets/${planetId}`)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Factor Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Factor Name *
              </label>
              <input
                type="text"
                value={formData.factorName}
                onChange={(e) => handleInputChange('factorName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={200}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {getCategoryOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Type *
              </label>
              <select
                value={formData.dataType}
                onChange={(e) => handleInputChange('dataType', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {getDataTypeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value *
              </label>
              {formData.dataType === FactorType.Boolean ? (
                <select
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select...</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : formData.dataType === FactorType.Json ? (
                <textarea
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter valid JSON"
                  required
                />
              ) : (
                <input
                  type={formData.dataType === FactorType.Numeric ? 'number' : 
                        formData.dataType === FactorType.Date ? 'date' : 'text'}
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step={formData.dataType === FactorType.Numeric ? 'any' : undefined}
                  required
                />
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={50}
                placeholder="e.g., kg, °C, %"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
                min="0"
                max="10"
              />
            </div>

            {/* Recorded By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recorded By
              </label>
              <input
                type="text"
                value={formData.recordedBy}
                onChange={(e) => handleInputChange('recordedBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Optional description of this factor"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex  justify-end pt-6 border-t border-gray-200">
            {/* <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Factor'}
            </button> */}
            
            <div className="space-x-3">
              <button
                type="button"
                onClick={() => onNavigate(`/planets/${planetId}`)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Factor</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{factor?.factorName}"? This action cannot be undone.
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
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                disabled={deleting}
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
