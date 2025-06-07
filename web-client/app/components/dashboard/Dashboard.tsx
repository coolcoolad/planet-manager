import React, { useState, useEffect } from 'react';
import { Planet, Evaluation, User } from '../../types/api';
import { planetService, evaluationService } from '../../services';
import { PlanetStatusCard } from './PlanetStatusCard';
import { RecentEvaluations } from './RecentEvaluations';
import { QuickActions } from './QuickActions';

interface DashboardProps {
  user?: User;
  onNavigate: (route: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planetsData, evaluationsData] = await Promise.all([
          planetService.getAllPlanets(),
          evaluationService.getAllEvaluations()
        ]);
        
        // Sort by time descending (most recent first)
        const sortedPlanets = planetsData.sort((a, b) => 
          new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        );
        const sortedEvaluations = evaluationsData.sort((a, b) => 
          new Date(b.createdAt || b.createdAt).getTime() - new Date(a.createdAt || a.createdAt).getTime()
        );
        
        setPlanets(sortedPlanets);
        setEvaluations(sortedEvaluations);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}!
        </h2>
        <p className="text-gray-600">
          Monitor planetary data and evaluate migration opportunities for the Earth Federation.
        </p>
      </div>

      {/* Recent Planets */}
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
          {planets.slice(0, 3).map(planet => (
            <PlanetStatusCard
              key={planet.id}
              planet={planet}
              onViewDetails={() => onNavigate(`/planets/${planet.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Recent Evaluations */}
      <RecentEvaluations
        evaluations={evaluations.slice(0, 5)}
        onViewAll={() => onNavigate('/evaluation')}
      />

      {/* Quick Actions */}
      <QuickActions user={user} onNavigate={onNavigate} />
    </div>
  );
};
