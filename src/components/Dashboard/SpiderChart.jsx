import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const SpiderChart = ({ 
  spiderData, 
  selectedDistrict, 
  comparisonDistrict,
  selectedPopulationGroup,
  populationGroupSpiderData,
  viewMode
}) => {
  
  const getPopulationGroupLabel = (populationGroup) => {
    const labels = {
      'informal_workers': 'แรงงานนอกระบบ',
      'elderly': 'ผู้สูงอายุ',
      'disabled': 'คนพิการ', 
      'lgbtq': 'กลุ่มเพศหลากหลาย'
    };
    return labels[populationGroup] || populationGroup;
  };

  // Choose which data to display
  const chartData = viewMode === 'population' ? populationGroupSpiderData : spiderData;
  
  const getTitle = () => {
    if (viewMode === 'population') {
      return {
        main: 'Health Equity Analysis',
        sub: `${getPopulationGroupLabel(selectedPopulationGroup)} vs Overall Population`
      };
    }
    return {
      main: 'District Health Comparison',
      sub: `${selectedDistrict} vs ${comparisonDistrict}`
    };
  };

  const title = getTitle();

  const renderRadarLines = () => {
    if (viewMode === 'population') {
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-700">{entry.name}</span>
              <span className="text-sm font-medium">{entry.value?.toFixed(1)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Simple Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title.main}
        </h2>
        <p className="text-gray-600">
          {title.sub}
        </p>
      </div>

      {/* Spider Chart */}
      <div className="h-96 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
            <PolarGrid />
            <PolarAngleAxis 
              dataKey="domain" 
              tick={{ fontSize: 12, fill: '#374151' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickCount={5}
            />
            {renderRadarLines()}
            <Legend />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Simple Info Box */}
      <div className="bg-gray-50 p-4 rounded-lg border text-center">
        <p className="text-sm text-gray-600">
          {viewMode === 'population' 
            ? 'Higher scores indicate better health outcomes. Gaps between lines show health inequities.'
            : 'Higher scores indicate better health outcomes. Compare districts across all health domains.'
          }
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Currently showing Health Behaviors data only. Other domains will be added when data becomes available.
        </p>
      </div>
    </div>
  );
};

export default SpiderChart;