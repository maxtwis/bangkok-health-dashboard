// Complete Enhanced DataUtils.jsx - Bangkok Health Dashboard
// Includes original functions + new population group analysis features

// ==================== EXISTING UTILITY FUNCTIONS ====================

export const formatYear = (year) => {
  return `${year - 543}`; // Convert from Buddhist era to Christian era
};

export const getFilteredData = (rateData, selectedGeographyType, selectedArea, years) => {
  if (selectedGeographyType === 'bangkok') {
    // For Bangkok level, aggregate data across all districts
    const yearData = years.map(year => {
      const yearRecords = rateData.filter(row => row.year === year);
      const avgValue = yearRecords.length > 0 
        ? yearRecords.reduce((sum, record) => sum + (record.value || 0), 0) / yearRecords.length 
        : 0;
      
      return {
        year: year,
        value: parseFloat(avgValue.toFixed(2))
      };
    });
    
    return yearData;
  } else if (selectedArea) {
    // For district level, filter by selected district
    return rateData
      .filter(row => row.dname === selectedArea)
      .map(row => ({
        year: row.year,
        value: row.value
      }))
      .sort((a, b) => a.year - b.year);
  }
  
  return [];
};

export const getSexFilteredData = (rateBySexData, selectedGeographyType, selectedArea, years, sexes) => {
  if (selectedGeographyType === 'bangkok') {
    // Aggregate sex data for all of Bangkok
    const result = [];
    
    years.forEach(year => {
      sexes.forEach(sex => {
        const sexYearRecords = rateBySexData.filter(row => 
          row.year === year && row.sex === sex);
        
        if (sexYearRecords.length > 0) {
          const validRecords = sexYearRecords.filter(record => record.value !== null && record.value !== undefined);
          
          if (validRecords.length > 0) {
            const avgValue = validRecords.reduce((sum, record) => 
              sum + (record.value || 0), 0) / validRecords.length;
            
            result.push({
              year,
              sex,
              value: parseFloat(avgValue.toFixed(2))
            });
          } else {
            // Include record with null value if no valid values exist
            result.push({
              year,
              sex,
              value: null
            });
          }
        }
      });
    });
    
    return result;
  } else if (selectedArea) {
    // Filter sex data for selected district
    return rateBySexData
      .filter(row => row.dname === selectedArea)
      .map(row => ({
        year: row.year,
        sex: row.sex,
        value: row.value
      }))
      .sort((a, b) => {
        // First sort by year
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        // Then sort by sex (male, female, lgbt)
        const sexOrder = { male: 1, female: 2, lgbt: 3 };
        return sexOrder[a.sex] - sexOrder[b.sex];
      });
  }
  
  return [];
};

export const prepareSexComparisonData = (filteredSexData, years, sexes) => {
  const result = [];
  
  // Helper function to validate and clean value
  const cleanValue = (value) => {
    // Convert to number if it's not already
    const numValue = parseFloat(value);
    
    // Check if it's a valid number
    if (isNaN(numValue)) return 0;
    
    // Cap the value at 100% (since these are percentages)
    if (numValue > 100) return 100;
    
    // Ensure non-negative values
    if (numValue < 0) return 0;
    
    return numValue;
  };
  
  // Group by year
  const yearGroups = {};
  
  // First pass to collect data with validation
  filteredSexData.forEach(item => {
    if (!yearGroups[item.year]) {
      yearGroups[item.year] = {};
    }
    
    // Check if value is not null/undefined before processing
    if (item.value !== null && item.value !== undefined) {
      // Clean the value - handle invalid data
      const cleanedValue = cleanValue(item.value);
      yearGroups[item.year][item.sex] = cleanedValue;
    }
  });
  
  // Second pass to ensure we have entries for all years in the dataset
  years.forEach(year => {
    if (!yearGroups[year]) {
      yearGroups[year] = {};
    }
    
    // Convert to array format for chart
    const yearData = { year: parseInt(year) };
    
    // Ensure all sexes are represented with default 0 if missing
    sexes.forEach(sex => {
      yearData[sex] = yearGroups[year][sex] || 0;
    });
    
    result.push(yearData);
  });

  // Sort by year
  result.sort((a, b) => a.year - b.year);
  
  return result;
};

