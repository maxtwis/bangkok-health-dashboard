# Analysis Methodology and Logic Documentation

**Purpose**: This document captures all critical logic, definitions, and methodology used in the Bangkok Health Equity Analysis. Use this as the source of truth when continuing analysis work.

**Last Updated**: 2025-11-03

---

## 1. Population Classification Logic

### Priority-Based Hierarchical Classification

**CRITICAL**: Population groups are classified using **STATISTICALLY SUPERIOR PRIORITY ORDER**. Once a respondent matches a higher-priority group, they are classified there regardless of other characteristics.

**Rationale**: Prioritize by **data precision** (district-level N > city-level N > no N) and **vulnerability** (smallest/rarest groups first to avoid statistical drowning).

```python
def classify_population_group(row):
    """
    Classify respondent into population groups
    PRIORITY ORDER based on statistical best practices
    """
    # Priority 1: Disabled (N≈90k, district-level weights) - SMALLEST, MOST VULNERABLE
    # If someone is "Elderly + Disabled", classify as Disabled to ensure
    # this small vulnerable group is not statistically drowned out
    if row['disable_status'] == 1:
        return 'disabled'

    # Priority 2: Elderly (N≈1.2M, district-level weights) - LARGE BUT PRECISE DATA
    elif row['age'] >= 60:
        return 'elderly'

    # Priority 3: Informal workers (N≈1.5M, city-level weight) - LARGE, CITY-LEVEL DATA
    # CORRECT: occupation_status=1 AND occupation_contract=0
    # WRONG: occupation_type='2' (only captures 70 people, not all informal workers!)
    elif row['occupation_status'] == 1 and row['occupation_contract'] == 0:
        return 'informal'

    # Priority 4: LGBTQ+ (no official N, identity-based) - NO POPULATION DATA
    elif row['sex'] == 'lgbt':
        return 'lgbt'

    # Priority 5: General population (residual group)
    else:
        return 'general'
```

### Source of Truth
- **Dashboard code**: `src/components/Dashboard/IndicatorAnalysis.jsx` lines 76-90
- **Data Processor**: `src/utils/DataProcessor.js` lines 844-853
- **Analysis Script**: `population_group_inequality_analysis.py` lines 52-107
- **JavaScript equivalent**:
```javascript
const classifyPopulationGroup = (record) => {
  // Priority 1: Disabled (N≈90k, district-level weights) - smallest, most vulnerable
  if (record.disable_status === 1) return 'disabled';
  // Priority 2: Elderly (N≈1.2M, district-level weights) - large but precise
  if (record.age >= 60) return 'elderly';
  // Priority 3: Informal Workers (N≈1.5M, city-level weight)
  if (record.occupation_status === 1 && record.occupation_contract === 0) return 'informal_workers';
  // Priority 4: LGBTQ+ (no official N, identity-based)
  if (record.sex === 'lgbt') return 'lgbtq';
  // Priority 5: General Population (residual)
  return 'general_population';
};
```

### Priority Order Justification

| Priority | Group | Population (N) | Weight Type | Rationale |
|----------|-------|----------------|-------------|-----------|
| 1 | **Disabled** | ~90,000 | District-level | Smallest, most vulnerable; precise data; avoid drowning in larger groups |
| 2 | **Elderly** | ~1,200,000 | District-level | Large but precise district-level data |
| 3 | **Informal Workers** | ~1,500,000 | City-level | Large group with city-level weight precision |
| 4 | **LGBTQ+** | Unknown | Fixed (1.0) | Identity-based, no official population data |
| 5 | **General** | Residual | Fixed (2.5) | Everyone else |

### Population Sizes (After Priority Classification)
With the statistically superior priority order:
- **Disabled**: ~258 respondents (captures all disabled, including elderly disabled)
- **Elderly**: ~2,964 respondents (elderly who are not disabled)
- **Informal Workers**: ~1,330 respondents (workers without contracts, not elderly/disabled)
- **LGBTQ+**: ~522 respondents (LGBTQ+ who are not disabled/elderly/informal)
- **General Population**: ~1,449 respondents (everyone else)

**Total**: 6,523 respondents

