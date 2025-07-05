import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const SpiderChart = ({ spiderData, selectedDistrict, comparisonDistrict }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Social Determinants of Health Equity Scores
        </h2>
        <h3 className="text-lg text-gray-700 mb-3">
          for {selectedDistrict}, Bangkok
        </h3>
        <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors">
          Read more about this plot
        </button>
      </div>

      {/* Spider Chart */}
      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={spiderData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
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
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Tooltip 
              formatter={(value, name) => [`${value.toFixed(1)}`, name]}
              labelFormatter={(label) => `Domain: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Information Box */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
        <p className="text-sm text-green-800 text-center">
          View the demographics used to help determine the similarity between your district and other districts.
          Select another district to see the comparison.
        </p>
      </div>

      {/* Legend and Notes */}
      <div className="text-center">
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
        
        <p className="text-xs text-gray-600 mb-2">
          <strong>Note:</strong> Only Health Behaviors domain currently has data. Other domains show placeholder values of 0.
        </p>
        <p className="text-xs text-gray-500">
          Health Behaviors score is calculated from alcohol drinking rate, smoking rate, obesity rate, and traffic death rate.
          Higher scores indicate better health behaviors.
        </p>
      </div>
    </div>
  );
};

export default SpiderChart;