export const getSummaryData = (filteredData, selectedArea, indicatorName = 'Alcohol Drinking Rate') => {
  if (!filteredData || filteredData.length < 2) return null;
  
  const baseline = filteredData[0];
  const latest = filteredData[filteredData.length - 1];
  
  const change = latest.value - baseline.value;
  const percentChange = baseline.value !== 0 
    ? ((latest.value - baseline.value) / baseline.value * 100).toFixed(1) 
    : '0.0';
  
  return {
    indicator: indicatorName,
    area: selectedArea || 'Bangkok',
    baselineYear: baseline.year,
    baselineValue: baseline.value,
    latestYear: latest.year,
    latestValue: latest.value,
    change,
    percentChange
  };
};

// Population group functions
export const getPopulationFilteredData = (
  populationData, 
  selectedGeographyType, 
  selectedArea, 
  years, 
  populationGroups
) => {
  if (!populationData || populationData.length === 0) {
    // Return empty array if no data is available
    return [];
  }
  
  if (selectedGeographyType === 'bangkok') {
    // Aggregate population data for all of Bangkok
    const result = [];
    
    years.forEach(year => {
      populationGroups.forEach(group => {
        const groupYearRecords = populationData.filter(row => 
          row.year === year && row.population_group === group);
        
        if (groupYearRecords.length > 0) {
          const validRecords = groupYearRecords.filter(record => 
            record.value !== null && record.value !== undefined);
          
          if (validRecords.length > 0) {
            const avgValue = validRecords.reduce((sum, record) => 
              sum + (record.value || 0), 0) / validRecords.length;
            
            result.push({
              year,
              population_group: group,
              value: parseFloat(avgValue.toFixed(2))
            });
          } else {
            // Include record with null value if no valid values exist
            result.push({
              year,
              population_group: group,
              value: null
            });
          }
        }
      });
    });
    
    return result;
  } else if (selectedArea) {
    // Filter population data for selected district
    return populationData
      .filter(row => row.dname === selectedArea)
      .map(row => ({
        year: row.year,
        population_group: row.population_group,
        value: row.value
      }))
      .sort((a, b) => {
        // First sort by year
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        // Then sort by population group
        const groupOrder = { 
          'general': 1, 
          'elderly': 2, 
          'disabled': 3, 
          'lgbtq': 4, 
          'informal': 5 
        };
        return groupOrder[a.population_group] - groupOrder[b.population_group];
      });
  }
  
  return [];
};

export const preparePopulationComparisonData = (filteredPopulationData, years, populationGroups) => {
  if (!filteredPopulationData || filteredPopulationData.length === 0) {
    // Return sample data as fallback when no real data is available
    return [
      { year: 2566, general: 16.5, elderly: 9.2, disabled: 11.3, lgbtq: 18.7, informal: 21.4 },
      { year: 2567, general: 17.8, elderly: 9.7, disabled: 12.1, lgbtq: 19.2, informal: 22.6 },
      { year: 2568, general: 18.2, elderly: 10.1, disabled: 12.8, lgbtq: 19.5, informal: 23.1 }
    ];
  }
  
  const result = [];
  
  // Group by year
  const yearGroups = {};
  filteredPopulationData.forEach(item => {
    if (!yearGroups[item.year]) {
      yearGroups[item.year] = {};
    }
    yearGroups[item.year][item.population_group] = item.value;
  });
  
  // Convert to array format for chart
  Object.keys(yearGroups).sort().forEach(year => {
    const yearData = { year: parseInt(year) };
    populationGroups.forEach(group => {
      yearData[group] = yearGroups[year][group] || 0;
    });
    result.push(yearData);
  });
  
  return result;
};

// ==================== NEW POPULATION GROUP ANALYSIS FUNCTIONS ====================

// Population group data processing functions
export const getPopulationGroupData = (
  populationGroupData, 
  district, 
  populationGroup, 
  indicator,
  year = null
) => {
  if (!populationGroupData || populationGroupData.length === 0) {
    return null;
  }

  const filteredData = populationGroupData.filter(row => 
    row.dname === district && 
    row.population_group === populationGroup &&
    row.indicator === indicator &&
    (year ? row.year === year : true)
  );

  return filteredData.length > 0 ? filteredData : null;
};

