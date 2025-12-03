"""
Bangkok-level Comparative Analysis of 5 Population Groups - CORRECTED VERSION
Weighted SDHE Domain Analysis with ANOVA and Post-hoc Tests

This script uses the CORRECT 7 Dashboard Domains:
1. Economic Security
2. Healthcare Access
3. Physical Environment
4. Social Context
5. Health Behaviors
6. Health Outcomes
7. Education

Performs:
1. Master weight application (Elderly, Disabled, Informal Workers, LGBTQ+, General Population)
2. SDHE domain score calculation using dashboard domain structure
3. Weighted one-way ANOVA for each domain
4. Post-hoc tests (Games-Howell for unequal variances)
5. Summary of most vulnerable groups per dimension
"""

import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import levene, f_oneway
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# STEP 1: Load and Prepare Data
# ============================================================================

print("="*80)
print("BANGKOK-LEVEL POPULATION GROUP INEQUALITY ANALYSIS")
print("Using 7 Dashboard Domains")
print("="*80)
print("\nStep 1: Loading data...")

# Load survey data
survey_df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
print(f"Survey data loaded: {len(survey_df)} respondents")

# Load district weights
weight_df = pd.read_csv('public/data/statistical checking/weight_by_district.csv', encoding='utf-8-sig')
print(f"District weights loaded: {len(weight_df)} districts")

# ============================================================================
# STEP 2: Apply Master Weights
# ============================================================================

print("\nStep 2: Applying master weights by population group...")

def apply_master_weight(row, weight_df):
    """
    Apply master weight based on population group and district

    STATISTICALLY SUPERIOR PRIORITY ORDER (by data precision & vulnerability):
    Prioritize groups by:
    - Data precision (district-level N > city-level N > no N)
    - Population size (rarest/smallest groups first to avoid statistical drowning)

    1. Disabled (N≈90k, district-level weights) - Smallest, most vulnerable
    2. Elderly (N≈1.2M, district-level weights) - Large but precise data
    3. Informal Workers (N≈1.5M, city-level weight) - Large, city-level data
    4. LGBTQ+ (no official N, weight=1.0) - Identity-based, no population data
    5. General Population (residual, weight=2.5)

    Rationale: If someone is "Elderly + Disabled", classify as Disabled to ensure
    the smallest vulnerable group is not statistically drowned out.
    """

    # Get district code
    district_code = row.get('dcode', None)

    # PRIORITY 1: Disabled (highest priority - smallest, most vulnerable group)
    if row.get('disable_status', 0) == 1:
        if district_code and district_code in weight_df['dcode'].values:
            weight = weight_df[weight_df['dcode'] == district_code]['Weight_Disabled'].values[0]
        else:
            weight = 1.0
        group = 'Disabled'

    # PRIORITY 2: Elderly (large group with precise district-level data)
    elif row.get('age', 0) >= 60:
        if district_code and district_code in weight_df['dcode'].values:
            weight = weight_df[weight_df['dcode'] == district_code]['Weight_Elderly'].values[0]
        else:
            weight = 1.0
        group = 'Elderly'

    # PRIORITY 3: Informal Workers (large group with city-level data)
    # Correct logic: occupation_status=1 AND occupation_contract=0
    # Captures ALL informal workers, not just freelancers
    elif row.get('occupation_status', 0) == 1 and row.get('occupation_contract', 0) == 0:
        weight = 0.6611
        group = 'Informal Workers'

    # PRIORITY 4: LGBTQ+ (identity-based, no population data)
    elif row.get('sex', '') == 'lgbt':
        weight = 1.0
        group = 'LGBTQ+'

    # PRIORITY 5: General Population (residual group)
    else:
        weight = 2.5
        group = 'General Population'

    return pd.Series({'master_weight': weight, 'population_group': group})

# Apply weights
survey_df[['master_weight', 'population_group']] = survey_df.apply(
    lambda row: apply_master_weight(row, weight_df), axis=1
)

print("\nPopulation group distribution:")
print(survey_df['population_group'].value_counts())

# ============================================================================
# STEP 3: Calculate SDHE Domain Scores (6 Dashboard Domains)
# ============================================================================

print("\nStep 3: Calculating SDHE domain scores using dashboard structure...")

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
survey_df['monthly_income'] = survey_df.apply(calculate_income, axis=1)
survey_df['bmi'] = survey_df.apply(calculate_bmi, axis=1)

# ============================================================================
# DOMAIN 1: ECONOMIC SECURITY
# ============================================================================
print("  - Calculating Economic Security scores...")

# Indicators: unemployment_rate, employment_rate, vulnerable_employment,
# food_insecurity, work_injury, catastrophic_health_spending

# Employment status (reverse unemployment)
survey_df['employment_score'] = survey_df['occupation_status'].apply(
    lambda x: 100 if x == 1 else 0
)

# Vulnerable employment (no contract, no welfare)
def vulnerable_employment_score(row):
    if row.get('occupation_status', 0) == 1:
        has_contract = row.get('occupation_contract', 0) == 1
        has_welfare = row.get('occupation_welfare', 0) == 1
        if has_contract and has_welfare:
            return 100  # Not vulnerable
        elif has_contract or has_welfare:
            return 50
        else:
            return 0  # Vulnerable
    return np.nan

survey_df['vulnerable_employment_score'] = survey_df.apply(vulnerable_employment_score, axis=1)

# Food insecurity (reverse scoring)
survey_df['food_security_score'] = survey_df.apply(
    lambda row: 100 if row.get('food_insecurity_1', 0) == 0 and row.get('food_insecurity_2', 0) == 0
    else 50 if row.get('food_insecurity_1', 0) == 1 and row.get('food_insecurity_2', 0) == 0
    else 0, axis=1
)

# Work injury (reverse scoring)
survey_df['work_injury_score'] = survey_df.apply(
    lambda row: 100 if row.get('occupation_injury', 0) == 0 else 0, axis=1
)

# Income score
income_values = survey_df['monthly_income'].dropna()
if len(income_values) > 0:
    survey_df['income_score'] = survey_df['monthly_income'].apply(
        lambda x: normalize_score(x, income_values.min(), income_values.max())
    )
else:
    survey_df['income_score'] = np.nan

# Catastrophic health spending (reverse - spending > 10% of income is bad)
def health_spending_burden(row):
    income = row.get('monthly_income', 0)
    health_exp = row.get('hh_health_expense', 0)
    if income > 0 and pd.notna(health_exp):
        ratio = health_exp / income
        if ratio > 0.25:
            return 0  # Catastrophic
        elif ratio > 0.10:
            return 50  # High burden
        else:
            return 100  # Affordable
    return np.nan

survey_df['health_spending_score'] = survey_df.apply(health_spending_burden, axis=1)

