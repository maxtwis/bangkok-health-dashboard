# Bangkok Health Dashboard: Project Documentation

## Executive Summary

The Bangkok Health Dashboard is a comprehensive web-based platform that analyzes health equity across Bangkok's 50 districts, focusing on four vulnerable population groups: informal workers, LGBT community, elderly (60+), and people with disabilities. The platform processes survey data and infrastructure information to provide evidence-based insights for health policy and intervention planning.

### Key Features
- **Dual Indicator Framework**: SDHE (Social Determinants of Health Equity) and IMD (Index of Multiple Deprivation) metrics
- **Interactive Visualization**: Maps, spider charts, correlation matrices, and detailed analysis
- **Population-Focused Analysis**: Targets specific vulnerable groups with tailored indicators
- **Bilingual Support**: Full Thai/English interface
- **Statistical Rigor**: Minimum sample sizes, correlation analysis, significance testing

---

## 1. Data Sources Overview

### 1.1 Primary Survey Data (`survey_sampling.csv`)
**Purpose**: Main source for SDHE (Social Determinants of Health Equity) indicators
**Records**: 50,000+ individual survey responses
**Coverage**: All 50 Bangkok districts
**Variables**: 130+ fields covering health, social, economic, and environmental factors

**Key Data Fields**:
- **Demographics**: District code (dname), age, sex, disability status
- **Employment**: Occupation status, contract type, income, working hours
- **Health Conditions**: 21 disease types (diabetes, hypertension, etc.)
- **Healthcare Access**: Medical consultation skips, health expenses
- **Social Context**: Violence, discrimination, community safety
- **Education**: Literacy levels, education completion
- **Housing**: Home ownership, utilities access, environmental conditions

### 1.2 Healthcare Infrastructure Data

#### Health Supply (`health_supply.csv`)
**Purpose**: Healthcare worker density calculations
**Fields**:
- District code (dcode)
- Doctor count, nurse count, pharmacist count
- Dentist count, hospital beds
- Population data for ratio calculations

#### Health Facilities (`health_facilities.csv`)
**Purpose**: Healthcare facility access and specialized services
**Fields**:
- Facility name, type, district
- LGBT-friendly services indicator
- Wheelchair accessibility
- Mental health services availability

### 1.3 Community Infrastructure Data

#### Market Access (`market.csv`)
**Purpose**: Food access infrastructure
**Fields**: District code, market count

#### Sports Facilities (`sportfield.csv`)
**Purpose**: Recreation and physical activity infrastructure
**Fields**: District code, sports facility count

#### Public Parks (`public_park.csv`)
**Purpose**: Green space and recreation access
**Fields**: District code, park count

### 1.4 Population Data (`district_population.csv`)
**Purpose**: Population denominators for rate calculations
**Fields**: District code, population count by district

### 1.5 Indicator Metadata (`indicator_detail.csv`)
**Purpose**: Bilingual indicator names, descriptions, and calculation methods
**Fields**:
- Indicator code
- Thai and English names
- Thai and English descriptions
- Calculation method explanations

---

## 2. Population Group Classification

The platform analyzes four vulnerable population groups based on survey responses:

### 2.1 Informal Workers
**Definition**: Employed individuals without formal employment contracts
**Classification Logic**:
```
occupation_status = 1 (employed) AND occupation_contract = 0 (no formal contract)
```
**Characteristics**:
- Limited access to employment benefits
- Higher economic vulnerability
- Includes: street vendors, day laborers, gig workers, freelancers

### 2.2 LGBT Community
**Definition**: Self-identified LGBT individuals
**Classification Logic**:
```
sex = 'lgbt'
```
**Characteristics**:
- Unique healthcare access barriers
- Higher rates of discrimination
- Age distribution: predominantly 18-45 years

### 2.3 Elderly (60+)
**Definition**: Adults aged 60 years and above
**Classification Logic**:
```
age >= 60
```
**Characteristics**:
- Higher prevalence of chronic conditions
- Mobility and accessibility challenges
- Social isolation concerns