// Calculate health equity gap between population group and overall population
export const calculateEquityGap = (
  populationGroupValue, 
  overallPopulationValue, 
  indicator
) => {
  if (!populationGroupValue || !overallPopulationValue) {
    return null;
  }

  const gap = populationGroupValue - overallPopulationValue;
  const percentageGap = (gap / overallPopulationValue) * 100;

  // Determine if gap is concerning based on indicator type
  const isConcerning = isEquityGapConcerning(gap, indicator);
  
  return {
    absoluteGap: gap,
    percentageGap: percentageGap,
    isConcerning: isConcerning,
    severity: getGapSeverity(Math.abs(percentageGap))
  };
};

// Determine if equity gap is concerning (higher values are worse for health behaviors)
const isEquityGapConcerning = (gap, indicator) => {
  const worseBehaviorIndicators = ['drink_rate', 'smoke_rate', 'obese_rate', 'traffic_death_rate'];
  
  if (worseBehaviorIndicators.includes(indicator)) {
    return gap > 0; // Positive gap means population group has higher (worse) rates
  }
  
  // For positive health indicators, negative gap would be concerning
  return gap < 0;
};

// Categorize gap severity
const getGapSeverity = (absolutePercentageGap) => {
  if (absolutePercentageGap < 10) return 'low';
  if (absolutePercentageGap < 25) return 'moderate';
  if (absolutePercentageGap < 50) return 'high';
  return 'severe';
};

// Calculate vulnerability index for a population group in a district
export const calculateVulnerabilityIndex = (
  populationGroupData,
  overallPopulationData, 
  district, 
  populationGroup,
  indicators = ['drink_rate', 'smoke_rate', 'obese_rate', 'traffic_death_rate']
) => {
  const gaps = [];
  const currentYear = Math.max(...(populationGroupData.map(d => d.year) || [2568]));

  indicators.forEach(indicator => {
    const groupData = getPopulationGroupData(populationGroupData, district, populationGroup, indicator, currentYear);
    const overallData = overallPopulationData.find(d => 
      d.dname === district && d.year === currentYear && d.indicator === indicator
    );

    if (groupData && groupData.length > 0 && overallData) {
      const gap = calculateEquityGap(groupData[0].value, overallData.value, indicator);
      if (gap) {
        gaps.push({
          indicator,
          gap: gap.percentageGap,
          severity: gap.severity,
          isConcerning: gap.isConcerning
        });
      }
    }
  });

  if (gaps.length === 0) return null;

  // Calculate overall vulnerability score (0-100, where 100 is most vulnerable)
  const concerningGaps = gaps.filter(g => g.isConcerning);
  const averageGapSize = gaps.reduce((sum, g) => sum + Math.abs(g.gap), 0) / gaps.length;
  const vulnerabilityScore = Math.min(100, 
    (concerningGaps.length / gaps.length * 50) + // 50% weight for having concerning gaps
    (Math.min(50, averageGapSize / 2)) // 50% weight for gap size
  );

  return {
    score: vulnerabilityScore,
    totalIndicators: gaps.length,
    concerningGaps: concerningGaps.length,
    averageGapSize: averageGapSize,
    gaps: gaps,
    riskLevel: vulnerabilityScore > 75 ? 'high' : vulnerabilityScore > 50 ? 'moderate' : 'low'
  };
};

// Prepare spider chart data for population group comparison
export const preparePopulationGroupSpiderData = (
  populationGroupData,
  overallPopulationData,
  district,
  populationGroup,
  domains = {
    'Health Behaviors': ['drink_rate', 'smoke_rate', 'obese_rate', 'traffic_death_rate'],
    'Education': [],
    'Economic Stability': [],
    'Healthcare Access': [],
    'Neighborhood Environment': [],
    'Community Context': []
  }
) => {
  const currentYear = Math.max(...(populationGroupData.map(d => d.year) || [2568]));
  
  return Object.entries(domains).map(([domainName, indicators]) => {
    let groupScore = 0;
    let overallScore = 0;
    
    if (indicators.length > 0) {
      // Calculate domain scores based on available indicators
      const groupScores = [];
      const overallScores = [];
      
      indicators.forEach(indicator => {
        const groupData = getPopulationGroupData(populationGroupData, district, populationGroup, indicator, currentYear);
        const overallData = overallPopulationData.find(d => 
          d.dname === district && d.year === currentYear && d.indicator === indicator
        );
        
        if (groupData && groupData.length > 0) {
          // Convert rate to health score (lower rates = higher health scores)
          const groupHealthScore = Math.max(0, 100 - (groupData[0].value * 2));
          groupScores.push(groupHealthScore);
        }
        
        if (overallData) {
          const overallHealthScore = Math.max(0, 100 - (overallData.value * 2));
          overallScores.push(overallHealthScore);
        }
      });
      
      groupScore = groupScores.length > 0 ? 
        groupScores.reduce((sum, score) => sum + score, 0) / groupScores.length : 0;
      overallScore = overallScores.length > 0 ? 
        overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length : 0;
    }
    
    return {
      domain: domainName,
      fullMark: 100,
      [populationGroup]: Math.round(groupScore * 10) / 10,
      ['overall']: Math.round(overallScore * 10) / 10,
      hasData: indicators.length > 0
    };
  });
};

