import React from 'react';

const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3 text-gray-500">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-sm font-medium tracking-wide animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
