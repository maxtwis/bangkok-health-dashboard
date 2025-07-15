import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

const PopulationGroupSpiderChart = ({ getIndicatorData, selectedDistrict }) => {
  const [scaleMode, setScaleMode] = useState('dynamic'); // 'full' or 'dynamic'
  
  const populationGroups = [
    { value: 'informal_workers', label: 'Informal Workers', color: '#ef4444' },
    { value: 'elderly', label: 'Elderly', color: '#3b82f6' },
    { value: 'disabled', label: 'Disabled', color: '#10b981' },
    { value: 'lgbtq', label: 'LGBTQ+', color: '#f59e0b' }
  ];

  const domains = [
    'economic_security',
    'education', 
    'healthcare_access',
    'physical_environment',
    'social_context',
    'health_behaviors'
  ];

  const domainLabels = {
    'economic_security': 'Economic Security',
    'education': 'Education', 
    'healthcare_access': 'Healthcare Access',
    'physical_environment': 'Physical Environment',
    'social_context': 'Social Context',
    'health_behaviors': 'Health Behaviors'
  };

  // Prepare data for the spider chart
  const chartData = domains.map(domain => {
    const dataPoint = {
      domain: domainLabels[domain],
      fullDomain: domain
    };

    populationGroups.forEach(group => {
      const indicatorData = getIndicatorData(domain, selectedDistrict, group.value);
      const domainScore = indicatorData.find(item => item.isDomainScore);
      dataPoint[group.value] = domainScore ? domainScore.value : 0;
    });

    return dataPoint;
  });

  // Calculate dynamic scale range
  const allValues = chartData.flatMap(d => 
    populationGroups.map(group => d[group.value])
  );
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  
  // Create more dramatic scale
  let scaleMin, scaleMax;
  if (scaleMode === 'dynamic') {
    // Use a tighter range around the actual data
    const range = maxValue - minValue;
    const padding = Math.max(range * 0.2, 5); // At least 5 point padding
    scaleMin = Math.max(0, Math.floor(minValue - padding));
    scaleMax = Math.min(100, Math.ceil(maxValue + padding));
  } else {
    // Full 0-100 scale
    scaleMin = 0;
    scaleMax = 100;
  }

  // Transform data for dynamic scaling
  const transformedData = chartData.map(d => {
    const transformed = { ...d };
    if (scaleMode === 'dynamic') {
      populationGroups.forEach(group => {
        // Map the value to the 0-100 range for display
        const originalValue = d[group.value];
        const scaledValue = ((originalValue - scaleMin) / (scaleMax - scaleMin)) * 100;
        transformed[group.value] = scaledValue;
        transformed[`${group.value}_original`] = originalValue; // Keep original for tooltips
      });
    }
    return transformed;
  });

  // Custom tick formatter to wrap long labels
  const formatTick = (value) => {
    if (value.length > 12) {
      const words = value.split(' ');
      if (words.length > 1) {
        return words[0] + '\n' + words.slice(1).join(' ');
      }
    }
    return value;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              SDHE Domain Comparison by Population Group
            </h3>
            <p className="text-sm text-gray-600">
              Comparing domain scores across all population groups in {selectedDistrict}
            </p>
          </div>
          
          {/* Scale Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setScaleMode('dynamic')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                scaleMode === 'dynamic' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dynamic Scale
            </button>
            <button
              onClick={() => setScaleMode('full')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                scaleMode === 'full' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Full Scale (0-100)
            </button>
          </div>
        </div>
        
        {scaleMode === 'dynamic' && (
          <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
            <strong>Dynamic Scale:</strong> Showing range {scaleMin}% to {scaleMax}% to highlight differences
          </div>
        )}
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={transformedData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis 
              dataKey="domain" 
              className="text-xs"
              tick={{ fontSize: 11, fill: '#374151' }}
              tickFormatter={formatTick}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              className="text-xs"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickCount={6}
              tickFormatter={(value) => {
                if (scaleMode === 'dynamic') {
                  const actualValue = scaleMin + (value / 100) * (scaleMax - scaleMin);
                  return actualValue.toFixed(0);
                }
                return value;
              }}
            />
            
            {populationGroups.map(group => (
              <Radar
                key={group.value}
                name={group.label}
                dataKey={group.value}
                stroke={group.color}
                fill={group.color}
                fillOpacity={0.15}
                strokeWidth={3}
                dot={{ fill: group.color, strokeWidth: 2, r: 4 }}
              />
            ))}
            
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Domain Rankings */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-800 mb-3">Domain Performance Rankings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {populationGroups.map(group => {
            const groupScores = chartData.map(d => ({
              domain: d.domain,
              score: d[group.value]
            })).sort((a, b) => b.score - a.score);

            return (
              <div key={group.value} className="bg-gray-50 p-3 rounded">
                <div className="flex items-center mb-2">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <h5 className="font-medium text-sm">{group.label}</h5>
                </div>
                <div className="space-y-1">
                  {groupScores.map((item, index) => (
                    <div key={item.domain} className="flex justify-between text-xs">
                      <span className={index < 2 ? 'text-green-600' : index >= 4 ? 'text-red-600' : 'text-gray-600'}>
                        {index + 1}. {item.domain}
                      </span>
                      <span className="font-medium">{item.score.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="mt-4 bg-blue-50 p-3 rounded text-xs text-gray-600">
        <p><strong>How to read:</strong> Each line represents one population group. Use "Dynamic Scale" to highlight differences between groups, or "Full Scale" to see absolute performance. Hover over points to see exact values.</p>
      </div>
    </div>
  );
};

export default PopulationGroupSpiderChart;