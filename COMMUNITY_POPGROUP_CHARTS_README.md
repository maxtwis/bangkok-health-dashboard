# Community-Population Group Comparison Charts

## Overview

This visualization suite creates **Gemini-style comparison charts** that reveal the "hidden character" within each vulnerable population group. Instead of treating groups as homogeneous, these charts show dramatic differences based on sub-characteristics like income, education, and generation.

## The "Hidden Character" Concept

Every population group has internal heterogeneity. For example:
- **"Elderly"** isn't just one group - it includes "Elderly with high income" vs "Elderly with low income"
- **"Disabled"** includes "Disabled with bachelor's degree" vs "Disabled with primary/no education"
- **"Informal Workers"** spans from high earners to those in poverty
- **"LGBTQ+"** includes different generations with vastly different experiences

These charts make these hidden disparities **visually dramatic and immediately understandable**.

## Visual Design Features

Following the Gemini AI style you provided:

### 1. **Color-Coded Bars**
- 🟢 **Green**: Better outcomes (higher is better, or lower for negative indicators)
- 🔴 **Red**: Worse outcomes
- Clear visual contrast makes the disparity immediately obvious

### 2. **Curved Arrow Annotations**
- Connects the two bars with an elegant arc
- Shows the direction and magnitude of difference

### 3. **Impact Multipliers**
- Bold text showing "2.2x Higher" or "9.2x Higher"
- Absolute difference in percentage points
- Makes the scale of disparity immediately understandable

### 4. **Group Context**
- Sample sizes shown in labels (e.g., "n=216")
- Clear sub-group definitions (e.g., "Lowest 25%", "Bachelor+")

## Generated Charts (10 Total)

### ELDERLY Population (3 charts)
Comparing **High Income (Top 25%)** vs **Low Income (Bottom 25%)**

1. **Catastrophic Health Spending**
   - Low income elderly: 37.0% face catastrophic spending
   - High income elderly: 4.0%
   - **9.2x Higher** burden on poor elderly
   - ![Chart](community_popgroup_charts/elderly_income_catastrophic_spending.png)

2. **Medical Care Skipped Due to Cost**
   - Shows access barriers by income level
   - ![Chart](community_popgroup_charts/elderly_income_medical_skip.png)

3. **Severe Food Insecurity**
   - Hunger among elderly by income
   - ![Chart](community_popgroup_charts/elderly_income_food_insecurity.png)

### DISABLED Population (2 charts)
Comparing **High Education (Bachelor+)** vs **Low Education (Primary/None)**

4. **Employment Rate**
   - Bachelor+ disabled: 29.4% employed
   - Primary/None disabled: 13.3% employed
   - **2.2x Higher** employment with education
   - ![Chart](community_popgroup_charts/disabled_education_employment.png)

5. **Health Coverage Rate**
   - Education's impact on health access
   - ![Chart](community_popgroup_charts/disabled_education_health_coverage.png)

### INFORMAL WORKERS Population (3 charts)
Comparing **High Income (Top Third)** vs **Low Income (Bottom Third)**

6. **Catastrophic Health Spending**
   - Even among informal workers, income matters enormously
   - ![Chart](community_popgroup_charts/informal_income_catastrophic_spending.png)

7. **Feeling Unsafe in Community**
   - Low-income informal workers face more safety concerns
   - ![Chart](community_popgroup_charts/informal_income_feels_unsafe.png)

8. **No Physical Exercise**
   - Income impacts health behaviors
   - ![Chart](community_popgroup_charts/informal_income_no_exercise.png)

### LGBTQ+ Population (2 charts)
Comparing **Gen Z (18-27)** vs **Gen X+ (44+)**

9. **Health Coverage Rate**
   - Generational differences in healthcare access
   - ![Chart](community_popgroup_charts/lgbt_generation_health_coverage.png)

10. **Chronic Disease Prevalence**
    - Age-related health outcomes within LGBTQ+ community
    - ![Chart](community_popgroup_charts/lgbt_generation_chronic_disease.png)

## Key Insights

### 1. Income Inequality Magnifies Vulnerability

Among **already vulnerable elderly**:
- Poor elderly face **9x higher** catastrophic health spending
- Economic security creates massive health disparities within the same age group

Among **informal workers**:
- High earners can still face health burdens
- But low earners face compounded vulnerabilities

### 2. Education as Multiplier for Disabled

- Bachelor's degree **more than doubles** employment rate for disabled persons
- Education enables economic participation despite disability
- But most disabled have only primary education (n=346 vs n=34)

### 3. Generational Divides in LGBTQ+ Community

- Younger LGBTQ+ individuals have different health profiles
- Older generations show higher chronic disease rates (age effect)
- But coverage rates also vary, suggesting access issues

### 4. Intersectional Vulnerability

