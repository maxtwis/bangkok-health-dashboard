import React from 'react';

const DistrictSelector = ({
  districts,
  selectedDistrict,
  setSelectedDistrict,
  comparisonDistrict,
  setComparisonDistrict
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-medium mb-4">Get Started</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            1. Select my district:
          </label>
          <select 
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          >
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            2. Select comparison district:
          </label>
          <select 
            value={comparisonDistrict}
            onChange={(e) => setComparisonDistrict(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          >
            {districts.filter(d => d !== selectedDistrict).map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1 italic">*sorted by similarity to my district</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
          Methodology overview
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
          Data sources
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Additional Resources:</strong></p>
        <div className="flex flex-wrap gap-4 mt-2">
          <a href="#" className="text-blue-600 hover:text-blue-800 underline">
            Explore public health plans
          </a>
          <a href="#" className="text-blue-600 hover:text-blue-800 underline">
            Explore health behavior programs
          </a>
          <a href="#" className="text-blue-600 hover:text-blue-800 underline">
            Visit the Community Connector GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default DistrictSelector;