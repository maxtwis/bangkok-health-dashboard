# Community-Level by Population Group Indicator Analysis

## Overview

This analysis combines **community-level stratification** with **population group stratification** to identify determinants of vulnerability WITHIN each population group ACROSS different community types.

## Purpose

While `community_indicator_analysis.py` analyzes indicators by community type and `intra_group_vulnerability_analysis.py` analyzes vulnerability within population groups, this new analysis answers the question:

**"How do different vulnerable populations (elderly, disabled, informal workers, LGBTQ+) fare in different community environments?"**

## Methodology

### Population Groups (Inclusive Filtering)
Following the same logic as `intra_group_vulnerability_analysis.py`, individuals can belong to multiple groups:

1. **Elderly (60+)**: Age >= 60 years
2. **Disabled**: disability_status == 1
3. **Informal Workers**: occupation_status == 1 AND occupation_contract == 0
4. **LGBTQ+**: sex == 'lgbt'

### Community Types
5 community types analyzed:
- Suburban (ชุมชนชานเมือง)
- Housing Estate (ชุมชนหมู่บ้านจัดสรร)
- High-rise/Condo (ชุมชนอาคารสูง)
- Urban (ชุมชนเมือง)
- Crowded (ชุมชนแออัด)

### Indicators Analyzed
All 7 domains from MULTIPLE_CORRELATION.md:
1. **Economic Security** (6 indicators)
2. **Healthcare Access** (3 indicators)
3. **Physical Environment** (9 indicators)
4. **Social Context** (4 indicators)
5. **Health Behaviors** (4 indicators)
6. **Health Outcomes** (2 indicators)
7. **Education** (7 indicators)

## Key Findings

### Elderly Population (2,967 respondents)

**Economic Security:**
- **Unemployment Rate**: Varies significantly by community (58.8% to 73.9%, F=5.821, p=0.0001)
- **Catastrophic Health Spending**: Highest in Suburban (30.8%), lowest in Housing Estate (9.1%) - SIGNIFICANT difference

**Physical Environment:**
- **Housing Overcrowding**: Dramatically higher in Crowded communities (64.5%) vs Housing Estate (8.8%)
- **Has Health Facility**: Urban communities have best access (27.7%) vs High-rise (4.1%)
- **Has Ramp/Accessibility**: Critical for elderly - Urban leads (12.9%), Suburban lags (1.5%)

**Social Context:**
- **Feels Unsafe**: 5x higher in Crowded communities (15.2%) vs Housing Estate (0%)
- All social indicators show significant variation by community type

**Health Outcomes:**
- **Chronic Disease Prevalence**: Ranges from 74.7% (Urban) to 85.3% (Housing Estate)
- **Multiple Chronic Diseases**: High-rise elderly have lowest burden (34.7%)

### Disabled Population (545 respondents)

**Economic Security:**
- **Unemployment Rate**: Ranges from 77% (Urban) to 100% (High-rise) - SIGNIFICANT
- **Income**: Highest in Crowded communities (23,543 Baht/month) vs Suburban (8,667 Baht/month)

**Physical Environment:**
- **Has Ramp/Accessibility**: Only 8.8% in Urban communities, 0% in Suburban/High-rise - CRITICAL GAP
- **Housing Overcrowding**: Severe in Crowded (70.2%) vs High-rise (16.7%)

**Social Context:**
- **Feels Unsafe**: Much higher in Crowded (16.7%) and High-rise (16.7%) vs Urban (2.7%)
- **Violence Experience**: Highest in Suburban (10.5%)

**Health Behaviors:**
- **No Exercise**: Highest in Crowded (80%) - likely linked to environment/facilities

### Informal Workers (2,127 respondents)

**Economic Security:**
- **Vulnerable Employment**: Consistently high across all communities (93.8% to 96.2%)
- **Catastrophic Health Spending**: Highest in Suburban (27.3%), lowest in Housing Estate (5.3%)

**Physical Environment:**
- **Housing Overcrowding**: Severe inequality - 66% in Crowded vs 3.8% in Housing Estate
- **Pollution Exposure**: Highest in High-rise (83.8%) - SIGNIFICANT finding
- **Has Health Facility**: Urban (23.3%) >> Crowded (16.4%) >> others (<6%)

**Social Context:**
- **Feels Unsafe**: 3x higher in Crowded (11.8%) vs other communities
- **No Social Support**: Higher in Housing Estate (11.5%) and Crowded (7.5%)

