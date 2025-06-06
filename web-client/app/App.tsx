import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { PlanetOverview } from './components/planets/PlanetOverview';
import { EvaluationForm } from './components/evaluation/EvaluationForm';
import { FactorForm } from './components/data-input/FactorForm';
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
    switch (currentRoute) {
      case '/dashboard':
        return <Dashboard user={user} onNavigate={handleNavigate} />;
      
      case '/planets':
        return <PlanetOverview user={user} onNavigate={handleNavigate} />;
      
      case '/data-input':
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
      
      case '/evaluation':
        return (
          <EvaluationForm
            onSuccess={(evaluationId) => {
              alert(`Evaluation created successfully! ID: ${evaluationId}`);
              handleNavigate('/dashboard');
            }}
            onCancel={() => handleNavigate('/dashboard')}
          />
        );
      
      default:
        return <Dashboard user={user} onNavigate={handleNavigate} />;
    }
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
