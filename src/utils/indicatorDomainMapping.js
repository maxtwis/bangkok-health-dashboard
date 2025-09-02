/**
 * Mapping of indicators to their domains
 * Based on the structure in DataProcessor.js
 */

export const INDICATOR_DOMAIN_MAP = {
  // Economic Security
  unemployment_rate: 'economic_security',
  employment_rate: 'economic_security',
  vulnerable_employment: 'economic_security',
  non_vulnerable_employment: 'economic_security',
  food_insecurity_moderate: 'economic_security',
  food_insecurity_severe: 'economic_security',
  work_injury_fatal: 'economic_security',
  work_injury_non_fatal: 'economic_security',
  catastrophic_health_spending_household: 'economic_security',
  health_spending_over_10_percent: 'economic_security',
  health_spending_over_25_percent: 'economic_security',

  // Education
  functional_literacy: 'education',
  primary_completion: 'education',
  secondary_completion: 'education',
  tertiary_completion: 'education',
  training_participation: 'education',

  // Healthcare Access
  health_coverage: 'healthcare_access',
  medical_consultation_skip_cost: 'healthcare_access',
  medical_treatment_skip_cost: 'healthcare_access',
  prescribed_medicine_skip_cost: 'healthcare_access',
  dental_access: 'healthcare_access',
  doctor_per_population: 'healthcare_access',
  nurse_per_population: 'healthcare_access',
  healthworker_per_population: 'healthcare_access',
  community_healthworker_per_population: 'healthcare_access',
  health_service_access: 'healthcare_access',
  bed_per_population: 'healthcare_access',

  // Physical Environment
  electricity_access: 'physical_environment',
  clean_water_access: 'physical_environment',
  sanitation_facilities: 'physical_environment',
  waste_management: 'physical_environment',
  housing_overcrowding: 'physical_environment',
  home_ownership: 'physical_environment',
  disaster_experience: 'physical_environment',

  // Social Context
  community_safety: 'social_context',
  violence_physical: 'social_context',
  violence_psychological: 'social_context',
  violence_sexual: 'social_context',
  discrimination_experience: 'social_context',
  social_support: 'social_context',
  community_murder: 'social_context',

  // Health Behaviors
  alcohol_consumption: 'health_behaviors',
  tobacco_use: 'health_behaviors',
  physical_activity: 'health_behaviors',
  obesity: 'health_behaviors',

  // Health Outcomes
  any_chronic_disease: 'health_outcomes',
  diabetes: 'health_outcomes',
  hypertension: 'health_outcomes',
  gout: 'health_outcomes',
  chronic_kidney_disease: 'health_outcomes',
  cancer: 'health_outcomes',
  high_cholesterol: 'health_outcomes',
  ischemic_heart_disease: 'health_outcomes',
  liver_disease: 'health_outcomes',
  stroke: 'health_outcomes',
  hiv: 'health_outcomes',
  mental_health: 'health_outcomes',
  allergies: 'health_outcomes',
  bone_joint_disease: 'health_outcomes',
  respiratory_disease: 'health_outcomes',
  emphysema: 'health_outcomes',
  anemia: 'health_outcomes',
  stomach_ulcer: 'health_outcomes',
  epilepsy: 'health_outcomes',
  intestinal_disease: 'health_outcomes',
  paralysis: 'health_outcomes',
  dementia: 'health_outcomes',
  cardiovascular_diseases: 'health_outcomes',
  metabolic_diseases: 'health_outcomes',
  multiple_chronic_conditions: 'health_outcomes'
};

/**
 * Get the domain for a given indicator
 * @param {string} indicator - The indicator key
 * @returns {string} The domain name
 */
export function getIndicatorDomain(indicator) {
  return INDICATOR_DOMAIN_MAP[indicator] || 'unknown';
}

/**
 * Get all indicators for a specific domain
 * @param {string} domain - The domain name
 * @returns {string[]} Array of indicator keys
 */
export function getIndicatorsByDomain(domain) {
  return Object.keys(INDICATOR_DOMAIN_MAP)
    .filter(indicator => INDICATOR_DOMAIN_MAP[indicator] === domain);
}

/**
 * Get all available domains
 * @returns {string[]} Array of unique domain names
 */
export function getAllDomains() {
  return [...new Set(Object.values(INDICATOR_DOMAIN_MAP))];
}