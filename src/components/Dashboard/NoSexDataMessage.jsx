
import React from 'react';

const NoSexDataMessage = ({ indicatorName }) => {
  return (
    <div className="h-64 md:h-80 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-center p-6">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No Sex-Specific Data Available</h3>
        <p className="mt-1 text-sm text-gray-500">
          {indicatorName} data is not available broken down by sex.
        </p>
      </div>
    </div>
  );
};

export default NoSexDataMessage;