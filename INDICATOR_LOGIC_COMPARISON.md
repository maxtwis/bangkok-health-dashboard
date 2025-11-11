# Indicator Logic Comparison: Dashboard vs Python Analysis

## Critical Issues Found

### 1. ⚠️ CRITICAL: Disease Indicators Column Names
**Location**: `generate_deep_sdhe_analysis.py` lines 54-60

**Dashboard uses**: `diseases_type/1`, `diseases_type/2`, etc. (with slashes)
**Python uses**: `diseases_type_1`, `diseases_type_2`, etc. (with underscores)

**Dashboard logic** (IndicatorDetail.jsx:848):
```javascript
case 'diabetes':
  return record.diseases_status === 1 && record['diseases_type/1'] === 1;
```

**Python needs**:
```python
'Chronic Diseases': {
    'has_disease': 'diseases_status',
    'diabetes': 'diseases_type/1',  # NOT diseases_type_1
    'hypertension': 'diseases_type/2',  # NOT diseases_type_2
    'gout': 'diseases_type/3',
    'kidney_disease': 'diseases_type/4',
    'cancer': 'diseases_type/5'
}
```

**Impact**: All chronic disease comparisons may be incorrect or returning null values.

---

### 2. ⚠️ CRITICAL: Informal Workers Definition
**Location**: `generate_deep_sdhe_analysis.py` line 33

**Dashboard** (IndicatorDetail.jsx:173, 742):
```javascript
// Informal workers = EMPLOYED (occupation_status=1) AND no contract (occupation_contract=0)
return record.occupation_status === 1 && record.occupation_contract === 0;
```

**Python currently**:
```python
self.df['informal'] = (self.df['occupation_contract'] == 0).astype(int)
```

**Python should be**:
```python
self.df['informal'] = (
    (self.df['occupation_status'] == 1) &
    (self.df['occupation_contract'] == 0)
).astype(int)
```

**Impact**: Python incorrectly includes UNEMPLOYED people (occupation_status=0, occupation_contract=0) as informal workers. This inflates the informal worker count significantly.

---

### 3. ✅ CORRECT: General/Normal Population
Python correctly excludes all vulnerable groups (line 34-39).

---

### 4. ✅ CORRECT: BMI Calculation
Both dashboard and Python correctly calculate BMI as `weight / (height/100)²`

---

### 5. ✅ CORRECT: Food Insecurity
Both use:
- `food_insecurity_1` for moderate food insecurity
- `food_insecurity_2` for severe food insecurity

---

### 6. ⚠️ CHECK: Health Behaviors

**Dashboard** (IndicatorDetail.jsx:829-835):
```javascript
case 'alcohol_consumption':
  return record.drink_status === 1 || record.drink_status === 2;
case 'tobacco_use':
  return record.smoke_status === 1;
case 'physical_activity':
  return record.exercise_status === 1;  // Regular exercise
```

**Python** (generate_deep_sdhe_analysis.py:47-49):
```python
'smoking': 'smoke_status',
'drinking': 'drink_status',
'exercise': 'exercise_status',
```

**Note**: Python treats these as numeric values for t-tests, which is correct. Dashboard checks specific thresholds for binary classification.

---

### 7. ✅ CORRECT: Income Calculation
**Location**: All analysis scripts (e.g., `overcrowding_analysis.py`, `homeownership_by_employment.py`)

**Dashboard** (IndicatorDetail.jsx):
```javascript
// income_type: 1=daily wage, 2=monthly salary
const monthlyIncome = record.income_type === 1
  ? record.income * 30  // Daily wage × 30
  : record.income;      // Monthly salary as-is
```

**Python** (all analysis scripts):
```python
def get_monthly_income(row):
    if pd.isna(row['income']) or pd.isna(row['income_type']):
        return np.nan
    if row['income_type'] == 1:  # Daily wage
        return row['income'] * 30
    elif row['income_type'] == 2:  # Monthly salary
        return row['income']
    else:
        return np.nan
```

**Verified**: ✅ Income calculation matches dashboard logic exactly

---

### 8. ✅ CORRECT: Overcrowding Definition
**Location**: `overcrowding_analysis.py` lines 51-59

**Survey questions**:
- `community_environment_1` = 1 → Dense residential buildings (อาคารที่อยู่อาศัยหนาแน่น)
- `community_environment_2` = 1 → Small/narrow housing (บ้านมีพื้นที่แคบ)

**Python logic**:
```python
df['dense_buildings'] = df['community_environment_1'].apply(
    lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
)
df['small_house'] = df['community_environment_2'].apply(
    lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
)

# Any overcrowding = either condition present
df['any_overcrowding'] = df.apply(
    lambda row: 1 if (row['dense_buildings'] == 1 or row['small_house'] == 1)
                else (0 if pd.notna(row['dense_buildings']) or pd.notna(row['small_house'])
                      else np.nan),
    axis=1
)
```

