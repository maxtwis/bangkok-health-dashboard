"""
Targeted Indicator Analysis for Elderly Group in Critical Districts
Root Cause Analysis with Indicator-Level Comparison

This script:
1. Focuses on Elderly group only (age >= 60, not disabled)
2. Analyzes Top 5 Critical Districts for:
   - Economic Security (Districts: 1010, 1024, 1046, 1033, 1037)
   - Health Outcomes (Districts: 1014, 1031, 1029, 1012, 1008)
3. Calculates weighted percentage for specific indicators
4. Compares critical districts vs Bangkok average
5. Identifies significant gaps (root causes)
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# STEP 1: Load Data and Create Elderly Dataset
# ============================================================================

print("="*80)
print("TARGETED INDICATOR ANALYSIS - ELDERLY GROUP")
print("Root Cause Analysis for Critical Districts")
print("="*80)
print("\nStep 1: Loading data and creating Elderly dataset...")

# Load survey data
survey_df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
print(f"Survey data loaded: {len(survey_df)} respondents")

# Load district weights
weight_df = pd.read_csv('public/data/statistical checking/weight_by_district.csv', encoding='utf-8-sig')
print(f"District weights loaded: {len(weight_df)} districts")

# Create Elderly dataset with priority logic (Disabled > Elderly)
# Elderly = age >= 60 AND disable_status != 1
elderly_df = survey_df[
    (survey_df['age'] >= 60) &
    (survey_df['disable_status'] != 1)
].copy()

print(f"Elderly respondents (mutually exclusive): {len(elderly_df)}")

# Convert dname to string in both dataframes to ensure compatibility
elderly_df['dname'] = elderly_df['dname'].astype(str)
weight_df['dname'] = weight_df['dname'].astype(str)

# Merge weights
elderly_df = elderly_df.merge(
    weight_df[['dname', 'Weight_Elderly']],
    on='dname',
    how='left'
)

# Fill missing weights with 1.0
elderly_df['Weight_Elderly'] = elderly_df['Weight_Elderly'].fillna(1.0)

# ============================================================================
# STEP 2: Define Critical Districts
# ============================================================================

print("\nStep 2: Defining critical districts...")

critical_districts_econ = ['1010', '1024', '1046', '1033', '1037']
critical_districts_health = ['1014', '1031', '1029', '1012', '1008']

print(f"Economic Security Critical Districts: {critical_districts_econ}")
print(f"Health Outcomes Critical Districts: {critical_districts_health}")

# ============================================================================
# STEP 3: Define Indicator Calculation Functions
# ============================================================================

print("\nStep 3: Defining indicator calculation functions...")

def calculate_monthly_income(row):
    """Calculate monthly income"""
    if pd.isna(row.get('income', None)) or row.get('income', 0) == 0:
        return np.nan
    if row.get('income_type', 2) == 1:  # Daily income
        return row['income'] * 30
    else:  # Monthly income
        return row['income']

# Calculate monthly income
elderly_df['monthly_income'] = elderly_df.apply(calculate_monthly_income, axis=1)

def weighted_percentage(df, condition_col, weight_col='Weight_Elderly'):
    """
    Calculate weighted percentage for a binary indicator
    condition_col should be a boolean Series or column name
    """
    if isinstance(condition_col, str):
        valid_data = df[[condition_col, weight_col]].dropna()
        if len(valid_data) == 0:
            return np.nan
        weighted_sum = (valid_data[condition_col] * valid_data[weight_col]).sum()
        total_weight = valid_data[weight_col].sum()
    else:
        valid_df = df[condition_col.notna()].copy()
        if len(valid_df) == 0:
            return np.nan
        valid_condition = condition_col[condition_col.notna()]
        weighted_sum = (valid_condition * valid_df[weight_col]).sum()
        total_weight = valid_df[weight_col].sum()

    if total_weight == 0:
        return np.nan
    return (weighted_sum / total_weight) * 100

def weighted_mean(df, value_col, weight_col='Weight_Elderly'):
    """Calculate weighted mean"""
    valid_data = df[[value_col, weight_col]].dropna()
    if len(valid_data) == 0:
        return np.nan
    return np.average(valid_data[value_col], weights=valid_data[weight_col])

# ============================================================================
# STEP 4: Calculate Economic Security Indicators
# ============================================================================

print("\nStep 4: Calculating Economic Security indicators...")

# Indicator 1: Unemployment Rate (%)
elderly_df['unemployed'] = elderly_df['occupation_status'].apply(
    lambda x: 1 if x == 0 else 0
)

# Indicator 2: Vulnerable Employment (%) - No contract AND no welfare
def is_vulnerable_employment(row):
    if row.get('occupation_status', 0) == 1:  # If employed
        no_contract = row.get('occupation_contract', 0) == 0
        no_welfare = row.get('occupation_welfare', 0) == 0
        return 1 if (no_contract and no_welfare) else 0
    return np.nan

elderly_df['vulnerable_employment'] = elderly_df.apply(is_vulnerable_employment, axis=1)

# Indicator 3: Food Insecurity - Moderate (%) - food_insecurity_1 == 1
elderly_df['food_insecurity_moderate'] = elderly_df['food_insecurity_1'].apply(
    lambda x: 1 if x == 1 else 0
)

# Indicator 4: Food Insecurity - Severe (%) - food_insecurity_2 == 1
elderly_df['food_insecurity_severe'] = elderly_df['food_insecurity_2'].apply(
    lambda x: 1 if x == 1 else 0
)

# Indicator 5: Work Injury (%) - occupation_injury == 1
elderly_df['work_injury'] = elderly_df['occupation_injury'].apply(
    lambda x: 1 if x == 1 else 0
)

# Indicator 6: Average Monthly Income (Baht)
# Already calculated as monthly_income

# Indicator 7: Catastrophic Health Spending (%) - health expense > 10% of income
def has_catastrophic_spending(row):
    income = row.get('monthly_income', 0)
    health_exp = row.get('hh_health_expense', 0)
    if income > 0 and pd.notna(health_exp):
        ratio = health_exp / income
        return 1 if ratio > 0.10 else 0
    return np.nan

elderly_df['catastrophic_spending'] = elderly_df.apply(has_catastrophic_spending, axis=1)

# ============================================================================
# STEP 5: Calculate Health Outcomes Indicators
# ============================================================================

print("\nStep 5: Calculating Health Outcomes indicators...")

# Indicator 1: Chronic Disease Prevalence (%)
elderly_df['has_chronic_disease'] = elderly_df['diseases_status'].apply(
    lambda x: 1 if x == 1 else 0
)

# Indicator 2-22: Specific Disease Prevalence (%)
disease_names = {
    'diseases_type_1': 'Diabetes',
    'diseases_type_2': 'Hypertension',
    'diseases_type_3': 'Gout',
    'diseases_type_4': 'Chronic Kidney Disease',
    'diseases_type_5': 'Cancer',
    'diseases_type_6': 'Hyperlipidemia',
    'diseases_type_7': 'Ischemic Heart Disease',
    'diseases_type_8': 'Liver Disease',
    'diseases_type_9': 'Stroke',
    'diseases_type_10': 'HIV',
    'diseases_type_11': 'Mental Disorders',
    'diseases_type_12': 'Allergies',
    'diseases_type_13': 'Bone and Joint Disease',
    'diseases_type_14': 'Respiratory Disease',
    'diseases_type_15': 'Emphysema',
    'diseases_type_16': 'Anemia',
    'diseases_type_17': 'Peptic Ulcer',
    'diseases_type_18': 'Epilepsy',
    'diseases_type_19': 'Intestinal Disease',
    'diseases_type_20': 'Paralysis',
    'diseases_type_21': 'Stroke Sequelae'
}

# Indicator 3: Multiple Chronic Diseases (2+ diseases) (%)
disease_columns = [f'diseases_type_{i}' for i in range(1, 22)]

def count_diseases(row):
    count = 0
    for col in disease_columns:
        if row.get(col, 0) == 1:
            count += 1
    return count

elderly_df['disease_count'] = elderly_df.apply(count_diseases, axis=1)
elderly_df['multiple_diseases'] = elderly_df['disease_count'].apply(
    lambda x: 1 if x >= 2 else 0
)

# ============================================================================
# STEP 6: Calculate Bangkok Average (All Elderly)
# ============================================================================

print("\nStep 6: Calculating Bangkok average for all indicators...")

bangkok_results = {}

# Economic Security Indicators
bangkok_results['Unemployment Rate (%)'] = weighted_percentage(elderly_df, 'unemployed')
bangkok_results['Vulnerable Employment (%)'] = weighted_percentage(
    elderly_df[elderly_df['occupation_status'] == 1],
    'vulnerable_employment'
)
bangkok_results['Food Insecurity - Moderate (%)'] = weighted_percentage(elderly_df, 'food_insecurity_moderate')
bangkok_results['Food Insecurity - Severe (%)'] = weighted_percentage(elderly_df, 'food_insecurity_severe')
bangkok_results['Work Injury Rate (%)'] = weighted_percentage(elderly_df, 'work_injury')
bangkok_results['Average Monthly Income (Baht)'] = weighted_mean(elderly_df, 'monthly_income')
bangkok_results['Catastrophic Health Spending (%)'] = weighted_percentage(elderly_df, 'catastrophic_spending')

# Health Outcomes Indicators
bangkok_results['Chronic Disease Prevalence (%)'] = weighted_percentage(elderly_df, 'has_chronic_disease')
bangkok_results['Multiple Chronic Diseases (%)'] = weighted_percentage(elderly_df, 'multiple_diseases')

# Top 5 specific diseases
for col, name in disease_names.items():
    bangkok_results[f'{name} (%)'] = weighted_percentage(elderly_df, col)

# ============================================================================
# STEP 7: Calculate District-Level Indicators
# ============================================================================

print("\nStep 7: Calculating district-level indicators...")

def calculate_district_indicators(district_code):
    """Calculate all indicators for a specific district"""
    district_df = elderly_df[elderly_df['dname'] == district_code]

    if len(district_df) == 0:
        return None

    results = {}
    results['N'] = len(district_df)

    # Economic Security Indicators
    results['Unemployment Rate (%)'] = weighted_percentage(district_df, 'unemployed')
    results['Vulnerable Employment (%)'] = weighted_percentage(
        district_df[district_df['occupation_status'] == 1],
        'vulnerable_employment'
    )
    results['Food Insecurity - Moderate (%)'] = weighted_percentage(district_df, 'food_insecurity_moderate')
    results['Food Insecurity - Severe (%)'] = weighted_percentage(district_df, 'food_insecurity_severe')
    results['Work Injury Rate (%)'] = weighted_percentage(district_df, 'work_injury')
    results['Average Monthly Income (Baht)'] = weighted_mean(district_df, 'monthly_income')
    results['Catastrophic Health Spending (%)'] = weighted_percentage(district_df, 'catastrophic_spending')

    # Health Outcomes Indicators
    results['Chronic Disease Prevalence (%)'] = weighted_percentage(district_df, 'has_chronic_disease')
    results['Multiple Chronic Diseases (%)'] = weighted_percentage(district_df, 'multiple_diseases')

    # Top diseases
    for col, name in disease_names.items():
        results[f'{name} (%)'] = weighted_percentage(district_df, col)

    return results

# ============================================================================
# STEP 8: Generate Comparison Tables
# ============================================================================

print("\nStep 8: Generating comparison tables...")

# Economic Security Domain - ALL INDICATORS
print("\n" + "="*80)
print("ECONOMIC SECURITY DOMAIN - COMPREHENSIVE COMPARISON TABLE")
print("Critical Districts: 1010, 1024, 1046, 1033, 1037 (ALL INDICATORS)")
print("="*80)

# All Economic Security indicators based on domain calculation
econ_indicators = [
    'Unemployment Rate (%)',
    'Vulnerable Employment (%)',
    'Food Insecurity - Moderate (%)',
    'Food Insecurity - Severe (%)',
    'Work Injury Rate (%)',
    'Average Monthly Income (Baht)',
    'Catastrophic Health Spending (%)'
]

econ_comparison = []
for indicator in econ_indicators:
    row = {'Indicator': indicator, 'Bangkok Avg': bangkok_results[indicator]}

    for district in critical_districts_econ:
        district_results = calculate_district_indicators(district)
        if district_results:
            row[f'District {district}'] = district_results[indicator]

    # Calculate average gap for income (inverted - higher is better)
    if indicator == 'Average Monthly Income (Baht)':
        district_values = [row.get(f'District {d}', np.nan) for d in critical_districts_econ]
        valid_values = [v for v in district_values if pd.notna(v)]
        if valid_values:
            avg_district = np.mean(valid_values)
            row['Gap'] = bangkok_results[indicator] - avg_district  # Positive gap = Bangkok higher (better)
    else:
        # For other indicators, higher is worse
        district_values = [row.get(f'District {d}', np.nan) for d in critical_districts_econ]
        valid_values = [v for v in district_values if pd.notna(v)]
        if valid_values:
            avg_district = np.mean(valid_values)
            row['Gap'] = avg_district - bangkok_results[indicator]  # Positive gap = District worse

    econ_comparison.append(row)

econ_df = pd.DataFrame(econ_comparison)
print("\n" + econ_df.to_string(index=False))

# Health Outcomes Domain - ALL DISEASE INDICATORS
print("\n" + "="*80)
print("HEALTH OUTCOMES DOMAIN - COMPREHENSIVE COMPARISON TABLE")
print("Critical Districts: 1014, 1031, 1029, 1012, 1008 (ALL DISEASE TYPES)")
print("="*80)

# ALL Health Outcomes indicators
health_indicators = [
    'Chronic Disease Prevalence (%)',
    'Multiple Chronic Diseases (%)'
]

# Add all 21 specific disease types
for col, name in disease_names.items():
    health_indicators.append(f'{name} (%)')

health_comparison = []
for indicator in health_indicators:
    row = {'Indicator': indicator, 'Bangkok Avg': bangkok_results[indicator]}

    for district in critical_districts_health:
        district_results = calculate_district_indicators(district)
        if district_results:
            row[f'District {district}'] = district_results[indicator]

    # Calculate average gap (higher is worse for health outcomes)
    district_values = [row.get(f'District {d}', np.nan) for d in critical_districts_health]
    valid_values = [v for v in district_values if pd.notna(v)]
    if valid_values:
        avg_district = np.mean(valid_values)
        row['Gap'] = avg_district - bangkok_results[indicator]  # Positive gap = District worse

    health_comparison.append(row)

health_df = pd.DataFrame(health_comparison)
print("\n" + health_df.to_string(index=False))

# ============================================================================
# STEP 9: Identify Significant Gaps (Root Causes)
# ============================================================================

print("\n" + "="*80)
print("SIGNIFICANT GAPS - ROOT CAUSE ANALYSIS")
print("="*80)

print("\n--- ECONOMIC SECURITY DOMAIN ---")
print("\nTop 5 Indicators with Largest Gaps:")
econ_gaps = econ_df[['Indicator', 'Bangkok Avg', 'Gap']].copy()
econ_gaps = econ_gaps.sort_values('Gap', ascending=False).head(5)
print(econ_gaps.to_string(index=False))

print("\n--- HEALTH OUTCOMES DOMAIN ---")
print("\nTop 5 Indicators with Largest Gaps:")
health_gaps = health_df[['Indicator', 'Bangkok Avg', 'Gap']].copy()
health_gaps = health_gaps.sort_values('Gap', ascending=False).head(5)
print(health_gaps.to_string(index=False))

# ============================================================================
# STEP 10: Save Results
# ============================================================================

print("\n" + "="*80)
print("SAVING RESULTS")
print("="*80)

# Save comparison tables
econ_df.to_csv('elderly_economic_security_comparison.csv', index=False, encoding='utf-8-sig')
health_df.to_csv('elderly_health_outcomes_comparison.csv', index=False, encoding='utf-8-sig')

# Save detailed text report
with open('elderly_targeted_indicator_analysis_results.txt', 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write("TARGETED INDICATOR ANALYSIS - ELDERLY GROUP\n")
    f.write("Root Cause Analysis for Critical Districts\n")
    f.write("="*80 + "\n\n")

    f.write("ECONOMIC SECURITY DOMAIN - COMPARISON TABLE\n")
    f.write("Critical Districts: 1010, 1024, 1046, 1033, 1037\n")
    f.write("="*80 + "\n")
    f.write(econ_df.to_string(index=False))
    f.write("\n\n")

    f.write("HEALTH OUTCOMES DOMAIN - COMPARISON TABLE\n")
    f.write("Critical Districts: 1014, 1031, 1029, 1012, 1008\n")
    f.write("="*80 + "\n")
    f.write(health_df.to_string(index=False))
    f.write("\n\n")

    f.write("="*80 + "\n")
    f.write("SIGNIFICANT GAPS - ROOT CAUSE ANALYSIS\n")
    f.write("="*80 + "\n\n")

    f.write("--- ECONOMIC SECURITY DOMAIN ---\n")
    f.write("Top 5 Indicators with Largest Gaps:\n")
    f.write("-" * 80 + "\n")
    f.write(econ_gaps.to_string(index=False))
    f.write("\n\n")

    f.write("--- HEALTH OUTCOMES DOMAIN ---\n")
    f.write("Top 5 Indicators with Largest Gaps:\n")
    f.write("-" * 80 + "\n")
    f.write(health_gaps.to_string(index=False))
    f.write("\n")

print("\nResults saved to:")
print("  - elderly_economic_security_comparison.csv")
print("  - elderly_health_outcomes_comparison.csv")
print("  - elderly_targeted_indicator_analysis_results.txt")

print("\n" + "="*80)
print("TARGETED INDICATOR ANALYSIS COMPLETE")
print("="*80)
