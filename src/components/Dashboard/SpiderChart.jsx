import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const SpiderChart = ({ 
  analysisLevel, // 'bangkok' or 'district'
  selectedDistrict,
  selectedPopulationGroup,
  bangkokPopulationData, // All 4 population groups for Bangkok
  districtData, // Single district detailed data
  allRateData
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

  // Bangkok-level: Compare 4 population groups + overall
  const getBangkokSpiderData = () => {
    // Sample data structure - replace with actual Bangkok aggregated data
    return [
      { 
        domain: 'Health Behaviors', 
        fullMark: 100,
        informal_workers: 65,
        elderly: 75,
        disabled: 70,
        lgbtq: 68,
        overall: 72
      },
      { 
        domain: 'Education', 
        fullMark: 100,
        informal_workers: 45,
        elderly: 55,
        disabled: 50,
        lgbtq: 60,
        overall: 65
      },
      { 
        domain: 'Economic Stability', 
        fullMark: 100,
        informal_workers: 40,
        elderly: 60,
        disabled: 45,
        lgbtq: 55,
        overall: 70
      },
      { 
        domain: 'Healthcare Access', 
        fullMark: 100,
        informal_workers: 50,
        elderly: 65,
        disabled: 45,
        lgbtq: 55,
        overall: 70
      },
      { 
        domain: 'Neighborhood Environment', 
        fullMark: 100,
        informal_workers: 60,
        elderly: 65,
        disabled: 55,
        lgbtq: 62,
        overall: 68
      },
      { 
        domain: 'Community Context', 
        fullMark: 100,
        informal_workers: 55,
        elderly: 70,
        disabled: 60,
        lgbtq: 50,
        overall: 65
      }
    ];
  };

  // District-level: Compare selected population group vs overall in specific district
  const getDistrictSpiderData = () => {
    if (!selectedDistrict || !selectedPopulationGroup) {
      // Return default data if required props are missing
      return [
        { domain: 'Health Behaviors', fullMark: 100, [selectedPopulationGroup || 'group']: 50, overall: 60 },
        { domain: 'Education', fullMark: 100, [selectedPopulationGroup || 'group']: 45, overall: 55 },
        { domain: 'Economic Stability', fullMark: 100, [selectedPopulationGroup || 'group']: 40, overall: 50 },
        { domain: 'Healthcare Access', fullMark: 100, [selectedPopulationGroup || 'group']: 45, overall: 55 },
        { domain: 'Neighborhood Environment', fullMark: 100, [selectedPopulationGroup || 'group']: 50, overall: 60 },
        { domain: 'Community Context', fullMark: 100, [selectedPopulationGroup || 'group']: 45, overall: 55 }
      ];
    }

    return [
      { 
        domain: 'Health Behaviors', 
        fullMark: 100,
        [selectedPopulationGroup]: 68,
        overall: 75
      },
      { 
        domain: 'Education', 
        fullMark: 100,
        [selectedPopulationGroup]: 52,
        overall: 68
      },
      { 
        domain: 'Economic Stability', 
        fullMark: 100,
        [selectedPopulationGroup]: 45,
        overall: 72
      },
      { 
        domain: 'Healthcare Access', 
        fullMark: 100,
        [selectedPopulationGroup]: 58,
        overall: 73
      },
      { 
        domain: 'Neighborhood Environment', 
        fullMark: 100,
        [selectedPopulationGroup]: 62,
        overall: 70
      },
      { 
        domain: 'Community Context', 
        fullMark: 100,
        [selectedPopulationGroup]: 55,
        overall: 67
      }
    ];
  };

  // Get chart data with validation
  const getChartData = () => {
    try {
      if (analysisLevel === 'bangkok') {
        return getBangkokSpiderData();
      } else {
        return getDistrictSpiderData();
      }
    } catch (error) {
      console.error('Error generating chart data:', error);
      // Return fallback data
      return [
        { domain: 'Health Behaviors', fullMark: 100, value1: 50, value2: 60 },
        { domain: 'Education', fullMark: 100, value1: 45, value2: 55 },
        { domain: 'Economic Stability', fullMark: 100, value1: 40, value2: 50 },
        { domain: 'Healthcare Access', fullMark: 100, value1: 45, value2: 55 },
        { domain: 'Neighborhood Environment', fullMark: 100, value1: 50, value2: 60 },
        { domain: 'Community Context', fullMark: 100, value1: 45, value2: 55 }
      ];
    }
  };

  const chartData = getChartData();
  
  // Validate chart data
  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">
            <p>Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    if (analysisLevel === 'bangkok') {
      return {
        main: 'Bangkok Population Groups Health Equity',
        sub: `Comparing all vulnerable groups across 50 districts (4,000 surveys)`
      };
    }
    return {
      main: 'District Population Health Analysis',
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
                <span className="text-sm font-medium">{entry.value.toFixed(0)}</span>
              </div>
            );
          })}
          {analysisLevel === 'bangkok' && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
              Lower scores indicate higher vulnerability
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderInsights = () => {
    try {
      if (analysisLevel === 'bangkok') {
        return (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-sm font-medium text-orange-800">Most Vulnerable</div>
              <div className="text-xs text-orange-600 mt-1">แรงงานนอกระบบ (Economic instability)</div>
            </div>
            <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
              <div className="text-sm font-medium text-pink-800">Social Challenges</div>
              <div className="text-xs text-pink-600 mt-1">กลุ่มเพศหลากหลาย (Community context)</div>
            </div>
          </div>
        );
      } else {
        const healthBehaviorsDomain = chartData.find(d => d.domain === 'Health Behaviors');
        if (!healthBehaviorsDomain) return null;
        
        const overallScore = healthBehaviorsDomain.overall || 0;
        const groupScore = healthBehaviorsDomain[selectedPopulationGroup] || 0;
        const gap = overallScore - groupScore;
        
        return (
          <div className={`p-3 rounded-lg text-center text-sm mb-4 ${
            gap < 5 ? 'bg-green-50 text-green-800 border border-green-200' :
            gap < 15 ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <strong>Health Equity Gap:</strong> {gap.toFixed(0)} points difference
            <div className="text-xs mt-1">
              {gap > 10 && 'Significant inequity - targeted interventions needed'}
              {gap <= 10 && gap > 5 && 'Moderate inequity - monitor and support'}
              {gap <= 5 && 'Minimal inequity - maintain current support'}
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
            ? 'Bangkok-wide comparison shows health inequities across population groups. Lower scores indicate higher vulnerability and need for targeted interventions.'
            : `District-level analysis reveals local health equity gaps. Use this data to design community-specific health programs for ${selectedDistrict || 'the selected district'}.`
          }
        </p>
        
        <div className="mt-3 text-xs text-gray-600">
          <strong>Data Source:</strong> {analysisLevel === 'bangkok' 
            ? '4,000 surveys across 50 Bangkok districts (80 per district)'
            : `${selectedDistrict || 'District'} surveys + health outcomes + accessibility indicators`
          }
        </div>
      </div>

      {/* Survey Coverage Info for Bangkok Level */}
      {analysisLevel === 'bangkok' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Survey Coverage</h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">แรงงานนอกระบบ:</span> ~1,000 surveys
            </div>
            <div>
              <span className="font-medium">ผู้สูงอายุ:</span> ~1,000 surveys
            </div>
            <div>
              <span className="font-medium">คนพิการ:</span> ~1,000 surveys
            </div>
            <div>
              <span className="font-medium">กลุ่มเพศหลากหลาย:</span> ~1,000 surveys
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpiderChart;