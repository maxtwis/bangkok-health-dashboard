import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  showMessage = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        animate-spin rounded-full border-2 border-gray-200 border-t-blue-600
      `} />
      
      {showMessage && (
        <p className={`
          mt-3 text-gray-600 font-medium
          ${textSizeClasses[size]}
        `}>
          {message}
        </p>
      )}
    </div>
  );
};

const LoadingSkeleton = ({ className = '', rows = 3 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="mb-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

const LoadingCard = ({ title, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="animate-pulse">
        {title && (
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        )}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="mt-6 flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = ({ message = 'Loading health data...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" message={message} />
        <div className="mt-8 max-w-md">
          <p className="text-sm text-gray-500">
            This may take a few moments while we process the health equity data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
export { LoadingSkeleton, LoadingCard, LoadingScreen };