These charts prove that vulnerability is **multiplicative**, not additive:
- Being elderly + poor is worse than elderly alone
- Being disabled + low education is worse than disabled alone
- Being informal worker + low income creates extreme precarity

## Policy Implications

### 1. **Targeted Interventions Required**

Generic "elderly programs" or "disabled support" miss the mark. We need:
- **Income-targeted elderly support**: Subsidized healthcare for poor elderly
- **Education-employment bridges**: Job training for disabled persons
- **Safety nets for informal workers**: Income-indexed health subsidies

### 2. **Priority Setting**

When resources are limited, target the **intersection of vulnerabilities**:
- **Highest priority**: Poor elderly (9x catastrophic spending gap)
- **High priority**: Low-education disabled (2.2x employment gap)
- **Medium priority**: Low-income informal workers (multiple gaps)

### 3. **Monitoring Heterogeneity**

Don't just track "elderly health outcomes" - track:
- Elderly health outcomes **by income quartile**
- Disabled employment **by education level**
- Informal worker wellbeing **by income tercile**

## Technical Details

### Chart Generation

```bash
python generate_community_popgroup_comparison_charts.py
```

**Requirements:**
- matplotlib (for visualization)
- pandas, numpy (for data processing)
- Data: `public/data/community_data.csv`

**Output:**
- 10 high-resolution PNG charts (300 DPI)
- Saved in `community_popgroup_charts/` directory

### Stratification Logic

**Elderly - Income Quartiles:**
- Uses `pd.qcut()` with 4 bins on `monthly_income`
- Compares bottom 25% vs top 25%

**Disabled - Education Levels:**
- Primary/None: education in [0,1,2]
- Secondary: education in [3,4,5,6]
- Bachelor+: education in [7,8]

**Informal Workers - Income Terciles:**
- Uses `pd.qcut()` with 3 bins
- Compares bottom third vs top third

**LGBTQ+ - Generations:**
- Gen Z: age 18-27
- Gen Y: age 28-43
- Gen X+: age 44+

### Color Semantics

**Reverse Indicators** (lower is better):
- Worst group (highest value) = RED
- Best group (lowest value) = GREEN
- Examples: unemployment, catastrophic spending, food insecurity

**Normal Indicators** (higher is better):
- Best group (highest value) = GREEN
- Worst group (lowest value) = RED
- Examples: employment, health coverage, education

## Comparison with Other Analyses

| Analysis | What it shows | Use case |
|----------|---------------|----------|
| `community_indicator_analysis.py` | Community type differences | Where to intervene geographically |
| `intra_group_vulnerability_analysis.py` | Statistical determinants within groups | What factors drive vulnerability |
| **`generate_community_popgroup_comparison_charts.py`** | **Sub-group visual comparisons** | **Who needs help most urgently** |

This visualization suite is specifically designed for:
- **Policy presentations** (dramatic visuals)
- **Advocacy** (showing hidden disparities)
- **Public communication** (easy to understand)
- **Budget justification** (quantifying need)

## Future Enhancements

Potential additions:

1. **Triple Comparisons**
   - Show low/middle/high income groups
   - Requires different layout

2. **Community-Specific Charts**
   - "Poor elderly in Crowded communities vs Rich elderly in Urban communities"
   - Combines community + population + sub-characteristic

3. **Interactive Dashboard**
   - Allow users to select population group and sub-characteristic
   - Generate chart on-demand

4. **Multi-Indicator Dashboards**
   - 2x2 or 3x3 grid of comparisons
   - See multiple outcomes simultaneously

5. **Trend Charts**
   - If longitudinal data available
   - Show whether gaps are widening or narrowing

## Using These Charts

### In Reports
- Use as lead visuals in executive summaries
- One chart per policy recommendation
- Reference the multipliers in text (e.g., "9x higher burden")

### In Presentations
- Start with the most dramatic chart (elderly catastrophic spending)
- Use arrows and annotations to tell a story
- Compare to generic statistics to show hidden heterogeneity

### In Media
- These charts are social media-ready (clear, bold, dramatic)
- Crop to square for Instagram
- Add source citation

### In Grant Applications
- Use to justify targeted interventions
- Show magnitude of need quantitatively
- Demonstrate understanding of nuance

## Data Source

All charts use `public/data/community_data.csv` (n=4,522 respondents) with:
- Elderly: 2,967 individuals
- Disabled: 545 individuals
- Informal workers: 2,127 individuals
- LGBTQ+: 185 individuals

Minimum sample size for sub-groups: 5 respondents (for statistical validity)

## Credits

**Chart Style**: Inspired by Gemini AI visual analytics
**Analysis Framework**: Based on `intra_group_vulnerability_analysis.py`
**Data**: Bangkok Health Dashboard Survey 2025

---

**Generated**: December 2025
**Version**: 1.0
**License**: [Your License]
