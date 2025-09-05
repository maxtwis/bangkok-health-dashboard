// Dashboard Utility Functions - Extracted for better maintainability and testability

import { REVERSE_INDICATORS, HEALTHCARE_SUPPLY_BENCHMARKS, PERFORMANCE_THRESHOLDS } from '../constants/dashboardConstants';


/**
 * Get performance color based on score and indicator type
 * @param {number} score - The score value (0-100)
 * @param {string} indicator - The indicator name
 * @returns {string} Color class or hex code
 */
export const getPerformanceColor = (score, indicator = '') => {
  if (score === null || score === undefined || isNaN(score)) {
    return '#EF4444'; // red for no data
  }

  const isReverse = REVERSE_INDICATORS[indicator];
  const adjustedScore = isReverse ? (100 - score) : score;

  if (adjustedScore >= PERFORMANCE_THRESHOLDS.excellent) {
    return '#10B981'; // green - excellent
  } else if (adjustedScore >= PERFORMANCE_THRESHOLDS.good) {
    return '#F59E0B'; // yellow - good
  } else if (adjustedScore >= PERFORMANCE_THRESHOLDS.fair) {
    return '#FB923C'; // orange - fair
  } else {
    return '#EF4444'; // red - poor
  }
};

/**
 * Get performance label based on score and indicator type
 * @param {number} score - The score value (0-100)
 * @param {string} indicator - The indicator name
 * @returns {string} Performance label
 */
export const getPerformanceLabel = (score, indicator = '') => {
  if (score === null || score === undefined || isNaN(score)) {
    return 'No Data';
  }

  const isReverse = REVERSE_INDICATORS[indicator];
  const adjustedScore = isReverse ? (100 - score) : score;

  if (adjustedScore >= PERFORMANCE_THRESHOLDS.excellent) {
    return 'Excellent';
  } else if (adjustedScore >= PERFORMANCE_THRESHOLDS.good) {
    return 'Good';
  } else if (adjustedScore >= PERFORMANCE_THRESHOLDS.fair) {
    return 'Fair';
  } else {
    return 'Poor';
  }
};

/**
 * Get healthcare supply color based on WHO benchmarks
 * @param {number} value - The supply value
 * @param {string} indicator - The indicator name
 * @returns {string} Color code
 */
export const getHealthcareSupplyColor = (value, indicator) => {
  const benchmark = HEALTHCARE_SUPPLY_BENCHMARKS[indicator];
  
  if (!benchmark || value === null || value === undefined) {
    return '#EF4444'; // red for no data
  }

  if (value >= benchmark.good) {
    return '#10B981'; // green
  } else if (value >= benchmark.fair) {
    return '#F59E0B'; // yellow
  } else if (value >= benchmark.poor) {
    return '#FB923C'; // orange
  } else {
    return '#EF4444'; // red
  }
};

/**
 * Calculate domain score from indicators
 * @param {Array} indicators - Array of indicator objects with name and value
 * @returns {number} Domain score (0-100)
 */
export const calculateDomainScore = (indicators) => {
  if (!indicators || indicators.length === 0) return 0;

  const validIndicators = indicators.filter(ind => 
    ind.value !== null && ind.value !== undefined && !isNaN(ind.value)
  );

  if (validIndicators.length === 0) return 0;

  const totalScore = validIndicators.reduce((sum, indicator) => {
    const isReverse = REVERSE_INDICATORS[indicator.name];
    const adjustedScore = isReverse ? (100 - indicator.value) : indicator.value;
    return sum + Math.max(0, Math.min(100, adjustedScore));
  }, 0);

  return Math.round(totalScore / validIndicators.length);
};

/**
 * Format number for display
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places
 * @param {string} suffix - Suffix to add (like %)
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 1, suffix = '') => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  return `${value.toFixed(decimals)}${suffix}`;
};

/**
 * Sort indicators by performance (best to worst)
 * @param {Array} indicators - Array of indicator objects
 * @returns {Array} Sorted indicators
 */
export const sortIndicatorsByPerformance = (indicators) => {
  return [...indicators].sort((a, b) => {
    const aIsReverse = REVERSE_INDICATORS[a.name];
    const bIsReverse = REVERSE_INDICATORS[b.name];
    
    const aScore = aIsReverse ? (100 - a.value) : a.value;
    const bScore = bIsReverse ? (100 - b.value) : b.value;
    
    return bScore - aScore; // Sort descending (best first)
  });
};

/**
 * Get top N indicators by performance
 * @param {Array} indicators - Array of indicator objects
 * @param {number} count - Number of indicators to return
 * @returns {Array} Top indicators
 */
export const getTopIndicators = (indicators, count = 5) => {
  const sorted = sortIndicatorsByPerformance(indicators);
  return sorted.slice(0, count);
};

/**
 * Get bottom N indicators by performance
 * @param {Array} indicators - Array of indicator objects
 * @param {number} count - Number of indicators to return
 * @returns {Array} Bottom indicators
 */
export const getBottomIndicators = (indicators, count = 5) => {
  const sorted = sortIndicatorsByPerformance(indicators);
  return sorted.slice(-count).reverse(); // Reverse to show worst first
};

/**
 * Filter indicators by search term
 * @param {Array} indicators - Array of indicator objects
 * @param {string} searchTerm - Search term
 * @param {Function} getIndicatorName - Function to get localized name
 * @returns {Array} Filtered indicators
 */
export const filterIndicators = (indicators, searchTerm, getIndicatorName) => {
  if (!searchTerm.trim()) return indicators;
  
  const term = searchTerm.toLowerCase().trim();
  
  return indicators.filter(indicator => {
    const name = getIndicatorName(indicator.name) || indicator.name;
    return name.toLowerCase().includes(term) || 
           indicator.name.toLowerCase().includes(term);
  });
};

/**
 * Debounce function to prevent excessive API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Check if data is loading or error state
 * @param {boolean} isLoading - Loading state
 * @param {string} error - Error message
 * @param {*} data - Data to check
 * @returns {Object} State information
 */
export const getDataState = (isLoading, error, data) => {
  return {
    isLoading,
    hasError: !!error,
    hasData: !!data && !isLoading && !error,
    isEmpty: !data || (Array.isArray(data) && data.length === 0),
    error
  };
};

/**
 * Generate consistent color for population group
 * @param {string} groupValue - Population group value
 * @returns {string} Color code
 */
export const getPopulationGroupColor = (groupValue) => {
  const colors = {
    'all': '#4F46E5',
    'informal_workers': '#059669',
    'elderly': '#DC2626',
    'unemployed': '#D97706',
    'youth': '#7C3AED',
    'migrants': '#DB2777'
  };
  
  return colors[groupValue] || '#6B7280';
};

export default {
  getPerformanceColor,
  getPerformanceLabel,
  getHealthcareSupplyColor,
  calculateDomainScore,
  formatNumber,
  sortIndicatorsByPerformance,
  getTopIndicators,
  getBottomIndicators,
  filterIndicators,
  debounce,
  getDataState,
  getPopulationGroupColor
};