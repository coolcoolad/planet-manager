import React, { useState } from 'react';
import { User } from '../../types/api';
import { authService } from '../../services';

interface HeaderProps {
  user?: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const getRoleDisplay = (role: number) => {
    switch (role) {
      case 3: return { text: 'Super Admin', class: 'bg-purple-600' };
      case 2: return { text: 'Admin', class: 'bg-green-600' };
      case 1: return { text: 'User', class: 'bg-blue-600' };
      default: return { text: 'Guest', class: 'bg-gray-600' };
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🪐</span>
          <h1 className="text-xl font-bold">Planet Migration System</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">{user.username}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 px-3 py-1 rounded text-sm transition-colors"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
};
