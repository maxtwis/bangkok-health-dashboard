# Healthcare Access Section - Corrections Summary

## What Was Wrong in Original Report

### 1. Welfare Coverage Misunderstanding
**Original (INCORRECT):**
- Stated that only 37.6% of disabled, 41.4% of informal workers, and 43.0% of elderly had health coverage
- Implied these groups lacked health insurance

**Reality:**
- Thailand has universal health coverage
- Survey welfare column values: 1=civil servant (8.1%), 2=social security (23.8%), 3=universal 30 baht/บัตรทอง (65.2%), other (2.9%)
- Nearly everyone has SOME form of health coverage

### 2. Medical Skipping Data Source Confusion
**Original (INCORRECT):**
- Mixed up "skipping medical care due to fear" as a direct survey indicator
- Confused oral health access reasons with general medical skipping

**Reality:**
- `medical_skip_1`, `medical_skip_2`, `medical_skip_3` = ALL about **cost-related** skipping (binary 0/1)
- Fear/no time barriers come from `oral_health_access_reason` text field (when `oral_health_access = 0`)

### 3. Oral Health Reason Categorization
**Original (INCORRECT):**
- Python script didn't include "self-treatment" category
- Elderly showed 57.5% "other" reasons - seemed meaningless

**Reality (from IndicatorDetail.jsx):**
- Code includes 6 categories: cost, fear, distance, no_time, wait_time, **self_treatment**, other
- Self-treatment keywords: "หาย" (heal), "ยา" (medicine), "เอง" (self)
- Elderly actually show 34.5% self-treatment vs 3.2% general (31.3 pp gap!)

## Corrected Key Findings

### Medical Care Skipping (Cost-Related)
| Group | Skip Rate | vs General | Gap | Significance |
|-------|-----------|------------|-----|--------------|
| LGBT+ | 43.6% | 28.9% | +14.8 pp | p < 0.001 *** |
| Elderly | 15.4% | 28.9% | -13.5 pp | p < 0.001 *** |
| Disabled | 25.5% | 28.9% | -3.3 pp | n.s. |
| Informal | 23.7% | 28.9% | -5.2 pp | n.s. |

**Key insight:** LGBT+ have the HIGHEST medical care skipping rate despite universal coverage.

### Income as Strongest Predictor Within Groups
- **Disabled:** 48.6% low-income skip vs 22.5% higher-income (26.1 pp gap, p < 0.001)
- **Elderly:** 28.4% low-income skip vs 11.8% higher-income (16.6 pp gap, p < 0.001)

### Oral Health Access Barriers by Group

**General Population (n=156 didn't access, 11.9% non-access rate):**
- Fear: 33.3%
- Cost: 32.7%
- No time: 23.1%
- Self-treatment: 3.2%

**LGBT+ (n=103 didn't access, 15.0% non-access rate - HIGHEST):**
- No time: 34.0%
- Cost: 32.0%
- Fear: 22.3%
- Self-treatment: 3.9%

**Elderly (n=226 didn't access, 7.6% non-access rate):**
- **Self-treatment: 34.5%** ← KEY FINDING! (31.3 pp higher than general)
- Other: 23.0%
- Cost: 15.5%
- Wait time: 13.7%
- Fear: 5.8% (27.5 pp LOWER than general)

**Disabled (n=78 didn't access, 12.2% non-access rate):**
- Cost: 26.9%
- Other: 19.2%
- Self-treatment: 16.7%
- Wait time: 15.4%
- No time: 10.3%

**Informal Workers (n=255 didn't access, 9.6% non-access rate):**
- Cost: 26.7%
- Self-treatment: 22.4%
- No time: 14.5%
- Fear: 14.1%
- Other: 14.1%

## Key Interpretive Insights

### 1. Universal Coverage ≠ Universal Access
Despite Thailand's universal health coverage, financial barriers remain:
- Out-of-pocket costs for medications
- Transportation expenses
- Income loss from taking time off work
- These hit low-income groups hardest

### 2. Elderly Self-Treatment Pattern
Elderly don't avoid dental care due to fear or cost primarily, but because they:
- Normalize oral health decline ("teeth fall out naturally")
- Self-medicate with pain relievers or herbal remedies
- Accept tooth loss as part of aging
- Buy medicine themselves rather than see dentist

This is culturally significant and different from access barriers.

### 3. LGBT+ Dual Barriers
- Highest cost-related skipping (43.6%)
- High "no time" barrier for oral health (34.0%)
- Fear present but not dominant (22.3%)
- Suggests economic pressure + time constraints (possibly related to precarious employment)

### 4. Counterintuitive Employment Finding
Formal workers skip care MORE (32.6%) than informal (23.7%) or non-employed (16.9%)
- BUT: Low-income formal workers have HIGHEST skipping (44.3%)
- Suggests formal employment alone insufficient if income too low for out-of-pocket costs

## Code Reference
Analysis logic matches: `src/components/Dashboard/IndicatorDetail.jsx:425-464`
- Classification order matters: cost → fear → distance → no_time → wait_time → self_treatment → other
- Keywords must match exactly as in code
