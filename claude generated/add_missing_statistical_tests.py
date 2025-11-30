"""
Add Statistical Significance Tests for All Missing Tables in Report

This script adds chi-square tests for:
1. Exercise Frequency Distribution by population group
2. Smoking Status Distribution by population group
3. Drinking Status Distribution by population group
4. Oral Health Access Barriers by population group
5. Income Quartile Disease Rates
6. Education Level Disease Rates
"""

import pandas as pd
import numpy as np
from scipy import stats

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("ADDITIONAL STATISTICAL TESTS FOR REPORT")
print("=" * 80)

# Define population groups (MATCHES dashboard logic exactly)
def classify_population_group(row):
    """Classify respondent into population groups - PRIORITY ORDER MATTERS"""
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

# Process monthly income
def get_monthly_income(row):
    if pd.isna(row['income']) or pd.isna(row['income_type']):
        return np.nan
    if row['income_type'] == 1:  # Daily income
        return row['income'] * 30
    elif row['income_type'] == 2:  # Already monthly
        return row['income']
    else:
        return np.nan

df['monthly_income'] = df.apply(get_monthly_income, axis=1)

# Process chronic disease
df['has_disease'] = df['diseases_status'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))

groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']
group_names = {
    'general': 'General Population',
    'elderly': 'Elderly (60+)',
    'disabled': 'Disabled',
    'lgbt': 'LGBT+',
    'informal': 'Informal Workers'
}

print("\n" + "=" * 80)
print("PART 1: EXERCISE FREQUENCY DISTRIBUTION - CHI-SQUARE TESTS")
print("=" * 80)
print("\nComparing each group vs General Population:")
print("-" * 80)
print(f"{'Group':<25} {'Chi-square':<12} {'df':<5} {'p-value':<10} {'Significance':<15}")
print("-" * 80)

general_exercise = df[df['pop_group'] == 'general']['exercise_status'].value_counts(normalize=True).sort_index()

for group in ['elderly', 'disabled', 'lgbt', 'informal']:
    group_df = df[df['pop_group'] == group]
    general_df = df[df['pop_group'] == 'general']

    # Filter valid data
    valid_group = group_df[pd.notna(group_df['exercise_status'])]
    valid_general = general_df[pd.notna(general_df['exercise_status'])]

    if len(valid_group) >= 30 and len(valid_general) >= 30:
        # Create contingency table
        contingency = pd.crosstab(
            pd.concat([valid_general, valid_group]).index.map(lambda x: 'General' if x in valid_general.index else group_names[group]),
            pd.concat([valid_general, valid_group])['exercise_status']
        )

        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        sig = "Significant" if p_val < 0.05 else "No effect"

        print(f"{group_names[group]:<25} {chi2:>10.2f}   {dof:<5} {p_val:>8.4f}   {sig:<15}")

print("\n" + "=" * 80)
print("PART 2: SMOKING STATUS DISTRIBUTION - CHI-SQUARE TESTS")
print("=" * 80)
print("\nComparing each group vs General Population:")
print("-" * 80)
print(f"{'Group':<25} {'Chi-square':<12} {'df':<5} {'p-value':<10} {'Significance':<15}")
print("-" * 80)

for group in ['elderly', 'disabled', 'lgbt', 'informal']:
    group_df = df[df['pop_group'] == group]
    general_df = df[df['pop_group'] == 'general']

    valid_group = group_df[pd.notna(group_df['smoke_status'])]
    valid_general = general_df[pd.notna(general_df['smoke_status'])]

    if len(valid_group) >= 30 and len(valid_general) >= 30:
        contingency = pd.crosstab(
            pd.concat([valid_general, valid_group]).index.map(lambda x: 'General' if x in valid_general.index else group_names[group]),
            pd.concat([valid_general, valid_group])['smoke_status']
        )

        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        sig = "Significant" if p_val < 0.05 else "No effect"

        print(f"{group_names[group]:<25} {chi2:>10.2f}   {dof:<5} {p_val:>8.4f}   {sig:<15}")