### LGBTQ+ Population (185 respondents)

**Economic Security:**
- Relatively consistent across communities, but sample sizes small in some

**Physical Environment:**
- **Housing Overcrowding**: Extreme in Crowded (70.9%) vs Suburban (14.5%)
- **Has Health Facility**: Urban leads (25%)

**Social Context:**
- **Discrimination Experience**: Present across all communities (0.6% to 3.0%)
- **Violence Experience**: Varies significantly by community type

**Health Behaviors:**
- **No Exercise**: Highest in Crowded (62.3%), likely environmental constraints

## Statistical Significance

The analysis includes **One-way ANOVA tests** for each indicator across community types within each population group. Findings marked with `***SIGNIFICANT***` indicate p < 0.05.

### Most Significant Findings:
1. **Housing Overcrowding**: Consistently significant across ALL population groups (F > 45, p < 0.0001)
2. **Disaster Experience**: Significant for Elderly, Disabled, Informal Workers
3. **Pollution Exposure**: Significant for all groups
4. **Has Health Facility**: Significant disparities across communities
5. **Feels Unsafe**: Significant for all groups
6. **Education Level**: Significant variation by community for most groups

## Policy Implications

### 1. Targeted Interventions by Community-Population Matrix
Instead of one-size-fits-all approaches, target specific vulnerable populations in specific community settings:

- **Crowded Communities + Elderly**: Address overcrowding, safety concerns, exercise facilities
- **Suburban Communities + Disabled**: Install accessibility infrastructure (ramps, handrails)
- **High-rise + Informal Workers**: Address pollution exposure, create affordable healthcare access
- **Urban Communities + LGBTQ+**: Leverage existing health facilities, address discrimination

### 2. Critical Infrastructure Gaps
- **Accessibility for Disabled**: Ramps/handrails critically lacking across ALL community types
- **Health Facilities**: Severe disparity between Urban (20-27%) and other communities (<10%)
- **Public Recreation Spaces**: Important for health behaviors, varies 21-50% across communities

### 3. Environmental Health Priorities
- **Crowded Communities**: Urgent need for overcrowding reduction, pollution control
- **High-rise Communities**: Address extreme pollution exposure (73-84%)
- **All Communities**: Disaster preparedness varies widely (6% to 50%)

## Output Files

### Main Report
- `community_population_group_indicator_analysis.txt` - Comprehensive text report with all findings

### CSV Files (28 files)
For each of 4 population groups × 7 domains:
- `community_elderly_60plus_economic_security.csv`
- `community_disabled_healthcare_access.csv`
- `community_informal_workers_physical_environment.csv`
- `community_lgbtqplus_social_context.csv`
- ... (and 24 more)

Each CSV contains:
- Indicator values for each community type
- Mean, Standard Deviation, Min, Max, Range statistics
- Community type comparisons

## How to Use This Analysis

1. **For Policymakers**: Identify which vulnerable populations in which communities need urgent intervention
2. **For Community Leaders**: Understand how your community type compares for specific vulnerable groups
3. **For Health Planners**: Design targeted programs based on community-population intersections
4. **For Researchers**: Generate hypotheses about community-level determinants of health disparities

## Running the Analysis

```bash
python community_population_group_indicator_analysis.py
```

**Requirements:**
- Python 3.7+
- pandas, numpy, scipy
- Data file: `public/data/community_data.csv`

**Execution time:** ~30-60 seconds

## Comparison with Related Analyses

| Analysis | Level | Stratification | Use Case |
|----------|-------|----------------|----------|
| `community_indicator_analysis.py` | Community | 5 community types | Overall community comparison |
| `intra_group_vulnerability_analysis.py` | Population | 4 population groups | Within-group determinants |
| **`community_population_group_indicator_analysis.py`** | **Community × Population** | **5 types × 4 groups** | **Intersectional disparities** |

This analysis uniquely reveals how **community environment moderates vulnerability** for different population groups.

## Next Steps

Consider adding:
1. **Multivariate regression** to control for confounders
2. **Geographic mapping** to visualize community-population hotspots
3. **Temporal analysis** if longitudinal data becomes available
4. **Cost-effectiveness** of interventions by community-population segment

---

**Created:** December 2025
**Author:** Bangkok Health Dashboard Project
**License:** [Your License]
