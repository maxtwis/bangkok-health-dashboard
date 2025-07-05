import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const EnhancedSpiderChart = ({ 
  spiderData, 
  selectedDistrict, 
  comparisonDistrict,
  comparisonType,
  selectedPopulationGroup,
  populationGroupSpiderData
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

  const chartData = comparisonType === 'population' ? populationGroupSpiderData : spiderData;
  
  const getChartTitle = () => {
    if (comparisonType === 'population') {
      return {
        main: 'Health Equity Analysis',
        sub: `${getPopulationGroupLabel(selectedPopulationGroup)} vs Overall Population in ${selectedDistrict}`
      };
    }
    return {
      main: 'Social Determinants of Health Equity Scores',
      sub: `for ${selectedDistrict}, Bangkok`
    };
  };

  const title = getChartTitle();

  // Custom tooltip for population group comparison
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 mb-2">{`Domain: ${label}`}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-700">
                {entry.name}: {entry.value?.toFixed(1)}
              </span>
              {comparisonType === 'population' && entry.dataKey !== 'overall' && payload.length > 1 && (
                <span className="text-xs text-gray-500 ml-2">
                  {entry.value > payload.find(p => p.dataKey === 'overall')?.value ? '↑' : '↓'} 
                  {Math.abs(entry.value - payload.find(p => p.dataKey === 'overall')?.value).toFixed(1)} gap
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderRadarLines = () => {
    if (comparisonType === 'population') {
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
    } else {
      return (
        <>
          <Radar
            name={selectedDistrict}
            dataKey={selectedDistrict}
            stroke="#059669"
            fill="#059669"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name={comparisonDistrict}
            dataKey={comparisonDistrict}
            stroke="#dc2626"
            fill="#dc2626"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </>
      );
    }
  };

  const renderLegendContent = () => {
    if (comparisonType === 'population') {
      return (
        <div className="flex justify-center items-center space-x-6 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-blue-500"></div>
            <span className="text-sm text-gray-700">Overall Population</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-red-500"></div>
            <span className="text-sm text-gray-700">{getPopulationGroupLabel(selectedPopulationGroup)}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center items-center space-x-6 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-green-600"></div>
            <span className="text-sm text-gray-700">{selectedDistrict}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-red-600"></div>
            <span className="text-sm text-gray-700">{comparisonDistrict}</span>
          </div>
        </div>
      );
    }
  };

  const renderInsights = () => {
    if (comparisonType === 'population' && chartData && chartData.length > 0) {
      const healthBehaviorsDomain = chartData.find(d => d.domain === 'Health Behaviors');
      
      if (healthBehaviorsDomain && healthBehaviorsDomain.hasData) {
        const overallScore = healthBehaviorsDomain.overall;
        const groupScore = healthBehaviorsDomain[selectedPopulationGroup];
        const gap = groupScore - overallScore;
        
        return (
          <div className={`p-3 rounded-lg text-center text-sm ${
            Math.abs(gap) < 5 ? 'bg-green-50 text-green-800' :
            Math.abs(gap) < 15 ? 'bg-yellow-50 text-yellow-800' :
            'bg-red-50 text-red-800'
          }`}>
            <strong>Health Behaviors Gap:</strong> {gap > 0 ? '+' : ''}{gap.toFixed(1)} points
            {gap > 5 && <span className="block text-xs mt-1">Higher vulnerability in this population group</span>}
            {gap < -5 && <span className="block text-xs mt-1">Better health behaviors than overall population</span>}
            {Math.abs(gap) <= 5 && <span className="block text-xs mt-1">Similar to overall population</span>}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title.main}
        </h2>
        <h3 className="text-lg text-gray-700 mb-3">
          {title.sub}
        </h3>
        <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors">
          Read more about this plot
        </button>
      </div>

      {/* Spider Chart */}
      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
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
            {renderRadarLines()}
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      {renderLegendContent()}

      {/* Equity Gap Insights */}
      {renderInsights()}

      {/* Information Box */}
      <div className={`p-4 rounded-lg border mb-4 ${
        comparisonType === 'population' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
      }`}>
        <p className={`text-sm text-center ${
          comparisonType === 'population' ? 'text-green-800' : 'text-blue-800'
        }`}>
          {comparisonType === 'population' 
            ? 'Comparing health equity between population groups in the selected district. Red areas indicate where the selected group has poorer health outcomes than the overall population.'
            : 'View the demographics used to help determine the similarity between your district and other districts. Select another district to see the comparison.'
          }
        </p>
      </div>

      {/* Notes */}
      <div className="text-center">
        <div className="text-xs text-gray-600 mb-2">
          <strong>Note:</strong> {comparisonType === 'population' 
            ? 'Population group comparison currently uses Health Behaviors data only. Other domains show baseline values.'
            : 'Only Health Behaviors domain currently has data. Other domains show placeholder values of 0.'
          }
        </div>
        <p className="text-xs text-gray-500">
          {comparisonType === 'population'
            ? 'Higher scores indicate better health behaviors. Gaps of 10+ points may indicate need for targeted interventions.'
            : 'Health Behaviors score is calculated from alcohol drinking rate, smoking rate, obesity rate, and traffic death rate. Higher scores indicate better health behaviors.'
          }
        </p>
      </div>
    </div>
  );
};

export default EnhancedSpiderChart;