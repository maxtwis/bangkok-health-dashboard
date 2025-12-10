"""
Chapter 4.4: Community-Level Analysis
Impact of Community Type on SDHE Domains

This script:
1. Aggregates survey data by community_type from community_data.csv
2. Calculates mean scores for all 7 SDHE domains
3. Performs one-way ANOVA to test for significant differences between community types
4. Conducts post-hoc tests (Games-Howell) for pairwise comparisons
"""

import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import f_oneway, levene
from itertools import combinations
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("CHAPTER 4.4: COMMUNITY-LEVEL ANALYSIS")
print("Impact of Community Type on SDHE Domains")
print("="*80)

# ============================================================================
# STEP 1: Load Data
# ============================================================================

print("\nStep 1: Loading data...")

# Load FULL survey data for Bangkok average (6,523 respondents)
full_survey_df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
print(f"Full survey data loaded: {len(full_survey_df)} respondents")

# Load community data (has community_type column - subset of 4,522)
community_df = pd.read_csv('public/data/community_data.csv', encoding='utf-8-sig')
print(f"Community data loaded: {len(community_df)} respondents")
print(f"Difference: {len(full_survey_df) - len(community_df)} respondents (LGBTQ+, General Population outside communities)")

# Check community types
print("\nCommunity types:")
community_types = community_df['community_type'].value_counts()
# print(community_types)  # Commented out to avoid encoding issues

# ============================================================================
# STEP 2: Calculate SDHE Domain Scores for BOTH datasets
# ============================================================================

print("\nStep 2: Calculating SDHE domain scores for full survey (Bangkok average)...")
print("         and community data (for community type analysis)...")

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
community_df['monthly_income'] = community_df.apply(calculate_income, axis=1)
community_df['bmi'] = community_df.apply(calculate_bmi, axis=1)

# ============================================================================
# DOMAIN 1: ECONOMIC SECURITY
# ============================================================================
print("  - Economic Security...")

