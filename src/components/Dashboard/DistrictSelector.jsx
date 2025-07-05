import React from 'react';

const DistrictSelector = ({
  districts,
  // District comparison props
  selectedDistrict,
  setSelectedDistrict,
  comparisonDistrict,
  setComparisonDistrict,
  // Population group comparison props
  selectedPopulationGroup,
  setSelectedPopulationGroup,
  // View mode props
  viewMode,
  setViewMode // 'district' or 'population' or 'both'
}) => {
  
  const populationGroups = [
    { value: 'overall', label: 'Overall Population', thai: 'ประชากรทั่วไป' },
    { value: 'informal_workers', label: 'Informal Workers', thai: 'แรงงานนอกระบบ' },
    { value: 'elderly', label: 'Elderly', thai: 'ผู้สูงอายุ' },
    { value: 'disabled', label: 'People with Disabilities', thai: 'คนพิการ' },
    { value: 'lgbtq', label: 'LGBTQ+', thai: 'กลุ่มเพศหลากหลาย' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-medium mb-4">Get Started</h2>
      
      {/* District Selection - Always Available */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            3. Select population group:
          </label>
          <select 
            value={selectedPopulationGroup}
            onChange={(e) => setSelectedPopulationGroup(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
          >
            {populationGroups.map(group => (
              <option key={group.value} value={group.value}>
                {group.thai} ({group.label})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1 italic">for population equity analysis</p>
        </div>
      </div>

      {/* View Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select analysis view:
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setViewMode('district')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'district'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            District Comparison
          </button>
          <button
            onClick={() => setViewMode('population')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'population'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Population Equity Analysis
          </button>
          <button
            onClick={() => setViewMode('both')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'both'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            Combined View
          </button>
        </div>
      </div>

      {/* Current Analysis Description */}
      <div className="mb-4 p-4 rounded-lg border">
        {viewMode === 'district' && (
          <div className="bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">District Comparison Mode</h4>
            <p className="text-sm text-blue-700">
              Comparing overall health equity between <strong>{selectedDistrict}</strong> and <strong>{comparisonDistrict}</strong> districts.
            </p>
          </div>
        )}
        
        {viewMode === 'population' && (
          <div className="bg-green-50 border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Population Equity Analysis</h4>
            <p className="text-sm text-green-700">
              Analyzing health equity for <strong>{populationGroups.find(g => g.value === selectedPopulationGroup)?.thai}</strong> compared to overall population in <strong>{selectedDistrict}</strong> district.
            </p>
          </div>
        )}
        
        {viewMode === 'both' && (
          <div className="bg-purple-50 border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">Combined Analysis</h4>
            <p className="text-sm text-purple-700">
              Showing both district comparison (<strong>{selectedDistrict}</strong> vs <strong>{comparisonDistrict}</strong>) and population equity analysis for <strong>{populationGroups.find(g => g.value === selectedPopulationGroup)?.thai}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
          Methodology overview
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
          Data sources
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
          Health equity definitions
        </button>
      </div>

      {/* Additional Resources */}
      <div className="text-sm text-gray-600">
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