// Dashboard Constants - Extracted for better maintainability

// Define which indicators are "reverse" (bad when high)
export const REVERSE_INDICATORS = {
  // Economic Security - mostly reverse (bad when high)
  unemployment_rate: true,
  vulnerable_employment: true,
  food_insecurity_moderate: true,
  food_insecurity_severe: true,
  work_injury_fatal: true,
  work_injury_non_fatal: true,
  catastrophic_health_spending_household: true,
  health_spending_over_10_percent: true,
  health_spending_over_25_percent: true,
  
  // Healthcare Access - mixed
  medical_consultation_skip_cost: true,
  medical_treatment_skip_cost: true,
  prescribed_medicine_skip_cost: true,
  
  // Physical Environment - mixed
  housing_overcrowding: true,
  disaster_experience: true,
  
  // Social Context - mostly reverse
  violence_physical: true,
  violence_psychological: true,
  violence_sexual: true,
  discrimination_experience: true,
  community_murder: true,
  
  // Health Behaviors - mixed
  alcohol_consumption: true,
  tobacco_use: true,
  obesity: true,

  // Health Outcomes - ALL REVERSE (diseases are bad when high)
  any_chronic_disease: true,
  diabetes: true,
  hypertension: true,
  gout: true,
  chronic_kidney_disease: true,
  cancer: true,
  high_cholesterol: true,
  ischemic_heart_disease: true,
  liver_disease: true,
  stroke: true,
  hiv: true,
  mental_health: true,
  allergies: true,
  bone_joint_disease: true,
  respiratory_disease: true,
  emphysema: true,
  anemia: true,
  stomach_ulcer: true,
  epilepsy: true,
  intestinal_disease: true,
  paralysis: true,
  dementia: true,
  cardiovascular_diseases: true,
  metabolic_diseases: true,
  multiple_chronic_conditions: true
};

// WHO Benchmarks for Healthcare Supply Indicators
export const HEALTHCARE_SUPPLY_BENCHMARKS = {
  doctor_per_population: { good: 2.5, fair: 1.0, poor: 0.5 },
  nurse_per_population: { good: 2.5, fair: 1.5, poor: 1.0 },
  hospital_per_population: { good: 3.5, fair: 2.5, poor: 1.5 },
  clinic_per_population: { good: 5.0, fair: 3.0, poor: 1.5 },
  pharmacy_per_population: { good: 10.0, fair: 5.0, poor: 2.0 }
};

// Population Groups Configuration
export const POPULATION_GROUPS = [
  { value: 'all', label: 'All Population', color: '#4F46E5' },
  { value: 'informal_workers', label: 'Informal Workers', color: '#059669' },
  { value: 'elderly', label: 'Elderly', color: '#DC2626' },
  { value: 'unemployed', label: 'Unemployed', color: '#D97706' },
  { value: 'youth', label: 'Youth', color: '#7C3AED' },
  { value: 'migrants', label: 'Migrants', color: '#DB2777' }
];

// Domain Configuration
export const DOMAINS = [
  { 
    id: 'economic_security', 
    name: 'Economic Security',
    color: '#3B82F6',
    description: 'Employment, income, and financial stability indicators'
  },
  { 
    id: 'healthcare_access', 
    name: 'Healthcare Access',
    color: '#EF4444',
    description: 'Access to healthcare services and affordability'
  },
  { 
    id: 'physical_environment', 
    name: 'Physical Environment',
    color: '#10B981',
    description: 'Housing, environment, and infrastructure conditions'
  },
  { 
    id: 'social_context', 
    name: 'Social Context',
    color: '#8B5CF6',
    description: 'Social support, discrimination, and community safety'
  },
  { 
    id: 'health_behaviors', 
    name: 'Health Behaviors',
    color: '#F59E0B',
    description: 'Lifestyle choices and health-related behaviors'
  },
  { 
    id: 'health_outcomes', 
    name: 'Health Outcomes',
    color: '#EC4899',
    description: 'Disease prevalence and health conditions'
  }
];

// Tab Configuration
export const VIEW_TABS = [
  { id: 'analysis', label: 'Analysis', icon: '📊' },
  { id: 'comparison', label: 'Comparison', icon: '🔍' },
  { id: 'map', label: 'Geographic View', icon: '🗺️' }
];

// Performance thresholds for coloring
export const PERFORMANCE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  poor: 0
};

// Chart colors
export const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export default {
  REVERSE_INDICATORS,
  HEALTHCARE_SUPPLY_BENCHMARKS,
  POPULATION_GROUPS,
  DOMAINS,
  VIEW_TABS,
  PERFORMANCE_THRESHOLDS,
  CHART_COLORS
};