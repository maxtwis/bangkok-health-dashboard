"""
Comprehensive Domain Analysis for Intersection Groups

This script analyzes ALL SDHE domains for intersection groups to match
the comprehensive structure of section 5.2.2 (population group analysis).

Domains to analyze for each intersection:
1. Employment & Income (partially done, expand)
2. Education & Skills (MISSING)
3. Healthcare Access (partially done, expand)
4. Chronic Diseases (MISSING)
5. Health Behaviors (MISSING)
6. Housing & Environment (MISSING)
7. Social Context (partially done, expand to include safety + emergency support)
8. Family & Household (MISSING)
9. Food Security (partially done, expand)

Priority-based classification: LGBT+ -> Elderly -> Disabled -> Informal -> General
"""

import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import chi2_contingency

# Load data
print("Loading data...")
df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
print(f"Loaded {len(df)} respondents\n")

# Population classification with priority order
def classify_population_group(row):
    if row['sex'] == 'lgbt':
        return 'lgbt'
    elif row['age'] >= 60:
        return 'elderly'
    elif row['disable_status'] == 1:
        return 'disabled'
    elif row['occupation_status'] == 1 and row['occupation_contract'] == 0:
        return 'informal'
    else:
        return 'general'

df['pop_group'] = df.apply(classify_population_group, axis=1)

# Create intersection groups (mutually exclusive with priority)
def classify_intersection_group(row):
    """
    Classify intersection groups BEFORE priority classification
    This allows us to identify TRUE intersections (e.g., someone who is both elderly AND disabled)
    """
    is_lgbt = (row['sex'] == 'lgbt')
    is_elderly = (row['age'] >= 60)
    is_disabled = (row['disable_status'] == 1)
    is_informal = (row['occupation_status'] == 1 and row['occupation_contract'] == 0)

    # Count how many categories they belong to
    categories = []
    if is_lgbt:
        categories.append('lgbt')
    if is_elderly:
        categories.append('elderly')
    if is_disabled:
        categories.append('disabled')
    if is_informal:
        categories.append('informal')

    # Single identity (will be classified by priority)
    if len(categories) == 1:
        return categories[0]

    # Intersections (sorted alphabetically for consistency)
    if len(categories) >= 2:
        return '+'.join(sorted(categories))

    return 'general'

df['intersection_group'] = df.apply(classify_intersection_group, axis=1)

# Convert income to monthly
def convert_to_monthly_income(row):
    if pd.isna(row['income']) or row['income'] == 0:
        return np.nan
    if row['income_type'] == 1:  # Daily
        return row['income'] * 30
    elif row['income_type'] == 2:  # Monthly
        return row['income']
    else:
        return np.nan

df['monthly_income'] = df.apply(convert_to_monthly_income, axis=1)

# Calculate indicators for all domains
print("Calculating indicators across all domains...")

# 1. EMPLOYMENT & INCOME DOMAIN
df['employed'] = (df['occupation_status'] == 1).astype(float)
df['has_contract'] = df['occupation_contract'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['has_welfare'] = df['occupation_welfare'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['working_hours'] = pd.to_numeric(df['working_hours'], errors='coerce')
df['occupation_injury'] = df['occupation_injury'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)

# 2. EDUCATION & SKILLS DOMAIN
df['primary_education'] = (df['education'] <= 1).astype(float)
df['bachelor_plus'] = (df['education'] >= 5).astype(float)
df['can_read'] = df['read'].apply(lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan))
df['can_write'] = df['write'].apply(lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan))
df['can_math'] = df['math'].apply(lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan))
df['has_training'] = df['training'].apply(lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan))