### Common Error to Avoid
❌ **WRONG PRIORITY**: LGBTQ+ first → Disabled person who is elderly gets classified as LGBTQ+, losing precise district-level weight
✅ **CORRECT PRIORITY**: Disabled first → Captures smallest vulnerable group with best data precision
❌ **WRONG INFORMAL DEFINITION**: `occupation_type == '2'` → only 70 people
✅ **CORRECT INFORMAL DEFINITION**: `occupation_status == 1 AND occupation_contract == 0` → captures all informal workers

---

## 2. Health Behavior Categorization Logic

### Exercise Status

**Survey Question**: `exercise_status` column

**Categories**:
- `0` = ไม่ได้ออกกำลังกาย (No exercise)
- `1` = ไม่เกิน 3 ครั้งต่อสัปดาห์ (Less than 3 times/week)
- `2` = 3-4 ครั้งต่อสัปดาห์ (3-4 times/week)
- `3` = ตั้งแต่ 5 ครั้งขึ้นไปต่อสัปดาห์ (5+ times/week)

**Binary Classification for Analysis**:
```python
# Regular exercise = 3+ times/week
df['exercise_regular'] = df['exercise_status'].apply(
    lambda x: 1 if x in [2, 3] else (0 if x in [0, 1] else np.nan)
)
```
- **Regular exerciser**: `exercise_status` = 2 or 3 (3+ times/week)
- **Non-regular exerciser**: `exercise_status` = 0 or 1 (< 3 times/week)

### Smoking Status

**Survey Question**: `smoke_status` column

**Categories**:
- `0` = ไม่เคยสูบ (Never smoked)
- `1` = เคยสูบ แต่เลิกแล้ว (Former smoker, quit)
- `2` = นาน ๆ สูบที (Occasional smoker)
- `3` = สูบประจำ (Regular smoker)

**Binary Classification for Analysis**:
```python
# Current smoker = occasional or regular
df['smoke_current'] = df['smoke_status'].apply(
    lambda x: 1 if x in [2, 3] else (0 if x in [0, 1] else np.nan)
)
```
- **Current smoker**: `smoke_status` = 2 or 3 (occasional or regular)
- **Non-smoker/Quit**: `smoke_status` = 0 or 1 (never or former)

### Drinking Status

**Survey Questions**:
- `drink_status` column (primary)
- `drink_rate` column (intensity, only if drink_status=1)

**Drink Status Categories**:
- `0` = ไม่ดื่ม (Never drink)
- `1` = ดื่ม (Currently drink)
- `2` = เคยดื่ม แต่เลิกแล้ว (Former drinker, quit)

**Drink Rate Categories** (only for drink_status=1):
- `1` = ดื่มประจำ (Regular drinker)
- `2` = นาน ๆ ดื่มที (Occasional drinker)

**Binary Classifications for Analysis**:
```python
# Current drinker (any frequency)
df['drink_current'] = df['drink_status'].apply(
    lambda x: 1 if x == 1 else (0 if x in [0, 2] else np.nan)
)

# Regular drinker (subset analysis: drinks AND drinks regularly)
df['drink_regular'] = df.apply(
    lambda row: 1 if (row['drink_status'] == 1 and row['drink_rate'] == 1) else
                (0 if pd.notna(row['drink_status']) else np.nan),
    axis=1
)
```

**Definitions**:
- **Current drinker**: `drink_status` = 1 (any frequency)
- **Non-drinker/Quit**: `drink_status` = 0 or 2 (never or former)
- **Regular drinker**: `drink_status` = 1 AND `drink_rate` = 1 (currently drink regularly)
- **All Others** (in regular drinker analysis): Everyone else (never, quit, or occasional)

---

## 3. Socioeconomic Variable Processing

### Monthly Income Conversion

**Survey Question**:
- `income` column (amount)
- `income_type` column (frequency)

**Income Type Categories**:
- `1` = Daily income (รายได้ต่อวัน)
- `2` = Monthly income (รายได้ต่อเดือน)

