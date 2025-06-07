import React, { useState, useEffect } from 'react';
import { evaluationService } from '../../services';
import { EvaluationStatus, User, Evaluation } from '../../types/api';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface EvaluationsOverviewProps {
  user?: User;
  onNavigate: (route: string) => void;
}

export const EvaluationsOverview: React.FC<EvaluationsOverviewProps> = ({ 
  user, 
  onNavigate 
}) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EvaluationStatus | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    evaluationId: number | null;
    evaluationName: string;
  }>({
    isOpen: false,
    evaluationId: null,
    evaluationName: ''
  });

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const data = await evaluationService.getAllEvaluations();
        setEvaluations(data);
      } catch (err) {
        setError('Failed to load evaluations');
        console.error('Error fetching evaluations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  const getStatusColor = (status: EvaluationStatus) => {
    switch (status) {
      case EvaluationStatus.Completed:
        return 'bg-green-100 text-green-800';
      case EvaluationStatus.Running:
        return 'bg-blue-100 text-blue-800';
      case EvaluationStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: EvaluationStatus) => {
    const statusMap = {
      [EvaluationStatus.Pending]: 'Pending',
      [EvaluationStatus.Running]: 'Running',
      [EvaluationStatus.Completed]: 'Completed',
      [EvaluationStatus.Failed]: 'Failed',
    };
    return statusMap[status] || 'Unknown';
  };

  const getAlgorithmName = (algorithm: number) => {
    const algorithmMap = {
      1: 'Simple Weighted',
      2: 'Complex Weighted',
      3: 'Machine Learning'
    };
    return algorithmMap[algorithm as keyof typeof algorithmMap] || 'Unknown';
  };

  const filteredEvaluations = evaluations
    .filter(evaluation => 
      statusFilter === 'all' || evaluation.status === statusFilter
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDeleteEvaluation = async (evaluationId: number) => {
    try {
      await evaluationService.deleteEvaluation(evaluationId);
      setEvaluations(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
      setDeleteConfirm({ isOpen: false, evaluationId: null, evaluationName: '' });
    } catch (err) {
      console.error('Error deleting evaluation:', err);
      setError('Failed to delete evaluation');
    }
  };

  const openDeleteConfirm = (evaluation: Evaluation) => {
    setDeleteConfirm({
      isOpen: true,
      evaluationId: evaluation.id,
      evaluationName: `Evaluation #${evaluation.id}`
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, evaluationId: null, evaluationName: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Evaluations</h1>
        <button
          onClick={() => onNavigate('/evaluation/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          New Evaluation
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EvaluationStatus | 'all')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value={EvaluationStatus.Pending}>Pending</option>
            <option value={EvaluationStatus.Running}>Running</option>
            <option value={EvaluationStatus.Completed}>Completed</option>
            <option value={EvaluationStatus.Failed}>Failed</option>
          </select>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredEvaluations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No evaluations found</p>
            <p className="text-gray-400 text-sm mt-2">
              {statusFilter !== 'all' 
                ? `No evaluations with status "${getStatusText(statusFilter as EvaluationStatus)}"` 
                : 'Create your first evaluation to get started'
              }
            </p>
            <button
              onClick={() => onNavigate('/evaluation/new')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Create Evaluation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Algorithm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{evaluation.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                        {getStatusText(evaluation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getAlgorithmName(evaluation.algorithm)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {evaluation.planetIds?.length || 0} planets
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {evaluation.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => onNavigate(`/evaluation/${evaluation.id}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(evaluation)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Evaluations</div>
          <div className="text-2xl font-bold text-gray-900">{evaluations.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {evaluations.filter(e => e.status === EvaluationStatus.Completed).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Running</div>
          <div className="text-2xl font-bold text-blue-600">
            {evaluations.filter(e => e.status === EvaluationStatus.Running).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Failed</div>
          <div className="text-2xl font-bold text-red-600">
            {evaluations.filter(e => e.status === EvaluationStatus.Failed).length}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Evaluation"
        message={`Are you sure you want to delete ${deleteConfirm.evaluationName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteConfirm.evaluationId && handleDeleteEvaluation(deleteConfirm.evaluationId)}
        onCancel={closeDeleteConfirm}
        type="danger"
      />
    </div>
  );
};
