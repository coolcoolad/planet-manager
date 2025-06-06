import React from 'react';
import { Evaluation, EvaluationStatus } from '../../types/api';

interface RecentEvaluationsProps {
  evaluations: Evaluation[];
  onViewAll: () => void;
}

export const RecentEvaluations: React.FC<RecentEvaluationsProps> = ({ evaluations, onViewAll }) => {
  const getStatusColor = (status: EvaluationStatus) => {
    switch (status) {
      case EvaluationStatus.Completed: return 'bg-green-100 text-green-800';
      case EvaluationStatus.Running: return 'bg-blue-100 text-blue-800';
      case EvaluationStatus.Pending: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: EvaluationStatus) => {
    const statusMap = {
      [EvaluationStatus.Pending]: 'Pending',
      [EvaluationStatus.Running]: 'Running',
      [EvaluationStatus.Completed]: 'Completed',
      [EvaluationStatus.Failed]: 'Failed'
    };
    return statusMap[status] || 'Unknown';
  };

  if (evaluations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Evaluations</h3>
        <div className="text-center py-8">
          <span className="text-4xl">⚖️</span>
          <p className="text-gray-500 mt-2">No evaluations yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Recent Evaluations</h3>
        <button
          onClick={onViewAll}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Algorithm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Planets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evaluations.map((evaluation) => (
              <tr key={evaluation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(evaluation.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {evaluation.algorithm === 1 ? 'Simple Weighted' :
                   evaluation.algorithm === 2 ? 'Complex Weighted' :
                   evaluation.algorithm === 3 ? 'Machine Learning' : 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {evaluation.planetIds?.length || 0} planets
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                    {getStatusText(evaluation.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {evaluation.createdBy || 'System'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
