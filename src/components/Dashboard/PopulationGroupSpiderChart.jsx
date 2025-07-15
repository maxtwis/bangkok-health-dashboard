import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

const PopulationGroupSpiderChart = ({ getIndicatorData, selectedDistrict }) => {
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          SDHE Domain Comparison by Population Group
        </h3>
        <p className="text-sm text-gray-600">
          Comparing domain scores across all population groups in {selectedDistrict}
        </p>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
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
            />
            
            {populationGroups.map(group => (
              <Radar
                key={group.value}
                name={group.label}
                dataKey={group.value}
                stroke={group.color}
                fill={group.color}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ fill: group.color, strokeWidth: 1, r: 3 }}
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

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {populationGroups.map(group => {
          const groupData = chartData.map(d => d[group.value]);
          const average = groupData.reduce((sum, val) => sum + val, 0) / groupData.length;
          const highest = Math.max(...groupData);
          const lowest = Math.min(...groupData);
          
          return (
            <div key={group.value} className="bg-gray-50 p-3 rounded">
              <div className="flex items-center mb-2">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: group.color }}
                ></div>
                <h4 className="font-medium text-sm text-gray-900">{group.label}</h4>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Average: <span className="font-medium">{average.toFixed(1)}%</span></div>
                <div>Highest: <span className="font-medium">{highest.toFixed(1)}%</span></div>
                <div>Lowest: <span className="font-medium">{lowest.toFixed(1)}%</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Domain Rankings */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-800 mb-3">Best Performing Domains by Group</h4>
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
                <ol className="text-xs text-gray-600 space-y-1">
                  {groupScores.slice(0, 3).map((item, index) => (
                    <li key={item.domain} className="flex justify-between">
                      <span>{index + 1}. {item.domain}</span>
                      <span className="font-medium">{item.score.toFixed(1)}%</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="mt-4 bg-blue-50 p-3 rounded text-xs text-gray-600">
        <p><strong>How to read:</strong> Each line represents one population group. Points closer to the outer edge indicate better outcomes in that domain. The chart uses corrected domain scores that account for reverse indicators.</p>
      </div>
    </div>
  );
};

export default PopulationGroupSpiderChart;