**Note**: Uses OR logic - respondent is considered overcrowded if EITHER dense buildings OR small house is reported (or both).

---

### 9. ✅ CORRECT: Housing Tenure (Homeownership)
**Location**: `homeownership_by_employment.py` line 35, `overcrowding_analysis.py` lines 62-63

**Survey question**: `house_status`
- 1 = Own house (เป็นเจ้าของ)
- 2 = Rent (เช่า)
- Other values = Other arrangements

**Python logic**:
```python
# Homeownership
df['own_house'] = df['house_status'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)

# Renting
df['rent_house'] = df['house_status'].apply(
    lambda x: 1 if x == 2 else (0 if pd.notna(x) else np.nan)
)
```

**Note**: Binary classification where own_house=1 means house_status=1, own_house=0 means any other valid value (including rent, family housing, etc.)

---

### 10. ✅ CORRECT: Employment Status
**Location**: `homeownership_by_employment.py` line 38

**Survey question**: `occupation_status`
- 0 = Not employed
- 1 = Employed

**Python logic**:
```python
df['employed'] = df['occupation_status'].apply(
    lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
)
```

**Note**: Direct binary mapping from occupation_status

---

### 11. ✅ CORRECT: Employment Contract Type
**Location**: `homeownership_by_employment.py` (implicit), informal worker definition

**Survey question**: `occupation_contract`
- 0 = No contract (informal employment)
- 1 = Has contract (formal employment)

**Python logic**:
```python
# Informal worker = employed WITHOUT contract
(df['occupation_status'] == 1) & (df['occupation_contract'] == 0)

# Formal contract analysis (among employed)
# occupation_contract == 1 vs occupation_contract == 0
```

**Note**: Contract status only meaningful among employed individuals (occupation_status=1)

---

### 12. ⚠️ CRITICAL: Disaster Exposure Definition - INCOMPLETE
**Location**: REPORT_SDHE_ANALYSIS_SECTION.md line 709, Dashboard DataProcessor.js:576-579

**Dashboard** (DataProcessor.js:576-579):
```javascript
disaster_experience: {
  fields: ['community_disaster_1', 'community_disaster_2', 'community_disaster_3', 'community_disaster_4'],
  condition: (r) => r.community_disaster_1 === 1 || r.community_disaster_2 === 1 ||
                     r.community_disaster_3 === 1 || r.community_disaster_4 === 1
}
```

**Report currently uses**:
```python
# Only self_disaster_1 (personal experience of disaster type 1)
disaster = df['self_disaster_1'] == 1
```

**RECOMMENDED definition** (comprehensive):
```python
# Community disaster exposure - ALL types (1-8) for comprehensive measure
disaster = (
    (df['community_disaster_1'] == 1) |  # Flooding
    (df['community_disaster_2'] == 1) |  # Extreme heat
    (df['community_disaster_3'] == 1) |  # Extreme cold
    (df['community_disaster_4'] == 1) |  # Fire
    (df['community_disaster_5'] == 1) |  # Earthquake
    (df['community_disaster_6'] == 1) |  # Epidemic (COVID-19!)
    (df['community_disaster_7'] == 1) |  # Sinkhole/Land subsidence
    (df['community_disaster_8'] == 1)    # Pollution/Dust (PM2.5!)
)
```

**Impact comparison**:

| Definition | General Pop | Elderly | Disabled | Informal | Coverage |
|---|---|---|---|---|---|
| **self_disaster_1** (Report uses) | 2.5% | 11.4% | 14.5% | - | Very limited |
| **community_disaster_1-4** (Dashboard) | 23.9% | 42.7% | 41.5% | 33.5% | Partial |
| **community_disaster_1-8** (RECOMMENDED) | **41.1%** | **81.5%** | **71.6%** | **69.4%** | **Comprehensive** |

**Critical findings**:

1. **Dashboard misses 31.8% of population** by excluding types 5-8
2. **23.2% experienced ONLY epidemic or pollution disasters** - completely missed by dashboard
3. **Type 6 (Epidemic/โรคระบาด)**: 28.9% overall - captures COVID-19 pandemic impact
4. **Type 8 (Pollution/มลพิษ ฝุ่น)**: 37.5% overall - captures Bangkok's PM2.5 air pollution crisis
5. **Elderly most affected**: 81.5% experienced disasters with comprehensive definition

**Disaster type breakdown by population**:

