// Updated PopulationGroupSpiderChart with better spacing and layout
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
    
    // For Thai text, split at spaces or after certain characters
    if (language === 'th') {
      if (value.length > 10) {
        const words = value.split(' ');
        if (words.length > 1) {
          const mid = Math.ceil(words.length / 2);
          return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ');
        }
        // If no spaces, try to break at reasonable points
        if (value.length > 15) {
          const breakPoint = Math.floor(value.length / 2);
          return value.substring(0, breakPoint) + '\n' + value.substring(breakPoint);
        }
      }
    } else {
      // For English text
      if (value.length > 12) {
        const words = value.split(' ');
        if (words.length > 1) {
          const mid = Math.ceil(words.length / 2);
          return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ');
        }
      }
    }
    return value;
  };

  // Custom tooltip to show original values
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold mb-3 text-gray-800">{label}</p>
          {payload.map((entry, index) => {
            const originalValue = transformedData.find(d => d.domain === label)?.[`${entry.dataKey}_original`] || 0;
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm mb-1">
                <span className="font-medium">{t(`populationGroups.${entry.dataKey}`)}</span>: <span className="font-semibold">{originalValue.toFixed(1)}%</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {t('ui.spiderChartTitle')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t('ui.spiderChartDescription')} {
                selectedDistrict === 'Bangkok Overall' && language === 'th'
                  ? t('ui.bangkokOverall') 
                  : selectedDistrict
              }
            </p>
          </div>
          
          {/* Scale Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 flex-shrink-0">
            <button
              onClick={() => setScaleMode('dynamic')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                scaleMode === 'dynamic' 
                  ? 'bg-white text-gray-900 shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('ui.dynamicScale')}
            </button>
            <button
              onClick={() => setScaleMode('full')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                scaleMode === 'full' 
                  ? 'bg-white text-gray-900 shadow-md' 
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
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">
              {language === 'th' ? 'ไม่มีข้อมูลสำหรับการแสดงผล' : 'No data available for visualization'}
            </p>
            <p className="text-sm text-gray-400">
              {language === 'th' ? 'กรุณาเลือกเขตหรือกลุ่มประชากรอื่น' : 'Please select a different district or population group'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Spider Chart - Increased size */}
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={transformedData} margin={{ top: 40, right: 120, bottom: 40, left: 120 }}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis 
                  dataKey="domain" 
                  className="text-sm font-medium"
                  tick={{ 
                    fontSize: 13, 
                    fill: '#374151',
                    fontWeight: 500
                  }}
                  tickFormatter={formatTick}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
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
                    fillOpacity={0.1}
                    strokeWidth={3}
                    dot={{ fill: group.color, strokeWidth: 2, r: 5 }}
                  />
                ))}
                
                <Legend 
                  wrapperStyle={{
                    paddingTop: '30px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Domain Rankings - Improved layout */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-6">{t('ui.domainPerformanceRankings')}</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {populationGroups.map(group => {
                const groupScores = chartData.map(d => ({
                  domain: d.domain,
                  score: d[group.value] || 0
                })).sort((a, b) => b.score - a.score);

                return (
                  <div key={group.value} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div 
                        className="w-4 h-4 rounded-full mr-3 flex-shrink-0" 
                        style={{ backgroundColor: group.color }}
                      ></div>
                      <h5 className="font-semibold text-gray-800 text-base">{t(`populationGroups.${group.value}`)}</h5>
                    </div>
                    <div className="space-y-3">
                      {groupScores.map((item, index) => (
                        <div key={item.domain} className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${
                            index < 2 ? 'text-green-700' : index >= 4 ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            {index + 1}. {item.domain}
                          </span>
                          <span className="font-bold text-gray-900 text-sm">{item.score.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">{t('ui.howToRead')}:</p>
                <p className="text-sm text-blue-800 leading-relaxed">{t('ui.spiderChartInstructions')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopulationGroupSpiderChart;