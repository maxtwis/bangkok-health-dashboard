import React from 'react';
import { getEquityInsights, calculateVulnerabilityIndex, getPopulationGroupLabel } from '../DataUtils';

const PopulationGroupsTab = ({ 
  selectedDistrict, 
  populationGroupData = [], 
  overallPopulationData = [],
  selectedPopulationGroup = 'informal_workers'
}) => {
  
  const populationGroups = [
    { value: 'informal_workers', label: 'แรงงานนอกระบบ', english: 'Informal Workers', color: 'bg-orange-100 text-orange-800' },
    { value: 'elderly', label: 'ผู้สูงอายุ', english: 'Elderly', color: 'bg-purple-100 text-purple-800' },
    { value: 'disabled', label: 'คนพิการ', english: 'People with Disabilities', color: 'bg-blue-100 text-blue-800' },
    { value: 'lgbtq', label: 'กลุ่มเพศหลากหลาย', english: 'LGBTQ+', color: 'bg-pink-100 text-pink-800' }
  ];

  // Get equity insights for selected population group
  const equityInsights = getEquityInsights(
    populationGroupData,
    overallPopulationData,
    selectedDistrict,
    selectedPopulationGroup
  );

  // Calculate vulnerability for all groups (for overview)
  const groupVulnerabilities = populationGroups.map(group => {
    const vulnerability = calculateVulnerabilityIndex(
      populationGroupData,
      overallPopulationData,
      selectedDistrict,
      group.value
    );
    
    return {
      ...group,
      vulnerability: vulnerability
    };
  }).sort((a, b) => (b.vulnerability?.score || 0) - (a.vulnerability?.score || 0));

  const renderVulnerabilityCard = (group) => {
    const vuln = group.vulnerability;
    
    if (!vuln) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-gray-700">{group.label}</h4>
              <p className="text-sm text-gray-500">{group.english}</p>
            </div>
            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
              No Data
            </span>
          </div>
          <p className="text-sm text-gray-500">Insufficient data for analysis</p>
        </div>
      );
    }

    const getRiskColor = (riskLevel) => {
      switch(riskLevel) {
        case 'high': return 'bg-red-100 text-red-800 border-red-200';
        case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div className={`p-4 rounded-lg border ${getRiskColor(vuln.riskLevel)}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium">{group.label}</h4>
            <p className="text-sm opacity-75">{group.english}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{vuln.score.toFixed(1)}</div>
            <div className="text-xs uppercase tracking-wide">{vuln.riskLevel} Risk</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Health Disparities:</span>
            <span className="font-medium">{vuln.concerningGaps}/{vuln.totalIndicators} indicators</span>
          </div>
          
          {vuln.gaps.filter(g => g.isConcerning).slice(0, 2).map(gap => (
            <div key={gap.indicator} className="text-xs opacity-75">
              • {gap.indicator.replace('_', ' ')}: {gap.gap > 0 ? '+' : ''}{gap.gap.toFixed(1)}% difference
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEquityInsights = () => {
    if (!equityInsights.hasData) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="text-gray-600">{equityInsights.message}</p>
        </div>
      );
    }

    const selectedGroup = populationGroups.find(g => g.value === selectedPopulationGroup);
    
    return (
      <div className="space-y-4">
        {/* Vulnerability Summary */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-3">
            {selectedGroup?.label} Vulnerability Analysis
          </h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {equityInsights.vulnerabilityIndex.score.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Vulnerability Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {equityInsights.vulnerabilityIndex.concerningGaps}
              </div>
              <div className="text-sm text-gray-600">Health Disparities</div>
            </div>
          </div>

          <div className={`px-3 py-2 rounded text-center text-sm font-medium ${
            equityInsights.vulnerabilityIndex.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
            equityInsights.vulnerabilityIndex.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {equityInsights.vulnerabilityIndex.riskLevel.toUpperCase()} VULNERABILITY RISK
          </div>
        </div>

        {/* Specific Insights */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Health Equity Insights</h4>
          {equityInsights.insights.map((insight, index) => (
            <div key={index} className={`p-3 rounded border-l-4 ${
              insight.type === 'alert' ? 'bg-red-50 border-red-400' :
              insight.severity === 'high' ? 'bg-orange-50 border-orange-400' :
              insight.severity === 'moderate' ? 'bg-yellow-50 border-yellow-400' :
              'bg-blue-50 border-blue-400'
            }`}>
              <p className="text-sm text-gray-800">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-3">Population Groups Health Equity</h3>
      
      {/* Overview Cards */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Vulnerability Overview - {selectedDistrict}</h4>
        <div className="grid grid-cols-1 gap-4">
          {groupVulnerabilities.map(group => (
            <div key={group.value}>
              {renderVulnerabilityCard(group)}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis for Selected Group */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">
          Detailed Analysis: {populationGroups.find(g => g.value === selectedPopulationGroup)?.label}
        </h4>
        {renderEquityInsights()}
      </div>

      {/* Methodology Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-800 mb-2">About Vulnerability Analysis</h4>
        <p className="text-sm text-blue-700 mb-2">
          Vulnerability scores measure health disparities between population groups and the overall population. 
          Higher scores indicate greater health inequities that may require targeted interventions.
        </p>
        <div className="text-xs text-blue-600 space-y-1">
          <p>• <strong>Low Risk (0-50):</strong> Minimal health disparities</p>
          <p>• <strong>Moderate Risk (51-75):</strong> Some concerning health gaps</p>
          <p>• <strong>High Risk (76-100):</strong> Significant health inequities requiring attention</p>
        </div>
      </div>

      {/* Sample Data Note */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Currently displaying simulated population group data. 
          Actual survey data for แรงงานนอกระบบ, ผู้สูงอายุ, คนพิการ, and กลุ่มเพศหลากหลาย 
          will be integrated when available.
        </p>
      </div>
    </div>
  );
};

export default PopulationGroupsTab;