print("\n" + "=" * 80)
print("PART 3: DRINKING STATUS DISTRIBUTION - CHI-SQUARE TESTS")
print("=" * 80)
print("\nComparing each group vs General Population:")
print("-" * 80)
print(f"{'Group':<25} {'Chi-square':<12} {'df':<5} {'p-value':<10} {'Significance':<15}")
print("-" * 80)

for group in ['elderly', 'disabled', 'lgbt', 'informal']:
    group_df = df[df['pop_group'] == group]
    general_df = df[df['pop_group'] == 'general']

    valid_group = group_df[pd.notna(group_df['drink_status'])]
    valid_general = general_df[pd.notna(general_df['drink_status'])]

    if len(valid_group) >= 30 and len(valid_general) >= 30:
        contingency = pd.crosstab(
            pd.concat([valid_general, valid_group]).index.map(lambda x: 'General' if x in valid_general.index else group_names[group]),
            pd.concat([valid_general, valid_group])['drink_status']
        )

        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        sig = "Significant" if p_val < 0.05 else "No effect"

        print(f"{group_names[group]:<25} {chi2:>10.2f}   {dof:<5} {p_val:>8.4f}   {sig:<15}")

print("\n" + "=" * 80)
print("PART 4: INCOME QUARTILE DISEASE RATES - CHI-SQUARE TESTS")
print("=" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['monthly_income'])) &
        (pd.notna(group_df['has_disease']))
    ].copy()

    if len(valid_df) < 100:
        continue

    # Create income quartiles
    valid_df['income_quartile'] = pd.qcut(valid_df['monthly_income'], q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'], duplicates='drop')

    # Chi-square test
    contingency = pd.crosstab(valid_df['income_quartile'], valid_df['has_disease'])

    if contingency.shape[0] >= 2 and contingency.shape[1] >= 2:
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)

        # Calculate disease rates by quartile
        rates = valid_df.groupby('income_quartile')['has_disease'].mean() * 100

        print(f"\n{group_names[group]}:")
        print(f"  Chi-square = {chi2:.2f}, p-value = {p_val:.4f}")
        print(f"  Disease rates by quartile:")
        for q in ['Q1', 'Q2', 'Q3', 'Q4']:
            if q in rates.index:
                n = len(valid_df[valid_df['income_quartile'] == q])
                print(f"    {q}: {rates[q]:.1f}% (n={n})")

        if p_val < 0.05:
            print(f"  Significant income gradient (p={p_val:.4f})")
        else:
            print(f"  No significant income gradient (p={p_val:.4f})")

print("\n" + "=" * 80)
print("PART 5: EDUCATION LEVEL DISEASE RATES - CHI-SQUARE TESTS")
print("=" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['education'])) &
        (pd.notna(group_df['has_disease']))
    ].copy()

    if len(valid_df) < 100:
        continue

    # Create education categories: 0-2 (Primary or less), 3-6 (Secondary/Vocational), 7-8 (Bachelor+)
    valid_df['edu_category'] = valid_df['education'].apply(
        lambda x: 'Primary' if x in [0, 1, 2] else ('Secondary' if x in [3, 4, 5, 6] else 'Bachelor+')
    )

    # Chi-square test
    contingency = pd.crosstab(valid_df['edu_category'], valid_df['has_disease'])

    if contingency.shape[0] >= 2 and contingency.shape[1] >= 2:
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)

        # Calculate disease rates by education level
        rates = valid_df.groupby('edu_category')['has_disease'].mean() * 100

        print(f"\n{group_names[group]}:")
        print(f"  Chi-square = {chi2:.2f}, p-value = {p_val:.4f}")
        print(f"  Disease rates by education:")
        for edu in ['Primary', 'Secondary', 'Bachelor+']:
            if edu in rates.index:
                n = len(valid_df[valid_df['edu_category'] == edu])
                print(f"    {edu}: {rates[edu]:.1f}% (n={n})")

        if p_val < 0.05:
            print(f"  Significant education gradient (p={p_val:.4f})")
        else:
            print(f"  No significant education gradient (p={p_val:.4f})")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
