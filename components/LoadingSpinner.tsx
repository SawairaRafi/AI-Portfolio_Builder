
import React from 'react';

interface LoadingSpinnerProps {
  size?: number; // Tailwind size unit, e.g. 8 for h-8 w-8
  color?: string; // Tailwind color class, e.g. text-primary-500
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 8, color = 'text-primary-500 dark:text-primary-400' }) => {
  return (
    <div className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-r-2 border-transparent ${color}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
