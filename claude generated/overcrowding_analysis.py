"""
Overcrowding and Housing Quality Analysis

Analyzes:
1. Dense residential buildings (community_environment_1)
2. Small/narrow housing (community_environment_2)
3. Any overcrowding (either condition)
By population group, income, and housing tenure
"""

import pandas as pd
import numpy as np
from scipy import stats

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("OVERCROWDING & HOUSING QUALITY ANALYSIS")
print("=" * 80)

# Define population groups
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

# Process monthly income
def get_monthly_income(row):
    if pd.isna(row['income']) or pd.isna(row['income_type']):
        return np.nan
    if row['income_type'] == 1:
        return row['income'] * 30
    elif row['income_type'] == 2:
        return row['income']
    else:
        return np.nan

df['monthly_income'] = df.apply(get_monthly_income, axis=1)

# Overcrowding indicators
df['dense_buildings'] = df['community_environment_1'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))
df['small_house'] = df['community_environment_2'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))

# Any overcrowding (either dense buildings OR small house)
df['any_overcrowding'] = df.apply(
    lambda row: 1 if (row['dense_buildings'] == 1 or row['small_house'] == 1)
                else (0 if pd.notna(row['dense_buildings']) or pd.notna(row['small_house']) else np.nan),
    axis=1
)

# Housing tenure
df['own_house'] = df['house_status'].apply(lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan))
df['rent_house'] = df['house_status'].apply(lambda x: 1 if x == 2 else (0 if pd.notna(x) else np.nan))

groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']
group_names = {
    'general': 'General Population',
    'elderly': 'Elderly (60+)',
    'disabled': 'Disabled',
    'lgbt': 'LGBT+',
    'informal': 'Informal Workers'
}

print("\n" + "=" * 80)
print("PART 1: OVERCROWDING BY POPULATION GROUP")
print("=" * 80)
print("\nOvercrowding Indicators by Group (vs General Population):")
print("-" * 80)
print(f"{'Group':<25} {'Dense Bldgs':<15} {'Small House':<15} {'Any Overcrowd':<15} {'n':<8}")
print("-" * 80)

general_dense = df[df['pop_group'] == 'general']['dense_buildings'].sum() / df[df['pop_group'] == 'general']['dense_buildings'].count() * 100
general_small = df[df['pop_group'] == 'general']['small_house'].sum() / df[df['pop_group'] == 'general']['small_house'].count() * 100
general_any = df[df['pop_group'] == 'general']['any_overcrowding'].sum() / df[df['pop_group'] == 'general']['any_overcrowding'].count() * 100

print(f"{'General Population':<25} {general_dense:>6.1f}%        {general_small:>6.1f}%        {general_any:>6.1f}%        {len(df[df['pop_group'] == 'general']):>6}")

for group in ['elderly', 'disabled', 'lgbt', 'informal']:
    group_df = df[df['pop_group'] == group]

    dense_rate = group_df['dense_buildings'].sum() / group_df['dense_buildings'].count() * 100 if group_df['dense_buildings'].count() > 0 else np.nan
    small_rate = group_df['small_house'].sum() / group_df['small_house'].count() * 100 if group_df['small_house'].count() > 0 else np.nan
    any_rate = group_df['any_overcrowding'].sum() / group_df['any_overcrowding'].count() * 100 if group_df['any_overcrowding'].count() > 0 else np.nan

    # Chi-square test vs general population
    general_df = df[df['pop_group'] == 'general']
    combined = pd.concat([general_df, group_df])

    if group_df['any_overcrowding'].count() >= 30:
        contingency = pd.crosstab(
            combined['pop_group'] == group,
            combined['any_overcrowding']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {dense_rate:>6.1f}%        {small_rate:>6.1f}%        {any_rate:>6.1f}%        {len(group_df):>6} (p={p_val:.3f})")

print("\n" + "=" * 80)
print("PART 2: OVERCROWDING BY INCOME LEVEL")
print("=" * 80)
print("\nAny Overcrowding by Income (Low <10K vs High >=10K THB/month):")
print("-" * 80)
print(f"{'Group':<25} {'Low Income':<15} {'High Income':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['monthly_income'])) &
        (pd.notna(group_df['any_overcrowding']))
    ].copy()

    if len(valid_df) < 30:
        continue

    low_income = valid_df[valid_df['monthly_income'] < 10000]
    high_income = valid_df[valid_df['monthly_income'] >= 10000]

    low_rate = (low_income['any_overcrowding'].sum() / len(low_income) * 100) if len(low_income) > 0 else np.nan
    high_rate = (high_income['any_overcrowding'].sum() / len(high_income) * 100) if len(high_income) > 0 else np.nan
    gap = low_rate - high_rate

    if len(low_income) > 0 and len(high_income) > 0:
        contingency = pd.crosstab(
            valid_df['monthly_income'] < 10000,
            valid_df['any_overcrowding']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("PART 3: OVERCROWDING BY HOUSING TENURE")
print("=" * 80)
print("\nAny Overcrowding by Housing Type (Own vs Rent):")
print("-" * 80)
print(f"{'Group':<25} {'Own House':<15} {'Rent House':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['house_status'])) &
        (pd.notna(group_df['any_overcrowding']))
    ].copy()

    if len(valid_df) < 30:
        continue

    own = valid_df[valid_df['own_house'] == 1]
    rent = valid_df[valid_df['rent_house'] == 1]

    own_rate = (own['any_overcrowding'].sum() / len(own) * 100) if len(own) > 0 else np.nan
    rent_rate = (rent['any_overcrowding'].sum() / len(rent) * 100) if len(rent) > 0 else np.nan
    gap = rent_rate - own_rate

    if len(own) >= 5 and len(rent) >= 5:
        contingency = pd.crosstab(
            valid_df['rent_house'],
            valid_df['any_overcrowding']
        )
        if contingency.shape == (2, 2):
            chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        else:
            p_val = np.nan
    else:
        p_val = np.nan

    if not np.isnan(own_rate) and not np.isnan(rent_rate):
        print(f"{group_names[group]:<25} {own_rate:>6.1f}%        {rent_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