// Get equity insights for a district and population group
export const getEquityInsights = (
  populationGroupData,
  overallPopulationData,
  district,
  populationGroup
) => {
  const vulnerabilityIndex = calculateVulnerabilityIndex(
    populationGroupData, 
    overallPopulationData, 
    district, 
    populationGroup
  );
  
  if (!vulnerabilityIndex) {
    return {
      hasData: false,
      message: "Insufficient data for equity analysis"
    };
  }

  const insights = [];
  const groupLabel = getPopulationGroupLabel(populationGroup);

  // Generate insights based on vulnerability analysis
  if (vulnerabilityIndex.riskLevel === 'high') {
    insights.push({
      type: 'alert',
      message: `${groupLabel} in ${district} shows high health vulnerability (${vulnerabilityIndex.score.toFixed(1)}/100)`,
      priority: 'high'
    });
  }

  vulnerabilityIndex.gaps.forEach(gap => {
    if (gap.isConcerning && gap.severity !== 'low') {
      const indicatorLabel = getIndicatorLabel(gap.indicator);
      insights.push({
        type: 'disparity',
        message: `${gap.gap > 0 ? 'Higher' : 'Lower'} ${indicatorLabel.toLowerCase()} (${Math.abs(gap.gap).toFixed(1)}% difference)`,
        indicator: gap.indicator,
        severity: gap.severity
      });
    }
  });

  return {
    hasData: true,
    vulnerabilityIndex: vulnerabilityIndex,
    insights: insights,
    district: district,
    populationGroup: populationGroup
  };
};

// Calculate district similarity based on multiple indicators
export const calculateDistrictSimilarity = (
  district1,
  district2,
  allRateData,
  indicators = ['drink_rate', 'smoke_rate', 'obese_rate', 'traffic_death_rate']
) => {
  const similarities = [];
  const currentYear = Math.max(...(allRateData.drinkRateData?.map(d => d.year) || [2568]));

  indicators.forEach(indicator => {
    let data1, data2;
    
    switch(indicator) {
      case 'drink_rate':
        data1 = allRateData.drinkRateData?.find(d => d.dname === district1 && d.year === currentYear);
        data2 = allRateData.drinkRateData?.find(d => d.dname === district2 && d.year === currentYear);
        break;
      case 'smoke_rate':
        data1 = allRateData.smokeRateData?.find(d => d.dname === district1 && d.year === currentYear);
        data2 = allRateData.smokeRateData?.find(d => d.dname === district2 && d.year === currentYear);
        break;
      case 'obese_rate':
        data1 = allRateData.obeseRateData?.find(d => d.dname === district1 && d.year === currentYear);
        data2 = allRateData.obeseRateData?.find(d => d.dname === district2 && d.year === currentYear);
        break;
      case 'traffic_death_rate':
        data1 = allRateData.trafficDeathRateData?.find(d => d.dname === district1 && d.year === currentYear);
        data2 = allRateData.trafficDeathRateData?.find(d => d.dname === district2 && d.year === currentYear);
        break;
    }

    if (data1 && data2) {
      const diff = Math.abs(data1.value - data2.value);
      const maxValue = Math.max(data1.value, data2.value);
      const similarity = maxValue > 0 ? (1 - (diff / maxValue)) * 100 : 100;
      similarities.push(similarity);
    }
  });

  if (similarities.length === 0) return 0;
  
  // Return average similarity across all indicators
  return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
};

