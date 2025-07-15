// Basic SDHE Dashboard - src/components/Dashboard/index.jsx
import React, { useState } from 'react';
import useBasicSDHEData from '../../hooks/useBasicSDHEData';

const BasicSDHEDashboard = () => {
  const { isLoading, error, data, getAvailableDistricts, getAvailableDomains, getIndicatorData } = useBasicSDHEData();
  
  const [selectedPopulationGroup, setSelectedPopulationGroup] = useState('informal_workers');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('economic_security');

  const populationGroups = [
    { value: 'informal_workers', label: 'แรงงานนอกระบบ (Informal Workers)' },
    { value: 'elderly', label: 'ผู้สูงอายุ (Elderly)' },
    { value: 'disabled', label: 'คนพิการ (People with Disabilities)' },
    { value: 'lgbtq', label: 'กลุ่มเพศหลากหลาย (LGBTQ+)' }
  ];

  const domainLabels = {
    'economic_security': 'Economic Security',
    'education': 'Education', 
    'healthcare_access': 'Healthcare Access',
    'physical_environment': 'Physical Environment',
    'social_context': 'Social Context',
    'health_behaviors': 'Health Behaviors'
  };

  // Set default district when data loads
  React.useEffect(() => {
    if (!selectedDistrict && data) {
      const districts = getAvailableDistricts();
      if (districts.length > 0) {
        setSelectedDistrict(districts[0]);
      }
    }
  }, [data, selectedDistrict, getAvailableDistricts]);

  // Set default domain when data loads
  React.useEffect(() => {
    if (data) {
      const domains = getAvailableDomains();
      if (domains.length > 0 && !domains.includes(selectedDomain)) {
        setSelectedDomain(domains[0]);
      }
    }
  }, [data, selectedDomain, getAvailableDomains]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-lg font-medium">Loading SDHE Data</div>
          </div>
          <p className="text-gray-600">Processing survey data and calculating health equity indicators...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Data Loading Error</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const districts = getAvailableDistricts();
  const domains = getAvailableDomains();
  const indicatorData = getIndicatorData(selectedDomain, selectedDistrict, selectedPopulationGroup);

  const getScoreColor = (value) => {
    if (value >= 80) return 'bg-green-100 text-green-800';
    if (value >= 60) return 'bg-yellow-100 text-yellow-800';
    if (value >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Bangkok SDHE Dashboard</h1>
          <p className="text-gray-600 mt-1">Social Determinants of Health Equity Analysis</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Population Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Population Group
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

            {/* District Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {districts.map(district => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Domain Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {domains.map(domain => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedDomain === domain
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {domainLabels[domain] || domain}
                </button>
              ))}
            </nav>
          </div>

          {/* Indicators Table */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {domainLabels[selectedDomain]} Indicators
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedPopulationGroup.replace('_', ' ')} in {selectedDistrict}
              </p>
            </div>

            {indicatorData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Indicator</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Score</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Sample Size</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicatorData.map((item, index) => (
                      <tr 
                        key={item.indicator} 
                        className={`border-b border-gray-100 ${
                          item.isDomainScore ? 'bg-blue-50 font-medium' : 
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {item.isDomainScore && (
                              <span className="text-blue-600 font-bold">📊</span>
                            )}
                            <span className={item.isDomainScore ? 'font-bold text-blue-800' : ''}>
                              {item.label}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            getScoreColor(item.value)
                          }`}>
                            {item.value}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-gray-600">
                          {item.sample_size.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                item.value >= 80 ? 'bg-green-500' :
                                item.value >= 60 ? 'bg-yellow-500' :
                                item.value >= 40 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No data available for this combination</p>
                <p className="text-sm mt-1">Try selecting a different district or population group</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="font-medium text-gray-800 mb-2">About SDHE Indicators</h4>
          <p className="text-sm text-gray-600 mb-2">
            Social Determinants of Health Equity (SDHE) indicators measure conditions that influence health outcomes 
            across different population groups. Scores represent the percentage achieving positive health outcomes.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 mt-4">
            <div>🟢 <strong>80-100%:</strong> Excellent</div>
            <div>🟡 <strong>60-79%:</strong> Good</div>
            <div>🟠 <strong>40-59%:</strong> Fair</div>
            <div>🔴 <strong>0-39%:</strong> Poor</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicSDHEDashboard;