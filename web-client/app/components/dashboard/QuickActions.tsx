import React from 'react';
import { User } from '../../types/api';

interface QuickActionsProps {
  user?: User;
  onNavigate: (route: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ user, onNavigate }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('/planets')}
          className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium">View All Planets</span>
        </button>
        <button
          onClick={() => onNavigate('/evaluation')}
          className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium">New Evaluation</span>
        </button>
        <button
          onClick={() => onNavigate('/reports')}
          className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium">View Reports</span>
        </button>
      </div>
    </div>
  );
};