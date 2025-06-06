import React from 'react';
import { User, UserRole } from '../../types/api';

interface NavigationProps {
  user?: User;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ user, activeRoute, onNavigate }) => {
  const canAccess = (requiredRole: UserRole) => {
    return user && user.role >= requiredRole;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', requiredRole: UserRole.Guest },
    { path: '/planets', label: 'Planets', icon: '🪐', requiredRole: UserRole.Guest },
    { path: '/data-input', label: 'Data Input', icon: '📝', requiredRole: UserRole.User },
    { path: '/evaluation', label: 'Evaluation', icon: '⚖️', requiredRole: UserRole.User },
    { path: '/settings', label: 'Settings', icon: '⚙️', requiredRole: UserRole.Admin },
  ];

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-1">
          {navItems
            .filter(item => canAccess(item.requiredRole))
            .map(item => (
              <li key={item.path}>
                <button
                  onClick={() => onNavigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-700 transition-colors ${
                    activeRoute === item.path ? 'bg-gray-700 border-b-2 border-blue-400' : ''
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
};
