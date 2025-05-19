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
  
  // Group by year
  const yearGroups = {};
  filteredSexData.forEach(item => {
    if (!yearGroups[item.year]) {
      yearGroups[item.year] = {};
    }
    yearGroups[item.year][item.sex] = item.value;
  });
  
  // Convert to array format for chart
  Object.keys(yearGroups).sort().forEach(year => {
    const yearData = { year: parseInt(year) };
    sexes.forEach(sex => {
      yearData[sex] = yearGroups[year][sex] || 0;
    });
    result.push(yearData);
  });
  
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