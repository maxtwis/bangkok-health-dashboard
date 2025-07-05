import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const SpiderChart = ({ 
  spiderData, 
  selectedDistrict, 
  comparisonDistrict,
  selectedPopulationGroup,
  populationGroupSpiderData,
  viewMode // 'district', 'population', or 'both'
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

  const getChartConfig = () => {
    switch(viewMode) {
      case 'district':
        return {
          data: spiderData,
          title: {
            main: 'Social Determinants of Health Equity Scores',
            sub: `District Comparison: ${selectedDistrict} vs ${comparisonDistrict}`
          },
          lines: [
            {
              name: selectedDistrict,
              dataKey: selectedDistrict,
              stroke: '#059669',
              fill: '#059669',
              fillOpacity: 0.3,
              strokeWidth: 2
            },
            {
              name: comparisonDistrict,
              dataKey: comparisonDistrict,
              stroke: '#dc2626',
              fill: '#dc2626',
              fillOpacity: 0.3,
              strokeWidth: 2
            }
          ]
        };
        
      case 'population':
        return {
          data: populationGroupSpiderData,
          title: {
            main: 'Health Equity Analysis',
            sub: `${getPopulationGroupLabel(selectedPopulationGroup)} vs Overall Population in ${selectedDistrict}`
          },
          lines: [
            {
              name: 'Overall Population',
              dataKey: 'overall',
              stroke: '#3B82F6',
              fill: '#3B82F6',
              fillOpacity: 0.2,
              strokeWidth: 2
            },
            {
              name: getPopulationGroupLabel(selectedPopulationGroup),
              dataKey: selectedPopulationGroup,
              stroke: '#EF4444',
              fill: '#EF4444',
              fillOpacity: 0.3,
              strokeWidth: 3
            }
          ]
        };
        
      case 'both':
        // Combine both datasets for side-by-side comparison
        const combinedData = spiderData.map((districtItem, index) => {
          const popItem = populationGroupSpiderData[index] || {};
          return {
            ...districtItem,
            [`${selectedPopulationGroup}_group`]: popItem[selectedPopulationGroup] || 0,
            overall_pop: popItem.overall || 0
          };
        });
        
        return {
          data: combinedData,
          title: {
            main: 'Combined Health Equity Analysis',
            sub: `District Comparison + Population Equity for ${selectedDistrict}`
          },
          lines: [
            {
              name: `${selectedDistrict} (District)`,
              dataKey: selectedDistrict,
              stroke: '#059669',
              fill: '#059669',
              fillOpacity: 0.15,
              strokeWidth: 2
            },
            {
              name: `${comparisonDistrict} (District)`,
              dataKey: comparisonDistrict,
              stroke: '#dc2626',
              fill: '#dc2626',
              fillOpacity: 0.15,
              strokeWidth: 2
            },
            {
              name: `Overall Population`,
              dataKey: 'overall_pop',
              stroke: '#3B82F6',
              fill: '#3B82F6',
              fillOpacity: 0.15,
              strokeWidth: 2,
              strokeDasharray: '5 5'
            },
            {
              name: getPopulationGroupLabel(selectedPopulationGroup),
              dataKey: `${selectedPopulationGroup}_group`,
              stroke: '#F59E0B',
              fill: '#F59E0B',
              fillOpacity: 0.15,
              strokeWidth: 3,
              strokeDasharray: '5 5'
            }
          ]
        };
        
      default:
        return null;
    }
  };

  const config = getChartConfig();
  if (!config) return null;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium text-gray-800 mb-2">{`Domain: ${label}`}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-2 mb-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-700 truncate">{entry.name}</span>
              </div>
              <span className="text-sm font-medium">{entry.value?.toFixed(1)}</span>
            </div>
          ))}
          
          {viewMode === 'population' && payload.length > 1 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                Gap: {Math.abs(payload[1].value - payload[0].value).toFixed(1)} points
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderLegendContent = () => {
    return (
      <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
        {config.lines.map((line, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-4 h-1" 
              style={{ 
                backgroundColor: line.stroke,
                ...(line.strokeDasharray && { backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 2px, currentColor 2px, currentColor 4px)' })
              }}
            ></div>
            <span className="text-sm text-gray-700">{line.name}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderInsights = () => {
    if (viewMode === 'population' && config.data && config.data.length > 0) {
      const healthBehaviorsDomain = config.data.find(d => d.domain === 'Health Behaviors');
      
      if (healthBehaviorsDomain && healthBehaviorsDomain.hasData) {
        const overallScore = healthBehaviorsDomain.overall;
        const groupScore = healthBehaviorsDomain[selectedPopulationGroup];
        const gap = groupScore - overallScore;
        
        return (
          <div className={`p-3 rounded-lg text-center text-sm mb-4 ${
            Math.abs(gap) < 5 ? 'bg-green-50 text-green-800' :
            Math.abs(gap) < 15 ? 'bg-yellow-50 text-yellow-800' :
            'bg-red-50 text-red-800'
          }`}>
            <strong>Health Equity Gap:</strong> {gap > 0 ? '+' : ''}{gap.toFixed(1)} points
            {gap > 5 && <span className="block text-xs mt-1">Higher vulnerability in this population group</span>}
            {gap < -5 && <span className="block text-xs mt-1">Better health behaviors than overall population</span>}
            {Math.abs(gap) <= 5 && <span className="block text-xs mt-1">Similar to overall population</span>}
          </div>
        );
      }
    }

    if (viewMode === 'both') {
      return (
        <div className="bg-purple-50 p-3 rounded-lg text-center text-sm mb-4">
          <strong>Combined Analysis:</strong> Solid lines show district comparison, dashed lines show population equity within {selectedDistrict}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {config.title.main}
        </h2>
        <h3 className="text-lg text-gray-700 mb-3">
          {config.title.sub}
        </h3>
        <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors">
          Read more about this plot
        </button>
      </div>

      {/* Spider Chart */}
      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={config.data} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
            <PolarGrid />
            <PolarAngleAxis 
              dataKey="domain" 
              className="text-xs"
              tick={{ fontSize: 11, fill: '#374151' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              className="text-xs"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickCount={6}
            />
            {config.lines.map((line, index) => (
              <Radar
                key={index}
                name={line.name}
                dataKey={line.dataKey}
                stroke={line.stroke}
                fill={line.fill}
                fillOpacity={line.fillOpacity}
                strokeWidth={line.strokeWidth}
                strokeDasharray={line.strokeDasharray}
              />
            ))}
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      {renderLegendContent()}

      {/* Insights */}
      {renderInsights()}

      {/* Information Box */}
      <div className={`p-4 rounded-lg border mb-4 ${
        viewMode === 'population' ? 'bg-green-50 border-green-200' :
        viewMode === 'both' ? 'bg-purple-50 border-purple-200' :
        'bg-blue-50 border-blue-200'
      }`}>
        <p className={`text-sm text-center ${
          viewMode === 'population' ? 'text-green-800' :
          viewMode === 'both' ? 'text-purple-800' :
          'text-blue-800'
        }`}>
          {viewMode === 'population' && 'Comparing health equity between population groups in the selected district. Red areas indicate where the selected group has poorer health outcomes than the overall population.'}
          {viewMode === 'district' && 'Comparing overall health equity between districts. Select different districts to see how they compare across all health domains.'}
          {viewMode === 'both' && 'Combined view showing both district-level differences and population group equity within the selected district. Use this to identify both geographic and demographic health disparities.'}
        </p>
      </div>

      {/* Notes */}
      <div className="text-center">
        <div className="text-xs text-gray-600 mb-2">
          <strong>Note:</strong> {viewMode === 'population' 
            ? 'Population group comparison currently uses Health Behaviors data only. Other domains show baseline values.'
            : viewMode === 'both'
            ? 'Only Health Behaviors domain currently has data for both comparisons. Other domains show placeholder values.'
            : 'Only Health Behaviors domain currently has data. Other domains show placeholder values of 0.'
          }
        </div>
        <p className="text-xs text-gray-500">
          Higher scores indicate better health behaviors. Scores are calculated from alcohol drinking rate, smoking rate, obesity rate, and traffic death rate.
        </p>
      </div>
    </div>
  );
};

export default SpiderChart;