import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { User } from '../../types/api';

interface LayoutProps {
  user?: User;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  activeRoute, 
  onNavigate, 
  onLogout, 
  children 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <Navigation user={user} activeRoute={activeRoute} onNavigate={onNavigate} />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};
