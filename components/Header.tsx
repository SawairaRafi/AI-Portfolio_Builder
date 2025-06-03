
import React from 'react';
import { GitHubUser } from '../types';
import ThemeToggle from './ThemeToggle';
import AuthButton from './AuthButton';

interface HeaderProps {
  githubUser: GitHubUser | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ githubUser, onLogin, onLogout }) => {
  return (
    <header className="bg-slate-100 dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          AI Portfolio Builder
        </h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <AuthButton user={githubUser} onLogin={onLogin} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
};

export default Header;
