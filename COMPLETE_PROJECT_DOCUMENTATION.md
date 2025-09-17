# Bangkok Health Dashboard: Complete Project Documentation

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Data Model and Schema](#data-model-and-schema)
4. [Population Classification System](#population-classification-system)
5. [Calculation Methodologies](#calculation-methodologies)
6. [Indicator Framework](#indicator-framework)
7. [Statistical Analysis Methods](#statistical-analysis-methods)
8. [Performance Benchmarking](#performance-benchmarking)
9. [Data Quality Assurance](#data-quality-assurance)
10. [Visualization Processing](#visualization-processing)
11. [Technical Implementation](#technical-implementation)
12. [API Reference](#api-reference)
13. [Deployment Guide](#deployment-guide)

---

## Executive Summary

The Bangkok Health Dashboard is a comprehensive data visualization platform that analyzes health equity across Bangkok's 50 districts and four vulnerable population groups. The system processes survey data and infrastructure information to calculate **Social Determinants of Health Equity (SDHE)** and **Index of Multiple Deprivation (IMD)** indicators, providing evidence-based insights for health policy and intervention planning.

### Key Features
- **Dual Indicator Framework**: SDHE (survey-based) and IMD (infrastructure-based) metrics
- **Population-Focused Analysis**: Targets informal workers, LGBT community, elderly (60+), and people with disabilities
- **Statistical Rigor**: Minimum sample sizes, correlation analysis, significance testing
- **Interactive Visualization**: Maps, spider charts, correlation matrices, district rankings
- **Bilingual Support**: Thai/English interface with full localization

### Technical Stack
- **Frontend**: React 19 + Vite, Tailwind CSS, Recharts, Leaflet
- **Data Processing**: PapaCSV, Lodash utilities
- **Infrastructure**: Static file hosting, client-side processing
- **Standards Compliance**: WHO health indicators, SDG alignment

---

## System Architecture

### Data Flow Architecture
```
Raw Data Sources → CSV Processing → Population Classification →
Indicator Calculation → Statistical Analysis → Visualization Rendering
```

### Core Components

#### 1. Data Processing Engine (`DataProcessor` class)
- **Location**: `src/utils/DataProcessor.js`
- **Purpose**: Central calculation engine for all health indicators
- **Key Methods**:
  - `loadData()`: Asynchronous data loading with error handling
  - `calculateSDHEIndicators()`: Survey-based health metrics
  - `calculateIMDIndicators()`: Infrastructure-based metrics
  - `classifyPopulationGroup()`: Population group assignment

#### 2. Dashboard Controller (`Dashboard/index.jsx`)
- **Location**: `src/components/Dashboard/index.jsx`
- **Purpose**: Main orchestrator for data flow and state management
- **Responsibilities**: Routing logic, filter management, data coordination

#### 3. Visualization Components
- **BangkokMap**: Interactive district-level choropleth maps
- **IndicatorDetail**: Detailed analysis with district rankings
- **IndicatorAnalysis**: Cross-indicator correlation analysis
- **PopulationGroupSpiderChart**: Multi-dimensional performance comparison

---

## Data Model and Schema

### Primary Data Sources

#### Survey Data (`survey_sampling.csv`)
**Records**: 50,000+ individual survey responses
**Structure**: 130+ variables covering health, social, economic, and environmental factors

```javascript
// Core Survey Schema
{
  dname: String,              // District code (1001-1050)
  age: Number,                // Respondent age (14-60+)
  sex: String,                // 'male', 'female', 'lgbt'
  disable_status: Number,     // 0=no disability, 1=has disability
  disable_work_status: Number, // 0=no work impact, 1=affects work

  // Health Conditions (21 disease types)
  diseases_status: Number,    // 0=no diseases, 1=has diseases
  diseases_type_1: Number,    // Diabetes (0/1)
  diseases_type_2: Number,    // Hypertension (0/1)
  // ... diseases_type_21

  // Behavioral Factors
  drink_status: Number,       // Alcohol consumption (0-3 scale)
  smoke_status: Number,       // Tobacco use (0-3 scale)
  exercise_status: Number,    // Physical activity level

  // Socioeconomic Factors
  occupation_status: Number,  // 0=unemployed, 1=employed
  occupation_type: Number,    // Employment category
  occupation_freelance_type: Number, // Informal work type
  occupation_contract: Number, // 0=no contract, 1=formal contract
  income: Number,             // Monthly income (THB)
  income_type: Number,        // 1=daily, 2=monthly

  // Housing and Environment
  house_status: Number,       // Housing tenure
  water_supply: Number,       // Water access quality
  waste_water_disposal: Number, // Sanitation type

  // Healthcare Access
  medical_skip_1: Number,     // Skipped consultation due to cost
  medical_skip_2: Number,     // Skipped treatment due to cost
  medical_skip_3: Number,     // Skipped medicine due to cost
  hh_health_expense: Number,  // Household health spending
  health_expense: Number,     // Individual health spending

  // Social Context
  physical_violence: Number,   // Experienced physical violence
  psychological_violence: Number, // Experienced psychological violence
  sexual_violence: Number,    // Experienced sexual violence
  discrimination_1: Number,   // Age discrimination
  discrimination_2: Number,   // Gender discrimination
  discrimination_3: Number,   // Health status discrimination
  discrimination_4: Number,   // Income discrimination
  discrimination_5: Number,   // Other discrimination
  community_safety: Number,   // Community safety rating (1-4)

  // Food Security
  food_insecurity_1: Number,  // Moderate food insecurity
  food_insecurity_2: Number,  // Severe food insecurity

  // Education
  education: Number,          // Education level (1-8 scale)
  speak: Number,              // Speaking proficiency
  read: Number,               // Reading proficiency
  write: Number,              // Writing proficiency
  math: Number                // Numeracy proficiency
}
```

#### Healthcare Infrastructure Data
```javascript
// Health Supply Data (health_supply.csv)
{
  dcode: String,              // District code
  doctor: Number,             // Number of doctors
  nurse: Number,              // Number of nurses
  pharmacist: Number,         // Number of pharmacists
  dentist: Number,            // Number of dentists
  public_health_officer: Number, // Public health officers
  hospital_bed: Number,       // Hospital beds
  population: Number          // District population
}

// Health Facilities Data (health_facilities.csv)
{
  facility_name: String,      // Facility name
  facility_type: String,      // Hospital/Clinic/Health Center
  district: String,           // District name
  lgbt_clinic: Number,        // LGBT-friendly services (0/1)
  wheelchair_accessible: Number, // Accessibility (0/1)
  mental_health_service: Number  // Mental health services (0/1)
}
```

#### Community Infrastructure Data
```javascript
// Market Data (market.csv)
{
  district_code: String,      // District code
  market_count: Number        // Number of markets
}

// Sports Facilities (sportfield.csv)
{
  district_code: String,      // District code
  sportfield_count: Number    // Number of sports facilities
}

// Public Parks (public_park.csv)
{
  district_code: String,      // District code
  park_count: Number          // Number of public parks
}
```

---

## Population Classification System

### Target Population Groups

The system classifies respondents into four vulnerable population groups based on specific survey variables:

#### 1. Informal Workers
**Classification Logic**:
```javascript
function isInformalWorker(record) {
  return record.occupation_status === 1 &&           // Employed
         record.occupation_contract === 0;            // No formal contract
}
```

**Characteristics**:
- Employed but without formal employment contracts
- Limited access to employment benefits and social protection
- Higher economic vulnerability and job insecurity
- Includes: street vendors, day laborers, gig workers, freelancers

#### 2. LGBT Community
**Classification Logic**:
```javascript
function isLGBT(record) {
  return record.sex === 'lgbt';
}
```

**Characteristics**:
- Self-identified as LGBT in gender/sexuality field
- Faces unique healthcare access barriers
- Higher rates of discrimination in healthcare settings
- Age distribution: predominantly 18-45 years (elderly LGBT very rare)

#### 3. Elderly (60+)
**Classification Logic**:
```javascript
function isElderly(record) {
  return record.age >= 60;
}
```

**Characteristics**:
- Adults aged 60 years and above
- Higher prevalence of chronic conditions
- Mobility and accessibility challenges
- Social isolation and fixed income concerns

#### 4. People with Disabilities
**Classification Logic**:
```javascript
function isDisabled(record) {
  return record.disable_status === 1;
}
```

**Characteristics**:
- Self-reported disability status
- Physical, sensory, intellectual, or multiple disabilities
- Employment discrimination and economic challenges
- Accessibility barriers to healthcare and services

### Population Group Assignment Algorithm

```javascript
function classifyPopulationGroup(record) {
  const groups = [];

  // Check each population group (individuals can belong to multiple groups)
  if (record.occupation_status === 1 && record.occupation_contract === 0) {
    groups.push('informal_workers');
  }

  if (record.sex === 'lgbt') {
    groups.push('lgbt');
  }

  if (record.age >= 60) {
    groups.push('elderly');
  }

  if (record.disable_status === 1) {
    groups.push('disabled');
  }

  // Return primary group (first match) or general population
  return groups.length > 0 ? groups[0] : 'general_population';
}
```

---

## Calculation Methodologies

### SDHE Indicator Calculations

#### Economic Security Domain

**1. Employment Indicators**
```javascript
// Unemployment Rate
unemployment_rate: {
  calculation: (records) => {
    const workingAge = records.filter(r => r.age >= 15 && r.age <= 64);
    const unemployed = workingAge.filter(r => r.occupation_status === 0);
    return (unemployed.length / workingAge.length) * 100;
  },
  reverse: true // Higher unemployment is worse
}

// Employment Rate
employment_rate: {
  calculation: (records) => {
    const workingAge = records.filter(r => r.age >= 15 && r.age <= 64);
    const employed = workingAge.filter(r => r.occupation_status === 1);
    return (employed.length / workingAge.length) * 100;
  },
  reverse: false // Higher employment is better
}

// Vulnerable Employment (Informal Workers)
vulnerable_employment: {
  calculation: (records) => {
    const employed = records.filter(r => r.occupation_status === 1);
    const informal = employed.filter(r => r.occupation_contract === 0);
    return (informal.length / employed.length) * 100;
  },
  reverse: true // Higher informal employment is worse
}
```

**2. Food Security Indicators**
```javascript
// Moderate Food Insecurity
food_insecurity_moderate: {
  calculation: (records) => {
    const validResponses = records.filter(r =>
      r.food_insecurity_1 !== null && r.food_insecurity_1 !== undefined
    );
    const insecure = validResponses.filter(r => r.food_insecurity_1 === 1);
    return (insecure.length / validResponses.length) * 100;
  },
  reverse: true
}

// Severe Food Insecurity
food_insecurity_severe: {
  calculation: (records) => {
    const validResponses = records.filter(r =>
      r.food_insecurity_2 !== null && r.food_insecurity_2 !== undefined
    );
    const severe = validResponses.filter(r => r.food_insecurity_2 === 1);
    return (severe.length / validResponses.length) * 100;
  },
  reverse: true
}
```

**3. Healthcare Financial Burden**
```javascript
// Catastrophic Health Spending (WHO 40% threshold)
catastrophic_health_spending_household: {
  calculation: (records) => {
    const validRecords = records.filter(r =>
      r.hh_health_expense !== null &&
      r.income !== null &&
      r.income > 0
    );

    const catastrophicHouseholds = validRecords.filter(r => {
      // Convert daily income to monthly if needed
      const monthlyIncome = r.income_type === 1 ? r.income * 30 : r.income;
      const healthSpendingRatio = (r.hh_health_expense / monthlyIncome) * 100;
      return healthSpendingRatio > 40; // WHO catastrophic threshold
    });

    return (catastrophicHouseholds.length / validRecords.length) * 100;
  },
  reverse: true
}

// Health Spending Over 10% of Income
health_spending_over_10_percent: {
  calculation: (records) => {
    const validRecords = records.filter(r =>
      r.health_expense !== null &&
      r.income !== null &&
      r.income > 0
    );

    const highSpending = validRecords.filter(r => {
      const monthlyIncome = r.income_type === 1 ? r.income * 30 : r.income;
      const spendingRatio = (r.health_expense / monthlyIncome) * 100;
      return spendingRatio > 10;
    });

    return (highSpending.length / validRecords.length) * 100;
  },
  reverse: true
}
```

#### Education Domain

**1. Functional Literacy**
```javascript
functional_literacy: {
  calculation: (records) => {
    const validResponses = records.filter(r =>
      r.speak !== null && r.read !== null &&
      r.write !== null && r.math !== null
    );

    const literate = validResponses.filter(r =>
      r.speak === 1 && r.read === 1 && r.write === 1 && r.math === 1
    );

    return (literate.length / validResponses.length) * 100;
  },
  reverse: false
}
```

**2. Educational Attainment**
```javascript
// Primary Education Completion
primary_education_completion: {
  calculation: (records) => {
    const eligibleAge = records.filter(r => r.age >= 18); // Adults only
    const primaryComplete = eligibleAge.filter(r => r.education >= 2);
    return (primaryComplete.length / eligibleAge.length) * 100;
  },
  reverse: false
}

// Secondary Education Completion
secondary_education_completion: {
  calculation: (records) => {
    const eligibleAge = records.filter(r => r.age >= 18);
    const secondaryComplete = eligibleAge.filter(r => r.education >= 4);
    return (secondaryComplete.length / eligibleAge.length) * 100;
  },
  reverse: false
}

// Tertiary Education Completion
tertiary_education_completion: {
  calculation: (records) => {
    const eligibleAge = records.filter(r => r.age >= 22); // University age
    const tertiaryComplete = eligibleAge.filter(r => r.education >= 6);
    return (tertiaryComplete.length / eligibleAge.length) * 100;
  },
  reverse: false
}
```

#### Health Outcomes Domain

**1. Obesity Calculation (BMI-based)**
```javascript
obesity: {
  calculation: (records) => {
    const validBMI = records.filter(r =>
      r.height > 0 && r.weight > 0 &&
      r.height >= 100 && r.height <= 250 && // Reasonable height range
      r.weight >= 30 && r.weight <= 300     // Reasonable weight range
    );

    const obese = validBMI.filter(r => {
      const bmi = r.weight / Math.pow(r.height / 100, 2);
      return bmi >= 30; // WHO obesity threshold
    });

    return (obese.length / validBMI.length) * 100;
  },
  reverse: true
}
```

**2. Chronic Disease Indicators**
```javascript
// Any Chronic Disease
any_chronic_disease: {
  calculation: (records) => {
    const validResponses = records.filter(r => r.diseases_status !== null);
    const hasDisease = validResponses.filter(r => r.diseases_status === 1);
    return (hasDisease.length / validResponses.length) * 100;
  },
  reverse: true
}

// Cardiovascular Diseases (Composite)
cardiovascular_diseases: {
  calculation: (records) => {
    const hasCardiovascular = records.filter(r =>
      r.diseases_type_2 === 1 ||  // Hypertension
      r.diseases_type_7 === 1 ||  // High cholesterol
      r.diseases_type_15 === 1 || // Ischemic heart disease
      r.diseases_type_17 === 1    // Stroke
    );
    return (hasCardiovascular.length / records.length) * 100;
  },
  reverse: true
}

// Metabolic Diseases (Composite)
metabolic_diseases: {
  calculation: (records) => {
    const hasMetabolic = records.filter(r =>
      r.diseases_type_1 === 1 ||  // Diabetes
      r.diseases_type_4 === 1 ||  // Gout
      r.diseases_type_7 === 1     // High cholesterol
    );
    return (hasMetabolic.length / records.length) * 100;
  },
  reverse: true
}

// Multiple Chronic Conditions
multiple_chronic_conditions: {
  calculation: (records) => {
    const multipleConditions = records.filter(r => {
      const diseaseCount = [
        r.diseases_type_1, r.diseases_type_2, r.diseases_type_3,
        r.diseases_type_4, r.diseases_type_5, r.diseases_type_6,
        r.diseases_type_7, r.diseases_type_8, r.diseases_type_9,
        r.diseases_type_10, r.diseases_type_11, r.diseases_type_12,
        r.diseases_type_13, r.diseases_type_14, r.diseases_type_15,
        r.diseases_type_16, r.diseases_type_17, r.diseases_type_18,
        r.diseases_type_19, r.diseases_type_20, r.diseases_type_21
      ].filter(disease => disease === 1).length;

      return diseaseCount >= 2;
    });

    return (multipleConditions.length / records.length) * 100;
  },
  reverse: true
}
```

#### Social Context Domain

**1. Violence and Safety Indicators**
```javascript
// Physical Violence
physical_violence: {
  calculation: (records) => {
    const validResponses = records.filter(r => r.physical_violence !== null);
    const experienced = validResponses.filter(r => r.physical_violence === 1);
    return (experienced.length / validResponses.length) * 100;
  },
  reverse: true
}

// Community Safety (Weighted Score)
community_safety: {
  calculation: (records) => {
    const safetyResponses = records.filter(r =>
      r.community_safety >= 1 && r.community_safety <= 4
    );

    const totalScore = safetyResponses.reduce((sum, r) => {
      switch(r.community_safety) {
        case 4: return sum + 100; // Very safe
        case 3: return sum + 75;  // Safe
        case 2: return sum + 50;  // Moderately safe
        case 1: return sum + 25;  // Unsafe
        default: return sum;
      }
    }, 0);

    return totalScore / safetyResponses.length;
  },
  reverse: false // Higher score is better
}
```

**2. Discrimination Indicators**
```javascript
// Overall Discrimination Experience
discrimination_experience: {
  calculation: (records) => {
    const experiencedDiscrimination = records.filter(r =>
      r.discrimination_1 === 1 || // Age discrimination
      r.discrimination_2 === 1 || // Gender discrimination
      r.discrimination_3 === 1 || // Health status discrimination
      r.discrimination_4 === 1 || // Income discrimination
      r.discrimination_5 === 1    // Other discrimination
    );

    return (experiencedDiscrimination.length / records.length) * 100;
  },
  reverse: true
}
```

#### Healthcare Access Domain

**1. Healthcare Utilization Barriers**
```javascript
// Medical Consultation Skipped Due to Cost
medical_consultation_skip_cost: {
  calculation: (records) => {
    const validResponses = records.filter(r => r.medical_skip_1 !== null);
    const skipped = validResponses.filter(r => r.medical_skip_1 === 1);
    return (skipped.length / validResponses.length) * 100;
  },
  reverse: true
}

// Medical Treatment Skipped Due to Cost
medical_treatment_skip_cost: {
  calculation: (records) => {
    const validResponses = records.filter(r => r.medical_skip_2 !== null);
    const skipped = validResponses.filter(r => r.medical_skip_2 === 1);
    return (skipped.length / validResponses.length) * 100;
  },
  reverse: true
}

// Prescribed Medicine Skipped Due to Cost
prescribed_medicine_skip_cost: {
  calculation: (records) => {
    const validResponses = records.filter(r => r.medical_skip_3 !== null);
    const skipped = validResponses.filter(r => r.medical_skip_3 === 1);
    return (skipped.length / validResponses.length) * 100;
  },
  reverse: true
}
```

### IMD Indicator Calculations

#### Healthcare Infrastructure Domain

**1. Healthcare Worker Density (per 1,000 population)**
```javascript
// Doctor Density
doctor_per_population: {
  calculation: (facilityData, populationData) => {
    const totalDoctors = facilityData.doctor || 0;
    const population = populationData.population || 1;
    return (totalDoctors / population * 1000).toFixed(2);
  },
  unit: 'per 1,000 population'
}

// Nurse Density
nurse_per_population: {
  calculation: (facilityData, populationData) => {
    const totalNurses = facilityData.nurse || 0;
    const population = populationData.population || 1;
    return (totalNurses / population * 1000).toFixed(2);
  },
  unit: 'per 1,000 population'
}
```

**2. Healthcare Infrastructure Access (per 10,000 population)**
```javascript
// Hospital Bed Density
bed_per_population: {
  calculation: (facilityData, populationData) => {
    const totalBeds = facilityData.hospital_bed || 0;
    const population = populationData.population || 1;
    return (totalBeds / population * 10000).toFixed(2);
  },
  unit: 'per 10,000 population'
}

// Health Service Access
health_service_access: {
  calculation: (facilityData, populationData) => {
    const facilitiesCount = facilityData.length || 0;
    const population = populationData.population || 1;
    return (facilitiesCount / population * 10000).toFixed(2);
  },
  unit: 'per 10,000 population'
}
```

**3. Specialized Healthcare Services**
```javascript
// LGBT-Friendly Healthcare Access
lgbt_service_access: {
  calculation: (facilityData) => {
    const lgbtFriendly = facilityData.filter(f => f.lgbt_clinic === 1);
    return lgbtFriendly.length;
  },
  unit: 'absolute count'
}

// Mental Health Service Access
mental_health_service_access: {
  calculation: (facilityData) => {
    const mentalHealthServices = facilityData.filter(f =>
      f.mental_health_service === 1
    );
    return mentalHealthServices.length;
  },
  unit: 'absolute count'
}
```

#### Community Infrastructure Domain

**1. Market Access (per 10,000 population)**
```javascript
market_per_population: {
  calculation: (marketData, populationData) => {
    const marketCount = marketData.market_count || 0;
    const population = populationData.population || 1;
    return (marketCount / population * 10000).toFixed(2);
  },
  unit: 'per 10,000 population'
}
```

**2. Recreation and Sports Access**
```javascript
// Sports Field Access
sportfield_per_population: {
  calculation: (sportfieldData, populationData) => {
    const sportfieldCount = sportfieldData.sportfield_count || 0;
    const population = populationData.population || 1;
    return (sportfieldCount / population * 1000).toFixed(2);
  },
  unit: 'per 1,000 population'
}

// Public Park Access
park_access: {
  calculation: (parkData) => {
    return parkData.park_count || 0;
  },
  unit: 'absolute count'
}
```

---

## Statistical Analysis Methods

### Correlation Analysis

#### Pearson Correlation Calculation
```javascript
function calculatePearsonCorrelation(x, y) {
  if (x.length !== y.length || x.length < 2) {
    return { r: 0, n: 0, significant: false };
  }

  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;

    numerator += diffX * diffY;
    denominatorX += diffX * diffX;
    denominatorY += diffY * diffY;
  }

  if (denominatorX === 0 || denominatorY === 0) {
    return { r: 0, n: n, significant: false };
  }

  const r = numerator / Math.sqrt(denominatorX * denominatorY);

  return {
    r: r,
    n: n,
    significant: isStatisticallySignificant(r, n)
  };
}
```

#### Statistical Significance Testing
```javascript
function isStatisticallySignificant(r, n) {
  if (n < 3) return false;

  // Calculate t-statistic
  const t = r * Math.sqrt((n - 2) / (1 - r * r));

  // Critical values for different significance levels
  const tCritical05 = 1.96;   // p < 0.05 (*)
  const tCritical01 = 2.58;   // p < 0.01 (**)
  const tCritical001 = 3.29;  // p < 0.001 (***)

  const absT = Math.abs(t);

  return {
    significant: absT > tCritical05,
    pValue: absT > tCritical001 ? '<0.001' :
            absT > tCritical01 ? '<0.01' :
            absT > tCritical05 ? '<0.05' : '≥0.05',
    stars: absT > tCritical001 ? '***' :
           absT > tCritical01 ? '**' :
           absT > tCritical05 ? '*' : ''
  };
}
```

#### Correlation Strength Classification
```javascript
function classifyCorrelationStrength(r) {
  const absR = Math.abs(r);

  if (absR >= 0.7) return 'Very Strong';
  else if (absR >= 0.5) return 'Strong';
  else if (absR >= 0.3) return 'Moderate';
  else if (absR >= 0.1) return 'Weak';
  else return 'Negligible';
}
```

### Domain Score Calculation

#### SDHE Domain Scoring (Goodness Approach)
```javascript
function calculateSDHEDomainScore(indicators, results) {
  const validIndicators = indicators.filter(indicator =>
    results[indicator] && results[indicator].value !== null
  );

  if (validIndicators.length === 0) return null;

  const goodnessScores = validIndicators.map(indicator => {
    const rawValue = results[indicator].value;

    // Convert to "goodness" score (higher = better)
    if (REVERSE_INDICATORS[indicator]) {
      return Math.max(0, 100 - rawValue); // Bad indicators: lower is better
    } else {
      return Math.min(100, rawValue);     // Good indicators: higher is better
    }
  });

  // Calculate average goodness score for domain
  const domainScore = goodnessScores.reduce((sum, score) => sum + score, 0) / goodnessScores.length;

  return Math.round(domainScore * 100) / 100; // Round to 2 decimal places
}
```

#### IMD Domain Scoring (Raw Values)
```javascript
function calculateIMDDomainScore(indicators, results) {
  const validIndicators = indicators.filter(indicator =>
    results[indicator] && results[indicator].value !== null
  );

  if (validIndicators.length === 0) return null;

  // For IMD, use raw facility density values
  const rawValues = validIndicators.map(indicator =>
    parseFloat(results[indicator].value) || 0
  );

  // Return average raw value
  return rawValues.reduce((sum, value) => sum + value, 0) / rawValues.length;
}
```

---

## Performance Benchmarking

### SDHE Performance Thresholds

```javascript
const PERFORMANCE_THRESHOLDS = {
  excellent: 80,  // 80-100: Excellent performance
  good: 60,       // 60-79: Good performance
  fair: 40,       // 40-59: Fair performance
  poor: 0         // 0-39: Poor performance
};

function getPerformanceLevel(score, indicator) {
  // Apply reverse indicator logic
  const adjustedScore = REVERSE_INDICATORS[indicator] ? (100 - score) : score;

  if (adjustedScore >= PERFORMANCE_THRESHOLDS.excellent) return 'excellent';
  else if (adjustedScore >= PERFORMANCE_THRESHOLDS.good) return 'good';
  else if (adjustedScore >= PERFORMANCE_THRESHOLDS.fair) return 'fair';
  else return 'poor';
}

function getPerformanceColor(score, indicator) {
  const level = getPerformanceLevel(score, indicator);

  const colorMap = {
    excellent: '#10B981', // Green
    good: '#F59E0B',      // Yellow
    fair: '#FB923C',      // Orange
    poor: '#EF4444'       // Red
  };

  return colorMap[level];
}
```

### Healthcare Supply Benchmarks (WHO Standards)

```javascript
const HEALTHCARE_SUPPLY_BENCHMARKS = {
  // Healthcare Workers (per 1,000 population)
  doctor_per_population: {
    excellent: 2.5,  // WHO recommendation
    good: 1.0,
    fair: 0.5,
    poor: 0.0
  },

  nurse_per_population: {
    excellent: 2.5,
    good: 1.5,
    fair: 1.0,
    poor: 0.0
  },

  // Infrastructure (per 10,000 population)
  hospital_per_population: {
    excellent: 3.5,
    good: 2.5,
    fair: 1.5,
    poor: 0.0
  },

  clinic_per_population: {
    excellent: 5.0,
    good: 3.0,
    fair: 1.5,
    poor: 0.0
  },

  pharmacy_per_population: {
    excellent: 10.0,
    good: 5.0,
    fair: 2.0,
    poor: 0.0
  },

  // Community Infrastructure (per 10,000 population)
  market_per_population: {
    excellent: 1.5,
    good: 0.8,
    fair: 0.3,
    poor: 0.0
  },

  // Recreation (per 1,000 population)
  sportfield_per_population: {
    excellent: 2.0,
    good: 1.0,
    fair: 0.4,
    poor: 0.0
  }
};

function getBenchmarkLevel(value, indicator) {
  const benchmark = HEALTHCARE_SUPPLY_BENCHMARKS[indicator];
  if (!benchmark) return 'unknown';

  const numValue = parseFloat(value);

  if (numValue >= benchmark.excellent) return 'excellent';
  else if (numValue >= benchmark.good) return 'good';
  else if (numValue >= benchmark.fair) return 'fair';
  else return 'poor';
}
```

---

## Data Quality Assurance

### Sample Size Validation

```javascript
const MINIMUM_SAMPLE_SIZE = 5;

function validateSampleSize(records, populationGroup, district) {
  const filteredRecords = records.filter(r =>
    r.population_group === populationGroup &&
    r.district === district
  );

  return {
    sampleSize: filteredRecords.length,
    sufficient: filteredRecords.length >= MINIMUM_SAMPLE_SIZE,
    records: filteredRecords
  };
}

function markInsufficientSample(result) {
  return {
    ...result,
    value: null,
    insufficientSample: true,
    message: `Insufficient sample size (n < ${MINIMUM_SAMPLE_SIZE})`
  };
}
```

### Data Validation Rules

```javascript
// Income Validation for Financial Indicators
function validateIncomeData(records) {
  return records.filter(r =>
    r.income !== null &&
    r.income !== undefined &&
    r.income > 0 &&
    r.income < 1000000 // Reasonable upper bound
  );
}

// BMI Validation for Health Indicators
function validateBMIData(records) {
  return records.filter(r =>
    r.height > 0 && r.weight > 0 &&
    r.height >= 100 && r.height <= 250 && // cm
    r.weight >= 30 && r.weight <= 300     // kg
  );
}

// Age Validation for Age-Specific Indicators
function validateAgeData(records, minAge = null, maxAge = null) {
  return records.filter(r => {
    if (minAge !== null && r.age < minAge) return false;
    if (maxAge !== null && r.age > maxAge) return false;
    return r.age >= 14 && r.age <= 100; // Reasonable age range
  });
}

// Response Validation for Binary Indicators
function validateBinaryResponse(records, field) {
  return records.filter(r =>
    r[field] === 0 || r[field] === 1
  );
}
```

### Missing Data Handling

```javascript
function handleMissingData(records, requiredFields) {
  const validRecords = records.filter(record => {
    return requiredFields.every(field => {
      const value = record[field];
      return value !== null &&
             value !== undefined &&
             value !== '' &&
             !isNaN(value);
    });
  });

  const missingDataRate = ((records.length - validRecords.length) / records.length) * 100;

  return {
    validRecords: validRecords,
    originalCount: records.length,
    validCount: validRecords.length,
    missingDataRate: missingDataRate,
    highMissingData: missingDataRate > 20 // Flag if >20% missing
  };
}
```

---

## Visualization Processing

### Spider Chart Data Transformation

```javascript
function prepareSpiderChartData(indicators, results, activeGroups) {
  const chartData = indicators.map(indicator => {
    const dataPoint = {
      indicator: indicator.name,
      fullMark: 100
    };

    activeGroups.forEach(group => {
      const groupResult = results[group.value] && results[group.value][indicator.code];

      if (groupResult && !groupResult.insufficientSample) {
        let value = groupResult.value;

        // Apply reverse indicator logic
        if (REVERSE_INDICATORS[indicator.code]) {
          value = 100 - value;
        }

        dataPoint[group.value] = Math.max(0, Math.min(100, value));
      } else {
        dataPoint[group.value] = 0; // Missing data
      }
    });

    return dataPoint;
  });

  return chartData;
}

// Dynamic Range Calculation for Better Visualization
function calculateDynamicRange(chartData, activeGroups) {
  const allValues = chartData.flatMap(d =>
    activeGroups.map(group => d[group.value] || 0)
  );

  if (allValues.length === 0) return { min: 0, max: 100 };

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;

  // Add padding for better visualization
  const padding = Math.max(range * 0.2, 5);

  return {
    min: Math.max(0, Math.floor(minValue - padding)),
    max: Math.min(100, Math.ceil(maxValue + padding))
  };
}
```

### District Ranking Algorithm

```javascript
function calculateDistrictRankings(surveyData, indicator, populationGroup, reverseIndicator = false) {
  const districtValues = [];

  // Get unique districts from data
  const districts = [...new Set(surveyData.map(r => r.district_name))];

  districts.forEach(district => {
    const records = surveyData.filter(r =>
      r.district_name === district &&
      r.population_group === populationGroup
    );

    if (records.length >= MINIMUM_SAMPLE_SIZE) {
      const percentage = calculateIndicatorPercentage(records, indicator);

      districtValues.push({
        district: district,
        value: Math.min(100, Math.max(0, percentage)),
        sampleSize: records.length,
        color: getPerformanceColor(percentage, indicator)
      });
    }
  });

  // Sort districts by performance
  const sortedDistricts = districtValues.sort((a, b) => {
    if (reverseIndicator) {
      return a.value - b.value; // Lower is better for reverse indicators
    } else {
      return b.value - a.value; // Higher is better for normal indicators
    }
  });

  return {
    topPerformers: sortedDistricts.slice(0, 5),
    bottomPerformers: sortedDistricts.slice(-5).reverse(),
    allDistricts: sortedDistricts
  };
}
```

### Choropleth Map Data Processing

```javascript
function prepareChoroplethData(geoJsonData, indicatorResults, selectedIndicator) {
  const processedFeatures = geoJsonData.features.map(feature => {
    const districtCode = feature.properties.dcode;
    const districtName = feature.properties.dname;

    const result = indicatorResults[districtCode];

    let value = null;
    let color = '#E5E7EB'; // Default gray for no data
    let insufficientSample = false;

    if (result && result[selectedIndicator]) {
      const indicatorResult = result[selectedIndicator];

      if (indicatorResult.insufficientSample) {
        insufficientSample = true;
        color = '#FEE2E2'; // Light red for insufficient sample
      } else {
        value = indicatorResult.value;
        color = getPerformanceColor(value, selectedIndicator);
      }
    }

    return {
      ...feature,
      properties: {
        ...feature.properties,
        value: value,
        color: color,
        insufficientSample: insufficientSample,
        displayValue: value !== null ? `${value.toFixed(1)}%` : 'No data'
      }
    };
  });

  return {
    type: 'FeatureCollection',
    features: processedFeatures
  };
}
```

---

## Technical Implementation

### Performance Optimizations

#### 1. Memoization Strategy
```javascript
// Component-level memoization for expensive calculations
const MemoizedIndicatorDetail = React.memo(IndicatorDetail);

// Hook-level memoization for data processing
const processedData = useMemo(() => {
  if (!rawData) return null;
  return dataProcessor.calculateIndicators(rawData);
}, [rawData, selectedFilters]);

// Calculation-level memoization for correlation analysis
const correlationMatrix = useMemo(() => {
  if (!indicators || !results) return null;
  return calculateCorrelationMatrix(indicators, results);
}, [indicators, results]);
```

#### 2. Code Splitting and Lazy Loading
```javascript
// Route-based code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const IndicatorDetail = lazy(() => import('./components/Dashboard/IndicatorDetail'));

// Vite manual chunk configuration
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'charts': ['recharts'],
        'maps': ['leaflet', 'react-leaflet'],
        'utils': ['lodash', 'papaparse']
      }
    }
  }
}
```

#### 3. Data Caching Strategy
```javascript
class DataCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 300000; // 5 minutes
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}
```

### Error Handling and Resilience

#### 1. Data Loading Error Handling
```javascript
class DataProcessor {
  async loadData() {
    try {
      const timeout = 30000; // 30 second timeout

      const loadWithTimeout = (url) => {
        return Promise.race([
          fetch(url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);
      };

      const responses = await Promise.allSettled([
        loadWithTimeout('/data/survey_sampling.csv'),
        loadWithTimeout('/data/health_supply.csv'),
        loadWithTimeout('/data/health_facilities.csv'),
        // ... other data files
      ]);

      const failedLoads = responses.filter(r => r.status === 'rejected');

      if (failedLoads.length > 0) {
        console.warn('Some data files failed to load:', failedLoads);
      }

      return this.processLoadedData(responses);

    } catch (error) {
      console.error('Data loading failed:', error);
      throw new Error('Failed to load dashboard data');
    }
  }
}
```

#### 2. Calculation Error Recovery
```javascript
function safeCalculateIndicator(records, indicator, calculationFn) {
  try {
    if (!records || records.length === 0) {
      return { value: null, error: 'No data available' };
    }

    if (records.length < MINIMUM_SAMPLE_SIZE) {
      return {
        value: null,
        insufficientSample: true,
        sampleSize: records.length
      };
    }

    const result = calculationFn(records);

    if (isNaN(result) || !isFinite(result)) {
      return { value: null, error: 'Invalid calculation result' };
    }

    return {
      value: Math.max(0, Math.min(100, result)),
      sampleSize: records.length
    };

  } catch (error) {
    console.error(`Calculation error for ${indicator}:`, error);
    return { value: null, error: error.message };
  }
}
```

### Multilingual Support

#### 1. Dynamic Language Switching
```javascript
const LanguageContext = createContext();

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('th');

  const t = useCallback((key, fallback = key) => {
    const translations = getTranslations();
    return translations[language]?.[key] || fallback;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Usage in components
function IndicatorCard({ indicator }) {
  const { t } = useContext(LanguageContext);

  return (
    <div>
      <h3>{t(indicator.nameKey, indicator.nameEn)}</h3>
      <p>{t(indicator.descriptionKey, indicator.descriptionEn)}</p>
    </div>
  );
}
```

#### 2. Indicator Metadata Localization
```javascript
// Indicator metadata with translations
const indicatorMetadata = {
  unemployment_rate: {
    nameEn: 'Unemployment Rate',
    nameTh: 'อัตราการว่างงาน',
    descriptionEn: 'Percentage of working-age population that is unemployed',
    descriptionTh: 'ร้อยละของประชากรวัยทำงานที่ว่างงาน',
    interpretationEn: 'Lower unemployment indicates better economic opportunities',
    interpretationTh: 'อัตราการว่างงานที่ต่ำกว่าบ่งชี้โอกาสทางเศรษฐกิจที่ดีกว่า'
  }
  // ... more indicators
};

function getIndicatorName(indicator, language) {
  const key = language === 'th' ? 'nameTh' : 'nameEn';
  return indicatorMetadata[indicator]?.[key] || indicator;
}
```

---

## API Reference

### DataProcessor Class Methods

#### Core Data Loading
```javascript
class DataProcessor {
  // Load all data sources
  async loadData(): Promise<void>

  // Load specific data files
  async loadSurveyData(): Promise<Array<SurveyRecord>>
  async loadHealthcareSupplyData(): Promise<Array<HealthSupplyRecord>>
  async loadHealthcareFacilitiesData(): Promise<Array<FacilityRecord>>

  // Load community infrastructure data
  async loadMarketData(): Promise<Array<MarketRecord>>
  async loadSportfieldData(): Promise<Array<SportfieldRecord>>
  async loadParkData(): Promise<Array<ParkRecord>>
}
```

#### Indicator Calculations
```javascript
class DataProcessor {
  // Calculate SDHE indicators from survey data
  calculateSDHEIndicators(): Object<DistrictCode, Object<PopulationGroup, Object<Indicator, Result>>>

  // Calculate IMD indicators from facility/infrastructure data
  calculateIMDIndicators(): Object<DistrictCode, Object<Indicator, Result>>

  // Get Bangkok-wide aggregated results
  getBangkokOverallResults(): Object<Indicator, Result>

  // Calculate domain scores
  calculateDomainScore(indicators: Array<string>, results: Object): number
}
```

#### Population Classification
```javascript
class DataProcessor {
  // Classify individual respondent into population groups
  classifyPopulationGroup(record: SurveyRecord): string

  // Get population group counts by district
  getPopulationGroupCounts(): Object<DistrictCode, Object<PopulationGroup, number>>

  // Validate sample sizes for statistical reliability
  validateSampleSize(records: Array<SurveyRecord>, minSize: number = 5): boolean
}
```

### Data Structures

#### Survey Record Structure
```typescript
interface SurveyRecord {
  dname: string;              // District code (1001-1050)
  age: number;                // Age in years
  sex: 'male' | 'female' | 'lgbt';
  disable_status: 0 | 1;      // Disability status
  disable_work_status?: 0 | 1; // Work impact of disability

  // Employment
  occupation_status: 0 | 1;   // 0=unemployed, 1=employed
  occupation_type?: number;   // Employment category
  occupation_freelance_type?: number; // Informal work type
  occupation_contract?: 0 | 1; // 0=no contract, 1=formal contract
  income?: number;            // Monthly income
  income_type?: 1 | 2;        // 1=daily, 2=monthly

  // Health conditions (21 disease types)
  diseases_status?: 0 | 1;
  diseases_type_1?: 0 | 1;    // Diabetes
  diseases_type_2?: 0 | 1;    // Hypertension
  // ... diseases_type_21

  // Health behaviors
  drink_status?: number;      // Alcohol consumption
  smoke_status?: number;      // Tobacco use
  exercise_status?: number;   // Physical activity
  height?: number;            // Height in cm
  weight?: number;            // Weight in kg

  // Healthcare access
  medical_skip_1?: 0 | 1;     // Skipped consultation due to cost
  medical_skip_2?: 0 | 1;     // Skipped treatment due to cost
  medical_skip_3?: 0 | 1;     // Skipped medicine due to cost
  hh_health_expense?: number; // Household health spending
  health_expense?: number;    // Individual health spending

  // Social context
  physical_violence?: 0 | 1;  // Experienced physical violence
  psychological_violence?: 0 | 1; // Experienced psychological violence
  sexual_violence?: 0 | 1;    // Experienced sexual violence
  discrimination_1?: 0 | 1;   // Age discrimination
  discrimination_2?: 0 | 1;   // Gender discrimination
  discrimination_3?: 0 | 1;   // Health status discrimination
  discrimination_4?: 0 | 1;   // Income discrimination
  discrimination_5?: 0 | 1;   // Other discrimination
  community_safety?: 1 | 2 | 3 | 4; // Safety rating

  // Food security
  food_insecurity_1?: 0 | 1;  // Moderate food insecurity
  food_insecurity_2?: 0 | 1;  // Severe food insecurity

  // Education
  education?: number;         // Education level (1-8)
  speak?: 0 | 1;             // Speaking proficiency
  read?: 0 | 1;              // Reading proficiency
  write?: 0 | 1;             // Writing proficiency
  math?: 0 | 1;              // Numeracy proficiency

  // Housing and environment
  house_status?: number;      // Housing tenure
  water_supply?: number;      // Water access quality
  waste_water_disposal?: number; // Sanitation type
}
```

#### Result Structure
```typescript
interface IndicatorResult {
  value: number | null;       // Calculated percentage/rate
  sampleSize?: number;        // Number of respondents
  insufficientSample?: boolean; // Sample size < minimum threshold
  error?: string;             // Error message if calculation failed
  metadata?: {
    calculation: string;      // Calculation method description
    unit: string;            // Unit of measurement
    reverse: boolean;        // Whether higher values are worse
  };
}

interface DomainResult {
  [indicatorCode: string]: IndicatorResult;
  domainScore?: number;       // Aggregate domain score
}

interface DistrictResult {
  [populationGroup: string]: DomainResult;
}

interface SystemResults {
  [districtCode: string]: DistrictResult;
  bangkok_overall?: DomainResult; // City-wide aggregation
}
```

### Dashboard Utilities

#### Data Filtering Functions
```javascript
// Filter survey data by population group
function filterByPopulationGroup(data, populationGroup) {
  return data.filter(record =>
    classifyPopulationGroup(record) === populationGroup
  );
}

// Filter by district
function filterByDistrict(data, districtCode) {
  return data.filter(record => record.dname === districtCode);
}

// Filter by age range
function filterByAgeRange(data, minAge, maxAge) {
  return data.filter(record =>
    record.age >= minAge && record.age <= maxAge
  );
}
```

#### Statistical Utility Functions
```javascript
// Calculate percentile rank of a value within a dataset
function calculatePercentile(value, dataset) {
  const sorted = dataset.slice().sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  return (index / sorted.length) * 100;
}

// Calculate district rankings for an indicator
function calculateDistrictRankings(data, indicator, populationGroup) {
  // Returns: { topPerformers: Array, bottomPerformers: Array, allDistricts: Array }
}

// Format numbers for display
function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals);
}
```

---

## Deployment Guide

### Development Setup

#### Prerequisites
```bash
# Node.js 18+ and npm
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

#### Installation
```bash
# Clone repository
git clone <repository-url>
cd bangkok-health-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

#### Development Scripts
```bash
npm run dev      # Start Vite development server (http://localhost:5173)
npm run build    # Build production bundle to dist/
npm run preview  # Preview production build locally
npm run lint     # Run ESLint for code quality checks
```

### Data Preparation

#### Required Data Files (in `/public/data/`)
```
survey_sampling.csv           # Main survey data (50k+ records)
health_supply.csv            # Healthcare worker counts by district
health_facilities.csv        # Healthcare facility information
district_population.csv      # Population counts by district
community_health_worker.csv  # Community health worker data
community_population.csv     # Community-level population data
market.csv                   # Market facilities by district
sportfield.csv              # Sports facilities by district
public_park.csv             # Public parks by district
district.geojson            # Bangkok district boundaries
indicator_detail.csv        # Indicator metadata and translations
```

#### Data Validation Checklist
```bash
# Verify data file structure
head -1 /public/data/survey_sampling.csv  # Check headers
wc -l /public/data/survey_sampling.csv    # Check record count

# Validate district codes (should be 1001-1050)
cut -d',' -f1 /public/data/survey_sampling.csv | sort | uniq

# Check for missing values in critical fields
grep -c ",,\|,$" /public/data/survey_sampling.csv
```

### Production Deployment

#### Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
          'maps': ['leaflet', 'react-leaflet'],
          'utils': ['lodash', 'papaparse']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['leaflet', 'papaparse', 'lodash', 'recharts']
  }
});
```

#### Static File Hosting Requirements
```
- Minimum 100MB storage for data files
- Support for CSV, JSON, and GeoJSON files
- CORS headers enabled for data access
- HTTPS recommended for security
- CDN optional but recommended for performance
```

#### Environment Configuration
```javascript
// .env.production
VITE_API_BASE_URL=https://your-domain.com
VITE_DATA_PATH=/data/
VITE_ANALYTICS_ID=your-analytics-id
```

### Performance Optimization

#### Bundle Size Optimization
```bash
# Analyze bundle size
npm run build
npx bundlemon

# Key metrics to monitor:
# - Initial bundle: < 500KB gzipped
# - Vendor chunk: < 300KB gzipped
# - Data files: < 50MB total
```

#### Caching Strategy
```nginx
# Nginx configuration for static assets
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location /data/ {
  expires 1h;
  add_header Cache-Control "public";
}

location / {
  expires 1h;
  add_header Cache-Control "public";
  try_files $uri $uri/ /index.html;
}
```

### Monitoring and Maintenance

#### Key Performance Metrics
```javascript
// Performance monitoring
const performanceMetrics = {
  pageLoadTime: 'Target: < 3 seconds',
  dataLoadTime: 'Target: < 5 seconds',
  interactionResponsiveness: 'Target: < 100ms',
  memoryUsage: 'Target: < 100MB',
  bundleSize: 'Target: < 500KB gzipped'
};
```

#### Health Checks
```javascript
// API health check endpoint
function healthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dataFiles: checkDataFileAvailability(),
    sampleSizes: validateMinimumSampleSizes(),
    calculationIntegrity: validateCalculationResults()
  };
}
```

#### Backup and Recovery
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf "dashboard-backup-$DATE.tar.gz" \
  public/data/ \
  src/ \
  package.json \
  vite.config.js

# Upload to cloud storage
aws s3 cp "dashboard-backup-$DATE.tar.gz" s3://backups/
```

---

This comprehensive documentation provides all the technical details, calculations, and implementation guidance needed to understand, maintain, and extend the Bangkok Health Dashboard system. The document serves as both a technical specification and operational guide for developers, data scientists, and system administrators working with the platform.