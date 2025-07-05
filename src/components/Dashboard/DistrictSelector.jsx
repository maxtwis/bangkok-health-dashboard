import React from 'react';

const EnhancedDistrictSelector = ({
  districts,
  selectedDistrict,
  setSelectedDistrict,
  comparisonType,
  setComparisonType,
  comparisonDistrict,
  setComparisonDistrict,
  selectedPopulationGroup,
  setSelectedPopulationGroup
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* District Selection */}
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
        
        {/* Comparison Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            2. Select comparison type:
          </label>
          <select 
            value={comparisonType}
            onChange={(e) => setComparisonType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          >
            <option value="district">Compare with another district</option>
            <option value="population">Compare population groups</option>
          </select>
        </div>
        
        {/* Dynamic Third Selection */}
        <div>
          {comparisonType === 'district' ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3. Select comparison district:
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
            </>
          ) : (
            <>
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
              <p className="text-xs text-gray-500 mt-1 italic">vs Overall Population in {selectedDistrict}</p>
            </>
          )}
        </div>
      </div>

      {/* Comparison Mode Indicator */}
      <div className="mb-4 p-3 rounded-lg border">
        {comparisonType === 'district' ? (
          <div className="bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>District Comparison Mode:</strong> Comparing overall health equity between {selectedDistrict} and {comparisonDistrict}
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border-green-200">
            <p className="text-sm text-green-800">
              <strong>Population Equity Mode:</strong> Comparing {populationGroups.find(g => g.value === selectedPopulationGroup)?.thai} vs Overall Population in {selectedDistrict}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
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

export default EnhancedDistrictSelector;