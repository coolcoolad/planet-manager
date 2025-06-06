import React, { useState } from 'react';
import { authService } from '../../services/auth.service';
import { User } from '../../types/api';

interface LoginFormProps {
  onLogin: (user: User, token: string) => void;
  onError: (message: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      onError('Please enter both username and password');
      return;
    }

    setLoading(true);
    
    try {
      const result = await authService.login({ username, password });
      
      if (result.success && result.user && result.accessToken) {
        onLogin(result.user, result.accessToken);
      } else {
        onError(result.errorMessage || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      onError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (username: string, password: string) => {
    setLoading(true);
    
    try {
      const result = await authService.login({ username, password });
      
      if (result.success && result.user && result.accessToken) {
        onLogin(result.user, result.accessToken);
      } else {
        onError(result.errorMessage || 'Demo login failed');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      onError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-6xl">🪐</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Planet Migration System
          </h1>
          <p className="text-gray-600 mt-2">Please login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 text-center">Demo Accounts:</p>
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('admin', 'password123')}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-1 px-3 rounded-md text-sm transition-colors"
            >
              Demo: admin
            </button>
            
            <button
              onClick={() => handleDemoLogin('viewer_type1', 'password123')}
              disabled={loading}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-1 px-3 rounded-md text-sm transition-colors"
            >
              Demo: viewer_type1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
