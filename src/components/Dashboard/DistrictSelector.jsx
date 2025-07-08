import React from 'react';

const DistrictSelector = ({
  districts,
  selectedDistrict,
  setSelectedDistrict,
  selectedPopulationGroup,
  setSelectedPopulationGroup,
  analysisLevel,
  setAnalysisLevel // 'bangkok' or 'district'
}) => {
  
  const populationGroups = [
    { value: 'informal_workers', label: 'แรงงานนอกระบบ (Informal Workers)' },
    { value: 'elderly', label: 'ผู้สูงอายุ (Elderly)' },
    { value: 'disabled', label: 'คนพิการ (People with Disabilities)' },
    { value: 'lgbtq', label: 'กลุ่มเพศหลากหลาย (LGBTQ+)' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-medium mb-6">Bangkok Health Inequalities Dashboard</h2>
      
      {/* Analysis Level Selection - Primary Choice */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          1. Select analysis level:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setAnalysisLevel('bangkok')}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              analysisLevel === 'bangkok'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                analysisLevel === 'bangkok' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {analysisLevel === 'bangkok' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div>
                <div className={`font-medium ${analysisLevel === 'bangkok' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Bangkok Overview
                </div>
                <div className={`text-sm mt-1 ${analysisLevel === 'bangkok' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Compare population groups across all 50 districts (4,000 surveys)
                </div>
                <div className={`text-xs mt-2 ${analysisLevel === 'bangkok' ? 'text-blue-500' : 'text-gray-400'}`}>
                  🎯 Main Focus: Health equity analysis
                </div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setAnalysisLevel('district')}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              analysisLevel === 'district'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                analysisLevel === 'district' ? 'border-green-500 bg-green-500' : 'border-gray-300'
              }`}>
                {analysisLevel === 'district' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div>
                <div className={`font-medium ${analysisLevel === 'district' ? 'text-green-700' : 'text-gray-700'}`}>
                  District Deep Dive
                </div>
                <div className={`text-sm mt-1 ${analysisLevel === 'district' ? 'text-green-600' : 'text-gray-500'}`}>
                  Detailed analysis of specific districts (80 surveys per district)
                </div>
                <div className={`text-xs mt-2 ${analysisLevel === 'district' ? 'text-green-500' : 'text-gray-400'}`}>
                  📍 Secondary Focus: Local detailed insights
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Population Group Selection - Always Visible */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          2. Select population group to focus on:
        </label>
        <select 
          value={selectedPopulationGroup}
          onChange={(e) => setSelectedPopulationGroup(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {populationGroups.map(group => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
      </div>

      {/* District Selection - Only for District Level */}
      {analysisLevel === 'district' && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <label className="block text-sm font-medium text-green-800 mb-2">
            3. Select district for detailed analysis:
          </label>
          <select 
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-3 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
          >
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <p className="text-xs text-green-600 mt-2">
            Deep dive into {selectedDistrict} with surveys, health outcomes, accessibility indicators
          </p>
        </div>
      )}

      {/* Current Analysis Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-2">Current Analysis:</h4>
        {analysisLevel === 'bangkok' ? (
          <div>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Bangkok-wide Health Equity Analysis</strong>
            </p>
            <p className="text-sm text-gray-600">
              Analyzing <strong>{populationGroups.find(g => g.value === selectedPopulationGroup)?.label}</strong> across all 50 districts compared to overall Bangkok population
            </p>
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
              📊 Data: 4,000 surveys (80 per district) | 🎯 Focus: Population group equity
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-1">
              <strong>District-Level Detailed Analysis</strong>
            </p>
            <p className="text-sm text-gray-600">
              Deep dive into <strong>{selectedDistrict}</strong> district focusing on <strong>{populationGroups.find(g => g.value === selectedPopulationGroup)?.label}</strong>
            </p>
            <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
              📍 Data: District surveys + Health outcomes + Accessibility + Demographics + Map
            </div>
          </div>
        )}
      </div>

      {/* Info about methodology */}
      <div className="text-sm text-gray-600">
        <p className="mb-2"><strong>How it works:</strong></p>
        <ul className="text-xs space-y-1 text-gray-500 list-disc list-inside">
          <li><strong>Bangkok Level:</strong> See the big picture of health inequalities across population groups</li>
          <li><strong>District Level:</strong> Drill down into specific areas with comprehensive local data</li>
          <li><strong>Population Groups:</strong> แรงงานนอกระบบ, ผู้สูงอายุ, คนพิการ, กลุ่มเพศหลากหลาย</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
          Survey methodology
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
          Data sources
        </button>
      </div>
    </div>
  );
};

export default DistrictSelector;