**Conversion Logic**:
```python
def convert_to_monthly_income(row):
    """Convert income to monthly equivalent"""
    if pd.isna(row['income']) or row['income'] == 0:
        return np.nan

    # If daily income, multiply by 30 to get monthly
    if row['income_type'] == 1:
        return row['income'] * 30

    # If monthly income, use as-is
    elif row['income_type'] == 2:
        return row['income']

    else:
        return np.nan

df['monthly_income'] = df.apply(convert_to_monthly_income, axis=1)
```

### Income Terciles

For stratification analysis, divide each population group into three income levels:
```python
df['income_tercile'] = pd.qcut(
    df['monthly_income'],
    q=3,
    labels=['Low', 'Middle', 'High'],
    duplicates='drop'
)
```

### Education Level

**Survey Question**: `education` column

**Categories** (ordinal):
- Lower education: Primary school or less
- Middle education: Secondary school
- Higher education: Bachelor's degree or above

---

## 4. Chronic Disease Definition

**Survey Question**: `has_chronic_disease` column

**Definition**: Binary indicator (0/1) for whether respondent has been diagnosed with any chronic disease by a medical professional.

**Included diseases**:
- Diabetes
- Hypertension
- Heart disease
- Stroke
- Cancer
- Kidney disease
- COPD/Asthma
- Other chronic conditions

---

## 5. Statistical Analysis Methodology

### Correlation Analysis

**Point-Biserial Correlation**: Used when correlating binary behavior variable with binary disease outcome.

```python
from scipy import stats

# Example: Exercise and chronic disease
correlation, p_value = stats.pointbiserialr(
    df['exercise_regular'],  # Binary behavior: 0 or 1
    df['has_chronic_disease'] # Binary outcome: 0 or 1
)
```

**Interpretation**:
- **Negative correlation** (r < 0): Behavior is protective (e.g., exercise reduces disease)
- **Positive correlation** (r > 0): Behavior is harmful (e.g., behavior increases disease)
- **r close to 0**: No relationship

### Statistical Significance Thresholds

**P-value interpretation**:
- **p < 0.001**: Highly significant (✓✓✓)
- **p < 0.01**: Very significant (✓✓)
- **p < 0.05**: Significant (✓)
- **p < 0.10**: Marginal (approaching significance) (✗ but note it)
- **p ≥ 0.10**: Not significant (✗)

**Effect Size Classification** (for point-biserial r):
- **|r| < 0.1**: Weak/negligible effect
- **0.1 ≤ |r| < 0.3**: Small to moderate effect
- **|r| ≥ 0.3**: Large effect

### Sample Size Requirements

**Minimum sample sizes for reliable analysis**:
- **n ≥ 30**: Minimum for any statistical test
- **n ≥ 100**: Preferred for subgroup analysis
- **n ≥ 500**: Good for detecting small effects

**Warning thresholds**:
- **n < 30**: Do not analyze, sample too small
- **30 ≤ n < 100**: Analyze but note small sample limitation
- **n ≥ 100**: Generally reliable

### Group Comparisons

**T-tests for continuous outcomes**:
```python
from scipy import stats

# Compare disease rates between two groups
t_stat, p_value = stats.ttest_ind(
    group1_disease_rates,
    group2_disease_rates
)
```

**Chi-square tests for categorical outcomes**:
```python
from scipy.stats import chi2_contingency

# 2x2 contingency table
contingency_table = pd.crosstab(
    df['behavior'],
    df['has_chronic_disease']
)
chi2, p_value, dof, expected = chi2_contingency(contingency_table)
```

---

## 6. Reverse Causation and Paradoxes

### Smoking Paradox

**Observed Pattern**: Current smokers show LOWER chronic disease rates than non-smokers.

**Explanation**: This is **NOT a true protective effect**. It reflects **reverse causation**:
1. Individual smokes for years → develops chronic disease
2. Doctor diagnoses disease → strongly advises cessation
3. Individual quits smoking due to diagnosis
4. Survey captures them as "non-smoker/quit" WITH disease
5. Those still smoking are healthier (not yet diagnosed)

**Result**: Cross-sectional survey shows paradoxical negative correlation.

**Statistical Significance**:
- **Elderly**: Significant (p < 0.001, n=2,343) - strongest reverse causation
- **Other groups**: Non-significant due to smaller samples or lower disease prevalence

