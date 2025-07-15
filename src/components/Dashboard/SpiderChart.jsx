import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const EnhancedSDHESpiderChart = ({ 
  analysisLevel, // 'bangkok' or 'district'
  selectedDistrict,
  selectedPopulationGroup,
  sdheData, // Real SDHE data from useSDHEData hook
  getSpiderChartData, // Function from useSDHEData hook
  getEquityGaps, // Function from useSDHEData hook
  getVulnerabilityIndex // Function from useSDHEData hook
}) => {
  
  const getPopulationGroupLabel = (populationGroup) => {
    const labels = {
      'informal_workers': 'แรงงานนอกระบบ',
      'elderly': 'ผู้สูงอายุ',
      'disabled': 'คนพิการ', 
      'lgbtq': 'กลุ่มเพศหลากหลาย',
      'overall': 'ประชากรทั่วไป'
    };
    return labels[populationGroup] || populationGroup;
  };

  // Get chart data using real SDHE calculations
  const getChartData = () => {
    try {
      if (!getSpiderChartData) {
        console.warn('getSpiderChartData function not available');
        return [];
      }
      
      return getSpiderChartData(analysisLevel, selectedPopulationGroup);
    } catch (error) {
      console.error('Error generating chart data:', error);
      return [];
    }
  };

  const chartData = getChartData();
  
  // Validate chart data
  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">SDHE Data Processing</p>
            <p className="text-sm">Loading Social Determinants of Health Equity indicators...</p>
          </div>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    if (analysisLevel === 'bangkok') {
      return {
        main: 'Bangkok SDHE Population Groups Analysis',
        sub: `Social Determinants of Health Equity across vulnerable populations`
      };
    }
    return {
      main: 'District SDHE Population Analysis',
      sub: `${getPopulationGroupLabel(selectedPopulationGroup)} vs Overall Population in ${selectedDistrict || 'Selected District'}`
    };
  };

  const title = getTitle();

  const renderBangkokRadarLines = () => {
    // Validate data keys exist
    const sampleData = chartData[0] || {};
    const hasRequiredKeys = ['overall', 'informal_workers', 'elderly', 'disabled', 'lgbtq'].every(
      key => sampleData.hasOwnProperty(key)
    );

    if (!hasRequiredKeys) {
      console.warn('Missing required keys in chart data:', Object.keys(sampleData));
      return (
        <Radar
          name="Sample Data"
          dataKey="value1"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      );
    }

    return (
      <>
        <Radar
          name="ประชากรทั่วไป"
          dataKey="overall"
          stroke="#6B7280"
          fill="#6B7280"
          fillOpacity={0.1}
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <Radar
          name="แรงงานนอกระบบ"
          dataKey="informal_workers"
          stroke="#F59E0B"
          fill="#F59E0B"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name="ผู้สูงอายุ"
          dataKey="elderly"
          stroke="#8B5CF6"
          fill="#8B5CF6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name="คนพิการ"
          dataKey="disabled"
          stroke="#06B6D4"
          fill="#06B6D4"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name="กลุ่มเพศหลากหลาย"
          dataKey="lgbtq"
          stroke="#EC4899"
          fill="#EC4899"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </>
    );
  };

  const renderDistrictRadarLines = () => {
    const sampleData = chartData[0] || {};
    const groupKey = selectedPopulationGroup || 'group';
    
    // Validate data keys exist
    if (!sampleData.hasOwnProperty('overall') || !sampleData.hasOwnProperty(groupKey)) {
      console.warn('Missing required keys for district analysis:', Object.keys(sampleData));
      return (
        <>
          <Radar
            name="Group 1"
            dataKey="value1"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Radar
            name="Group 2"
            dataKey="value2"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.3}
            strokeWidth={3}
          />
        </>
      );
    }

    return (
      <>
        <Radar
          name="Overall Population"
          dataKey="overall"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name={getPopulationGroupLabel(selectedPopulationGroup)}
          dataKey={selectedPopulationGroup}
          stroke="#EF4444"
          fill="#EF4444"
          fillOpacity={0.3}
          strokeWidth={3}
        />
      </>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => {
            // Validate entry data
            if (!entry || typeof entry.value !== 'number') return null;
            
            return (
              <div key={index} className="flex items-center justify-between space-x-3 mb-1">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">{entry.value.toFixed(1)}%</span>
              </div>
            );
          })}
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
            Higher scores indicate better health equity
          </div>
        </div>
      );
    }
    return null;
  };

  const renderInsights = () => {
    try {
      if (analysisLevel === 'bangkok') {
        // Get equity gaps for Bangkok analysis
        const equityGaps = getEquityGaps ? getEquityGaps() : {};
        
        // Find the most vulnerable group overall
        const vulnerabilityScores = ['informal_workers', 'elderly', 'disabled', 'lgbtq'].map(group => {
          const vulnIndex = getVulnerabilityIndex ? getVulnerabilityIndex(group) : null;
          return {
            group,
            score: vulnIndex?.score || 0,
            riskLevel: vulnIndex?.riskLevel || 'unknown'
          };
        }).sort((a, b) => b.score - a.score);

        const mostVulnerable = vulnerabilityScores[0];
        const leastVulnerable = vulnerabilityScores[vulnerabilityScores.length - 1];

        return (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className={`p-3 rounded-lg border ${
              mostVulnerable.riskLevel === 'high' ? 'bg-red-50 border-red-200' :
              mostVulnerable.riskLevel === 'moderate' ? 'bg-orange-50 border-orange-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className={`text-sm font-medium ${
                mostVulnerable.riskLevel === 'high' ? 'text-red-800' :
                mostVulnerable.riskLevel === 'moderate' ? 'text-orange-800' :
                'text-yellow-800'
              }`}>
                Most Vulnerable
              </div>
              <div className={`text-xs mt-1 ${
                mostVulnerable.riskLevel === 'high' ? 'text-red-600' :
                mostVulnerable.riskLevel === 'moderate' ? 'text-orange-600' :
                'text-yellow-600'
              }`}>
                {getPopulationGroupLabel(mostVulnerable.group)} ({mostVulnerable.score.toFixed(0)}% risk)
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-800">Least Vulnerable</div>
              <div className="text-xs text-green-600 mt-1">
                {getPopulationGroupLabel(leastVulnerable.group)} ({leastVulnerable.score.toFixed(0)}% risk)
              </div>
            </div>
          </div>
        );
      } else {
        // District-level analysis
        const vulnerabilityIndex = getVulnerabilityIndex ? getVulnerabilityIndex(selectedPopulationGroup) : null;
        
        if (!vulnerabilityIndex) return null;
        
        return (
          <div className={`p-3 rounded-lg text-center text-sm mb-4 ${
            vulnerabilityIndex.riskLevel === 'high' ? 'bg-red-50 text-red-800 border border-red-200' :
            vulnerabilityIndex.riskLevel === 'moderate' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
            'bg-green-50 text-green-800 border border-green-200'
          }`}>
            <strong>Vulnerability Index:</strong> {vulnerabilityIndex.score.toFixed(1)}% ({vulnerabilityIndex.riskLevel} risk)
            <div className="text-xs mt-1">
              {vulnerabilityIndex.riskLevel === 'high' && 'Significant health inequities - targeted interventions needed'}
              {vulnerabilityIndex.riskLevel === 'moderate' && 'Some health disparities - monitor and support'}
              {vulnerabilityIndex.riskLevel === 'low' && 'Minimal health inequities - maintain current support'}
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error('Error rendering insights:', error);
      return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title.main}
        </h2>
        <p className="text-gray-600 text-sm">
          {title.sub}
        </p>
      </div>

      {/* Spider Chart */}
      <div className="h-96 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart 
            data={chartData} 
            margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
          >
            <PolarGrid />
            <PolarAngleAxis 
              dataKey="domain" 
              tick={{ fontSize: 11, fill: '#374151' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickCount={5}
            />
            {analysisLevel === 'bangkok' ? renderBangkokRadarLines() : renderDistrictRadarLines()}
            <Legend />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      {renderInsights()}

      {/* Information Box */}
      <div className={`p-4 rounded-lg border text-center ${
        analysisLevel === 'bangkok' 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <p className={`text-sm ${
          analysisLevel === 'bangkok' ? 'text-blue-800' : 'text-green-800'
        }`}>
          {analysisLevel === 'bangkok' 
            ? 'Bangkok-wide SDHE comparison shows health equity across population groups. Scores are calculated from actual survey responses across 6 domains: Economic Security, Education, Healthcare Access, Physical Environment, Social Context, and Health Behaviors.'
            : `District-level SDHE analysis reveals local health equity gaps for ${getPopulationGroupLabel(selectedPopulationGroup)}. Use this data to design targeted health programs for ${selectedDistrict || 'the selected district'}.`
          }
        </p>
        
        <div className="mt-3 text-xs text-gray-600">
          <strong>Data Source:</strong> {analysisLevel === 'bangkok' 
            ? 'Bangkok health survey responses processed through SDHE indicator calculations'
            : `${selectedDistrict || 'District'} survey responses + SDHE domain calculations`
          }
        </div>
      </div>

      {/* SDHE Domain Information */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-2">SDHE Domains Measured</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>🏢 <span className="font-medium">Economic Security</span></div>
          <div>🎓 <span className="font-medium">Education</span></div>
          <div>🏥 <span className="font-medium">Healthcare Access</span></div>
          <div>🏘️ <span className="font-medium">Physical Environment</span></div>
          <div>🤝 <span className="font-medium">Social Context</span></div>
          <div>💪 <span className="font-medium">Health Behaviors</span></div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Each domain score represents the percentage of positive health outcomes within that domain.
        </div>
      </div>
    </div>
  );
};

export default EnhancedSDHESpiderChart;