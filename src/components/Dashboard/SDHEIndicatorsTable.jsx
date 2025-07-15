import React, { useState } from 'react';

const SDHEIndicatorsTable = ({ 
  selectedPopulationGroup,
  selectedDistrict,
  analysisLevel,
  getIndicatorTableData,
  getAvailableDomains,
  sdheData
}) => {
  const [selectedDomain, setSelectedDomain] = useState('economic_security');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const domains = getAvailableDomains ? getAvailableDomains() : [];
  
  const domainLabels = {
    'economic_security': {
      label: 'Economic Security',
      icon: '🏢',
      description: 'Employment, income stability, and economic resilience'
    },
    'education': {
      label: 'Education',
      icon: '🎓',
      description: 'Educational attainment and literacy'
    },
    'healthcare_access': {
      label: 'Healthcare Access',
      icon: '🏥',
      description: 'Access to and affordability of healthcare services'
    },
    'physical_environment': {
      label: 'Physical Environment',
      icon: '🏘️',
      description: 'Housing, infrastructure, and environmental conditions'
    },
    'social_context': {
      label: 'Social Context',
      icon: '🤝',
      description: 'Community safety, social support, and discrimination'
    },
    'health_behaviors': {
      label: 'Health Behaviors',
      icon: '💪',
      description: 'Individual health-related behaviors and lifestyle'
    }
  };

  const getPopulationGroupLabel = (populationGroup) => {
    const labels = {
      'informal_workers': 'แรงงานนอกระบบ (Informal Workers)',
      'elderly': 'ผู้สูงอายุ (Elderly)',
      'disabled': 'คนพิการ (People with Disabilities)', 
      'lgbtq': 'กลุ่มเพศหลากหลาย (LGBTQ+)'
    };
    return labels[populationGroup] || populationGroup;
  };

  const getTableData = () => {
    if (!getIndicatorTableData) return [];
    
    if (analysisLevel === 'bangkok') {
      return getIndicatorTableData(selectedDomain, selectedPopulationGroup);
    } else {
      return getIndicatorTableData(selectedDomain, selectedPopulationGroup, selectedDistrict);
    }
  };

  const tableData = getTableData();

  const toggleRowExpansion = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const getScoreColor = (value, unit) => {
    if (unit === '%') {
      const numValue = parseFloat(value);
      if (numValue >= 80) return 'text-green-600 bg-green-50';
      if (numValue >= 60) return 'text-yellow-600 bg-yellow-50';
      if (numValue >= 40) return 'text-orange-600 bg-orange-50';
      return 'text-red-600 bg-red-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const renderDomainSelector = () => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Select SDHE Domain:</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {domains.map(domain => {
          const domainInfo = domainLabels[domain] || { label: domain, icon: '📊', description: '' };
          return (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedDomain === domain
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-2">
                <span className="text-lg">{domainInfo.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    selectedDomain === domain ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {domainInfo.label}
                  </div>
                  <div className={`text-xs mt-1 ${
                    selectedDomain === domain ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {domainInfo.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderTableHeader = () => {
    const domainInfo = domainLabels[selectedDomain] || { label: selectedDomain, icon: '📊' };
    
    return (
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xl">{domainInfo.icon}</span>
          <h3 className="text-lg font-medium text-blue-800">
            {domainInfo.label} Indicators
          </h3>
        </div>
        <p className="text-sm text-blue-700 mb-2">
          {analysisLevel === 'bangkok' 
            ? `Bangkok-wide analysis for ${getPopulationGroupLabel(selectedPopulationGroup)}`
            : `${selectedDistrict} district analysis for ${getPopulationGroupLabel(selectedPopulationGroup)}`
          }
        </p>
        <p className="text-xs text-blue-600">
          {domainInfo.description}
        </p>
      </div>
    );
  };

  const renderTable = () => {
    if (tableData.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg border">
          <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">No indicators available for this domain</p>
          <p className="text-sm text-gray-500">
            Data may still be processing or unavailable for the selected population group and area.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Indicator</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Value</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Score</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Sample</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Info</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <React.Fragment key={index}>
                <tr className={`border-b border-gray-100 hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                }`}>
                  <td className="py-3 px-4 text-gray-800">
                    <div className="font-medium">{item.indicator}</div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      getScoreColor(item.value, item.unit)
                    }`}>
                      {item.value}{item.unit}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          parseFloat(item.value) >= 80 ? 'bg-green-500' :
                          parseFloat(item.value) >= 60 ? 'bg-yellow-500' :
                          parseFloat(item.value) >= 40 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, parseFloat(item.value)))}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2 text-gray-600">
                    {typeof item.sample_size === 'number' ? item.sample_size.toLocaleString() : item.sample_size}
                  </td>
                  <td className="text-center py-3 px-2">
                    <button
                      onClick={() => toggleRowExpansion(index)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${
                          expandedRows.has(index) ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </td>
                </tr>
                {expandedRows.has(index) && (
                  <tr className="border-b border-gray-100 bg-blue-25">
                    <td colSpan="5" className="py-3 px-4">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <h5 className="font-medium text-blue-800 mb-2">Indicator Details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-700">Measurement:</span>
                            <p className="text-blue-600 mt-1">
                              Percentage of {selectedPopulationGroup.replace('_', ' ')} population meeting positive health outcome criteria for this indicator.
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-blue-700">Interpretation:</span>
                            <p className="text-blue-600 mt-1">
                              {parseFloat(item.value) >= 80 && 'Excellent performance - maintain current approaches'}
                              {parseFloat(item.value) >= 60 && parseFloat(item.value) < 80 && 'Good performance with room for improvement'}
                              {parseFloat(item.value) >= 40 && parseFloat(item.value) < 60 && 'Moderate performance - targeted interventions needed'}
                              {parseFloat(item.value) < 40 && 'Low performance - priority for intervention'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummaryStats = () => {
    if (tableData.length === 0) return null;

    const values = tableData.map(item => parseFloat(item.value)).filter(v => !isNaN(v));
    const average = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
    const highest = values.length > 0 ? Math.max(...values) : 0;
    const lowest = values.length > 0 ? Math.min(...values) : 0;

    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-3">Domain Summary Statistics</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{average.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{highest.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Highest Indicator</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{lowest.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Lowest Indicator</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500 text-center">
          Domain score represents health equity performance across {tableData.length} indicators
        </div>
      </div>
    );
  };

  if (domains.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">SDHE Data Processing</p>
          <p className="text-sm text-gray-500">
            Social Determinants of Health Equity indicators are being calculated from survey data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        SDHE Indicators Detail
      </h2>
      
      {renderDomainSelector()}
      {renderTableHeader()}
      {renderTable()}
      {renderSummaryStats()}

      {/* Methodology Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-800 mb-2">About SDHE Indicators</h4>
        <p className="text-sm text-blue-700 mb-2">
          Social Determinants of Health Equity (SDHE) indicators measure the conditions that influence health outcomes 
          and health disparities across different population groups. Each indicator represents the percentage of the 
          population achieving positive health-related outcomes.
        </p>
        <div className="text-xs text-blue-600 space-y-1">
          <p>• <strong>Score Range:</strong> 0-100% where higher scores indicate better health equity</p>
          <p>• <strong>Sample Size:</strong> Number of survey responses used to calculate each indicator</p>
          <p>• <strong>Data Source:</strong> Bangkok health survey responses processed through standardized SDHE calculations</p>
        </div>
      </div>
    </div>
  );
};

export default SDHEIndicatorsTable;