### 2.4 People with Disabilities
**Definition**: Self-reported disability status
**Classification Logic**:
```
disable_status = 1
```
**Characteristics**:
- Physical, sensory, or intellectual disabilities
- Employment discrimination
- Accessibility barriers to services

---

## 3. Indicator Framework

### 3.1 SDHE (Social Determinants of Health Equity) Indicators
**Source**: Survey data (`survey_sampling.csv`)
**Purpose**: Measure population health outcomes and social determinants

#### Economic Security Domain
1. **Unemployment Rate**
   - **Calculation**: (Number unemployed ÷ Total working-age population) × 100
   - **Interpretation**: Higher rates indicate economic insecurity

2. **Employment Rate**
   - **Calculation**: (Number employed ÷ Total working-age population) × 100
   - **Interpretation**: Higher rates indicate better economic opportunities

3. **Vulnerable Employment**
   - **Calculation**: (Informal workers ÷ Total employed) × 100
   - **Interpretation**: Higher rates indicate job insecurity

4. **Catastrophic Health Spending (Household)**
   - **Calculation**: (Households spending >40% income on health ÷ Total households) × 100
   - **WHO Standard**: 40% threshold for catastrophic spending

5. **Health Spending Over 10%**
   - **Calculation**: (Individuals spending >10% income on health ÷ Total individuals) × 100

#### Education Domain
1. **Functional Literacy**
   - **Calculation**: (People who can speak, read, write, and do math ÷ Total population) × 100

2. **Primary Education Completion**
   - **Calculation**: (Adults ≥18 with primary education ÷ Total adults) × 100

3. **Secondary Education Completion**
   - **Calculation**: (Adults ≥18 with secondary education ÷ Total adults) × 100

4. **Tertiary Education Completion**
   - **Calculation**: (Adults ≥22 with tertiary education ÷ Total adults) × 100

#### Healthcare Access Domain
1. **Medical Consultation Skip (Cost)**
   - **Calculation**: (People skipping consultation due to cost ÷ Total population) × 100

2. **Medical Treatment Skip (Cost)**
   - **Calculation**: (People skipping treatment due to cost ÷ Total population) × 100

3. **Prescribed Medicine Skip (Cost)**
   - **Calculation**: (People skipping medicine due to cost ÷ Total population) × 100

#### Health Outcomes Domain
1. **Obesity**
   - **Calculation**: BMI ≥30 using weight and height data
   - **Formula**: BMI = weight(kg) ÷ height(m)²

2. **Chronic Disease Prevalence**
   - **Any Chronic Disease**: diseases_status = 1
   - **Specific Diseases**: diabetes, hypertension, heart disease, etc.

3. **Multiple Chronic Conditions**
   - **Calculation**: Individuals with ≥2 chronic diseases

#### Social Context Domain
1. **Community Safety**
   - **Calculation**: Weighted score based on safety ratings (1-4 scale)
   - **Scoring**: Very safe=100, Safe=75, Moderate=50, Unsafe=25

2. **Violence Experience**
   - **Physical Violence**: physical_violence = 1
   - **Psychological Violence**: psychological_violence = 1
   - **Sexual Violence**: sexual_violence = 1

3. **Discrimination Experience**
   - **Calculation**: Any type of discrimination (age, gender, health, income, other)

#### Physical Environment Domain
1. **Clean Water Access**
   - **Calculation**: Access to clean water supply

2. **Sanitation Facilities**
   - **Calculation**: Access to proper sanitation

3. **Housing Overcrowding**
   - **Calculation**: Based on housing density indicators

### 3.2 IMD (Index of Multiple Deprivation) Indicators
**Source**: Infrastructure data (health_supply.csv, health_facilities.csv, etc.)
**Purpose**: Measure infrastructure and service availability

#### Healthcare Infrastructure Domain
1. **Doctor Density**
   - **Calculation**: (Total doctors ÷ District population) × 1,000
   - **Unit**: Doctors per 1,000 population
   - **WHO Benchmark**: 2.5 per 1,000 (excellent)

