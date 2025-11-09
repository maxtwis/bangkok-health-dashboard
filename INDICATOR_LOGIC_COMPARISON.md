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

## Priority Fixes Required

1. **HIGHEST PRIORITY**: Fix disease indicator column names (use `diseases_type/1` not `diseases_type_1`)
2. **HIGHEST PRIORITY**: Fix informal worker definition (require occupation_status=1)
3. **MEDIUM PRIORITY**: Verify that CSV columns actually use slashes in disease columns

---

## Recommended Actions

1. Check actual column names in `survey_sampling.csv` for disease columns
2. Update Python script disease indicator mappings
3. Update Python informal worker definition
4. Re-run analysis with corrected logic
5. Compare results with dashboard to verify consistency
