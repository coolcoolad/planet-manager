import React from 'react';
import { User } from '../../types/api';

interface NavigationProps {
  user?: User;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ user, activeRoute, onNavigate }) => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/planets', label: 'Planets', icon: '🪐' },
    { path: '/data-input', label: 'Data Input', icon: '📝' },
    { path: '/evaluation', label: 'Evaluation', icon: '⚖️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-1">
          {navItems.map(item => (
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