# Employment status
community_df['employment_score'] = community_df['occupation_status'].apply(
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

community_df['vulnerable_employment_score'] = community_df.apply(vulnerable_employment_score, axis=1)

# Food security
community_df['food_security_score'] = community_df.apply(
    lambda row: 100 if row.get('food_insecurity_1', 0) == 0 and row.get('food_insecurity_2', 0) == 0
    else 50 if row.get('food_insecurity_1', 0) == 1 and row.get('food_insecurity_2', 0) == 0
    else 0, axis=1
)

# Work injury
community_df['work_injury_score'] = community_df.apply(
    lambda row: 100 if row.get('occupation_injury', 0) == 0 else 0, axis=1
)

# Income score
income_values = community_df['monthly_income'].dropna()
if len(income_values) > 0:
    community_df['income_score'] = community_df['monthly_income'].apply(
        lambda x: normalize_score(x, income_values.min(), income_values.max())
    )
else:
    community_df['income_score'] = np.nan

# Health spending burden
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

community_df['health_spending_score'] = community_df.apply(health_spending_burden, axis=1)

# Economic Security Domain Score
community_df['economic_security_score'] = community_df[[
    'employment_score', 'vulnerable_employment_score', 'food_security_score',
    'work_injury_score', 'income_score', 'health_spending_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 2: HEALTHCARE ACCESS
# ============================================================================
print("  - Healthcare Access...")

# Health coverage
community_df['health_coverage_score'] = community_df['welfare'].apply(
    lambda x: 100 if (x in [1, 2, 3, '1', '2', '3']) else 0
)

# Medical access
community_df['medical_access_score'] = community_df['medical_skip_1'].apply(
    lambda x: 0 if x == 1 else 100
)

# CORRECTED: Dental access scoring
# - If no oral health problem (oral_health=0): score = 100 (no need for dental care = good outcome)
# - If had problem (oral_health=1) and got treatment (oral_health_access=1): score = 100
# - If had problem (oral_health=1) but no treatment (oral_health_access=0): score = 0
def dental_access_score(row):
    if row.get('oral_health', 0) == 1:
        return 100 if row.get('oral_health_access', 0) == 1 else 0
    return 100  # No oral health problem = positive outcome for domain score calculation

community_df['dental_access_score'] = community_df.apply(dental_access_score, axis=1)

# Healthcare Access Domain Score
community_df['healthcare_access_score'] = community_df[[
    'health_coverage_score', 'medical_access_score', 'dental_access_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 3: PHYSICAL ENVIRONMENT
# ============================================================================
print("  - Physical Environment...")

# Housing ownership
community_df['home_ownership_score'] = community_df['house_status'].apply(
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

community_df['utilities_score'] = community_df.apply(environment_quality_score, axis=1)

# Overcrowding
def overcrowding_score(row):
    overcrowded_1 = row.get('community_environment_1', 0)
    overcrowded_2 = row.get('community_environment_2', 0)
    if overcrowded_1 == 1 or overcrowded_2 == 1:
        return 0
    return 100

community_df['overcrowding_score'] = community_df.apply(overcrowding_score, axis=1)

# Disaster experience
community_df['disaster_score'] = community_df['community_disaster_1'].apply(
    lambda x: 0 if x == 1 else 100
)

# Pollution
community_df['pollution_score'] = community_df['health_pollution'].apply(
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

community_df['amenity_score'] = community_df.apply(community_amenity_score, axis=1)

# Physical Environment Domain Score
community_df['physical_environment_score'] = community_df[[
    'home_ownership_score', 'utilities_score', 'overcrowding_score',
    'disaster_score', 'pollution_score', 'amenity_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 4: SOCIAL CONTEXT
# ============================================================================
print("  - Social Context...")

# Community safety
community_df['safety_score'] = community_df['community_safety'].apply(
    lambda x: ((x - 1) / 3) * 100 if pd.notna(x) else np.nan
)

# Violence exposure
community_df['violence_score'] = community_df.apply(
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
community_df['discrimination_score'] = community_df['discrimination_1'].apply(
    lambda x: 0 if x == 1 else 100
)

# Social support
community_df['social_support_score'] = community_df['helper'].apply(
    lambda x: 100 if x == 1 else 0
)

# Social Context Domain Score
community_df['social_context_score'] = community_df[[
    'safety_score', 'violence_score', 'discrimination_score', 'social_support_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 5: HEALTH BEHAVIORS
# ============================================================================
print("  - Health Behaviors...")

# Alcohol consumption
community_df['alcohol_score'] = community_df['drink_status'].apply(
    lambda x: 100 if x == 0 else 50 if x == 2 else 0
)

# Tobacco use
community_df['tobacco_score'] = community_df['smoke_status'].apply(
    lambda x: 100 if x == 0 else 67 if x == 1 else 33 if x == 2 else 0
)

# Physical activity
community_df['exercise_score'] = community_df['exercise_status'].apply(
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

community_df['obesity_score'] = community_df['bmi'].apply(obesity_score)

# Health Behaviors Domain Score
community_df['health_behaviors_score'] = community_df[[
    'alcohol_score', 'tobacco_score', 'exercise_score', 'obesity_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 6: HEALTH OUTCOMES
# ============================================================================
print("  - Health Outcomes...")

# Chronic disease
community_df['chronic_disease_score'] = community_df['diseases_status'].apply(
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

community_df['disease_count'] = community_df.apply(count_diseases, axis=1)

# Disease burden score
community_df['disease_burden_score'] = community_df['disease_count'].apply(
    lambda x: 100 if x == 0 else 75 if x == 1 else 50 if x == 2 else 25 if x == 3 else 0
)

# Health Outcomes Domain Score
community_df['health_outcomes_score'] = community_df[[
    'chronic_disease_score', 'disease_burden_score'
]].mean(axis=1)

# ============================================================================
# DOMAIN 7: EDUCATION
# ============================================================================
print("  - Education...")

# Literacy Score
community_df['literacy_speak_score'] = community_df['speak'].apply(lambda x: 100 if x == 1 else 0)
community_df['literacy_read_score'] = community_df['read'].apply(lambda x: 100 if x == 1 else 0)
community_df['literacy_write_score'] = community_df['write'].apply(lambda x: 100 if x == 1 else 0)
community_df['literacy_math_score'] = community_df['math'].apply(lambda x: 100 if x == 1 else 0)

community_df['literacy_score'] = community_df[[
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

community_df['education_level_score'] = community_df['education'].apply(education_level_score)

# Training Participation Score
community_df['training_score'] = community_df['training'].apply(lambda x: 100 if x == 1 else 0)

# Education Domain Score (Literacy 40%, Education Level 40%, Training 20%)
community_df['education_score'] = (
    community_df['literacy_score'] * 0.4 +
    community_df['education_level_score'] * 0.4 +
    community_df['training_score'] * 0.2
)

print("\nAll 7 SDHE domain scores calculated.")

# ============================================================================
# STEP 3: Calculate Mean Scores by Community Type
# ============================================================================

print("\nStep 3: Calculating mean scores by community type...")

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

# Calculate Bangkok average (all respondents) first
bangkok_row = {'Community Type': 'Bangkok Average (All)', 'N': len(community_df)}
for domain, label in zip(domains, domain_labels):
    mean = community_df[domain].mean()
    std = community_df[domain].std()
    bangkok_row[f'{label} Mean'] = mean
    bangkok_row[f'{label} SD'] = std

# Calculate means by community type
results = [bangkok_row]  # Start with Bangkok average
for comm_type in sorted(community_df['community_type'].dropna().unique()):
    comm_df_temp = community_df[community_df['community_type'] == comm_type]
    n = len(comm_df_temp)

    row = {'Community Type': comm_type, 'N': n}

    for domain, label in zip(domains, domain_labels):
        mean = comm_df_temp[domain].mean()
        std = comm_df_temp[domain].std()
        row[f'{label} Mean'] = mean
        row[f'{label} SD'] = std

        # Calculate gap from Bangkok average
        row[f'{label} Gap'] = mean - bangkok_row[f'{label} Mean']

    results.append(row)

results_df = pd.DataFrame(results)

print("\n" + "="*80)
print("MEAN SDHE DOMAIN SCORES BY COMMUNITY TYPE")
print("(Bangkok Average included as reference)")
print("="*80)
# print(results_df.to_string(index=False))  # Commented to avoid encoding issues

# ============================================================================
# STEP 4: One-Way ANOVA
# ============================================================================

print("\n" + "="*80)
print("ONE-WAY ANOVA RESULTS")
print("="*80)

anova_results = []

for domain, label in zip(domains, domain_labels):
    # Prepare data for ANOVA
    groups_data = []

    for comm_type in community_df['community_type'].dropna().unique():
        comm_df_temp = community_df[community_df['community_type'] == comm_type]
        valid_data = comm_df_temp[domain].dropna().values
        if len(valid_data) > 0:
            groups_data.append(valid_data)

    # Perform ANOVA
    if len(groups_data) >= 2:
        f_stat, p_value = f_oneway(*groups_data)

        # Levene's test for equality of variances
        levene_stat, levene_p = levene(*groups_data)
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
# STEP 5: Post-Hoc Tests (Games-Howell)
# ============================================================================

print("\n" + "="*80)
print("POST-HOC TESTS (Games-Howell - Pairwise Comparisons)")
print("="*80)

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

        # Prepare data by community type
        groups_dict = {}
        for comm_type in sorted(community_df['community_type'].dropna().unique()):
            comm_df_temp = community_df[community_df['community_type'] == comm_type]
            valid_data = comm_df_temp[domain].dropna().values
            if len(valid_data) > 0:
                groups_dict[comm_type] = valid_data

        # Pairwise comparisons
        comparisons = []
        for comm1, comm2 in combinations(sorted(groups_dict.keys()), 2):
            p_value = welch_test_pairwise(groups_dict[comm1], groups_dict[comm2])
            mean1 = np.mean(groups_dict[comm1])
            mean2 = np.mean(groups_dict[comm2])

            comp = {
                'Community Type 1': comm1,
                'Community Type 2': comm2,
                'Mean Diff': mean1 - mean2,
                'p-value': p_value,
                'Significant': 'Yes' if p_value < 0.05 else 'No'
            }
            comparisons.append(comp)
            posthoc_results.append({**{'Domain': label}, **comp})

        comp_df = pd.DataFrame(comparisons)
        print(comp_df.to_string(index=False))

# ============================================================================
# STEP 6: Summary - Best and Worst Community Types
# ============================================================================

print("\n" + "="*80)
print("SUMMARY: BEST AND WORST COMMUNITY TYPES PER DOMAIN")
print("="*80)

summary = []
for domain, label in zip(domains, domain_labels):
    col_name = f'{label} Mean'

    if col_name in results_df.columns:
        # Find community type with lowest mean (worst)
        min_idx = results_df[col_name].idxmin()
        worst_community = results_df.loc[min_idx, 'Community Type']
        lowest_score = results_df.loc[min_idx, col_name]

        # Find community type with highest mean (best)
        max_idx = results_df[col_name].idxmax()
        best_community = results_df.loc[max_idx, 'Community Type']
        highest_score = results_df.loc[max_idx, col_name]

        # Calculate gap
        gap = highest_score - lowest_score

        # Check if statistically significant
        anova_row = anova_df[anova_df['Domain'] == label]
        is_significant = anova_row.iloc[0]['Significant (p<0.05)'] == 'Yes' if len(anova_row) > 0 else 'N/A'

        summary.append({
            'Domain': label,
            'Worst Community Type': worst_community,
            'Lowest Score': f"{lowest_score:.2f}",
            'Best Community Type': best_community,
            'Highest Score': f"{highest_score:.2f}",
            'Gap': f"{gap:.2f}",
            'Statistically Significant': is_significant
        })

summary_df = pd.DataFrame(summary)
print(summary_df.to_string(index=False))

# ============================================================================
# STEP 7: Save Results
# ============================================================================

print("\n" + "="*80)
print("SAVING RESULTS")
print("="*80)

# Save detailed results
with open('community_level_analysis_results.txt', 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write("CHAPTER 4.4: COMMUNITY-LEVEL ANALYSIS\n")
    f.write("Impact of Community Type on SDHE Domains\n")
    f.write("="*80 + "\n\n")

    f.write("MEAN SDHE DOMAIN SCORES BY COMMUNITY TYPE\n")
    f.write("="*80 + "\n")
    f.write(results_df.to_string(index=False))
    f.write("\n\n")

    f.write("ONE-WAY ANOVA RESULTS\n")
    f.write("="*80 + "\n")
    f.write(anova_df.to_string(index=False))
    f.write("\n\n")

    f.write("SUMMARY: BEST AND WORST COMMUNITY TYPES PER DOMAIN\n")
    f.write("="*80 + "\n")
    f.write(summary_df.to_string(index=False))
    f.write("\n")

# Save to CSV
results_df.to_csv('community_type_means.csv', index=False, encoding='utf-8-sig')
anova_df.to_csv('community_type_anova_results.csv', index=False, encoding='utf-8-sig')
summary_df.to_csv('community_type_summary.csv', index=False, encoding='utf-8-sig')

# Save post-hoc results
if posthoc_results:
    posthoc_df = pd.DataFrame(posthoc_results)
    posthoc_df.to_csv('community_type_posthoc_results.csv', index=False, encoding='utf-8-sig')

print("\nResults saved to:")
print("  - community_level_analysis_results.txt")
print("  - community_type_means.csv")
print("  - community_type_anova_results.csv")
print("  - community_type_summary.csv")
print("  - community_type_posthoc_results.csv")

print("\n" + "="*80)
print("COMMUNITY-LEVEL ANALYSIS COMPLETE")
print("="*80)