### Drinking Paradox

**Observed Pattern**: Current drinkers show LOWER chronic disease rates than non-drinkers (but weaker than smoking).

**Explanation**: Same reverse causation mechanism as smoking, but:
- Alcohol cessation less emphasized in medical advice
- Patients maintain drinking habits despite diagnosis
- Weaker paradox effect overall

**Statistical Significance**: None reach significance (all p > 0.2)

### Exercise - True Protective Effect

**Observed Pattern**: Regular exercisers show LOWER chronic disease rates (negative correlation).

**Why This is Different**:
- Exercise is NOT typically stopped after diagnosis (unlike smoking/drinking)
- In fact, exercise is often STARTED after diagnosis as treatment
- Therefore, negative correlation likely reflects **genuine protective effect**
- **BUT**: Only significant for informal workers (p < 0.001), not other groups

---

## 7. Key Analysis Results Summary

### Exercise and Chronic Disease

| Population Group | Gap | p-value | n | Interpretation |
|---|---|---|---|---|
| **Informal Workers** | -14.2 pp | < 0.001 | 744 | ✓ Significant protection |
| **Disabled** | -13.1 pp | 0.139 | 175 | ✗ Non-significant (small n) |
| **LGBT+** | -3.4 pp | 0.364 | 562 | ✗ No effect |
| **General Population** | -2.2 pp | 0.410 | 1,153 | ✗ No effect |
| **Elderly (60+)** | +0.2 pp | 0.893 | 2,343 | ✗ No effect |

**Key Finding**: Exercise protection ONLY works for informal workers - suggests it counteracts employment-related health risks.

### Smoking and Chronic Disease (Paradox)

| Population Group | Gap | p-value | n | Interpretation |
|---|---|---|---|---|
| **Elderly (60+)** | -9.4 pp | < 0.001 | 2,343 | ✓ Significant paradox |
| **Disabled** | -18.7 pp | 0.071 | 175 | ✗ Marginal (small n) |
| **Informal Workers** | -7.9 pp | 0.057 | 744 | ✗ Marginal |
| **LGBT+** | -6.0 pp | 0.093 | 562 | ✗ Marginal |
| **General Population** | -0.8 pp | 0.777 | 1,153 | ✗ No effect |

**Key Finding**: Paradox significant only for elderly due to large sample + high disease prevalence → strong reverse causation.

### Current Drinking and Chronic Disease (Weak Paradox)

| Population Group | Gap | p-value | n | Interpretation |
|---|---|---|---|---|
| **Disabled** | -9.1 pp | 0.272 | 175 | ✗ Non-significant |
| **Informal Workers** | -4.5 pp | 0.226 | 744 | ✗ Non-significant |
| **General Population** | -2.3 pp | 0.354 | 1,153 | ✗ No effect |
| **LGBT+** | -1.3 pp | 0.704 | 562 | ✗ No effect |
| **Elderly (60+)** | -1.0 pp | 0.589 | 2,343 | ✗ No effect |

**Key Finding**: Weak paradox, none significant - alcohol cessation less emphasized than smoking cessation.

### Regular Drinking and Chronic Disease (Subset Analysis)

| Population Group | Gap | p-value | n_regular | n_total | Interpretation |
|---|---|---|---|---|---|
| **Disabled** | +12.4 pp | 0.326 | 17 | 175 | ✗ Non-significant (very small n) |
| **Informal Workers** | +5.9 pp | 0.305 | 86 | 744 | ✗ Non-significant |
| **General Population** | +2.0 pp | 0.588 | 157 | 1,153 | ✗ No effect |
| **LGBT+** | +1.6 pp | 0.741 | 82 | 562 | ✗ No effect |
| **Elderly (60+)** | +0.8 pp | 0.781 | 131 | 2,343 | ✗ No effect |

**Key Finding**: No clear effects due to small regular drinker samples. Should not inform policy decisions.

---

## 8. Data Files and Locations

### Main Data File
- **Path**: `/public/data/survey_sampling.csv`
- **Respondents**: 6,523
- **Districts**: 50 Bangkok districts

