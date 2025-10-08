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
