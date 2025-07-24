import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const HotIssuesDashboard = ({ getAvailableDistricts, getAvailableDomains, getIndicatorData }) => {
  const [selectedView, setSelectedView] = useState('population'); // 'population' or 'district'

  const populationGroups = [
    { value: 'informal_workers', label: 'แรงงานนอกระบบ', color: '#ef4444' },
    { value: 'elderly', label: 'ผู้สูงอายุ', color: '#3b82f6' },
    { value: 'disabled', label: 'คนพิการ', color: '#10b981' },
    { value: 'lgbtq', label: 'LGBT สุขภาพ', color: '#f59e0b' }
  ];

  // Define reverse indicators (red when high)
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

  // Get hot issues (red status indicators)
  const getHotIssues = useMemo(() => {
    if (!getIndicatorData) return { byPopulation: [], byDistrict: [] };

    const domains = getAvailableDomains();
    const districts = getAvailableDistricts().filter(d => d !== 'Bangkok Overall');
    const hotIssues = [];

    // Collect all indicators with their performance across groups/districts
    domains.forEach(domain => {
      populationGroups.forEach(group => {
        const bangkokData = getIndicatorData(domain, 'Bangkok Overall', group.value);
        
        bangkokData.forEach(item => {
          if (!item.isDomainScore && item.indicator) {
            const isReverse = reverseIndicators[item.indicator];
            const value = item.value || 0;
            
            // Determine if it's a "hot issue" (red status)
            let isHotIssue = false;
            if (isReverse) {
              isHotIssue = value > 60; // High values are bad for reverse indicators
            } else {
              isHotIssue = value < 40; // Low values are bad for normal indicators
            }

            if (isHotIssue) {
              hotIssues.push({
                indicator: item.indicator,
                label: item.label,
                domain,
                group: group.value,
                groupLabel: group.label,
                value: value,
                isReverse: isReverse
              });
            }
          }
        });
      });
    });

    // Group by population
    const byPopulation = populationGroups.map(group => {
      const groupIssues = hotIssues.filter(issue => issue.group === group.value);
      const topIssues = groupIssues
        .sort((a, b) => {
          // Sort by severity (reverse indicators: higher is worse, normal: lower is worse)
          if (a.isReverse && b.isReverse) return b.value - a.value;
          if (!a.isReverse && !b.isReverse) return a.value - b.value;
          return 0;
        })
        .slice(0, 5);

      return {
        group: group.value,
        groupLabel: group.label,
        color: group.color,
        issues: topIssues,
        totalHotIssues: groupIssues.length
      };
    }).filter(item => item.issues.length > 0);

    // Group by district (top 5 worst districts)
    const districtHotIssues = {};
    
    districts.forEach(district => {
      const districtIssues = [];
      
      domains.forEach(domain => {
        populationGroups.forEach(group => {
          const districtData = getIndicatorData(domain, district, group.value);
          
          districtData.forEach(item => {
            if (!item.isDomainScore && item.indicator) {
              const isReverse = reverseIndicators[item.indicator];
              const value = item.value || 0;
              
              let isHotIssue = false;
              if (isReverse) {
                isHotIssue = value > 60;
              } else {
                isHotIssue = value < 40;
              }

              if (isHotIssue) {
                districtIssues.push({
                  indicator: item.indicator,
                  label: item.label,
                  domain,
                  group: group.value,
                  groupLabel: group.label,
                  value: value,
                  isReverse: isReverse
                });
              }
            }
          });
        });
      });

      if (districtIssues.length > 0) {
        districtHotIssues[district] = {
          district,
          issues: districtIssues,
          totalHotIssues: districtIssues.length,
          averageSeverity: districtIssues.reduce((sum, issue) => {
            return sum + (issue.isReverse ? issue.value : (100 - issue.value));
          }, 0) / districtIssues.length
        };
      }
    });

    const byDistrict = Object.values(districtHotIssues)
      .sort((a, b) => b.totalHotIssues - a.totalHotIssues)
      .slice(0, 5);

    return { byPopulation, byDistrict };
  }, [getAvailableDomains, getAvailableDistricts, getIndicatorData]);

  const hotIssuesData = getHotIssues;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">🔥 Hot Issues Analysis</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedView('population')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                selectedView === 'population' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              By Population Group
            </button>
            <button
              onClick={() => setSelectedView('district')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                selectedView === 'district' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Top 5 Districts
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          Hot issues are indicators with poor performance that require immediate intervention. 
          Red status indicates values that pose significant health equity concerns.
        </p>
      </div>

      {/* Population Group View */}
      {selectedView === 'population' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotIssuesData.byPopulation.map((groupData, index) => (
            <div key={groupData.group} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div 
                  className="w-4 h-4 rounded-full mr-3" 
                  style={{ backgroundColor: groupData.color }}
                ></div>
                <h3 className="text-lg font-medium text-gray-900">
                  กลุ่ม{groupData.groupLabel}
                </h3>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  Total Hot Issues: <span className="font-medium text-red-600">{groupData.totalHotIssues}</span>
                </div>
              </div>

              {/* Top 5 Issues Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={groupData.issues} 
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis 
                      type="category" 
                      dataKey="label" 
                      width={90}
                      tick={{ fontSize: 10 }}
                    />
                    <Bar dataKey="value" name="Issue Severity">
                      {groupData.issues.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={'#dc2626'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Issue Details */}
              <div className="mt-4 space-y-2">
                {groupData.issues.slice(0, 3).map((issue, index) => (
                  <div key={issue.indicator} className="flex justify-between text-xs">
                    <span className="text-gray-600">{index + 1}. {issue.label}</span>
                    <span className="font-medium text-red-600">{issue.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* District View */}
      {selectedView === 'district' && (
        <div className="space-y-6">
          {hotIssuesData.byDistrict.map((districtData, index) => (
            <div key={districtData.district} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {districtData.district}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Rank #{index + 1} • {districtData.totalHotIssues} Critical Issues
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {districtData.totalHotIssues}
                  </div>
                  <div className="text-xs text-gray-500">Hot Issues</div>
                </div>
              </div>

              {/* Issues by Population Group in this District */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {populationGroups.map(group => {
                  const groupIssues = districtData.issues.filter(issue => issue.group === group.value);
                  const issueCount = groupIssues.length;
                  const totalIssues = districtData.totalHotIssues;
                  const percentage = totalIssues > 0 ? (issueCount / totalIssues) * 100 : 0;

                  return (
                    <div key={group.value} className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#e5e7eb"
                            strokeWidth="4"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke={group.color}
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${(percentage / 100) * 175.93} 175.93`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold" style={{ color: group.color }}>
                            {issueCount}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">{group.label}</div>
                      <div className="text-xs font-medium" style={{ color: group.color }}>
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-medium text-red-800 mb-2">🚨 Action Required</h3>
        <p className="text-sm text-red-700">
          These hot issues represent critical health equity gaps that require immediate policy intervention 
          and resource allocation. Focus on the highest-impact indicators for maximum improvement in population health outcomes.
        </p>
      </div>
    </div>
  );
};

export default HotIssuesDashboard;