2. **Nurse Density**
   - **Calculation**: (Total nurses ÷ District population) × 1,000
   - **Unit**: Nurses per 1,000 population

3. **Hospital Bed Density**
   - **Calculation**: (Total beds ÷ District population) × 10,000
   - **Unit**: Beds per 10,000 population

4. **Health Service Access**
   - **Calculation**: (Number of facilities ÷ District population) × 10,000
   - **Unit**: Facilities per 10,000 population

5. **LGBT Service Access**
   - **Calculation**: Count of LGBT-friendly facilities
   - **Unit**: Absolute count (not per population)

#### Food Access Domain
1. **Market Access**
   - **Calculation**: (Number of markets ÷ District population) × 10,000
   - **Unit**: Markets per 10,000 population

#### Sports & Recreation Domain
1. **Sports Field Access**
   - **Calculation**: Count of sports facilities
   - **Unit**: Absolute count

2. **Park Access**
   - **Calculation**: Count of public parks
   - **Unit**: Absolute count

---

## 4. Calculation Methodologies

### 4.1 Data Quality Assurance

#### Minimum Sample Size
- **Requirement**: 5 respondents per district per population group
- **Implementation**: Calculations marked as "insufficient sample" if n < 5
- **Purpose**: Ensures statistical reliability

#### Missing Data Handling
- **Approach**: Exclude null/undefined values from calculations
- **Financial Indicators**: Special validation for income data (must be > 0)
- **Health Indicators**: Validation for reasonable BMI ranges

### 4.2 Statistical Methods

#### Percentage Calculations
```javascript
Percentage = (Number meeting condition ÷ Total valid responses) × 100
```

#### Domain Score Calculation
- **SDHE Domains**: Average of "goodness scores" (reverse indicators converted)
- **IMD Domains**: Average of raw infrastructure values
- **Reverse Indicators**: Higher values are worse (diseases, problems)

#### Correlation Analysis
- **Method**: Pearson correlation coefficient
- **Significance Testing**: t-test with critical values for p<0.05, p<0.01, p<0.001

### 4.3 Performance Benchmarks

#### SDHE Performance Levels
- **Excellent**: 80-100 points
- **Good**: 60-79 points
- **Fair**: 40-59 points
- **Poor**: 0-39 points

#### IMD Healthcare Supply Benchmarks (WHO Standards)
- **Doctor Density**: Excellent ≥2.5, Good ≥1.0, Fair ≥0.5 per 1,000 population
- **Nurse Density**: Excellent ≥2.5, Good ≥1.5, Fair ≥1.0 per 1,000 population

---

## 5. Platform Functions and Features

### 5.1 Interactive Map (BangkokMap.jsx)
**Purpose**: Choropleth visualization of Bangkok districts

**Features**:
- **Color Coding**: Performance-based coloring (green=excellent, red=poor)
- **District Selection**: Click to select district for detailed analysis
- **Fullscreen Mode**: Expandable map view
- **Tooltip Information**: Hover to see indicator values
- **Population Group Filtering**: Switch between different groups
- **Indicator Type Filtering**: SDHE vs IMD indicator visualization

**Data Processing**:
- Uses GeoJSON for district boundaries
- Color assignment based on performance thresholds
- Handles insufficient sample sizes with special coloring

### 5.2 Spider Chart (PopulationGroupSpiderChart.jsx)
**Purpose**: Multi-dimensional comparison across population groups

**Features**:
- **Radar Visualization**: Shows performance across multiple indicators
- **Group Comparison**: Up to 4 population groups simultaneously
- **Interactive Legend**: Toggle groups on/off
- **Dynamic Scaling**: Adjusts scale based on data range
- **Goodness Conversion**: Reverse indicators converted to "goodness scores"

### 5.3 Indicator Detail View (IndicatorDetail.jsx)
**Purpose**: Comprehensive analysis of individual indicators

**Features**:
- **District Rankings**: Top and bottom performing districts
- **Statistical Summary**: Mean, median, standard deviation
- **Sample Size Information**: Shows data reliability
- **Bilingual Descriptions**: Thai and English explanations
- **Calculation Method**: Shows how indicator is computed