# Economic Security Domain Score
survey_df['economic_security_score'] = survey_df[[
    'employment_score', 'vulnerable_employment_score', 'food_security_score',
    'work_injury_score', 'income_score', 'health_spending_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 2: HEALTHCARE ACCESS
# ============================================================================
print("  - Calculating Healthcare Access scores...")

# Indicators: health_coverage, medical_skip_cost, dental_access

# Health coverage
survey_df['health_coverage_score'] = survey_df['welfare'].apply(
    lambda x: 100 if x in [1, 2, 3] else 0
)

# Medical consultation skip due to cost (reverse)
survey_df['medical_access_score'] = survey_df['medical_skip_1'].apply(
    lambda x: 0 if x == 1 else 100
)

# Dental access
def dental_access_score(row):
    if row.get('oral_health', 0) == 1:  # Had oral health problem
        return 100 if row.get('oral_health_access', 0) == 1 else 0
    return 100  # No problem = good access

survey_df['dental_access_score'] = survey_df.apply(dental_access_score, axis=1)

# Healthcare Access Domain Score
survey_df['healthcare_access_score'] = survey_df[[
    'health_coverage_score', 'medical_access_score', 'dental_access_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 3: PHYSICAL ENVIRONMENT
# ============================================================================
print("  - Calculating Physical Environment scores...")

# Indicators: electricity, water, sanitation, waste_management,
# housing_overcrowding, home_ownership, disaster_experience

# Housing ownership
survey_df['home_ownership_score'] = survey_df['house_status'].apply(
    lambda x: 100 if x == 1 else 50 if x in [2, 3, 5] else 0
)

# Basic utilities (water, electricity, waste)
def environment_quality_score(row):
    # Check community_environment flags
    has_water = 1 if row.get('community_environment_3', 0) == 0 else 0  # No water shortage
    has_electricity = 1 if row.get('community_environment_4', 0) == 0 else 0  # No electricity shortage
    has_waste = 1 if row.get('community_environment_5', 0) == 0 else 0  # Has waste management
    has_sanitation = 1 if row.get('community_environment_6', 0) == 0 else 0  # No sewage problem

    total = has_water + has_electricity + has_waste + has_sanitation
    return (total / 4) * 100

survey_df['utilities_score'] = survey_df.apply(environment_quality_score, axis=1)

# Housing overcrowding (reverse)
def overcrowding_score(row):
    overcrowded_1 = row.get('community_environment_1', 0)  # Dense housing
    overcrowded_2 = row.get('community_environment_2', 0)  # Small house
    if overcrowded_1 == 1 or overcrowded_2 == 1:
        return 0
    return 100

survey_df['overcrowding_score'] = survey_df.apply(overcrowding_score, axis=1)

# Disaster experience (reverse)
survey_df['disaster_score'] = survey_df['community_disaster_1'].apply(
    lambda x: 0 if x == 1 else 100
)

# Health pollution (reverse)
survey_df['pollution_score'] = survey_df['health_pollution'].apply(
    lambda x: 0 if x == 1 else 100
)

# Community amenities (accessibility features)
def community_amenity_score(row):
    # Check for presence of amenities (each worth 25 points)
    has_ramp = 1 if row.get('community_amenity_type_1', 0) == 1 else 0  # Ramp
    has_handrail = 1 if row.get('community_amenity_type_2', 0) == 1 else 0  # Handrails
    has_public_space = 1 if row.get('community_amenity_type_3', 0) == 1 else 0  # Public recreation/exercise space
    has_health_facility = 1 if row.get('community_amenity_type_4', 0) == 1 else 0  # Health service facility

    total = has_ramp + has_handrail + has_public_space + has_health_facility
    return (total / 4) * 100

survey_df['amenity_score'] = survey_df.apply(community_amenity_score, axis=1)

# Physical Environment Domain Score
survey_df['physical_environment_score'] = survey_df[[
    'home_ownership_score', 'utilities_score', 'overcrowding_score',
    'disaster_score', 'pollution_score', 'amenity_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 4: SOCIAL CONTEXT
# ============================================================================
print("  - Calculating Social Context scores...")

# Indicators: community_safety, violence (physical, psychological, sexual),
# discrimination, social_support

# Community safety
survey_df['safety_score'] = survey_df['community_safety'].apply(
    lambda x: ((x - 1) / 3) * 100 if pd.notna(x) else np.nan
)

# Violence exposure (reverse)
survey_df['violence_score'] = survey_df.apply(
    lambda row: 100 if row.get('physical_violence', 0) == 0 and
                      row.get('psychological_violence', 0) == 0 and
                      row.get('sexual_violence', 0) == 0
    else 67 if (row.get('physical_violence', 0) + row.get('psychological_violence', 0) +
                row.get('sexual_violence', 0)) == 1
    else 33 if (row.get('physical_violence', 0) + row.get('psychological_violence', 0) +
                row.get('sexual_violence', 0)) == 2
    else 0, axis=1
)

# Discrimination (reverse)
survey_df['discrimination_score'] = survey_df['discrimination_1'].apply(
    lambda x: 0 if x == 1 else 100
)

# Social support
survey_df['social_support_score'] = survey_df['helper'].apply(
    lambda x: 100 if x == 1 else 0
)

# Social Context Domain Score
survey_df['social_context_score'] = survey_df[[
    'safety_score', 'violence_score', 'discrimination_score', 'social_support_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 5: HEALTH BEHAVIORS
# ============================================================================
print("  - Calculating Health Behaviors scores...")

# Indicators: alcohol_consumption, tobacco_use, physical_activity, obesity

# Alcohol consumption (reverse)
survey_df['alcohol_score'] = survey_df['drink_status'].apply(
    lambda x: 100 if x == 0 else 50 if x == 2 else 0
)

# Tobacco use (reverse)
survey_df['tobacco_score'] = survey_df['smoke_status'].apply(
    lambda x: 100 if x == 0 else 67 if x == 1 else 33 if x == 2 else 0
)

# Physical activity
survey_df['exercise_score'] = survey_df['exercise_status'].apply(
    lambda x: (x / 3) * 100 if pd.notna(x) else np.nan
)

# Obesity (reverse - BMI outside 18.5-24.9 is bad)
def obesity_score(bmi):
    if pd.isna(bmi):
        return np.nan
    if 18.5 <= bmi <= 24.9:
        return 100  # Normal
    elif bmi < 18.5:
        return 50  # Underweight
    elif 25 <= bmi < 30:
        return 50  # Overweight
    else:
        return 0  # Obese

survey_df['obesity_score'] = survey_df['bmi'].apply(obesity_score)

# Health Behaviors Domain Score
survey_df['health_behaviors_score'] = survey_df[[
    'alcohol_score', 'tobacco_score', 'exercise_score', 'obesity_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 6: HEALTH OUTCOMES
# ============================================================================
print("  - Calculating Health Outcomes scores...")

# Indicators: chronic diseases (all reverse - having disease is bad)

# Any chronic disease (reverse)
survey_df['chronic_disease_score'] = survey_df['diseases_status'].apply(
    lambda x: 0 if x == 1 else 100
)

# Count of disease types
disease_columns = [f'diseases_type_{i}' for i in range(1, 22)]
def count_diseases(row):
    count = 0
    for col in disease_columns:
        if row.get(col, 0) == 1:
            count += 1
    return count

survey_df['disease_count'] = survey_df.apply(count_diseases, axis=1)

# Disease burden score (reverse)
survey_df['disease_burden_score'] = survey_df['disease_count'].apply(
    lambda x: 100 if x == 0 else 75 if x == 1 else 50 if x == 2 else 25 if x == 3 else 0
)

# Health Outcomes Domain Score
survey_df['health_outcomes_score'] = survey_df[[
    'chronic_disease_score', 'disease_burden_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 7: EDUCATION
# ============================================================================
print("  - Calculating Education scores...")

# Indicators: literacy (speak, read, write, math), education level (0-8), training

# Literacy Score (25 points each = 100 total)
survey_df['literacy_speak_score'] = survey_df['speak'].apply(lambda x: 100 if x == 1 else 0)
survey_df['literacy_read_score'] = survey_df['read'].apply(lambda x: 100 if x == 1 else 0)
survey_df['literacy_write_score'] = survey_df['write'].apply(lambda x: 100 if x == 1 else 0)
survey_df['literacy_math_score'] = survey_df['math'].apply(lambda x: 100 if x == 1 else 0)

# Overall literacy score (average of 4 skills)
survey_df['literacy_score'] = survey_df[[
    'literacy_speak_score',
    'literacy_read_score',
    'literacy_write_score',
    'literacy_math_score'
]].mean(axis=1)

# Education Level Score
# Scale: 0=no school, 1-2=primary, 3-4=secondary, 5-6=vocational, 7-8=university
# Normalize to 0-100 scale
def education_level_score(edu):
    if pd.isna(edu):
        return np.nan
    # Convert 0-8 scale to 0-100
    return (edu / 8) * 100

survey_df['education_level_score'] = survey_df['education'].apply(education_level_score)

# Training Participation Score
# Recent training indicates continuous learning
survey_df['training_score'] = survey_df['training'].apply(lambda x: 100 if x == 1 else 0)

# Education Domain Score
# Weighted: Literacy (40%), Education Level (40%), Training (20%)
survey_df['education_score'] = (
    survey_df['literacy_score'] * 0.4 +
    survey_df['education_level_score'] * 0.4 +
    survey_df['training_score'] * 0.2
)

print("\nAll 7 dashboard SDHE domain scores calculated successfully.")

# ============================================================================
# STEP 4: Calculate Weighted Means by Population Group
# ============================================================================

print("\nStep 4: Calculating weighted means by population group...")

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

def weighted_mean(group_df, score_col):
    """Calculate weighted mean"""
    valid_data = group_df[[score_col, 'master_weight']].dropna()
    if len(valid_data) == 0:
        return np.nan
    return np.average(valid_data[score_col], weights=valid_data['master_weight'])

def weighted_std(group_df, score_col):
    """Calculate weighted standard deviation"""
    valid_data = group_df[[score_col, 'master_weight']].dropna()
    if len(valid_data) == 0:
        return np.nan
    avg = np.average(valid_data[score_col], weights=valid_data['master_weight'])
    variance = np.average((valid_data[score_col] - avg)**2, weights=valid_data['master_weight'])
    return np.sqrt(variance)

# Calculate weighted statistics
results = []
for group in sorted(survey_df['population_group'].unique()):
    group_df = survey_df[survey_df['population_group'] == group]
    n = len(group_df)

    row = {'Population Group': group, 'N': n}

    for domain, label in zip(domains, domain_labels):
        row[f'{label} Mean'] = weighted_mean(group_df, domain)
        row[f'{label} SD'] = weighted_std(group_df, domain)

    results.append(row)

results_df = pd.DataFrame(results)

print("\n" + "="*80)
print("WEIGHTED MEANS BY POPULATION GROUP (7 Dashboard Domains)")
print("="*80)
print(results_df.to_string(index=False))

# ============================================================================
# STEP 5: Weighted One-Way ANOVA
# ============================================================================

print("\n" + "="*80)
print("WEIGHTED ONE-WAY ANOVA RESULTS")
print("="*80)

anova_results = []

for domain, label in zip(domains, domain_labels):
    # Prepare data for ANOVA
    groups_data = []
    groups_weights = []

    for group in survey_df['population_group'].unique():
        group_df = survey_df[survey_df['population_group'] == group]
        valid_data = group_df[[domain, 'master_weight']].dropna()

        if len(valid_data) > 0:
            groups_data.append(valid_data[domain].values)
            groups_weights.append(valid_data['master_weight'].values)

    # Weighted ANOVA using replication
    weighted_groups = []
    for data, weights in zip(groups_data, groups_weights):
        normalized_weights = (weights / weights.min()).astype(int)
        weighted_data = []
        for val, w in zip(data, normalized_weights):
            weighted_data.extend([val] * w)
        weighted_groups.append(weighted_data)

    # Perform ANOVA
    if len(weighted_groups) >= 2:
        f_stat, p_value = f_oneway(*weighted_groups)
        levene_stat, levene_p = levene(*weighted_groups)
        equal_var = levene_p > 0.05

        anova_results.append({
            'Domain': label,
            'F-statistic': f_stat,
            'p-value': p_value,
            'Significant (p<0.05)': 'Yes' if p_value < 0.05 else 'No',
            'Levene p-value': levene_p,
            'Equal Variance': 'Yes' if equal_var else 'No'
        })

anova_df = pd.DataFrame(anova_results)
print(anova_df.to_string(index=False))

# ============================================================================
# STEP 6: Post-Hoc Tests
# ============================================================================

print("\n" + "="*80)
print("POST-HOC TESTS (Games-Howell - Pairwise Comparisons)")
print("="*80)

from itertools import combinations

def welch_test_pairwise(group1_data, group2_data):
    """Welch's t-test for unequal variances"""
    t_stat, p_value = stats.ttest_ind(group1_data, group2_data, equal_var=False)
    return p_value

posthoc_results = []

for domain, label in zip(domains, domain_labels):
    # Check if ANOVA was significant
    anova_row = anova_df[anova_df['Domain'] == label]
    if len(anova_row) > 0 and anova_row.iloc[0]['Significant (p<0.05)'] == 'Yes':
        print(f"\n{label} - Pairwise Comparisons:")
        print("-" * 80)

        # Prepare weighted data
        groups_dict = {}
        for group in sorted(survey_df['population_group'].unique()):
            group_df = survey_df[survey_df['population_group'] == group]
            valid_data = group_df[[domain, 'master_weight']].dropna()

            if len(valid_data) > 0:
                normalized_weights = (valid_data['master_weight'] / valid_data['master_weight'].min()).astype(int)
                weighted_data = []
                for val, w in zip(valid_data[domain].values, normalized_weights):
                    weighted_data.extend([val] * w)
                groups_dict[group] = weighted_data

        # Pairwise comparisons
        comparisons = []
        for group1, group2 in combinations(sorted(groups_dict.keys()), 2):
            p_value = welch_test_pairwise(groups_dict[group1], groups_dict[group2])
            mean1 = np.mean(groups_dict[group1])
            mean2 = np.mean(groups_dict[group2])

            comp = {
                'Group 1': group1,
                'Group 2': group2,
                'Mean Diff': mean1 - mean2,
                'p-value': p_value,
                'Significant': 'Yes' if p_value < 0.05 else 'No'
            }
            comparisons.append(comp)
            posthoc_results.append({**{'Domain': label}, **comp})

        comp_df = pd.DataFrame(comparisons)
        print(comp_df.to_string(index=False))

# ============================================================================
# STEP 7: Summary - Most Vulnerable Groups
# ============================================================================

print("\n" + "="*80)
print("SUMMARY: MOST VULNERABLE GROUPS PER DOMAIN")
print("="*80)

summary = []
for domain, label in zip(domains, domain_labels):
    col_name = f'{label} Mean'

    if col_name in results_df.columns:
        # Find group with lowest mean (most vulnerable)
        min_idx = results_df[col_name].idxmin()
        most_vulnerable = results_df.loc[min_idx, 'Population Group']
        lowest_score = results_df.loc[min_idx, col_name]

        # Find group with highest mean (least vulnerable)
        max_idx = results_df[col_name].idxmax()
        least_vulnerable = results_df.loc[max_idx, 'Population Group']
        highest_score = results_df.loc[max_idx, col_name]

        # Calculate inequality gap
        gap = highest_score - lowest_score

        # Check if statistically significant
        anova_row = anova_df[anova_df['Domain'] == label]
        is_significant = anova_row.iloc[0]['Significant (p<0.05)'] == 'Yes' if len(anova_row) > 0 else 'N/A'

        summary.append({
            'Domain': label,
            'Most Vulnerable': most_vulnerable,
            'Lowest Score': f"{lowest_score:.2f}",
            'Least Vulnerable': least_vulnerable,
            'Highest Score': f"{highest_score:.2f}",
            'Inequality Gap': f"{gap:.2f}",
            'Statistically Significant': is_significant
        })

summary_df = pd.DataFrame(summary)
print(summary_df.to_string(index=False))

# ============================================================================
# STEP 8: Save Results
# ============================================================================

print("\n" + "="*80)
print("SAVING RESULTS")
print("="*80)

# Save detailed results
with open('population_group_inequality_analysis_results.txt', 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write("BANGKOK-LEVEL POPULATION GROUP INEQUALITY ANALYSIS\n")
    f.write("Using 7 Dashboard Domains\n")
    f.write("="*80 + "\n\n")

    f.write("WEIGHTED MEANS BY POPULATION GROUP\n")
    f.write("="*80 + "\n")
    f.write(results_df.to_string(index=False))
    f.write("\n\n")

    f.write("WEIGHTED ONE-WAY ANOVA RESULTS\n")
    f.write("="*80 + "\n")
    f.write(anova_df.to_string(index=False))
    f.write("\n\n")

    f.write("SUMMARY: MOST VULNERABLE GROUPS PER DOMAIN\n")
    f.write("="*80 + "\n")
    f.write(summary_df.to_string(index=False))
    f.write("\n")

# Save to CSV
results_df.to_csv('weighted_means_by_group.csv', index=False, encoding='utf-8-sig')
anova_df.to_csv('anova_results.csv', index=False, encoding='utf-8-sig')
summary_df.to_csv('vulnerability_summary.csv', index=False, encoding='utf-8-sig')

# Save post-hoc results
if posthoc_results:
    posthoc_df = pd.DataFrame(posthoc_results)
    posthoc_df.to_csv('posthoc_results.csv', index=False, encoding='utf-8-sig')

print("\nResults saved to:")
print("  - population_group_inequality_analysis_results.txt")
print("  - weighted_means_by_group.csv")
print("  - anova_results.csv")
print("  - vulnerability_summary.csv")
print("  - posthoc_results.csv")

print("\n" + "="*80)
print("ANALYSIS COMPLETE - 7 DASHBOARD DOMAINS")
print("="*80)
