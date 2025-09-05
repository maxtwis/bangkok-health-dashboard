/**
 * Indicator Type Constants
 * Separating survey-based SDHE indicators from facility-based IMD indicators
 */

export const INDICATOR_TYPES = {
  SDHE: 'sdhe', // Social Determinants of Health Equity (Survey data)
  IMD: 'imd'     // Index of Multiple Deprivation (Facility data)
};

// Indicators from facility/supply data (IMD)
export const IMD_INDICATORS = [
  'doctor_per_population',
  'nurse_per_population',
  'healthworker_per_population',
  'community_healthworker_per_population',
  'health_service_access',
  'bed_per_population',
  'market_per_population',
  'sportfield_per_population'
];

// All other indicators are from survey data (SDHE)
export const SDHE_DOMAINS = {
  economic_security: 'Economic Security',
  education: 'Education',
  healthcare_access: 'Healthcare Access (Survey)', // Note: Different from facility access
  physical_environment: 'Physical Environment',
  social_context: 'Social Context',
  health_behaviors: 'Health Behaviors',
  health_outcomes: 'Health Outcomes'
};

// IMD domains for facility-based indicators
export const IMD_DOMAINS = {
  healthcare_infrastructure: 'Healthcare Infrastructure',
  food_access: 'Food Access',
  sports_recreation: 'Sports & Recreation'
};

/**
 * Determine if an indicator is SDHE or IMD based
 * @param {string} indicator 
 * @returns {string} INDICATOR_TYPES.SDHE or INDICATOR_TYPES.IMD
 */
export function getIndicatorType(indicator) {
  return IMD_INDICATORS.includes(indicator) ? INDICATOR_TYPES.IMD : INDICATOR_TYPES.SDHE;
}

/**
 * Get domains based on indicator type
 * @param {string} indicatorType 
 * @returns {object} domains object
 */
export function getDomainsByType(indicatorType) {
  return indicatorType === INDICATOR_TYPES.IMD ? IMD_DOMAINS : SDHE_DOMAINS;
}