| Type | Description | General | Elderly | Disabled | LGBT+ | Informal |
|---|---|---|---|---|---|---|
| 1 | Flooding | 6.6% | 21.0% | 22.3% | 8.8% | 15.6% |
| 2 | Extreme heat | 12.5% | 29.6% | 25.8% | 9.3% | 23.2% |
| 6 | Epidemic | 12.5% | **38.9%** | 28.8% | 15.9% | 29.4% |
| 8 | Pollution | 17.0% | **49.5%** | 38.4% | 18.7% | 40.7% |

**Note**: Type 5 (Earthquake) shows unusually high rates (42.0% overall, 57.0% elderly). This may indicate:
- Tremors from nearby regions
- Data quality issue
- Respondent confusion with other events
- Should be investigated further

**Recommendation**: Update dashboard AND report to use comprehensive definition (types 1-8) for complete disaster exposure assessment.

---

## Priority Fixes Required

1. **HIGHEST PRIORITY**: Fix disease indicator column names (use `diseases_type/1` not `diseases_type_1`)
2. **HIGHEST PRIORITY**: Fix informal worker definition (require occupation_status=1)
3. **HIGHEST PRIORITY**: Fix disaster exposure definition (use community_disaster_1-4, not self_disaster_1)
4. **MEDIUM PRIORITY**: Verify that CSV columns actually use slashes in disease columns

---

### 13. Social Context Indicators (Community Safety, Violence, Discrimination, Support)

**Community Safety**:
```python
# 4-point scale: 4=Very safe, 3=Moderately safe, 2=Somewhat unsafe, 1=Unsafe
# Binary measure: Safe = 3 or 4, Unsafe = 1 or 2
feels_safe = (df['community_safety'] >= 3).astype(int)
safety_score = df['community_safety']  # Keep ordinal for mean calculation
```

**Violence Indicators**:
```python
# All violence types: 0=Never, 1=Ever experienced
physical_violence = (df['physical_violence'] == 1).astype(int)
psychological_violence = (df['psychological_violence'] == 1).astype(int)
sexual_violence = (df['sexual_violence'] == 1).astype(int)

# Composite indicator
any_violence = (
    (df['physical_violence'] == 1) |
    (df['psychological_violence'] == 1) |
    (df['sexual_violence'] == 1)
).astype(int)
```

**Discrimination Indicators**:
```python
# Discrimination stored in separate binary columns
# discrimination_0 = Never (if all others are 0)
# discrimination_1 = Race/Ethnicity (เชื้อชาติ)
# discrimination_2 = Religion (ศาสนา)
# discrimination_3 = Gender (เพศ)
# discrimination_4 = Age (อายุ)
# discrimination_5 = Economic status (สถานะทางเศรษฐกิจ)

# Any discrimination
any_discrimination = (
    (df['discrimination_1'] == 1) |
    (df['discrimination_2'] == 1) |
    (df['discrimination_3'] == 1) |
    (df['discrimination_4'] == 1) |
    (df['discrimination_5'] == 1)
).astype(int)

# Specific types
discrimination_race = (df['discrimination_1'] == 1).astype(int)
discrimination_religion = (df['discrimination_2'] == 1).astype(int)
discrimination_gender = (df['discrimination_3'] == 1).astype(int)
discrimination_age = (df['discrimination_4'] == 1).astype(int)
discrimination_economic = (df['discrimination_5'] == 1).astype(int)
```

**Emergency Social Support**:
```python
# helper: 0=No emergency support, 1=Has friends/family for emergencies
has_emergency_support = (df['helper'] == 1).astype(int)
```

**Key Findings**:

1. **LGBT+ discrimination is 97% gender-based**: Out of 39.1% total discrimination, 38.1% is gender discrimination (11× higher than general population's 3.5%)

2. **Violence patterns diverge dramatically**:
   - LGBT+: 39.4% any violence (highest)
   - Elderly: 3.8% any violence (lowest, -20.1 pp)
   - Informal: 10.2% any violence (lower, -13.7 pp)

3. **Safety feelings inverse to violence exposure**:
   - Elderly feel safest (92.0%) yet experience least violence
   - LGBT+ feel moderately safe (76.4%) yet experience most violence

4. **Emergency support strong except LGBT+**:
   - Elderly: 95.1% (+11.0 pp)
   - LGBT+: 82.6% (-1.5 pp, only group lower than general)

**Data Quality Notes**:
- Multiple answers possible for discrimination (respondents can report multiple types)
- Violence questions ask about ever experiencing (lifetime, not past 12 months)
- Safety is subjective perception, not objective crime data
- Emergency support is binary (yes/no), doesn't capture quality or reliability

---

## Recommended Actions

1. Check actual column names in `survey_sampling.csv` for disease columns
2. Update Python script disease indicator mappings
3. Update Python informal worker definition
4. Re-run analysis with corrected logic
5. Compare results with dashboard to verify consistency
6. Verify discrimination column logic (discrimination_0 vs discrimination_1-5)
