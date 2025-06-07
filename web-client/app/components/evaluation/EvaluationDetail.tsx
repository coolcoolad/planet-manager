import React, { useState, useEffect } from 'react';
import { evaluationService } from '../../services';
import { EvaluationStatus, Evaluation } from '../../types/api';

interface EvaluationDetailProps {
  evaluationId: number;
  onBack: () => void;
}

export const EvaluationDetail: React.FC<EvaluationDetailProps> = ({ 
  evaluationId, 
  onBack 
}) => {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluationDetail = async () => {
      try {
        setLoading(true);
        const data = await evaluationService.getEvaluationById(evaluationId);
        setEvaluation(data);
      } catch (err) {
        setError('Failed to load evaluation details');
        console.error('Error fetching evaluation detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationDetail();
  }, [evaluationId]);

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
            <div className="mt-4">
              <button
                onClick={onBack}
                className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Evaluation not found</p>
        <button
          onClick={onBack}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          {/* <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Evaluations
          </button> */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(evaluation.status)}`}>
            {getStatusText(evaluation.status)}
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">Evaluation Results</h1>
        <p className="text-gray-600 mt-2">
          Created on {new Date(evaluation.createdAt).toLocaleDateString()} by {evaluation.createdBy}
        </p>
      </div>

      {/* Evaluation Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Algorithm</label>
            <p className="mt-1 text-sm text-gray-900">
              {evaluation.algorithm === 1 ? 'Simple Weighted' :
               evaluation.algorithm === 2 ? 'Complex Weighted' :
               evaluation.algorithm === 3 ? 'Machine Learning' : 'Unknown'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Planets Evaluated</label>
            <p className="mt-1 text-sm text-gray-900">{evaluation.planetIds?.length || 0} planets</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Evaluation ID</label>
            <p className="mt-1 text-sm text-gray-900">#{evaluation.id}</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {evaluation.status === EvaluationStatus.Completed && evaluation.results && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Planet Rankings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommendation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Strengths
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weaknesses
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evaluation.results.map((result: any) => (
                  <tr key={result.planetId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{result.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Planet {result.planetId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.totalScore.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.recommendation === 'Highly Recommended' ? 'bg-green-100 text-green-800' :
                        result.recommendation === 'Recommended' ? 'bg-blue-100 text-blue-800' :
                        result.recommendation === 'Consider with Caution' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.recommendation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {result.strengths?.slice(0, 2).join(', ') || 'None identified'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {result.weaknesses?.slice(0, 2).join(', ') || 'None identified'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weights Used */}
      {evaluation.weights && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Weights Used</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(evaluation.weights).map(([category, weight]) => (
              <div key={category} className="text-center">
                <div className="text-sm font-medium text-gray-700">{category}</div>
                <div className="text-lg font-bold text-blue-600">{(weight as number * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
