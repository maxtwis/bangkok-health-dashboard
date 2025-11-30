"""
Homeownership by Employment Status Analysis

Tests whether having a job (employed vs not employed) is associated with homeownership
across population groups.
"""

import pandas as pd
import numpy as np
from scipy import stats

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("HOMEOWNERSHIP BY EMPLOYMENT STATUS ANALYSIS")
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

# Housing tenure
df['own_house'] = df['house_status'].apply(lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan))

# Employment status
df['employed'] = df['occupation_status'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))

groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']
group_names = {
    'general': 'General Population',
    'elderly': 'Elderly (60+)',
    'disabled': 'Disabled',
    'lgbt': 'LGBT+',
    'informal': 'Informal Workers'
}

print("\n" + "=" * 80)
print("HOMEOWNERSHIP BY EMPLOYMENT STATUS")
print("=" * 80)
print("\nHomeownership Rates by Employment (Employed vs Not Employed):")
print("-" * 80)
print(f"{'Group':<25} {'Employed Own':<15} {'Not Employed Own':<18} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['occupation_status'])) &
        (pd.notna(group_df['own_house']))
    ].copy()

    if len(valid_df) < 30:
        continue

    employed = valid_df[valid_df['employed'] == 1]
    not_employed = valid_df[valid_df['employed'] == 0]

    employed_rate = (employed['own_house'].sum() / len(employed) * 100) if len(employed) > 0 else np.nan
    not_employed_rate = (not_employed['own_house'].sum() / len(not_employed) * 100) if len(not_employed) > 0 else np.nan
    gap = employed_rate - not_employed_rate

    if len(employed) > 0 and len(not_employed) > 0:
        contingency = pd.crosstab(
            valid_df['employed'],
            valid_df['own_house']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {employed_rate:>6.1f}%        {not_employed_rate:>6.1f}%           {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("HOMEOWNERSHIP BY EMPLOYMENT CONTRACT (Among Employed Only)")
print("=" * 80)
print("\nHomeownership Rates by Contract Status (Formal vs Informal):")
print("-" * 80)
print(f"{'Group':<25} {'Formal Contract':<18} {'No Contract':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

# Contract status (among employed only)
df['has_contract'] = df['occupation_contract'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    # Only employed people
    employed_df = group_df[group_df['occupation_status'] == 1].copy()

    valid_df = employed_df[
        (pd.notna(employed_df['occupation_contract'])) &
        (pd.notna(employed_df['own_house']))
    ].copy()

    if len(valid_df) < 30:
        continue

    formal = valid_df[valid_df['has_contract'] == 1]
    informal = valid_df[valid_df['has_contract'] == 0]

    formal_rate = (formal['own_house'].sum() / len(formal) * 100) if len(formal) > 0 else np.nan
    informal_rate = (informal['own_house'].sum() / len(informal) * 100) if len(informal) > 0 else np.nan
    gap = formal_rate - informal_rate

    if len(formal) >= 5 and len(informal) >= 5:
        contingency = pd.crosstab(
            valid_df['has_contract'],
            valid_df['own_house']
        )
        if contingency.shape == (2, 2):
            chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        else:
            p_val = np.nan
    else:
        p_val = np.nan

    if not np.isnan(formal_rate) and not np.isnan(informal_rate):
        print(f"{group_names[group]:<25} {formal_rate:>6.1f}%           {informal_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
