# Community-Population Group Indicator Bar Charts

## Overview

This chart collection provides **115+ individual bar charts** showing how each vulnerable population group experiences different health indicators across Bangkok's 5 community types.

## What This Shows

Instead of generic population statistics, these charts reveal **geographic disparities within vulnerable groups**:

- **Disabled unemployment** varies from 77% (Urban) to 100% (High-rise)
- **Elderly housing overcrowding** varies from 8.8% (Housing Estate) to 64.5% (Crowded)
- **Informal worker safety** varies dramatically by community type
- **LGBTQ+ health access** differs based on where they live

## Generated Charts (115+ total)

### By Population Group

#### 1. **Elderly (60+)** - ~29 charts
All 7 domains × multiple indicators:
- Economic Security (6 indicators)
- Healthcare Access (3 indicators)
- Physical Environment (9 indicators)
- Social Context (4 indicators)
- Health Behaviors (4 indicators)
- Health Outcomes (2 indicators)
- Education (7 indicators)

**Example**: `elderly_60plus_physical_environment_housing_overcrowding_pct.png`
- Shows elderly face 64.5% overcrowding in Crowded communities
- Only 8.8% in Housing Estates
- Mean line at 25.9%

#### 2. **Disabled** - ~29 charts
Same 7 domains as elderly

**Example**: `disabled_economic_security_unemployment_rate_pct.png`
- Shows 100% unemployment in High-rise communities (small sample)
- 77% in Urban communities
- 93.7% in Suburban
- Mean at 89.1%

#### 3. **Informal Workers** - ~29 charts
Same 7 domains

**Example**: `informal_workers_physical_environment_housing_overcrowding_pct.png`
- Shows housing quality varies dramatically
- Crowded communities: 66%
- Housing Estates: 3.8%

#### 4. **LGBTQ+** - ~29 charts
Same 7 domains

**Example**: `lgbtqplus_social_context_discrimination_experience_pct.png`
- Shows discrimination rates by community type
- Reveals safe vs unsafe areas for LGBTQ+ residents

## Chart Features

### Visual Design
- **Horizontal bars** - Easy to read, fits long community names
- **Color-coded by community** - Consistent with other analyses:
  - Blue: Crowded
  - Orange: Urban
  - Green: Suburban
  - Red: Housing Estate
  - Purple: High-rise
- **Mean reference line** (black dashed) - Shows average across communities
- **Value labels** - Exact percentages displayed on each bar

### Data Quality
- Minimum 2 community types required per indicator
- Missing data (NaN) automatically excluded
- Sample sizes may vary by community-population combination

## Key Insights by Population Group

### Elderly (60+)

**Housing Overcrowding** - Geographic inequality
- Crowded: 64.5% (2.5x mean)
- Urban: 26.2% (near mean)
- Housing Estate/High-rise: <11% (much better)

**Implication**: Elderly in crowded communities need urgent housing interventions

### Disabled

**Unemployment Rate** - Varies by community access
- High-rise: 100% (tiny sample, access barriers)
- Suburban: 93.7% (limited job opportunities)
- Urban: 77.0% (better, but still high)

**Implication**: Urban areas offer more employment for disabled, but still inadequate

**Accessibility Infrastructure** (Has Ramp/Handrails)
- Urban: Only 8.8% have ramps
- Suburban/High-rise: Near 0%

**Implication**: Critical infrastructure gap across ALL community types

### Informal Workers

**Housing Overcrowding** - Linked to affordability
- Crowded: 65.9% (dense, cheap housing)
- Housing Estate: 3.8% (planned, spacious)

**Pollution Exposure**
- High-rise: 83.8% (air quality issues)
- Other communities: 30-51%

**Implication**: Informal workers in high-rises face severe environmental health risks

### LGBTQ+

**Health Coverage**
- Generally high across communities (95-100%)
- But may hide access/quality issues

**Discrimination**
- Varies 0.6% to 3.0% by community
- Reveals relatively safer vs less safe areas

## Use Cases

### 1. **Targeted Policy Design**
Instead of: "Support elderly people"
Use charts to design: "Address housing overcrowding for elderly in crowded communities (64.5% vs 8.8% in housing estates)"

