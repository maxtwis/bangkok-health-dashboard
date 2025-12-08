# Bangkok Health Dashboard - Visualization Summary

## Generated Visualizations (Real Data)

All visualizations use **actual survey data** from `community_type_means_with_bangkok_7domains.csv` and domain-specific comparison files, styled to match the Gemini example.

---

## 1. Spider Chart (Radar Chart)

**File:** `community_sdhe_spider_chart_REAL.png`

**Description:** Comprehensive comparison of all 7 SDHE domains across 6 community types
- Bangkok Average (black dashed line)
- Crowded Community (blue)
- Urban Community (orange)
- Suburban Community (green)
- Housing Estate (red)
- High-rise/Condo (purple)

**Key Insights:**
- **Healthcare Access**: 90-96% (universal coverage achieved)
- **Social Context**: 89-97% (strong across all)
- **Health Outcomes**: 48-65% (moderate, shows access ≠ outcomes)
- **Physical Environment**: 55-69% (largest variation, Crowded lowest)

---

## 2. Individual Indicator Bar Charts

**Location:** `indicator_charts/` folder

**Total Charts:** 64 individual indicator bar charts

Each chart shows:
- Horizontal bars for 5 community types
- Bangkok Average reference line (black dashed)
- Values labeled at end of each bar
- Color-coded by community type

### Charts by Domain:

#### Economic Security (7 indicators)
1. `economic_security_unemployment_rate_pct.png`
2. `economic_security_vulnerable_employment_pct.png`
3. `economic_security_food_insecurity___moderate_pct.png`
4. `economic_security_food_insecurity___severe_pct.png`
5. `economic_security_work_injury_rate_pct.png`
6. `economic_security_average_monthly_income_baht.png`
7. `economic_security_catastrophic_health_spending_pct.png`

#### Healthcare Access (3 indicators)
1. `healthcare_access_health_coverage_rate_pct.png`
2. `healthcare_access_medical_skip_due_to_cost_pct.png`
3. `healthcare_access_dental_access_rate_pct.png`

#### Physical Environment (12 indicators)
1. `physical_environment_home_ownership_rate_pct.png`
2. `physical_environment_water_access_pct.png`
3. `physical_environment_electricity_access_pct.png`
4. `physical_environment_waste_management_pct.png`
5. `physical_environment_sanitation_access_pct.png`
6. `physical_environment_housing_overcrowding_pct.png`
7. `physical_environment_disaster_experience_pct.png`
8. `physical_environment_pollution_exposure_pct.png`
9. `physical_environment_has_ramp_accessibility_pct.png`
10. `physical_environment_has_handrails_pct.png`
11. `physical_environment_has_public_recreation_space_pct.png`
12. `physical_environment_has_health_facility_pct.png`

#### Social Context (4 indicators)
1. `social_context_feels_unsafe_pct.png`
2. `social_context_violence_experience_pct.png`
3. `social_context_discrimination_experience_pct.png`
4. `social_context_no_social_support_pct.png`

#### Health Behaviors (4 indicators)
1. `health_behaviors_alcohol_consumption_pct.png`
2. `health_behaviors_tobacco_use_pct.png`
3. `health_behaviors_no_exercise_pct.png`
4. `health_behaviors_abnormal_bmi_pct.png`

#### Health Outcomes (23 indicators)
1. `health_outcomes_chronic_disease_prevalence_pct.png`
2. `health_outcomes_multiple_chronic_diseases_pct.png`
3. `health_outcomes_diabetes_pct.png`
4. `health_outcomes_hypertension_pct.png`
5. `health_outcomes_gout_pct.png`
6. `health_outcomes_chronic_kidney_disease_pct.png`
7. `health_outcomes_cancer_pct.png`
8. `health_outcomes_hyperlipidemia_pct.png`
9. `health_outcomes_ischemic_heart_disease_pct.png`
10. `health_outcomes_liver_disease_pct.png`
11. `health_outcomes_stroke_pct.png`
12. `health_outcomes_hiv_pct.png`
13. `health_outcomes_mental_disorders_pct.png`
14. `health_outcomes_allergies_pct.png`
15. `health_outcomes_bone_and_joint_disease_pct.png`
16. `health_outcomes_respiratory_disease_pct.png`
17. `health_outcomes_emphysema_pct.png`
18. `health_outcomes_anemia_pct.png`
19. `health_outcomes_peptic_ulcer_pct.png`
20. `health_outcomes_epilepsy_pct.png`
21. `health_outcomes_intestinal_disease_pct.png`
22. `health_outcomes_paralysis_pct.png`
23. `health_outcomes_stroke_sequelae_pct.png`

#### Education (11 indicators)
1. `education_can_speak_thai_pct.png`
2. `education_can_read_thai_pct.png`
3. `education_can_write_thai_pct.png`
4. `education_can_do_basic_math_pct.png`
5. `education_had_training_pct.png`
6. `education_no_schooling_pct.png`
7. `education_primary_education_pct.png`
8. `education_secondary_education_pct.png`
9. `education_vocational_education_pct.png`
10. `education_higher_education_pct.png`
11. `education_average_education_level.png`

---

## Scripts Used

### `real_data_chart.py`
- Generates spider/radar chart
- Uses `community_type_means_with_bangkok_7domains.csv`
- Output: `community_sdhe_spider_chart_REAL.png`

### `generate_indicator_bar_charts.py`
- Generates all 64 individual indicator bar charts
- Uses domain-specific CSV files (e.g., `community_economic_security_comparison.csv`)
- Output: `indicator_charts/*.png`
- Special handling for:
  - Large values (Average Monthly Income)
  - Special characters in filenames (slashes, parentheses)

---

## Color Scheme

Consistent across all visualizations:

- **Bangkok Average**: Black (dashed line reference)
- **Crowded Community**: Blue (#1f77b4)
- **Urban Community**: Orange (#ff7f0e)
- **Suburban Community**: Green (#2ca02c)
- **Housing Estate**: Red (#d62728)
- **High-rise/Condo**: Purple (#9467bd)

---

## Usage in Report

### Recommended Visualizations by Section:

1. **Executive Summary**: Use spider chart for overall comparison
2. **Healthcare Access**: Use all 3 healthcare access indicator charts
3. **Economic Security**: Use unemployment, vulnerable employment, and income charts
4. **Physical Environment**: Use overcrowding, pollution, and facility access charts
5. **Health Outcomes**: Use chronic disease prevalence and top diseases (diabetes, hypertension)
6. **Education**: Use literacy rates and education level distribution

---

## Data Notes

- All data corrected with proper dental access logic (only counts those who needed care)
- Bangkok Average line provides citywide benchmark
- Small sample sizes (e.g., Housing Estate N=51) may show wider confidence intervals
- Urban Community income value (44M Baht) appears to be an outlier
- All percentages normalized to 0-100 scale for consistency