### 5.4 Correlation Analysis (IndicatorAnalysis.jsx)
**Purpose**: Statistical relationships between indicators

**Features**:
- **Correlation Matrix**: Pearson correlation coefficients
- **Significance Testing**: Statistical significance indicators
- **Strength Classification**: Weak, moderate, strong correlations
- **Interactive Heatmap**: Color-coded correlation strengths
- **Population Group Filtering**: Separate analysis per group

### 5.5 Filtering System
**Multi-level Filtering**:
1. **Indicator Type**: SDHE vs IMD
2. **Domain**: Economic Security, Education, Healthcare Access, etc.
3. **Population Group**: Informal Workers, LGBT, Elderly, Disabled, Normal Population
4. **District**: Bangkok Overall or specific districts

### 5.6 Language Support
**Bilingual Interface**:
- **Languages**: Thai (primary), English
- **Dynamic Switching**: Real-time language toggle
- **Complete Localization**: All indicator names, descriptions, and UI elements
- **Metadata Integration**: Uses indicator_detail.csv for translations

---

## 6. Technical Implementation

### 6.1 Technology Stack
- **Frontend Framework**: React 19 with Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Charts**: Recharts library
- **Maps**: Leaflet with React-Leaflet
- **Data Processing**: PapaCSV for CSV parsing, Lodash for utilities

### 6.2 Architecture Pattern
- **Component-Based**: Modular React components
- **State Management**: Context API for language, local state for filters
- **Data Flow**: CSV → DataProcessor → Dashboard → Visualization Components
- **Responsive Design**: Mobile-first approach with Tailwind

### 6.3 Performance Optimizations
- **Code Splitting**: Manual chunks for vendor, charts, maps, and utilities
- **Memoization**: React.memo and useMemo for expensive calculations
- **Lazy Loading**: Dynamic imports for route components
- **Data Caching**: Client-side caching for processed results

### 6.4 Data Processing Engine (DataProcessor.js)
**Core Functions**:

#### `loadSurveyData(csvContent)`
- Parses survey CSV data
- Adds district names and population group classifications
- Returns processed survey records

#### `loadHealthcareSupplyData()`
- Loads all infrastructure CSV files
- Processes health facilities, supply data, and community infrastructure
- Handles data validation and error recovery

#### `calculateIndicators()`
- Main calculation engine
- Processes all SDHE and IMD indicators
- Applies minimum sample size requirements
- Returns nested results structure: Domain → District → Population Group → Indicators

#### `classifyPopulationGroup(record)`
- Determines population group membership
- Applies classification logic for each group
- Returns primary group assignment

### 6.5 Error Handling
- **Data Loading**: Timeout protection (30 seconds)
- **Calculation Errors**: Safe calculation with fallback values
- **Missing Data**: Graceful handling with "No Data" states
- **Insufficient Samples**: Clear marking and explanation

---

## 7. Usage Guide

### 7.1 Getting Started
1. **Access Platform**: Navigate to dashboard URL
2. **Select Filters**: Choose indicator type, domain, population group, and district
3. **View Results**: Examine map, charts, and detailed analysis
4. **Switch Languages**: Use language toggle for Thai/English

### 7.2 Understanding Visualizations

#### Map Interpretation
- **Green Districts**: Excellent performance (80-100 points)
- **Yellow Districts**: Good performance (60-79 points)
- **Orange Districts**: Fair performance (40-59 points)
- **Red Districts**: Poor performance (0-39 points)
- **Gray Districts**: No data or insufficient sample

#### Spider Chart Reading
- **Larger Area**: Better overall performance
- **Individual Points**: Performance on specific indicators
- **Group Comparison**: Compare shapes across population groups

#### Correlation Analysis
- **Strong Positive**: Dark blue (r > 0.7)
- **Moderate Positive**: Light blue (0.3 < r < 0.7)
- **Weak/No Correlation**: White (-0.3 < r < 0.3)
- **Negative Correlation**: Red shades (r < -0.3)

