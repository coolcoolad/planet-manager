import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { PlanetsOverview, PlanetDetail, PlanetEditForm, PlanetNewForm } from './components/planets';
import { EvaluationForm } from './components/evaluation/EvaluationForm';
import { EvaluationDetail } from './components/evaluation/EvaluationDetail';
import { EvaluationsOverview } from './components/evaluation/EvaluationsOverview';
import { FactorForm } from './components/factors/FactorForm';
import { LoginForm } from './components/auth/LoginForm';
import { User } from './types/api';
import { apiClient, authService } from './services';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | undefined>();
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        apiClient.setAccessToken(token);
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to restore authentication:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (authUser: User, token: string) => {
    setUser(authUser);
    setIsAuthenticated(true);
    setError(null);
    apiClient.setAccessToken(token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userData', JSON.stringify(authUser));
    setCurrentRoute('/dashboard');
  };

  const handleLoginError = (message: string) => {
    setError(message);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(undefined);
      setIsAuthenticated(false);
      setError(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      setCurrentRoute('/login');
    }
  };

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
  };

  const renderContent = () => {
    console.log('Rendering content for route:', currentRoute);
    
    // Route pattern matching
    const matchRoute = (pattern: string, route: string) => {
      const regexPattern = pattern.replace(/:\w+/g, '([^/]+)');
      const regex = new RegExp(`^${regexPattern}$`);
      const match = route.match(regex);
      return match ? match.slice(1) : null;
    };

    // Dashboard
    if (currentRoute === '/dashboard') {
      return <Dashboard user={user} onNavigate={handleNavigate} />;
    }

    // Planets routes
    if (currentRoute === '/planets') {
      return <PlanetsOverview user={user} onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/planets/new') {
      return <PlanetNewForm user={user} onNavigate={handleNavigate} />;
    }

    const planetEditMatch = matchRoute('/planets/:id/edit', currentRoute);
    if (planetEditMatch) {
      const [planetId] = planetEditMatch;
      return <PlanetEditForm user={user} planetId={planetId} onNavigate={handleNavigate} />;
    }

    const planetDetailMatch = matchRoute('/planets/:id', currentRoute);
    if (planetDetailMatch) {
      const [planetId] = planetDetailMatch;
      return <PlanetDetail user={user} planetId={planetId} onNavigate={handleNavigate} />;
    }

    // Factors route
    if (currentRoute === '/factors') {
      return (
        <FactorForm
          user={user}
          onSuccess={() => {
            alert('Factor added successfully!');
            handleNavigate('/planets');
          }}
          onCancel={() => handleNavigate('/planets')}
        />
      );
    }

    // Evaluation routes
    if (currentRoute === '/evaluations') {
      return (
        <EvaluationsOverview
          user={user}
          onNavigate={handleNavigate}
        />
      )
    }

    if (currentRoute === '/evaluation/new') {
      return (
        <EvaluationForm
          onSuccess={(evaluationId) => {
            alert(`Evaluation created successfully! ID: ${evaluationId}`);
            handleNavigate('/dashboard');
          }}
          onCancel={() => handleNavigate('/dashboard')}
        />
      );
    }

    const evaluationDetailMatch = matchRoute('/evaluation/:id', currentRoute);
    if (evaluationDetailMatch) {
      const [evaluationId] = evaluationDetailMatch;
      return (
        <EvaluationDetail
          evaluationId={parseInt(evaluationId)}
          onBack={() => setCurrentRoute('/evaluation')}
        />
      );
    }

    // Default fallback
    return <Dashboard user={user} onNavigate={handleNavigate} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm onLogin={handleLogin} onError={handleLoginError} />
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </>
    );
  }

  return (
    <Layout
      user={user}
      activeRoute={currentRoute}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
