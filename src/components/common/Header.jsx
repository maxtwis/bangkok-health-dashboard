import React from 'react';

const Header = ({ indicatorName = 'Social Determinants of Health Equity' }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Bangkok Health Inequalities Dashboard</h1>
            <p className="text-sm text-gray-600">{indicatorName} Scores</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Community Connector</span>
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">?</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;