### 7.3 Data Interpretation Guidelines

#### For SDHE Indicators
- **Higher Values**: Generally better (except reverse indicators)
- **Reverse Indicators**: Lower values are better (diseases, problems)
- **Domain Scores**: Composite measures of multiple related indicators

#### For IMD Indicators
- **Raw Values**: Actual density or count measures
- **Benchmark Comparison**: Compare against WHO/international standards
- **Resource Allocation**: Identify areas needing infrastructure investment

---

## 8. Data Update Procedures

### 8.1 Survey Data Updates
1. **New Survey Data**: Replace `survey_sampling.csv` with updated file
2. **Format Validation**: Ensure column names match existing structure
3. **Data Quality Check**: Verify reasonable value ranges
4. **Minimum Sample**: Confirm adequate sample sizes per district

### 8.2 Infrastructure Data Updates
1. **Healthcare Data**: Update `health_supply.csv` and `health_facilities.csv`
2. **Community Data**: Update market, sports, and park facility data
3. **Population Data**: Update `district_population.csv` with current figures
4. **Indicator Metadata**: Update `indicator_detail.csv` for new indicators

### 8.3 System Deployment
1. **Build Process**: Run `npm run build` to create production bundle
2. **Static Hosting**: Deploy to web server with CSV file access
3. **Testing**: Verify all data loads correctly and calculations work
4. **Performance**: Monitor loading times and optimize if needed

---

## 9. Quality Assurance

### 9.1 Data Validation
- **Range Checks**: Income, age, and health measurements within reasonable bounds
- **Consistency Checks**: Cross-field validation (e.g., employment status vs income)
- **Completeness**: Track missing data rates per indicator
- **Sample Size**: Ensure adequate representation for statistical reliability

### 9.2 Calculation Verification
- **Manual Validation**: Spot-check calculations against source data
- **Cross-Reference**: Compare results with external health statistics
- **Trend Analysis**: Monitor changes over time for consistency
- **Statistical Review**: Validate correlation and significance testing

### 9.3 User Interface Testing
- **Cross-Browser**: Test on Chrome, Firefox, Safari, Edge
- **Responsive Design**: Verify mobile and tablet functionality
- **Language Switching**: Ensure complete translation coverage
- **Performance**: Monitor loading times and interaction responsiveness

---

## 10. Future Development

### 10.1 Potential Enhancements
- **Time Series Analysis**: Track indicators over multiple survey periods
- **Predictive Modeling**: Forecast health trends based on current data
- **Export Functionality**: PDF reports and data downloads
- **Advanced Filtering**: Custom indicator combinations and thresholds

### 10.2 Data Expansion
- **Additional Population Groups**: Youth, migrants, specific occupational groups
- **New Indicators**: Mental health, environmental health, social capital measures
- **Geographic Detail**: Sub-district or community-level analysis
- **External Data**: Integration with government health databases

### 10.3 Technical Improvements
- **Real-Time Updates**: Database integration for live data updates
- **Advanced Analytics**: Machine learning for pattern detection
- **API Development**: Programmatic access to data and calculations
- **Cloud Deployment**: Scalable hosting with CDN optimization

---

## 11. Contact and Support

### 11.1 Technical Documentation
- **Codebase**: Located in `/src` directory with detailed comments
- **Configuration**: `vite.config.js` for build settings
- **Dependencies**: `package.json` for library versions
- **Development**: Use `npm run dev` for local testing

### 11.2 Data Sources
- **Survey Data**: Primary source for SDHE indicators
- **Government Data**: Infrastructure and facility information
- **International Standards**: WHO benchmarks for healthcare metrics
- **Academic References**: Peer-reviewed methodologies for indicator calculations

---

This documentation provides a comprehensive overview of the Bangkok Health Dashboard platform, covering all data sources, calculation methods, platform functions, and technical implementation details. The platform serves as a powerful tool for health equity analysis and policy decision-making in Bangkok, providing evidence-based insights into the health status and social determinants affecting vulnerable populations across the city's 50 districts.