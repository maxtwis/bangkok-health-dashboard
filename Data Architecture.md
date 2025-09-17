# Data Architecture Documentation

This document provides comprehensive documentation of the Bangkok Health Dashboard's data architecture, including data flow systems, SDHE (Social Determinants of Health Equity) calculation methodologies, and complete technical specifications.

## Table of Contents

1. [Data Sources and Schema](#data-sources-and-schema)
2. [Data Flow Architecture](#data-flow-architecture)
3. [SDHE Calculation System](#sdhe-calculation-system)
4. [Data Processing Pipeline](#data-processing-pipeline)
5. [Indicator Methodology](#indicator-methodology)
6. [Population Grouping System](#population-grouping-system)
7. [Geographic Data Integration](#geographic-data-integration)
8. [Healthcare Facility Mapping](#healthcare-facility-mapping)
9. [Performance and Validation](#performance-and-validation)
10. [API Specifications](#api-specifications)

## Data Sources and Schema

### Primary Data Files Location
All data files are stored in `/public/data/` for client-side access:

### Core Survey Data
**File**: `survey_sampling.csv`
- **Purpose**: Main SDHE survey responses
- **Records**: ~50,000+ individual survey responses
- **Key Fields**:
  - `district`: Bangkok district (1-50)
  - `population_group`: Target demographic categories
  - `indicator_code`: Health indicator identifier
  - `response_value`: Survey response (0-1 scale)
  - `weight`: Statistical sampling weight
  - `timestamp`: Data collection date

### Population Demographics
**Files**:
- `district_population.csv`: District-level population totals
- `community_population.csv`: Community-level breakdowns
- `normal_population_indicator_*.csv`: Population indicator baselines

**Schema**:
```csv
district_id,district_name,total_population,working_age,elderly,children,informal_workers
1,"Phra Nakhon",140000,85000,25000,20000,35000
```

### Healthcare Infrastructure
**File**: `health_facilities.csv`
- **Purpose**: Healthcare facility locations and capacity
- **Fields**:
  - `facility_id`: Unique identifier
  - `facility_name`: Official name
  - `facility_type`: Hospital/Clinic/Health Center
  - `district`: Location district
  - `latitude`, `longitude`: Geographic coordinates
  - `capacity_beds`: Bed capacity
  - `services_offered`: Service categories
  - `accessibility_score`: Accessibility rating (1-10)

### Geographic Boundaries
**File**: `district.geojson`
- **Purpose**: Bangkok district boundaries for mapping
- **Format**: GeoJSON with district polygons
- **Properties**: District ID, name, area, population density

## Data Flow Architecture

### 1. Data Ingestion Layer
```
Raw Data Sources → CSV Files → Public Directory → Client Loading
```

**Process Flow**:
1. Survey data collected via field research
2. Population data sourced from Thai National Statistical Office
3. Healthcare facility data from Ministry of Public Health
4. Geographic boundaries from Bangkok Metropolitan Administration
5. All data standardized to UTF-8 CSV format
6. Files deployed to `/public/data/` for browser access

### 2. Data Loading System
**Hook**: `useSDHEData` (`src/hooks/useSDHEData.js`)

```javascript
// Data loading with error handling and timeout
const { data, loading, error } = useSDHEData();
```

**Features**:
- 30-second timeout protection
- Retry logic for failed requests
- Memory caching for performance
- Error state management

### 3. Data Processing Pipeline
**Core Processor**: `DataProcessor` class (`src/utils/DataProcessor.js`)

**Processing Steps**:
1. **Raw Data Validation**: Check for required fields and data types
2. **Statistical Filtering**: Remove districts with <5 respondents
3. **Weight Application**: Apply survey sampling weights
4. **Indicator Calculation**: Compute health indicators by population group
5. **Geographic Aggregation**: Roll up data to district level
6. **Benchmarking**: Compare against population baselines

## SDHE Calculation System

### Core Methodology

The Social Determinants of Health Equity (SDHE) system calculates health disparities across population groups using a multi-dimensional approach:

### 1. Indicator Scoring
**Base Formula**:
```javascript
indicator_score = Σ(response_value * weight) / Σ(weight)
```

**Population Group Calculation**:
```javascript
group_score = {
  indicator_code: weighted_average_by_group,
  sample_size: respondent_count,
  confidence_interval: statistical_confidence,
  relative_performance: score_vs_population_average
}
```

### 2. Health Domain Aggregation
**Domains** (from `dashboardConstants.js`):
- **Social Environment**: Community cohesion, social support
- **Economic Security**: Income stability, employment
- **Education**: Health literacy, educational attainment
- **Neighborhood**: Housing quality, environmental factors
- **Healthcare Access**: Service availability, affordability
- **Individual Factors**: Personal health behaviors

**Domain Score**:
```javascript
domain_score = Σ(indicator_scores_in_domain) / indicator_count
```

### 3. Equity Index Calculation
**Methodology**: Modified Gini coefficient approach
```javascript
equity_index = 1 - (2 * Σ|group_score - population_mean|) / (n * population_mean)
```

**Interpretation**:
- 1.0 = Perfect equity (all groups equal)
- 0.0 = Maximum inequity
- >0.8 = High equity
- 0.6-0.8 = Moderate equity
- <0.6 = Low equity

### 4. Reverse Indicator Handling
**Reverse Indicators** (lower values = better outcomes):
- Healthcare costs as % of income
- Disease prevalence rates
- Environmental hazard exposure
- Food insecurity rates

**Calculation Adjustment**:
```javascript
if (REVERSE_INDICATORS.includes(indicator_code)) {
  adjusted_score = 1 - raw_score;
}
```

## Data Processing Pipeline

### Pipeline Architecture
```
CSV Files → DataProcessor → Indicator Calculation → Geographic Aggregation → UI Rendering
```

### 1. Data Ingestion (`DataProcessor.loadData()`)
```javascript
async loadData() {
  const surveys = await this.loadCSV('survey_sampling.csv');
  const facilities = await this.loadCSV('health_facilities.csv');
  const population = await this.loadCSV('district_population.csv');
  // Validation and error handling
}
```

### 2. Statistical Processing (`DataProcessor.calculateIndicators()`)
```javascript
calculateIndicators() {
  return this.surveyData.reduce((acc, row) => {
    const weight = parseFloat(row.weight) || 1;
    const value = parseFloat(row.response_value);

    if (!acc[row.district]) acc[row.district] = {};
    if (!acc[row.district][row.population_group]) {
      acc[row.district][row.population_group] = {};
    }

    // Weighted average calculation
    const current = acc[row.district][row.population_group][row.indicator_code] || {
      sum: 0, weightSum: 0, count: 0
    };

    acc[row.district][row.population_group][row.indicator_code] = {
      sum: current.sum + (value * weight),
      weightSum: current.weightSum + weight,
      count: current.count + 1
    };

    return acc;
  }, {});
}
```

### 3. Data Validation Rules
- **Minimum Sample Size**: 5 respondents per district/group combination
- **Response Range**: 0.0 ≤ response_value ≤ 1.0
- **Weight Validation**: weight > 0
- **District Range**: 1 ≤ district ≤ 50 (Bangkok districts)

### 4. Missing Data Handling
```javascript
handleMissingData(districtData) {
  // Flag districts with insufficient data
  // Apply population-based interpolation where appropriate
  // Mark data quality indicators
}
```

## Indicator Methodology

### Indicator Categories

#### 1. Social Environment Indicators
- **Community Cohesion Score**: Social network strength (0-1)
- **Social Support Index**: Available support systems (0-1)
- **Community Participation Rate**: Civic engagement (0-1)

#### 2. Economic Security Indicators
- **Income Stability Index**: Employment security (0-1)
- **Financial Stress Score**: Economic burden (0-1, reverse)
- **Economic Mobility Potential**: Opportunity access (0-1)

#### 3. Education & Health Literacy
- **Health Literacy Score**: Health knowledge (0-1)
- **Educational Attainment Index**: Education levels (0-1)
- **Information Access Score**: Health information availability (0-1)

#### 4. Neighborhood Environment
- **Housing Quality Index**: Living conditions (0-1)
- **Environmental Safety Score**: Pollution/hazards (0-1)
- **Walkability Index**: Pedestrian infrastructure (0-1)

#### 5. Healthcare Access
- **Service Availability Score**: Healthcare proximity (0-1)
- **Affordability Index**: Cost barriers (0-1, reverse)
- **Quality of Care Score**: Service quality (0-1)

#### 6. Individual Health Factors
- **Preventive Care Utilization**: Screening rates (0-1)
- **Health Behavior Index**: Lifestyle factors (0-1)
- **Chronic Disease Management**: Care compliance (0-1)

### Calculation Methodology by Indicator Type

#### Continuous Indicators
```javascript
calculateContinuousIndicator(responses) {
  const weights = responses.map(r => r.weight);
  const values = responses.map(r => r.value);
  return weightedAverage(values, weights);
}
```

#### Binary Indicators
```javascript
calculateBinaryIndicator(responses) {
  const positiveResponses = responses.filter(r => r.value === 1);
  return positiveResponses.length / responses.length;
}
```

#### Composite Indicators
```javascript
calculateCompositeIndicator(subIndicators) {
  return subIndicators.reduce((sum, indicator) => {
    return sum + (indicator.score * indicator.weight);
  }, 0) / subIndicators.reduce((sum, ind) => sum + ind.weight, 0);
}
```

## Population Grouping System

### Target Population Groups
**Defined in**: `dashboardConstants.js`

1. **Informal Workers**
   - Street vendors, day laborers, gig workers
   - Economic vulnerability focus
   - Healthcare access barriers

2. **Elderly (65+)**
   - Age-related health challenges
   - Social isolation risks
   - Healthcare utilization patterns

3. **Children & Adolescents (0-18)**
   - Developmental health indicators
   - Educational environment factors
   - Family socioeconomic impact

4. **Women of Reproductive Age (15-49)**
   - Maternal health access
   - Gender-specific health barriers
   - Economic participation

5. **Migrant Workers**
   - Language barriers
   - Legal status health impacts
   - Cultural competency of care

6. **Low-Income Households**
   - Economic determinants of health
   - Healthcare affordability
   - Housing and nutrition security

### Population Group Weighting
```javascript
calculateGroupWeights() {
  // Population-proportional weighting
  const totalPopulation = this.getTotalPopulation();
  return POPULATION_GROUPS.map(group => ({
    group: group.key,
    weight: group.population / totalPopulation,
    adjustmentFactor: group.vulnerabilityMultiplier || 1.0
  }));
}
```

## Geographic Data Integration

### District-Level Analysis
**Bangkok Districts**: 50 administrative districts

**Geographic Processing**:
1. **Boundary Mapping**: GeoJSON polygon matching
2. **Population Density**: Residents per km²
3. **Healthcare Accessibility**: Distance-based scoring
4. **Socioeconomic Clustering**: Similar districts grouping

### Spatial Analysis Methods

#### Healthcare Accessibility Scoring
```javascript
calculateAccessibilityScore(district) {
  const facilities = this.getHealthcareFacilities(district);
  const population = this.getDistrictPopulation(district);

  const facilityDensity = facilities.length / population * 10000;
  const averageDistance = this.calculateAverageDistance(facilities);
  const serviceQuality = this.getAverageQualityScore(facilities);

  return (facilityDensity * 0.4) +
         ((10 - averageDistance) / 10 * 0.3) +
         (serviceQuality * 0.3);
}
```

#### Neighborhood Environment Index
```javascript
calculateNeighborhoodIndex(district) {
  return {
    walkability: this.calculateWalkabilityScore(district),
    greenSpace: this.calculateGreenSpaceAccess(district),
    airQuality: this.getAirQualityIndex(district),
    noiseLevel: this.getNoiseLevel(district),
    safety: this.calculateSafetyScore(district)
  };
}
```

## Healthcare Facility Mapping

### Facility Classification System

#### Facility Types
1. **Hospitals**
   - General hospitals (>100 beds)
   - Specialized hospitals
   - University hospitals

2. **Health Centers**
   - District health centers
   - Community health centers
   - Sub-district health promoting hospitals

3. **Clinics**
   - Private clinics
   - Specialty clinics
   - Urgent care centers

### Healthcare Supply Benchmarks
**Defined in**: `dashboardConstants.js`

```javascript
HEALTHCARE_SUPPLY_BENCHMARKS = {
  hospitals_per_100k: {
    excellent: 15,
    good: 10,
    adequate: 5,
    insufficient: 0
  },
  beds_per_1000: {
    excellent: 8,
    good: 5,
    adequate: 3,
    insufficient: 0
  },
  clinics_per_10k: {
    excellent: 20,
    good: 15,
    adequate: 10,
    insufficient: 0
  }
}
```

### Healthcare Access Calculation
```javascript
calculateHealthcareAccess(district, populationGroup) {
  const facilities = this.getFacilitiesInDistrict(district);
  const population = this.getPopulationCount(district, populationGroup);

  const metrics = {
    facilityDensity: this.calculateFacilityDensity(facilities, population),
    averageDistance: this.calculateAverageDistance(facilities),
    serviceAvailability: this.assessServiceAvailability(facilities, populationGroup),
    affordabilityScore: this.calculateAffordability(district, populationGroup),
    culturalCompetency: this.assessCulturalCompetency(facilities, populationGroup)
  };

  return this.aggregateAccessScore(metrics);
}
```

## Performance and Validation

### Data Quality Metrics

#### Sample Size Validation
```javascript
validateSampleSize(districtData) {
  const minSampleSize = 5;
  return Object.entries(districtData).filter(([key, data]) => {
    return data.sampleSize >= minSampleSize;
  });
}
```

#### Statistical Confidence
```javascript
calculateConfidenceInterval(mean, standardError, sampleSize) {
  const tValue = this.getTValue(sampleSize - 1); // 95% confidence
  const marginOfError = tValue * standardError;
  return {
    lower: mean - marginOfError,
    upper: mean + marginOfError,
    confidence: 0.95
  };
}
```

#### Data Completeness Check
```javascript
assessDataCompleteness() {
  return {
    surveyCompletion: this.calculateSurveyCompletionRate(),
    indicatorCoverage: this.calculateIndicatorCoverage(),
    populationGroupCoverage: this.calculatePopulationGroupCoverage(),
    geographicCoverage: this.calculateGeographicCoverage()
  };
}
```

### Performance Optimizations

#### Memory Management
- Data chunking for large datasets
- Lazy loading of geographic data
- Memoization of expensive calculations

#### Caching Strategy
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
    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

## API Specifications

### Data Access Patterns

#### useSDHEData Hook
```javascript
const {
  data,           // Processed survey data
  loading,        // Loading state
  error,          // Error state
  indicators,     // Available indicators
  districts,      // District list
  facilities      // Healthcare facilities
} = useSDHEData();
```

#### DataProcessor Methods
```javascript
class DataProcessor {
  // Core data loading
  async loadData()

  // Indicator calculations
  calculateIndicators()
  calculateDomainScores()
  calculateEquityIndex()

  // Geographic analysis
  getDistrictData(districtId)
  getPopulationGroupData(populationGroup)

  // Healthcare facility analysis
  getFacilityAccessibility(district)
  calculateHealthcareSupply()

  // Validation and quality
  validateDataQuality()
  getDataCompleteness()
  calculateStatisticalSignificance()
}
```

### Dashboard Utilities API
```javascript
// From dashboardUtils.js
export const dashboardUtils = {
  // Data filtering
  filterByPopulationGroup(data, group),
  filterByIndicator(data, indicator),
  filterByDistrict(data, district),

  // Calculations
  calculatePercentile(value, dataset),
  calculateRanking(districts, indicator),
  getIndicatorTrend(historical_data),

  // Formatting
  formatPercentage(value),
  formatHealthScore(score),
  getScoreColor(score, indicator),

  // Comparisons
  compareDistricts(district1, district2),
  comparePopulationGroups(group1, group2),
  calculateGap(advantaged, disadvantaged)
};
```

## Data Update and Maintenance

### Update Frequency
- **Survey Data**: Annual collection cycle
- **Facility Data**: Quarterly updates
- **Population Data**: Annual census updates
- **Geographic Boundaries**: As needed (rare)

### Data Validation Pipeline
1. **Schema Validation**: Required fields and data types
2. **Range Validation**: Value bounds checking
3. **Consistency Checks**: Cross-dataset validation
4. **Statistical Validation**: Outlier detection
5. **Geographic Validation**: Coordinate and boundary checks

### Backup and Recovery
- Version control for all data files
- Automated backup before updates
- Rollback procedures for data issues
- Data integrity monitoring

## Conclusion

This data architecture provides a robust foundation for analyzing social determinants of health equity in Bangkok. The system processes complex survey data, integrates multiple data sources, and calculates meaningful health equity indicators while maintaining statistical rigor and performance optimization.

The modular design allows for easy extension with new indicators, population groups, or geographic areas while maintaining consistency in calculation methodologies and data quality standards.