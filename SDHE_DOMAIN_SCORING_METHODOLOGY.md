# SDHE Domain Scoring Methodology
## Bangkok Health Equity Analysis - Population Group Inequality Study

**Document Purpose:** This document provides complete scoring criteria for all 6 SDHE domains used in the population group inequality analysis. All scores range from 0-100, where higher scores indicate better outcomes.

---

## 1. Economic Security Domain

**Formula:** Average of 6 component indicators

### Components:

#### 1.1 Employment Score
- **100 points:** Currently employed (`occupation_status = 1`)
- **0 points:** Not employed (`occupation_status = 0`)

#### 1.2 Vulnerable Employment Score
Only for employed individuals:
- **100 points:** Has contract AND welfare
- **50 points:** Has contract OR welfare
- **0 points:** No contract AND no welfare (vulnerable employment)

#### 1.3 Food Security Score
- **100 points:** No food insecurity (`food_insecurity_1 = 0` AND `food_insecurity_2 = 0`)
- **50 points:** Moderate insecurity (skipped meals but didn't go hungry all day)
- **0 points:** Severe insecurity (went hungry entire day)

#### 1.4 Work Injury Score
- **100 points:** No serious work injury in past 12 months (`occupation_injury = 0`)
- **0 points:** Had serious work injury (`occupation_injury = 1`)

#### 1.5 Income Score
- **Normalized 0-100:** Based on monthly income distribution
  - Daily income × 30 = monthly income
  - Min-max normalization: `(income - min) / (max - min) × 100`

#### 1.6 Health Spending Score
Based on household health expenditure as % of income:
- **100 points:** Health spending ≤ 10% of income (affordable)
- **50 points:** Health spending > 10% but ≤ 25% (high burden)
- **0 points:** Health spending > 25% of income (catastrophic)

**Final Score:** Average of all 6 components

---

## 2. Healthcare Access Domain

**Formula:** Average of 3 component indicators

### Components:

#### 2.1 Health Coverage Score
- **100 points:** Has health insurance (`welfare` = 1, 2, or 3)
  - 1 = Civil servant welfare
  - 2 = Social security
  - 3 = Universal coverage (30 baht/gold card)
- **0 points:** No health coverage

#### 2.2 Medical Access Score
- **100 points:** Did NOT skip medical care due to cost (`medical_skip_1 = 0`)
- **0 points:** Skipped seeing doctor due to cost (`medical_skip_1 = 1`)

#### 2.3 Dental Access Score
- **100 points:**
  - No oral health problems (`oral_health = 0`), OR
  - Had problem AND received dental care (`oral_health = 1` AND `oral_health_access = 1`)
- **0 points:** Had oral health problem but did NOT receive dental care

**Final Score:** Average of all 3 components

---

## 3. Physical Environment Domain

**Formula:** Average of 6 component indicators

### Components:

#### 3.1 Home Ownership Score
- **100 points:** Owns home (`house_status = 1`)
- **50 points:** Rents, lives with relatives, or welfare housing (`house_status` = 2, 3, or 5)
- **0 points:** Squatter/informal settlement (`house_status = 4`)

#### 3.2 Utilities Score
Based on access to 4 basic utilities (each worth 25 points):
- Clean water (no shortage: `community_environment_3 = 0`)
- Electricity (no shortage: `community_environment_4 = 0`)
- Waste management (has service: `community_environment_5 = 0`)
- Sanitation (no sewage problems: `community_environment_6 = 0`)

**Score:** `(number of utilities with access / 4) × 100`

#### 3.3 Overcrowding Score
- **100 points:** Not overcrowded (`community_environment_1 = 0` AND `community_environment_2 = 0`)
- **0 points:** Dense housing OR small house space

#### 3.4 Disaster Score
- **100 points:** No disaster experience in past 5 years (`community_disaster_1 = 0`)
- **0 points:** Experienced disaster (flood, extreme heat, etc.)

#### 3.5 Pollution Score
- **100 points:** No health impact from air pollution (`health_pollution = 0`)
- **0 points:** Health affected by air pollution (`health_pollution = 1`)

#### 3.6 Community Amenity Score
Based on presence of 4 accessibility features (each worth 25 points):
- Ramps for wheelchairs/elderly (`community_amenity_type_1 = 1`)
- Handrails for support (`community_amenity_type_2 = 1`)
- Public recreation/exercise spaces (`community_amenity_type_3 = 1`)
- Health service facilities (`community_amenity_type_4 = 1`)

**Score:** `(number of amenities present / 4) × 100`

**Note:** This indicator is particularly important for elderly and disabled populations' mobility and access to services.

**Final Score:** Average of all 6 components

---

## 4. Social Context Domain

**Formula:** Average of 4 component indicators

### Components:

#### 4.1 Community Safety Score
Based on perceived safety level (`community_safety`):
- **100 points:** Feels very safe (`community_safety = 4`)
- **67 points:** Feels moderately safe (`community_safety = 3`)
- **33 points:** Feels somewhat unsafe (`community_safety = 2`)
- **0 points:** Feels very unsafe (`community_safety = 1`)

Formula: `((community_safety - 1) / 3) × 100`

#### 4.2 Violence Score
Based on exposure to violence in past 12 months:
- **100 points:** No violence exposure (physical, psychological, sexual all = 0)
- **67 points:** One type of violence
- **33 points:** Two types of violence
- **0 points:** All three types of violence

#### 4.3 Discrimination Score
- **100 points:** No discrimination experience (`discrimination_1 = 0`)
- **0 points:** Experienced discrimination (`discrimination_1 = 1`)

#### 4.4 Social Support Score
- **100 points:** Has someone to rely on in emergencies (`helper = 1`)
- **0 points:** No emergency support (`helper = 0`)

**Final Score:** Average of all 4 components

---

## 5. Health Behaviors Domain

**Formula:** Average of 4 component indicators

### Components:

#### 5.1 Alcohol Score
- **100 points:** Never drinks (`drink_status = 0`)
- **50 points:** Former drinker, quit (`drink_status = 2`)
- **0 points:** Current drinker (`drink_status = 1`)

#### 5.2 Tobacco Score
- **100 points:** Never smoked (`smoke_status = 0`)
- **67 points:** Former smoker, quit (`smoke_status = 1`)
- **33 points:** Occasional smoker (`smoke_status = 2`)
- **0 points:** Regular smoker (`smoke_status = 3`)

#### 5.3 Exercise Score
Based on exercise frequency (`exercise_status`):
- **100 points:** 5+ times per week (`exercise_status = 3`)
- **67 points:** 3-4 times per week (`exercise_status = 2`)
- **33 points:** < 3 times per week (`exercise_status = 1`)
- **0 points:** No exercise (`exercise_status = 0`)

Formula: `(exercise_status / 3) × 100`

#### 5.4 Obesity Score
Based on BMI (Body Mass Index):
- **100 points:** Normal BMI (18.5 ≤ BMI ≤ 24.9)
- **50 points:** Underweight (BMI < 18.5) OR Overweight (25 ≤ BMI < 30)
- **0 points:** Obese (BMI ≥ 30)

BMI Calculation: `weight (kg) / (height (m))²`

**Final Score:** Average of all 4 components

---

## 6. Health Outcomes Domain

**Formula:** Average of 2 component indicators

### Components:

#### 6.1 Chronic Disease Score
- **100 points:** No chronic disease (`diseases_status = 0`)
- **0 points:** Has chronic disease (`diseases_status = 1`)

#### 6.2 Disease Burden Score
Based on number of disease types (from `diseases_type_1` to `diseases_type_21`):
- **100 points:** 0 diseases
- **75 points:** 1 disease
- **50 points:** 2 diseases
- **25 points:** 3 diseases
- **0 points:** 4+ diseases

**Disease types counted:**
1. Diabetes
2. Hypertension
3. Gout
4. Chronic kidney disease
5. Cancer
6. High cholesterol
7. Ischemic heart disease
8. Liver disease
9. Stroke
10. HIV
11. Mental health disorders
12. Allergies
13. Bone/joint disease
14. Respiratory disease
15. Emphysema
16. Anemia
17. Stomach ulcer
18. Epilepsy
19. Intestinal disease
20. Paralysis
21. Dementia

**Final Score:** Average of both components

---

## Master Weighting Scheme

Population groups receive different weights to correct for sampling bias:

| Population Group | Weight | Data Source |
|-----------------|---------|-------------|
| **Disabled** | District-specific | `weight_by_district.csv` (Weight_Disabled column) |
| **Elderly** | District-specific | `weight_by_district.csv` (Weight_Elderly column) |
| **Informal Workers** | 0.6611 | City-level constant |
| **LGBTQ+** | 1.0 | No adjustment |
| **General Population** | 2.5 | Residual adjustment |

**Priority Order for Classification:**
1. Disabled (highest priority - smallest, most vulnerable group)
2. Elderly
3. Informal Workers
4. LGBTQ+
5. General Population (residual)

**Rationale:** Prioritize by data precision (district-level > city-level > no data) and vulnerability (smallest groups first to prevent statistical drowning).

---

## Statistical Methods

### Weighted One-Way ANOVA
- Tests if mean domain scores differ significantly across population groups
- Uses sample weights to correct for sampling bias
- Null hypothesis: All groups have equal mean scores
- Significance level: p < 0.05

### Levene's Test
- Tests homogeneity of variances across groups
- If p < 0.05: variances are unequal → use Games-Howell post-hoc test
- If p > 0.05: variances are equal → use Tukey HSD post-hoc test

### Games-Howell Post-Hoc Test
- Used when variances are unequal (most common in this analysis)
- Performs pairwise comparisons between all population groups
- Controls for family-wise error rate
- Identifies which specific pairs of groups differ significantly

---

## Data Sources

- **Survey Data:** `public/data/survey_sampling.csv` (N = 6,523 respondents)
- **District Weights:** `public/data/statistical checking/weight_by_district.csv` (50 districts)
- **Analysis Script:** `population_group_inequality_analysis.py`

---

## Interpretation Guidelines

### Score Ranges
- **75-100:** Good/Excellent
- **50-74:** Moderate/Fair
- **25-49:** Poor
- **0-24:** Very Poor/Critical

### Inequality Gap
- **Gap < 5 points:** Small inequality
- **Gap 5-10 points:** Moderate inequality
- **Gap 10-20 points:** Large inequality
- **Gap > 20 points:** Very large inequality (critical concern)

### Statistical Significance
- **p < 0.001:** Highly significant (strong evidence of difference)
- **p < 0.01:** Very significant
- **p < 0.05:** Significant
- **p ≥ 0.05:** Not significant (no evidence of difference)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-30
**Analysis Date:** 2025-11-30
**Total Sample Size:** 6,523 respondents across 50 Bangkok districts
