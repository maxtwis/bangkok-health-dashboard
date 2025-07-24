import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const HotIssuesDashboard = ({ getAvailableDistricts, getAvailableDomains, getIndicatorData }) => {
  const [selectedIndicator, setSelectedIndicator] = useState('alcohol_consumption');

  const populationGroups = [
    { value: 'informal_workers', label: 'แรงงานนอกระบบ', color: '#ef4444' },
    { value: 'elderly', label: 'ผู้สูงอายุ', color: '#3b82f6' },
    { value: 'disabled', label: 'คนพิการ', color: '#10b981' },
    { value: 'lgbtq', label: 'LGBT สุขภาพ', color: '#f59e0b' }
  ];

  // Available indicators for selection
  const availableIndicators = [
    { value: 'alcohol_consumption', label: 'Alcohol Consumption', domain: 'health_behaviors' },
    { value: 'tobacco_use', label: 'Tobacco Use', domain: 'health_behaviors' },
    { value: 'physical_activity', label: 'Physical Activity', domain: 'health_behaviors' },
    { value: 'obesity', label: 'Obesity', domain: 'health_behaviors' },
    { value: 'unemployment_rate', label: 'Unemployment Rate', domain: 'economic_security' },
    { value: 'vulnerable_employment', label: 'Vulnerable Employment', domain: 'economic_security' },
    { value: 'food_insecurity_moderate', label: 'Food Insecurity (Moderate)', domain: 'economic_security' },
    { value: 'violence_physical', label: 'Physical Violence', domain: 'social_context' },
    { value: 'violence_psychological', label: 'Psychological Violence', domain: 'social_context' },
    { value: 'discrimination_experience', label: 'Discrimination Experience', domain: 'social_context' },
    { value: 'medical_consultation_skip_cost', label: 'Skipped Medical Care (Cost)', domain: 'healthcare_access' },
    { value: 'housing_overcrowding', label: 'Housing Overcrowding', domain: 'physical_environment' }
  ];

  // Define reverse indicators (where high values are bad)
  const reverseIndicators = {
    unemployment_rate: true,
    vulnerable_employment: true,
    food_insecurity_moderate: true,
    food_insecurity_severe: true,
    work_injury_fatal: true,
    work_injury_non_fatal: true,
    catastrophic_health_spending_household: true,
    health_spending_over_10_percent: true,
    health_spending_over_25_percent: true,
    medical_consultation_skip_cost: true,
    medical_treatment_skip_cost: true,
    prescribed_medicine_skip_cost: true,
    housing_overcrowding: true,
    disaster_experience: true,
    violence_physical: true,
    violence_psychological: true,
    violence_sexual: true,
    discrimination_experience: true,
    community_murder: true,
    alcohol_consumption: true,
    tobacco_use: true,
    obesity: true
  };

  // Get data for selected indicator across all districts and population groups
  const getIndicatorChartData = useMemo(() => {
    if (!getIndicatorData || !selectedIndicator) return [];

    const selectedIndicatorObj = availableIndicators.find(ind => ind.value === selectedIndicator);
    if (!selectedIndicatorObj) return [];

    const districts = getAvailableDistricts().filter(d => d !== 'Bangkok Overall');
    const isReverse = reverseIndicators[selectedIndicator];

    // Get data for each population group
    const populationGroupData = populationGroups.map(group => {
      const districtValues = [];

      districts.forEach(district => {
        const indicatorData = getIndicatorData(selectedIndicatorObj.domain, district, group.value);
        const indicatorItem = indicatorData.find(item => item.indicator === selectedIndicator);
        
        if (indicatorItem && indicatorItem.value !== null && indicatorItem.value !== undefined) {
          districtValues.push({
            district: district,
            value: Number(indicatorItem.value) || 0, // Ensure it's a number
            sampleSize: indicatorItem.sample_size || 0
          });
        }
      });

      // Sort districts by worst performance (highest for reverse indicators, lowest for normal)
      const sortedDistricts = districtValues.sort((a, b) => {
        if (isReverse) {
          return b.value - a.value; // Higher is worse for reverse indicators
        } else {
          return a.value - b.value; // Lower is worse for normal indicators
        }
      });

      // Get top 5 worst districts
      const top5Worst = sortedDistricts.slice(0, 5);

      return {
        group: group.value,
        groupLabel: group.label,
        color: group.color,
        chartData: top5Worst,
        totalDistricts: districtValues.length
      };
    });

    return populationGroupData;
  }, [selectedIndicator, getIndicatorData, getAvailableDistricts]);

  const selectedIndicatorObj = availableIndicators.find(ind => ind.value === selectedIndicator);
  const isReverse = reverseIndicators[selectedIndicator];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Indicator Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">🔥 Hot Issues by Indicator</h2>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Indicator to Analyze
          </label>
          <select 
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
            className="w-full max-w-md p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {availableIndicators.map(indicator => (
              <option key={indicator.value} value={indicator.value}>
                {indicator.label}
              </option>
            ))}
          </select>
        </div>
        
        <p className="text-sm text-gray-600">
          Showing top 5 {isReverse ? 'worst performing' : 'lowest performing'} districts for{' '}
          <span className="font-medium text-red-600">{selectedIndicatorObj?.label}</span> across all population groups.
          {isReverse ? ' Higher percentages indicate worse outcomes.' : ' Lower percentages indicate worse outcomes.'}
        </p>
      </div>

      {/* Charts for Each Population Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {getIndicatorChartData.map((groupData, index) => (
          <div key={groupData.group} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div 
                className="w-4 h-4 rounded-full mr-3" 
                style={{ backgroundColor: groupData.color }}
              ></div>
              <h3 className="text-lg font-medium text-gray-900">
                {selectedIndicatorObj?.label} - {groupData.groupLabel}
              </h3>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                Top 5 {isReverse ? 'Worst' : 'Lowest'} Districts (out of {groupData.totalDistricts})
              </div>
              {/* Debug info - remove this later */}
              <div className="text-xs text-gray-400 mb-2">
                Data points: {groupData.chartData.length} | 
                Sample data: {groupData.chartData[0] ? `${groupData.chartData[0].district}: ${groupData.chartData[0].value}%` : 'No data'}
              </div>
            </div>

            {/* Chart */}
            {groupData.chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={groupData.chartData} 
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                  >
                    <XAxis 
                      type="number" 
                      domain={[0, 'dataMax + 10']} 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="district" 
                      width={110}
                      tick={{ fontSize: 10 }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#dc2626"
                      stroke="#b91c1c"
                      strokeWidth={1}
                      radius={[0, 4, 4, 0]}
                      minPointSize={5}
                    >
                      {groupData.chartData.map((entry, cellIndex) => (
                        <Cell 
                          key={`cell-${cellIndex}`} 
                          fill={isReverse ? 
                            (entry.value > 75 ? '#dc2626' : 
                             entry.value > 50 ? '#ea580c' : 
                             entry.value > 25 ? '#d97706' : '#ca8a04') :
                            (entry.value < 25 ? '#dc2626' : 
                             entry.value < 50 ? '#ea580c' : 
                             entry.value < 75 ? '#d97706' : '#ca8a04')
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p>No data available</p>
                  <p className="text-sm mt-1">for this population group</p>
                </div>
              </div>
            )}

            {/* District Rankings */}
            <div className="mt-4 space-y-2">
              {groupData.chartData.slice(0, 5).map((district, index) => (
                <div key={district.district} className="flex justify-between text-xs">
                  <span className={`${
                    index === 0 ? 'text-red-600 font-bold' : 
                    index === 1 ? 'text-red-500' : 
                    'text-gray-600'
                  }`}>
                    #{index + 1}. {district.district}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-red-600">{district.value.toFixed(1)}%</span>
                    <span className="text-gray-400">({district.sampleSize})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-medium text-red-800 mb-2">📊 Analysis Summary</h3>
        <p className="text-sm text-red-700">
          This analysis shows the top 5 {isReverse ? 'worst performing' : 'lowest performing'} districts for{' '}
          <strong>{selectedIndicatorObj?.label}</strong> across all population groups. Districts with{' '}
          {isReverse ? 'higher percentages' : 'lower percentages'} require immediate attention and targeted interventions.
        </p>
        <div className="mt-3 text-xs text-red-600">
          <strong>Sample sizes shown in parentheses.</strong> Colors indicate severity levels from yellow (less severe) to dark red (most severe).
        </div>
      </div>
    </div>
  );
};

export default HotIssuesDashboard;