# 3. HEALTHCARE ACCESS DOMAIN
df['skipped_medical'] = df['medical_skip_1'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['oral_health_symptoms'] = df['oral_health'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['oral_access_issue'] = df['oral_health_access'].apply(
    lambda x: 1 if x == 0 else (0 if pd.notna(x) else np.nan)
)

# 4. CHRONIC DISEASES DOMAIN
df['has_chronic'] = df['diseases_status'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['hypertension'] = df['diseases_type_1'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['diabetes'] = df['diseases_type_2'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['kidney_disease'] = df['diseases_type_11'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)

# 5. HEALTH BEHAVIORS DOMAIN
df['exercise_regular'] = df['exercise_status'].apply(
    lambda x: 1 if x in [2, 3] else (0 if x in [0, 1] else np.nan)
)
df['current_smoker'] = df['smoke_status'].apply(
    lambda x: 1 if x in [2, 3] else (0 if x in [0, 1] else np.nan)
)
df['current_drinker'] = df['drink_status'].apply(
    lambda x: 1 if x == 1 else (0 if x in [0, 2] else np.nan)
)

# 6. HOUSING & ENVIRONMENT DOMAIN
df['owns_home'] = df['house_status'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['overcrowded'] = (df['hhsize'] / df['house_sink'] > 2).astype(float)
df['pollution_health'] = df['health_pollution'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)

# 7. SOCIAL CONTEXT DOMAIN
df['physical_violence'] = df['physical_violence'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['psychological_violence'] = df['psychological_violence'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['sexual_violence'] = df['sexual_violence'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['any_violence'] = (
    (df['physical_violence'] == 1) |
    (df['psychological_violence'] == 1) |
    (df['sexual_violence'] == 1)
).astype(float)

df['any_discrimination'] = (
    (df['discrimination_1'] == 1) |
    (df['discrimination_2'] == 1) |
    (df['discrimination_3'] == 1) |
    (df['discrimination_4'] == 1) |
    (df['discrimination_5'] == 1)
).astype(float)

df['feels_safe'] = (df['community_safety'] >= 3).astype(float)
df['has_emergency_support'] = df['helper'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)

# 8. FAMILY & HOUSEHOLD DOMAIN
df['hhsize'] = pd.to_numeric(df['hhsize'], errors='coerce')
df['hh_child_count'] = pd.to_numeric(df['hh_child_count'], errors='coerce')
df['hh_elder_count'] = pd.to_numeric(df['hh_elder_count'], errors='coerce')
df['hh_worker_count'] = pd.to_numeric(df['hh_worker_count'], errors='coerce')

# 9. FOOD SECURITY DOMAIN
df['food_worry'] = df['food_insecurity_1'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)
df['food_skip'] = df['food_insecurity_2'].apply(
    lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
)

print("Indicators calculated.\n")

# Define intersection groups to analyze
intersections = [
    ('disabled+elderly', 'disabled', 'elderly'),
    ('elderly+informal', 'elderly', 'informal'),
    ('elderly+lgbt', 'elderly', 'lgbt'),
    ('disabled+informal', 'disabled', 'informal'),
    ('disabled+lgbt', 'disabled', 'lgbt'),
    ('informal+lgbt', 'informal', 'lgbt'),
]

# Comprehensive analysis function
def analyze_intersection_all_domains(intersection_name, group1, group2):
    """
    Comprehensive analysis across ALL 9 SDHE domains for an intersection group
    """
    print(f"\n{'='*80}")
    print(f"COMPREHENSIVE DOMAIN ANALYSIS: {intersection_name.upper()}")
    print(f"{'='*80}\n")

    # Get data
    intersection_df = df[df['intersection_group'] == intersection_name].copy()
    general_df = df[df['pop_group'] == 'general'].copy()
    group1_df = df[df['pop_group'] == group1].copy()
    group2_df = df[df['pop_group'] == group2].copy()

    n_intersection = len(intersection_df)
    n_general = len(general_df)
    n_group1 = len(group1_df)
    n_group2 = len(group2_df)

    print(f"Sample sizes:")
    print(f"  {intersection_name}: n={n_intersection}")
    print(f"  {group1}: n={n_group1}")
    print(f"  {group2}: n={n_group2}")
    print(f"  general: n={n_general}\n")

    results = []

    # Define all indicators by domain
    domains = {
        'Employment & Income': [
            ('monthly_income', 'Monthly income', 'mean', 'THB'),
            ('employed', 'Employment rate', 'mean', '%'),
            ('has_contract', 'Has contract', 'mean', '%'),
            ('has_welfare', 'Has welfare', 'mean', '%'),
            ('working_hours', 'Working hours/week', 'mean', 'hours'),
            ('occupation_injury', 'Occupation injury', 'mean', '%'),
        ],
        'Education & Skills': [
            ('primary_education', 'Primary education or less', 'mean', '%'),
            ('bachelor_plus', "Bachelor's degree+", 'mean', '%'),
            ('can_read', 'Can read', 'mean', '%'),
            ('can_write', 'Can write', 'mean', '%'),
            ('can_math', 'Can do math', 'mean', '%'),
            ('has_training', 'Has training', 'mean', '%'),
        ],
        'Healthcare Access': [
            ('skipped_medical', 'Skipped medical care (cost)', 'mean', '%'),
            ('oral_health_symptoms', 'Had oral health symptoms', 'mean', '%'),
            ('oral_access_issue', 'Oral health access issue', 'mean', '%'),
        ],
        'Chronic Diseases': [
            ('has_chronic', 'Has any chronic disease', 'mean', '%'),
            ('hypertension', 'Hypertension', 'mean', '%'),
            ('diabetes', 'Diabetes', 'mean', '%'),
            ('kidney_disease', 'Kidney disease', 'mean', '%'),
        ],
        'Health Behaviors': [
            ('exercise_regular', 'Regular exercise (3+ times/week)', 'mean', '%'),
            ('current_smoker', 'Current smoker', 'mean', '%'),
            ('current_drinker', 'Current drinker', 'mean', '%'),
        ],
        'Housing & Environment': [
            ('owns_home', 'Owns home', 'mean', '%'),
            ('overcrowded', 'Overcrowded (>2 per room)', 'mean', '%'),
            ('pollution_health', 'Pollution health problems', 'mean', '%'),
        ],
        'Social Context': [
            ('any_violence', 'Any violence exposure', 'mean', '%'),
            ('physical_violence', 'Physical violence', 'mean', '%'),
            ('psychological_violence', 'Psychological violence', 'mean', '%'),
            ('any_discrimination', 'Any discrimination', 'mean', '%'),
            ('feels_safe', 'Feels safe in community', 'mean', '%'),
            ('has_emergency_support', 'Has emergency support', 'mean', '%'),
        ],
        'Family & Household': [
            ('hhsize', 'Household size', 'mean', 'persons'),
            ('hh_child_count', 'Children in household', 'mean', 'persons'),
            ('hh_elder_count', 'Elderly in household', 'mean', 'persons'),
            ('hh_worker_count', 'Workers in household', 'mean', 'persons'),
        ],
        'Food Security': [
            ('food_worry', 'Food insecurity worry', 'mean', '%'),
            ('food_skip', 'Skipped meals', 'mean', '%'),
        ],
    }

    # Analyze each domain
    for domain_name, indicators in domains.items():
        print(f"\n{domain_name}")
        print("-" * 80)

        domain_results = []

        for indicator_col, indicator_name, stat_type, unit in indicators:
            if indicator_col not in df.columns:
                continue

            # Calculate statistics
            general_val = general_df[indicator_col].mean()
            group1_val = group1_df[indicator_col].mean()
            group2_val = group2_df[indicator_col].mean()
            intersection_val = intersection_df[indicator_col].mean()

            # Skip if all NaN
            if pd.isna([general_val, intersection_val]).all():
                continue

            # Calculate gap
            if unit == '%':
                gap = (intersection_val - general_val) * 100  # percentage points
                general_display = f"{general_val * 100:.1f}%"
                group1_display = f"{group1_val * 100:.1f}%" if not pd.isna(group1_val) else "-"
                group2_display = f"{group2_val * 100:.1f}%" if not pd.isna(group2_val) else "-"
                intersection_display = f"{intersection_val * 100:.1f}%"
                gap_display = f"{gap:+.1f} pp"
            elif unit == 'THB':
                gap = intersection_val - general_val
                general_display = f"{general_val:,.0f} THB"
                group1_display = f"{group1_val:,.0f} THB" if not pd.isna(group1_val) else "-"
                group2_display = f"{group2_val:,.0f} THB" if not pd.isna(group2_val) else "-"
                intersection_display = f"{intersection_val:,.0f} THB"
                gap_display = f"{gap:+,.0f} THB"
            else:  # hours, persons, etc.
                gap = intersection_val - general_val
                general_display = f"{general_val:.1f}"
                group1_display = f"{group1_val:.1f}" if not pd.isna(group1_val) else "-"
                group2_display = f"{group2_val:.1f}" if not pd.isna(group2_val) else "-"
                intersection_display = f"{intersection_val:.1f}"
                gap_display = f"{gap:+.1f}"

            # T-test for significance
            try:
                general_data = general_df[indicator_col].dropna()
                intersection_data = intersection_df[indicator_col].dropna()

                if len(general_data) >= 30 and len(intersection_data) >= 5:
                    t_stat, p_value = stats.ttest_ind(intersection_data, general_data, nan_policy='omit')
                else:
                    p_value = np.nan
            except:
                p_value = np.nan

            # Store result
            domain_results.append({
                'Indicator': indicator_name,
                'General': general_display,
                group1.title(): group1_display,
                group2.title(): group2_display,
                intersection_name.title(): intersection_display,
                'Gap': gap_display,
                'p-value': p_value
            })

        # Print table for this domain
        if domain_results:
            print(f"\n| Indicator | General | {group1.title()} | {group2.title()} | {intersection_name.title()} | Gap | p-value |")
            print("|" + "|".join(['---'] * 7) + "|")

            for result in domain_results:
                p_val_str = f"< 0.001" if result['p-value'] < 0.001 else \
                           f"{result['p-value']:.3f}" if not pd.isna(result['p-value']) else "n.s."

                print(f"| {result['Indicator']} | {result['General']} | {result[group1.title()]} | "
                      f"{result[group2.title()]} | {result[intersection_name.title()]} | "
                      f"{result['Gap']} | {p_val_str} |")
        else:
            print("No data available for this domain")

    print(f"\n{'='*80}\n")

# Run comprehensive analysis for each intersection
for intersection_name, group1, group2 in intersections:
    analyze_intersection_all_domains(intersection_name, group1, group2)

print("\nCOMPREHENSIVE INTERSECTION DOMAIN ANALYSIS COMPLETE")
print("="*80)
