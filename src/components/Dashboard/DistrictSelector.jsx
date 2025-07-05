import React from 'react';

const DistrictSelector = ({
  districts,
  selectedDistrict,
  setSelectedDistrict,
  comparisonDistrict,
  setComparisonDistrict,
  selectedPopulationGroup,
  setSelectedPopulationGroup,
  viewMode,
  setViewMode
}) => {
  
  const populationGroups = [
    { value: 'informal_workers', label: 'แรงงานนอกระบบ (Informal Workers)' },
    { value: 'elderly', label: 'ผู้สูงอายุ (Elderly)' },
    { value: 'disabled', label: 'คนพิการ (People with Disabilities)' },
    { value: 'lgbtq', label: 'กลุ่มเพศหลากหลาย (LGBTQ+)' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-medium mb-6">Get Started</h2>
      
      {/* Basic Selection - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            1. Select my district:
          </label>
          <select 
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {districts.filter(d => d !== selectedDistrict).map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">*sorted by similarity to my district</p>
        </div>
      </div>

      {/* Simple Toggle for Analysis Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          3. What would you like to analyze?
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode('district')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              viewMode === 'district'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="font-medium">Compare Districts</div>
              <div className="text-sm mt-1">Overall health comparison between districts</div>
            </div>
          </button>
          
          <button
            onClick={() => setViewMode('population')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              viewMode === 'population'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="font-medium">Analyze Health Equity</div>
              <div className="text-sm mt-1">Compare population groups within a district</div>
            </div>
          </button>
        </div>
      </div>

      {/* Population Group Selection - Only show when needed */}
      {viewMode === 'population' && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <label className="block text-sm font-medium text-green-800 mb-2">
            Select population group to analyze:
          </label>
          <select 
            value={selectedPopulationGroup}
            onChange={(e) => setSelectedPopulationGroup(e.target.value)}
            className="w-full p-3 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
          >
            {populationGroups.map(group => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-green-600 mt-2">
            Will compare this group against the overall population in {selectedDistrict}
          </p>
        </div>
      )}

      {/* Current Analysis Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-2">Current Analysis:</h4>
        {viewMode === 'district' ? (
          <p className="text-sm text-gray-600">
            Comparing overall health equity between <strong>{selectedDistrict}</strong> and <strong>{comparisonDistrict}</strong>
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Analyzing health equity for <strong>{populationGroups.find(g => g.value === selectedPopulationGroup)?.label}</strong> compared to overall population in <strong>{selectedDistrict}</strong>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
          Methodology overview
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
          Data sources
        </button>
      </div>
    </div>
  );
};

export default DistrictSelector;