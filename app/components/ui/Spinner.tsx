import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'blue' 
}) => {
  // Define sizes in pixels
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  // Define colors
  const colorMap = {
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-300'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeMap[size]} ${colorMap[color]}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}; 