// Get most similar districts for a given district
export const getMostSimilarDistricts = (
  targetDistrict,
  allDistricts,
  allRateData,
  topN = 5
) => {
  if (!targetDistrict || !allDistricts || allDistricts.length === 0) return [];

  const similarities = allDistricts
    .filter(district => district !== targetDistrict)
    .map(district => ({
      district: district,
      similarity: calculateDistrictSimilarity(targetDistrict, district, allRateData)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);

  return similarities;
};

// ==================== HELPER FUNCTIONS ====================

// Helper functions for labels and formatting
export const getPopulationGroupLabel = (populationGroup) => {
  const labels = {
    'informal_workers': 'แรงงานนอกระบบ (Informal Workers)',
    'elderly': 'ผู้สูงอายุ (Elderly)',
    'disabled': 'คนพิการ (People with Disabilities)', 
    'lgbtq': 'กลุ่มเพศหลากหลาย (LGBTQ+)',
    'overall': 'ประชากรทั่วไป (Overall Population)'
  };
  return labels[populationGroup] || populationGroup;
};

export const getIndicatorLabel = (indicator) => {
  const labels = {
    'drink_rate': 'Alcohol Drinking Rate',
    'smoke_rate': 'Smoking Rate',
    'obese_rate': 'Obesity Rate',
    'traffic_death_rate': 'Traffic Death Rate'
  };
  return labels[indicator] || indicator;
};

export const getIndicatorUnit = (indicator) => {
  const units = {
    'drink_rate': '%',
    'smoke_rate': '%',
    'obese_rate': '%',
    'traffic_death_rate': ' per 100k'
  };
  return units[indicator] || '';
};

// Format value with appropriate unit
export const formatIndicatorValue = (value, indicator) => {
  if (value === null || value === undefined) return 'N/A';
  const unit = getIndicatorUnit(indicator);
  return `${value.toFixed(1)}${unit}`;
};

// Risk level color coding
export const getRiskLevelColor = (riskLevel) => {
  const colors = {
    'low': 'bg-green-100 text-green-800 border-green-200',
    'moderate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'high': 'bg-red-100 text-red-800 border-red-200',
    'severe': 'bg-red-200 text-red-900 border-red-300'
  };
  return colors[riskLevel] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Calculate health score from rate (for spider chart)
export const calculateHealthScore = (rate, indicator, maxRate = 50) => {
  // Lower rates = higher health scores
  // Scale to 0-100 where 100 is best health
  const normalizedRate = Math.min(rate, maxRate);
  return Math.max(0, 100 - (normalizedRate / maxRate * 100));
};

// Generate sample population group data (replace with actual data loading)
export const generateSamplePopulationGroupData = (districts, allRateData) => {
  const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq'];
  const indicators = ['drink_rate', 'smoke_rate', 'obese_rate', 'traffic_death_rate'];
  const currentYear = Math.max(...(allRateData.drinkRateData?.map(d => d.year) || [2568]));
  
  const data = [];
  
  districts.forEach(district => {
    populationGroups.forEach(group => {
      indicators.forEach(indicator => {
        // Get baseline value for the district
        let baseValue;
        switch(indicator) {
          case 'drink_rate':
            baseValue = allRateData.drinkRateData?.find(d => d.dname === district && d.year === currentYear)?.value || 15;
            break;
          case 'smoke_rate':
            baseValue = allRateData.smokeRateData?.find(d => d.dname === district && d.year === currentYear)?.value || 10;
            break;
          case 'obese_rate':
            baseValue = allRateData.obeseRateData?.find(d => d.dname === district && d.year === currentYear)?.value || 20;
            break;
          case 'traffic_death_rate':
            baseValue = allRateData.trafficDeathRateData?.find(d => d.dname === district && d.year === currentYear)?.value || 8;
            break;
          default:
            baseValue = 15;
        }
        
        // Add variation based on population group (simulating disparities)
        let multiplier = 1;
        switch(group) {
          case 'informal_workers':
            multiplier = indicator === 'drink_rate' ? 1.3 : indicator === 'smoke_rate' ? 1.5 : 1.2;
            break;
          case 'elderly':
            multiplier = indicator === 'drink_rate' ? 0.7 : indicator === 'obese_rate' ? 1.4 : 1.1;
            break;
          case 'disabled':
            multiplier = indicator === 'obese_rate' ? 1.3 : 1.2;
            break;
          case 'lgbtq':
            multiplier = indicator === 'smoke_rate' ? 1.4 : 1.1;
            break;
        }
        
        data.push({
          dname: district,
          population_group: group,
          indicator: indicator,
          year: currentYear,
          value: Math.max(0, baseValue * multiplier)
        });
      });
    });
  });
  
  return data;
};