### 2. **Resource Allocation**
Prioritize interventions where disparities are largest:
- Accessibility infrastructure for disabled (near 0% in all communities)
- Housing relief for informal workers in crowded areas (66% overcrowding)
- Air quality improvements in high-rise areas (84% pollution exposure)

### 3. **Community-Specific Programs**
Design programs for specific community-population combinations:
- **Crowded + Elderly**: Housing upgrades, safety improvements
- **Urban + Disabled**: Employment support, accessibility
- **High-rise + Informal Workers**: Pollution mitigation, affordable healthcare

### 4. **Monitoring Progress**
Baseline charts for tracking improvements:
- "Did we reduce elderly overcrowding in crowded communities?"
- "Did accessibility improvements increase in urban areas?"
- "Did pollution exposure decrease for high-rise residents?"

## File Organization

### Directory Structure
```
community_popgroup_indicator_charts/
├── elderly_60plus_economic_security_*.png
├── elderly_60plus_healthcare_access_*.png
├── elderly_60plus_physical_environment_*.png
├── disabled_economic_security_*.png
├── disabled_healthcare_access_*.png
├── informal_workers_economic_security_*.png
├── lgbtqplus_social_context_*.png
└── ...
```

### Naming Convention
```
{population}_{domain}_{indicator}.png

Examples:
- elderly_60plus_economic_security_unemployment_rate_pct.png
- disabled_physical_environment_has_ramp_accessibility_pct.png
- informal_workers_healthcare_access_health_coverage_rate_pct.png
- lgbtqplus_social_context_feels_unsafe_pct.png
```

## How to Generate

### Prerequisites
- Python 3.7+
- matplotlib, pandas, numpy
- CSV files from `community_population_group_indicator_analysis.py`

### Run Chart Generation
```bash
python generate_community_popgroup_bar_charts.py
```

**Output**: 115+ charts in `community_popgroup_indicator_charts/` directory

**Time**: ~2 minutes for all charts

## Data Source

**Input CSV Files** (28 files):
- `community_elderly_60plus_{domain}.csv` (7 files)
- `community_disabled_{domain}.csv` (7 files)
- `community_informal_workers_{domain}.csv` (7 files)
- `community_lgbtqplus_{domain}.csv` (7 files)

**Sample Sizes**:
- Elderly: 2,967 respondents
- Disabled: 545 respondents
- Informal Workers: 2,127 respondents
- LGBTQ+: 185 respondents

**Note**: Some community-population combinations have small samples (e.g., LGBTQ+ in Housing Estate)

## Integration with Other Analyses

| Tool | What it shows | Chart type |
|------|---------------|------------|
| `generate_indicator_bar_charts.py` | General population by community | Horizontal bars |
| `generate_community_popgroup_comparison_charts.py` | Sub-group comparisons (high vs low income) | Gemini-style with arrows |
| **`generate_community_popgroup_bar_charts.py`** | **Population groups by community** | **Horizontal bars** |

These three tools provide complementary visualizations:
1. **General population** charts show overall patterns
2. **Population group** charts show vulnerable group disparities
3. **Sub-group comparison** charts show hidden heterogeneity within groups

## Statistical Notes

### Mean Reference Line
- Black dashed line shows mean across communities
- Helps identify communities above/below average
- Weighted by number of communities with data, not population

### Missing Data
- Some indicators lack data for certain community types
- Housing Estate often has smallest sample
- High-rise has smallest elderly population

### Interpretation Caution
- Small samples (n<10) may not be reliable
- Some indicators show 100% or 0% due to small denominators
- Always check source CSV for sample sizes

## Future Enhancements

1. **Sample Size Annotations**: Add (n=X) to each bar
2. **Statistical Significance**: Mark significant differences
3. **Multi-Year Trends**: If longitudinal data available
4. **Interactive Filtering**: Web dashboard to select indicators
5. **Benchmark Lines**: Add Bangkok average or national average

## Credits

**Chart Style**: Based on `generate_indicator_bar_charts.py`
**Data Source**: `community_population_group_indicator_analysis.py`
**Framework**: Bangkok Health Dashboard Project 2025

---

**Generated**: December 2025
**Charts**: 115+ individual indicators
**Format**: PNG, 300 DPI
