import React, { useState, useEffect } from 'react';
import { User } from '../../types/api';
import { planetService, evaluationService } from '../../services';
import { PlanetStatusCard } from './PlanetStatusCard';
import { RecentEvaluations } from './RecentEvaluations';
import { QuickActions } from './QuickActions';

interface DashboardProps {
  user?: User;
  onNavigate: (route: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [planets, setPlanets] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planetsData, evaluationsData] = await Promise.all([
          planetService.getAllPlanets(),
          evaluationService.getAllEvaluations()
        ]);
        
        setPlanets(planetsData);
        setEvaluations(evaluationsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewEvaluationDetail = (evaluationId: number) => {
    onNavigate(`/evaluation/${evaluationId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}!
        </h2>
        <p className="text-gray-600">
          Monitor planetary data and evaluate migration opportunities for the Earth Federation.
        </p>
      </div>

      {/* Recent Planets Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Planets</h3>
          <button
            onClick={() => onNavigate('/planets')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planets.slice(0, 3).map((planet) => (
            <PlanetStatusCard
              key={planet.id}
              planet={planet}
              onViewDetails={() => onNavigate(`/planets/${planet.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Recent Evaluations Section */}
      <RecentEvaluations
        evaluations={evaluations.slice(0, 5)}
        onViewAll={() => onNavigate('/evaluation')}
        onViewDetail={handleViewEvaluationDetail}
      />

      {/* Quick Actions Section */}
      <QuickActions user={user} onNavigate={onNavigate} />
    </div>
  );
};
