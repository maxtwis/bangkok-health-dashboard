"""
Chapter 4.3: District-Level Spatial Analysis for Critical Districts (Hotspots)
Focus: Disabled and Elderly Groups with Mutually Exclusive Priority Logic

This script:
1. Applies priority logic: Disabled > Elderly (mutually exclusive)
2. Applies district-specific weights (Weight_Disabled, Weight_Elderly)
3. Calculates weighted mean SDHE domain scores for all 50 districts
4. Identifies Top 5 Critical Districts (Lowest Scores) for:
   - Elderly: Economic Security, Health Outcomes
   - Disabled: Healthcare Access, Physical Environment
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# STEP 1: Load Data
# ============================================================================

print("="*80)
print("DISTRICT-LEVEL SPATIAL ANALYSIS")
print("Critical Districts (Hotspots) Identification")
print("="*80)
print("\nStep 1: Loading data...")

# Load survey data
survey_df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
print(f"Survey data loaded: {len(survey_df)} respondents")

# Load district weights
weight_df = pd.read_csv('public/data/statistical checking/weight_by_district.csv', encoding='utf-8-sig')
print(f"District weights loaded: {len(weight_df)} districts")

# ============================================================================
# STEP 2: Apply Priority Logic - Create Mutually Exclusive Groups
# ============================================================================

print("\nStep 2: Applying priority logic (Disabled > Elderly)...")

def assign_priority_group(row, weight_df):
    """
    Apply mutually exclusive priority logic:
    1. Disabled (highest priority)
    2. Elderly (if not disabled)
    3. Other (excluded from this analysis)

    Returns group assignment and district-specific weight
    """
    district_name = row.get('dname', None)

    # PRIORITY 1: Disabled
    if row.get('disable_status', 0) == 1:
        if district_name and district_name in weight_df['dname'].values:
            weight = weight_df[weight_df['dname'] == district_name]['Weight_Disabled'].values[0]
        else:
            weight = 1.0
        return pd.Series({'group': 'Disabled', 'weight': weight})

    # PRIORITY 2: Elderly (only if NOT disabled)
    elif row.get('age', 0) >= 60:
        if district_name and district_name in weight_df['dname'].values:
            weight = weight_df[weight_df['dname'] == district_name]['Weight_Elderly'].values[0]
        else:
            weight = 1.0
        return pd.Series({'group': 'Elderly', 'weight': weight})

    # OTHER: Not included in this analysis
    else:
        return pd.Series({'group': 'Other', 'weight': np.nan})

# Apply priority assignment
survey_df[['priority_group', 'district_weight']] = survey_df.apply(
    lambda row: assign_priority_group(row, weight_df), axis=1
)

print("\nPriority group distribution:")
print(survey_df['priority_group'].value_counts())

# Filter to only Disabled and Elderly
analysis_df = survey_df[survey_df['priority_group'].isin(['Disabled', 'Elderly'])].copy()
print(f"\nTotal respondents for analysis: {len(analysis_df)}")
print(f"  - Disabled: {len(analysis_df[analysis_df['priority_group'] == 'Disabled'])}")
print(f"  - Elderly: {len(analysis_df[analysis_df['priority_group'] == 'Elderly'])}")

# ============================================================================
# STEP 3: Calculate SDHE Domain Scores
# ============================================================================

print("\nStep 3: Calculating SDHE domain scores...")

def calculate_income(row):
    """Calculate monthly income"""
    if pd.isna(row.get('income', None)) or row.get('income', 0) == 0:
        return np.nan
    if row.get('income_type', 2) == 1:  # Daily income
        return row['income'] * 30
    else:  # Monthly income
        return row['income']

def calculate_bmi(row):
    """Calculate BMI"""
    height = row.get('height', 0)
    weight = row.get('weight', 0)
    if height > 0 and weight > 0:
        return weight / ((height / 100) ** 2)
    return np.nan

def normalize_score(value, min_val, max_val, reverse=False):
    """Normalize score to 0-100 scale"""
    if pd.isna(value):
        return np.nan
    if max_val == min_val:
        return 50.0
    normalized = ((value - min_val) / (max_val - min_val)) * 100
    if reverse:
        normalized = 100 - normalized
    return np.clip(normalized, 0, 100)

# Calculate helper variables
analysis_df['monthly_income'] = analysis_df.apply(calculate_income, axis=1)
analysis_df['bmi'] = analysis_df.apply(calculate_bmi, axis=1)

# ============================================================================
# DOMAIN 1: ECONOMIC SECURITY
# ============================================================================
print("  - Economic Security...")

# Employment status
analysis_df['employment_score'] = analysis_df['occupation_status'].apply(
    lambda x: 100 if x == 1 else 0
)

# Vulnerable employment
def vulnerable_employment_score(row):
    if row.get('occupation_status', 0) == 1:
        has_contract = row.get('occupation_contract', 0) == 1
        has_welfare = row.get('occupation_welfare', 0) == 1
        if has_contract and has_welfare:
            return 100
        elif has_contract or has_welfare:
            return 50
        else:
            return 0
    return np.nan

analysis_df['vulnerable_employment_score'] = analysis_df.apply(vulnerable_employment_score, axis=1)

# Food security
analysis_df['food_security_score'] = analysis_df.apply(
    lambda row: 100 if row.get('food_insecurity_1', 0) == 0 and row.get('food_insecurity_2', 0) == 0
    else 50 if row.get('food_insecurity_1', 0) == 1 and row.get('food_insecurity_2', 0) == 0
    else 0, axis=1
)

# Work injury
analysis_df['work_injury_score'] = analysis_df.apply(
    lambda row: 100 if row.get('occupation_injury', 0) == 0 else 0, axis=1
)

# Income score
income_values = analysis_df['monthly_income'].dropna()
if len(income_values) > 0:
    analysis_df['income_score'] = analysis_df['monthly_income'].apply(
        lambda x: normalize_score(x, income_values.min(), income_values.max())
    )
else:
    analysis_df['income_score'] = np.nan

# Health spending
def health_spending_burden(row):
    income = row.get('monthly_income', 0)
    health_exp = row.get('hh_health_expense', 0)
    if income > 0 and pd.notna(health_exp):
        ratio = health_exp / income
        if ratio > 0.25:
            return 0
        elif ratio > 0.10:
            return 50
        else:
            return 100
    return np.nan

analysis_df['health_spending_score'] = analysis_df.apply(health_spending_burden, axis=1)

# Economic Security Domain Score
analysis_df['economic_security_score'] = analysis_df[[
    'employment_score', 'vulnerable_employment_score', 'food_security_score',
    'work_injury_score', 'income_score', 'health_spending_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 2: HEALTHCARE ACCESS
# ============================================================================
print("  - Healthcare Access...")

# Health coverage
analysis_df['health_coverage_score'] = analysis_df['welfare'].apply(
    lambda x: 100 if x in [1, 2, 3] else 0
)

# Medical access
analysis_df['medical_access_score'] = analysis_df['medical_skip_1'].apply(
    lambda x: 0 if x == 1 else 100
)

# Dental access
def dental_access_score(row):
    if row.get('oral_health', 0) == 1:
        return 100 if row.get('oral_health_access', 0) == 1 else 0
    return 100

analysis_df['dental_access_score'] = analysis_df.apply(dental_access_score, axis=1)

# Healthcare Access Domain Score
analysis_df['healthcare_access_score'] = analysis_df[[
    'health_coverage_score', 'medical_access_score', 'dental_access_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 3: PHYSICAL ENVIRONMENT
# ============================================================================
print("  - Physical Environment...")

# Housing ownership
analysis_df['home_ownership_score'] = analysis_df['house_status'].apply(
    lambda x: 100 if x == 1 else 50 if x in [2, 3, 5] else 0
)

# Basic utilities
def environment_quality_score(row):
    has_water = 1 if row.get('community_environment_3', 0) == 0 else 0
    has_electricity = 1 if row.get('community_environment_4', 0) == 0 else 0
    has_waste = 1 if row.get('community_environment_5', 0) == 0 else 0
    has_sanitation = 1 if row.get('community_environment_6', 0) == 0 else 0
    total = has_water + has_electricity + has_waste + has_sanitation
    return (total / 4) * 100

analysis_df['utilities_score'] = analysis_df.apply(environment_quality_score, axis=1)

# Overcrowding
def overcrowding_score(row):
    overcrowded_1 = row.get('community_environment_1', 0)
    overcrowded_2 = row.get('community_environment_2', 0)
    if overcrowded_1 == 1 or overcrowded_2 == 1:
        return 0
    return 100

analysis_df['overcrowding_score'] = analysis_df.apply(overcrowding_score, axis=1)

# Disaster experience
analysis_df['disaster_score'] = analysis_df['community_disaster_1'].apply(
    lambda x: 0 if x == 1 else 100
)

# Pollution
analysis_df['pollution_score'] = analysis_df['health_pollution'].apply(
    lambda x: 0 if x == 1 else 100
)

# Community amenities
def community_amenity_score(row):
    has_ramp = 1 if row.get('community_amenity_type_1', 0) == 1 else 0
    has_handrail = 1 if row.get('community_amenity_type_2', 0) == 1 else 0
    has_public_space = 1 if row.get('community_amenity_type_3', 0) == 1 else 0
    has_health_facility = 1 if row.get('community_amenity_type_4', 0) == 1 else 0
    total = has_ramp + has_handrail + has_public_space + has_health_facility
    return (total / 4) * 100

analysis_df['amenity_score'] = analysis_df.apply(community_amenity_score, axis=1)

# Physical Environment Domain Score
analysis_df['physical_environment_score'] = analysis_df[[
    'home_ownership_score', 'utilities_score', 'overcrowding_score',
    'disaster_score', 'pollution_score', 'amenity_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 4: SOCIAL CONTEXT
# ============================================================================
print("  - Social Context...")

# Community safety
analysis_df['safety_score'] = analysis_df['community_safety'].apply(
    lambda x: ((x - 1) / 3) * 100 if pd.notna(x) else np.nan
)

# Violence exposure
analysis_df['violence_score'] = analysis_df.apply(
    lambda row: 100 if row.get('physical_violence', 0) == 0 and
                      row.get('psychological_violence', 0) == 0 and
                      row.get('sexual_violence', 0) == 0
    else 67 if (row.get('physical_violence', 0) + row.get('psychological_violence', 0) +
                row.get('sexual_violence', 0)) == 1
    else 33 if (row.get('physical_violence', 0) + row.get('psychological_violence', 0) +
                row.get('sexual_violence', 0)) == 2
    else 0, axis=1
)

# Discrimination
analysis_df['discrimination_score'] = analysis_df['discrimination_1'].apply(
    lambda x: 0 if x == 1 else 100
)

# Social support
analysis_df['social_support_score'] = analysis_df['helper'].apply(
    lambda x: 100 if x == 1 else 0
)

# Social Context Domain Score
analysis_df['social_context_score'] = analysis_df[[
    'safety_score', 'violence_score', 'discrimination_score', 'social_support_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 5: HEALTH BEHAVIORS
# ============================================================================
print("  - Health Behaviors...")

# Alcohol consumption
analysis_df['alcohol_score'] = analysis_df['drink_status'].apply(
    lambda x: 100 if x == 0 else 50 if x == 2 else 0
)

# Tobacco use
analysis_df['tobacco_score'] = analysis_df['smoke_status'].apply(
    lambda x: 100 if x == 0 else 67 if x == 1 else 33 if x == 2 else 0
)

# Physical activity
analysis_df['exercise_score'] = analysis_df['exercise_status'].apply(
    lambda x: (x / 3) * 100 if pd.notna(x) else np.nan
)

# Obesity
def obesity_score(bmi):
    if pd.isna(bmi):
        return np.nan
    if 18.5 <= bmi <= 24.9:
        return 100
    elif bmi < 18.5:
        return 50
    elif 25 <= bmi < 30:
        return 50
    else:
        return 0

analysis_df['obesity_score'] = analysis_df['bmi'].apply(obesity_score)

# Health Behaviors Domain Score
analysis_df['health_behaviors_score'] = analysis_df[[
    'alcohol_score', 'tobacco_score', 'exercise_score', 'obesity_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 6: HEALTH OUTCOMES
# ============================================================================
print("  - Health Outcomes...")

# Chronic disease
analysis_df['chronic_disease_score'] = analysis_df['diseases_status'].apply(
    lambda x: 0 if x == 1 else 100
)

# Disease count
disease_columns = [f'diseases_type_{i}' for i in range(1, 22)]
def count_diseases(row):
    count = 0
    for col in disease_columns:
        if row.get(col, 0) == 1:
            count += 1
    return count

analysis_df['disease_count'] = analysis_df.apply(count_diseases, axis=1)

# Disease burden
analysis_df['disease_burden_score'] = analysis_df['disease_count'].apply(
    lambda x: 100 if x == 0 else 75 if x == 1 else 50 if x == 2 else 25 if x == 3 else 0
)

# Health Outcomes Domain Score
analysis_df['health_outcomes_score'] = analysis_df[[
    'chronic_disease_score', 'disease_burden_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 7: EDUCATION
# ============================================================================
print("  - Education...")

# Literacy Score
analysis_df['literacy_speak_score'] = analysis_df['speak'].apply(lambda x: 100 if x == 1 else 0)
analysis_df['literacy_read_score'] = analysis_df['read'].apply(lambda x: 100 if x == 1 else 0)
analysis_df['literacy_write_score'] = analysis_df['write'].apply(lambda x: 100 if x == 1 else 0)
analysis_df['literacy_math_score'] = analysis_df['math'].apply(lambda x: 100 if x == 1 else 0)

analysis_df['literacy_score'] = analysis_df[[
    'literacy_speak_score',
    'literacy_read_score',
    'literacy_write_score',
    'literacy_math_score'
]].mean(axis=1)

# Education Level Score (0-8 scale normalized to 0-100)
def education_level_score(edu):
    if pd.isna(edu):
        return np.nan
    return (edu / 8) * 100

analysis_df['education_level_score'] = analysis_df['education'].apply(education_level_score)

# Training Participation Score
analysis_df['training_score'] = analysis_df['training'].apply(lambda x: 100 if x == 1 else 0)

# Education Domain Score (Literacy 40%, Education Level 40%, Training 20%)
analysis_df['education_score'] = (
    analysis_df['literacy_score'] * 0.4 +
    analysis_df['education_level_score'] * 0.4 +
    analysis_df['training_score'] * 0.2
)

print("\nAll 7 SDHE domain scores calculated.")

# ============================================================================
# STEP 4: Calculate Weighted Mean by District
# ============================================================================

print("\nStep 4: Calculating weighted means by district...")

domains = [
    'economic_security_score',
    'healthcare_access_score',
    'physical_environment_score',
    'social_context_score',
    'health_behaviors_score',
    'health_outcomes_score',
    'education_score'
]

domain_labels = [
    'Economic Security',
    'Healthcare Access',
    'Physical Environment',
    'Social Context',
    'Health Behaviors',
    'Health Outcomes',
    'Education'
]

def weighted_mean(group_df, score_col, weight_col='district_weight'):
    """Calculate weighted mean"""
    valid_data = group_df[[score_col, weight_col]].dropna()
    if len(valid_data) == 0:
        return np.nan
    return np.average(valid_data[score_col], weights=valid_data[weight_col])

# District names are already in the analysis_df from survey data
# No need to merge

# Calculate district-level scores by group
results_disabled = []
results_elderly = []

# Process Disabled group
disabled_df = analysis_df[analysis_df['priority_group'] == 'Disabled']
for district in sorted(disabled_df['dname'].dropna().unique()):
    district_df = disabled_df[disabled_df['dname'] == district]
    n = len(district_df)

    row = {
        'District': district,
        'N': n
    }

    for domain, label in zip(domains, domain_labels):
        row[label] = weighted_mean(district_df, domain)

    results_disabled.append(row)

# Process Elderly group
elderly_df = analysis_df[analysis_df['priority_group'] == 'Elderly']
for district in sorted(elderly_df['dname'].dropna().unique()):
    district_df = elderly_df[elderly_df['dname'] == district]
    n = len(district_df)

    row = {
        'District': district,
        'N': n
    }

    for domain, label in zip(domains, domain_labels):
        row[label] = weighted_mean(district_df, domain)

    results_elderly.append(row)

disabled_district_df = pd.DataFrame(results_disabled)
elderly_district_df = pd.DataFrame(results_elderly)

print(f"\nDistricts with Disabled data: {len(disabled_district_df)}")
print(f"Districts with Elderly data: {len(elderly_district_df)}")

# ============================================================================
# STEP 5: Identify Top 5 Critical Districts (Lowest Scores)
# ============================================================================

print("\n" + "="*80)
print("TOP 5 CRITICAL DISTRICTS (HOTSPOTS)")
print("="*80)

# ELDERLY GROUP
print("\n--- ELDERLY GROUP ---\n")

# Economic Security - Bottom 5
print("Economic Security - Top 5 Critical Districts (Lowest Scores):")
print("-" * 80)
elderly_econ = elderly_district_df[['District', 'N', 'Economic Security']].copy()
elderly_econ = elderly_econ.dropna(subset=['Economic Security'])
elderly_econ = elderly_econ.sort_values('Economic Security', ascending=True).head(5)
elderly_econ['Rank'] = range(1, len(elderly_econ) + 1)
elderly_econ = elderly_econ[['Rank', 'District', 'N', 'Economic Security']]
print(elderly_econ.to_string(index=False))

# Health Outcomes - Bottom 5
print("\n\nHealth Outcomes - Top 5 Critical Districts (Lowest Scores):")
print("-" * 80)
elderly_health = elderly_district_df[['District', 'N', 'Health Outcomes']].copy()
elderly_health = elderly_health.dropna(subset=['Health Outcomes'])
elderly_health = elderly_health.sort_values('Health Outcomes', ascending=True).head(5)
elderly_health['Rank'] = range(1, len(elderly_health) + 1)
elderly_health = elderly_health[['Rank', 'District', 'N', 'Health Outcomes']]
print(elderly_health.to_string(index=False))

# DISABLED GROUP
print("\n\n--- DISABLED GROUP ---\n")

# Healthcare Access - Bottom 5
print("Healthcare Access - Top 5 Critical Districts (Lowest Scores):")
print("-" * 80)
disabled_healthcare = disabled_district_df[['District', 'N', 'Healthcare Access']].copy()
disabled_healthcare = disabled_healthcare.dropna(subset=['Healthcare Access'])
disabled_healthcare = disabled_healthcare.sort_values('Healthcare Access', ascending=True).head(5)
disabled_healthcare['Rank'] = range(1, len(disabled_healthcare) + 1)
disabled_healthcare = disabled_healthcare[['Rank', 'District', 'N', 'Healthcare Access']]
print(disabled_healthcare.to_string(index=False))

# Physical Environment - Bottom 5
print("\n\nPhysical Environment - Top 5 Critical Districts (Lowest Scores):")
print("-" * 80)
disabled_physical = disabled_district_df[['District', 'N', 'Physical Environment']].copy()
disabled_physical = disabled_physical.dropna(subset=['Physical Environment'])
disabled_physical = disabled_physical.sort_values('Physical Environment', ascending=True).head(5)
disabled_physical['Rank'] = range(1, len(disabled_physical) + 1)
disabled_physical = disabled_physical[['Rank', 'District', 'N', 'Physical Environment']]
print(disabled_physical.to_string(index=False))

# ============================================================================
# STEP 6: Save Results
# ============================================================================

print("\n" + "="*80)
print("SAVING RESULTS")
print("="*80)

# Save full district scores
disabled_district_df.to_csv('district_scores_disabled.csv', index=False, encoding='utf-8-sig')
elderly_district_df.to_csv('district_scores_elderly.csv', index=False, encoding='utf-8-sig')

# Save critical districts
elderly_econ.to_csv('critical_districts_elderly_economic_security.csv', index=False, encoding='utf-8-sig')
elderly_health.to_csv('critical_districts_elderly_health_outcomes.csv', index=False, encoding='utf-8-sig')
disabled_healthcare.to_csv('critical_districts_disabled_healthcare_access.csv', index=False, encoding='utf-8-sig')
disabled_physical.to_csv('critical_districts_disabled_physical_environment.csv', index=False, encoding='utf-8-sig')

# Save comprehensive text report
with open('district_spatial_analysis_results.txt', 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write("CHAPTER 4.3: DISTRICT-LEVEL SPATIAL ANALYSIS\n")
    f.write("Critical Districts (Hotspots) Identification\n")
    f.write("="*80 + "\n\n")

    f.write("METHODOLOGY:\n")
    f.write("- Priority Logic: Disabled > Elderly (mutually exclusive)\n")
    f.write("- Weights: District-specific (Weight_Disabled, Weight_Elderly)\n")
    f.write("- Analysis: All 50 districts, 6 SDHE domains\n\n")

    f.write("="*80 + "\n")
    f.write("TOP 5 CRITICAL DISTRICTS (HOTSPOTS)\n")
    f.write("="*80 + "\n\n")

    f.write("--- ELDERLY GROUP ---\n\n")
    f.write("Economic Security - Top 5 Critical Districts (Lowest Scores):\n")
    f.write("-" * 80 + "\n")
    f.write(elderly_econ.to_string(index=False))
    f.write("\n\n")

    f.write("Health Outcomes - Top 5 Critical Districts (Lowest Scores):\n")
    f.write("-" * 80 + "\n")
    f.write(elderly_health.to_string(index=False))
    f.write("\n\n")

    f.write("--- DISABLED GROUP ---\n\n")
    f.write("Healthcare Access - Top 5 Critical Districts (Lowest Scores):\n")
    f.write("-" * 80 + "\n")
    f.write(disabled_healthcare.to_string(index=False))
    f.write("\n\n")

    f.write("Physical Environment - Top 5 Critical Districts (Lowest Scores):\n")
    f.write("-" * 80 + "\n")
    f.write(disabled_physical.to_string(index=False))
    f.write("\n\n")

print("\nResults saved to:")
print("  - district_scores_disabled.csv")
print("  - district_scores_elderly.csv")
print("  - critical_districts_elderly_economic_security.csv")
print("  - critical_districts_elderly_health_outcomes.csv")
print("  - critical_districts_disabled_healthcare_access.csv")
print("  - critical_districts_disabled_physical_environment.csv")
print("  - district_spatial_analysis_results.txt")

print("\n" + "="*80)
print("DISTRICT-LEVEL SPATIAL ANALYSIS COMPLETE")
print("="*80)
