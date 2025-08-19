// Updated PopulationGroupSpiderChart with Language Support and Normal Population - FIXED
import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

const PopulationGroupSpiderChart = ({ getIndicatorData, selectedDistrict }) => {
  const { t, language } = useLanguage();
  const [scaleMode, setScaleMode] = useState('dynamic'); // 'full' or 'dynamic'
  
  // Updated to include normal_population with purple color
  const populationGroups = [
    { value: 'informal_workers', color: '#ef4444' },
    { value: 'elderly', color: '#3b82f6' },
    { value: 'disabled', color: '#10b981' },
    { value: 'lgbtq', color: '#f59e0b' },
    { value: 'normal_population', color: '#8b5cf6' } // Added normal population
  ];

  const domains = [
    'economic_security',
    'education', 
    'healthcare_access',
    'physical_environment',
    'social_context',
    'health_behaviors'
  ];

  // Prepare data for the spider chart
  const chartData = domains.map(domain => {
    const dataPoint = {
      domain: t(`domains.${domain}`),
      fullDomain: domain
    };

    populationGroups.forEach(group => {
      try {
        const indicatorData = getIndicatorData(domain, selectedDistrict, group.value);
        
        // Find domain score, handle both old and new data structures
        const domainScore = indicatorData.find(item => 
          item.isDomainScore || 
          item.indicator === '_domain_score' || 
          item.label?.toLowerCase().includes('score')
        );
        
        // Set the value, ensuring it's a valid number
        let scoreValue = 0;
        if (domainScore && domainScore.value !== null && domainScore.value !== undefined) {
          scoreValue = parseFloat(domainScore.value);
          // Ensure it's a valid number
          if (isNaN(scoreValue) || !isFinite(scoreValue)) {
            scoreValue = 0;
          }
        }
        
        dataPoint[group.value] = scoreValue;
        
      } catch (error) {
        dataPoint[group.value] = 0;
      }
    });

    return dataPoint;
  });

  // Calculate dynamic scale range
  const allValues = chartData.flatMap(d => 
    populationGroups.map(group => d[group.value] || 0)
  ).filter(val => !isNaN(val) && isFinite(val));
  
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100;
  
  // Create more dramatic scale
  let scaleMin, scaleMax;
  if (scaleMode === 'dynamic' && allValues.length > 0) {
    // Use a tighter range around the actual data
    const range = maxValue - minValue;
    const padding = Math.max(range * 0.2, 5); // At least 5 point padding
    scaleMin = Math.max(0, Math.floor(minValue - padding));
    scaleMax = Math.min(100, Math.ceil(maxValue + padding));
    
    // Ensure minimum range for visibility
    if (scaleMax - scaleMin < 20) {
      const center = (scaleMax + scaleMin) / 2;
      scaleMin = Math.max(0, center - 10);
      scaleMax = Math.min(100, center + 10);
    }
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
        const originalValue = d[group.value] || 0;
        const scaledValue = scaleMax > scaleMin ? 
          ((originalValue - scaleMin) / (scaleMax - scaleMin)) * 100 : 0;
        transformed[group.value] = Math.max(0, Math.min(100, scaledValue));
        transformed[`${group.value}_original`] = originalValue; // Keep original for tooltips
      });
    } else {
      populationGroups.forEach(group => {
        transformed[group.value] = d[group.value] || 0;
        transformed[`${group.value}_original`] = d[group.value] || 0;
      });
    }
    return transformed;
  });

  // Custom tick formatter to wrap long labels
  const formatTick = (value) => {
    if (typeof value !== 'string') return value;
    if (value.length > 12) {
      const words = value.split(' ');
      if (words.length > 1) {
        return words[0] + '\n' + words.slice(1).join(' ');
      }
    }
    return value;
  };

  // Custom tooltip to show original values
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => {
            const originalValue = transformedData.find(d => d.domain === label)?.[`${entry.dataKey}_original`] || 0;
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {t(`populationGroups.${entry.dataKey}`)}: {originalValue.toFixed(1)}%
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('ui.spiderChartTitle')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('ui.spiderChartDescription')} {
                selectedDistrict === 'Bangkok Overall' && language === 'th'
                  ? t('ui.bangkokOverall') 
                  : selectedDistrict
              }
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
              {t('ui.dynamicScale')}
            </button>
            <button
              onClick={() => setScaleMode('full')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                scaleMode === 'full' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('ui.fullScale')}
            </button>
          </div>
        </div>
      </div>

      {/* Check if we have valid data */}
      {allValues.length === 0 || allValues.every(val => val === 0) ? (
        <div className="h-96 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">
              {language === 'th' ? 'ไม่มีข้อมูลสำหรับการแสดงผล' : 'No data available for visualization'}
            </p>
            <p className="text-sm">
              {language === 'th' ? 'กรุณาเลือกเขตหรือกลุ่มประชากรอื่น' : 'Please select a different district or population group'}
            </p>
          </div>
        </div>
      ) : (
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
                  if (scaleMode === 'dynamic' && scaleMax > scaleMin) {
                    const actualValue = scaleMin + (value / 100) * (scaleMax - scaleMin);
                    return actualValue.toFixed(0);
                  }
                  return value;
                }}
              />
              
              {populationGroups.map(group => (
                <Radar
                  key={group.value}
                  name={t(`populationGroups.${group.value}`)}
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
      )}

      {/* Domain Rankings */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-800 mb-3">{t('ui.domainPerformanceRankings')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {populationGroups.map(group => {
            const groupScores = chartData.map(d => ({
              domain: d.domain,
              score: d[group.value] || 0
            })).sort((a, b) => b.score - a.score);

            return (
              <div key={group.value} className="bg-gray-50 p-3 rounded">
                <div className="flex items-center mb-2">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <h5 className="font-medium text-sm">{t(`populationGroups.${group.value}`)}</h5>
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
        <p><strong>{t('ui.howToRead')}:</strong> {t('ui.spiderChartInstructions')}</p>
      </div>
    </div>
  );
};

export default PopulationGroupSpiderChart;