### Supporting Data Files
- `health_facilities.csv` - Healthcare facility locations
- `district_population.csv` - Population by district
- `community_population.csv` - Community-level population
- `district.geojson` - Bangkok district boundaries
- `normal_population_indicator_*.csv` - Population indicators

### Analysis Scripts (Python)
- `health_behaviors_comprehensive_analysis.py` - Exercise, smoking, drinking distributions
- `health_behavior_chronic_disease_analysis.py` - Behavior-disease correlations
- Other analysis scripts in root directory

### Dashboard Code (JavaScript)
- `src/components/Dashboard/IndicatorAnalysis.jsx` - Population classification (lines 77-82)
- `src/components/Dashboard/index.jsx` - Main dashboard controller
- `src/hooks/useSDHEData.js` - Data loading
- `src/utils/dashboardUtils.js` - Helper functions

---

## 9. Writing Claims: Rules for Statistical Rigor

### ✅ Valid Claims

**When p < 0.05 AND adequate sample size**:
- "Informal workers show **significant exercise protection** (14.2 pp gap, r=-0.121, p < 0.001, n=744)"
- "Exercise significantly reduces chronic disease"
- "This demonstrates a genuine protective effect"

**When p ≥ 0.05**:
- "Shows no significant effect (2.2 pp, p=0.410)"
- "The gap cannot be distinguished from random variation"
- "While the observed gap is 13.1 pp, it fails to reach significance (p=0.139, n=175)"

### ❌ Invalid Claims

**Do NOT make causal claims when non-significant**:
- ❌ "Regular drinking shows concerning harmful trend" (when p=0.326, n=17)
- ❌ "Disabled show strong exercise protection" (when p=0.139)
- ❌ "LGBT+ benefit from exercise" (when p=0.364)

**Do NOT ignore sample size limitations**:
- ❌ "Disabled regular drinkers have 12.4 pp higher disease rate" (without noting n=17)
- ❌ Making claims about groups with n < 100 without caveats

### Required Elements in Claims

**For significant findings**:
1. Effect size (gap in pp or correlation coefficient)
2. P-value
3. Sample size (n)
4. Direction of effect
5. Interpretation

**Example**:
> "Informal workers show significant exercise protection (35.1% vs 49.3%, 14.2 pp gap, r=-0.121, p < 0.001, n=744), suggesting exercise counteracts employment-related health risks."

**For non-significant findings**:
1. Effect size (gap)
2. P-value (to show it's not significant)
3. Sample size (especially if small)
4. Statement of non-significance
5. Reason (if applicable: small sample, weak effect, etc.)

**Example**:
> "Disabled show similar gap (13.1 pp) but fail to reach significance (p=0.139, n=175). Small sample size prevents definitive conclusions."

---

## 10. Common Errors to Avoid

### Error 1: Wrong Informal Worker Definition
❌ `occupation_type == '2'` → 70 people (WRONG!)
✅ `occupation_status == 1 AND occupation_contract == 0` → 1,330 people

### Error 2: Wrong Population Priority
❌ Elderly first, then LGBT+
✅ LGBT+ first, then elderly (priority order matters!)

### Error 3: Making Causal Claims Without Significance
❌ "Regular drinking shows harmful effects" (when p > 0.3)
✅ "No clear relationship detected (all p > 0.3)"

### Error 4: Ignoring Sample Size
❌ "Disabled regular drinkers at higher risk" (n=17)
✅ "Small sample (n=17) prevents conclusions"

### Error 5: Not Recognizing Reverse Causation
❌ "Smoking protects against chronic disease"
✅ "Paradox reflects reverse causation (diagnosis prompts cessation)"

### Error 6: Wrong Column Names
❌ Using `row['sex'] in [3, 4]` (assuming numeric)
✅ Using `row['sex'] == 'lgbt'` (text value)

---

## 11. Contact and Updates

**Report File**: `REPORT_SDHE_ANALYSIS_SECTION.md`

**When to Update This File**:
- When new analysis logic is discovered
- When errors in methodology are found and corrected
- When new data transformations are implemented

**Version History**:
- 2025-11-03: Initial creation after fixing informal worker classification bug and health behavior analysis
