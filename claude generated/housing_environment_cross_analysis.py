"""
Housing & Environment Cross-Variable Analysis

Analyzes relationships between:
1. Housing tenure (own/rent) by income and education
2. Pollution-related health by income and housing
3. Disaster exposure by income and housing
4. Violence exposure by income and education
"""

import pandas as pd
import numpy as np
from scipy import stats

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("HOUSING & ENVIRONMENT CROSS-VARIABLE ANALYSIS")
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

# Education categories
df['education_low'] = df['education'].apply(lambda x: 1 if x in [0, 1, 2] else (0 if pd.notna(x) else np.nan))
df['education_high'] = df['education'].apply(lambda x: 1 if x in [7, 8] else (0 if pd.notna(x) else np.nan))

# Housing variables
# house_status: 1=own, 2=rent, 3=employee housing, 4=other
df['own_house'] = df['house_status'].apply(lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan))
df['rent_house'] = df['house_status'].apply(lambda x: 1 if x == 2 else (0 if pd.notna(x) else np.nan))

# Pollution health problems
# health_pollution: 1=yes, 0=no
df['pollution_health'] = df['health_pollution'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))

# Disaster exposure - check if any self_disaster columns are 1
disaster_cols = [c for c in df.columns if c.startswith('self_disaster_') and c != 'self_disaster_0']
if disaster_cols:
    df['disaster_exp'] = df[disaster_cols].max(axis=1)
else:
    df['disaster_exp'] = 0

# Violence
df['violence_psych'] = df['psychological_violence'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))
df['violence_phys'] = df['physical_violence'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))

groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']
group_names = {
    'general': 'General Population',
    'elderly': 'Elderly (60+)',
    'disabled': 'Disabled',
    'lgbt': 'LGBT+',
    'informal': 'Informal Workers'
}

print("\n" + "=" * 80)
print("PART 1: HOMEOWNERSHIP BY INCOME LEVEL")
print("=" * 80)
print("\nHomeownership Rates by Income (Low <10K vs High >=10K THB/month):")
print("-" * 80)
print(f"{'Group':<25} {'Low Income':<15} {'High Income':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['monthly_income'])) &
        (pd.notna(group_df['own_house']))
    ].copy()

    if len(valid_df) < 30:
        continue

    low_income = valid_df[valid_df['monthly_income'] < 10000]
    high_income = valid_df[valid_df['monthly_income'] >= 10000]

    low_rate = (low_income['own_house'].sum() / len(low_income) * 100) if len(low_income) > 0 else np.nan
    high_rate = (high_income['own_house'].sum() / len(high_income) * 100) if len(high_income) > 0 else np.nan
    gap = high_rate - low_rate

    if len(low_income) > 0 and len(high_income) > 0:
        contingency = pd.crosstab(
            valid_df['monthly_income'] >= 10000,
            valid_df['own_house']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("PART 2: HOMEOWNERSHIP BY EDUCATION LEVEL")
print("=" * 80)
print("\nHomeownership Rates by Education (Primary or Less vs Bachelor+):")
print("-" * 80)
print(f"{'Group':<25} {'Primary/Less':<15} {'Bachelor+':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['education'])) &
        (pd.notna(group_df['own_house']))
    ].copy()

    if len(valid_df) < 30:
        continue

    low_edu = valid_df[valid_df['education_low'] == 1]
    high_edu = valid_df[valid_df['education_high'] == 1]

    if len(low_edu) < 5 or len(high_edu) < 5:
        continue

    low_rate = (low_edu['own_house'].sum() / len(low_edu) * 100) if len(low_edu) > 0 else np.nan
    high_rate = (high_edu['own_house'].sum() / len(high_edu) * 100) if len(high_edu) > 0 else np.nan
    gap = high_rate - low_rate

    if len(low_edu) > 0 and len(high_edu) > 0:
        contingency = pd.crosstab(
            valid_df['education_high'],
            valid_df['own_house']
        )
        if contingency.shape == (2, 2):
            chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        else:
            p_val = np.nan
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("PART 3: POLLUTION HEALTH PROBLEMS BY INCOME")
print("=" * 80)
print("\nPollution-Related Health Problems by Income (Low <10K vs High >=10K):")
print("-" * 80)
print(f"{'Group':<25} {'Low Income':<15} {'High Income':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['monthly_income'])) &
        (pd.notna(group_df['pollution_health']))
    ].copy()

    if len(valid_df) < 30:
        continue

    low_income = valid_df[valid_df['monthly_income'] < 10000]
    high_income = valid_df[valid_df['monthly_income'] >= 10000]

    low_rate = (low_income['pollution_health'].sum() / len(low_income) * 100) if len(low_income) > 0 else np.nan
    high_rate = (high_income['pollution_health'].sum() / len(high_income) * 100) if len(high_income) > 0 else np.nan
    gap = high_rate - low_rate

    if len(low_income) > 0 and len(high_income) > 0:
        contingency = pd.crosstab(
            valid_df['monthly_income'] >= 10000,
            valid_df['pollution_health']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("PART 4: DISASTER EXPOSURE BY HOUSING TENURE")
print("=" * 80)
print("\nDisaster Exposure by Housing Type (Own vs Rent):")
print("-" * 80)
print(f"{'Group':<25} {'Own House':<15} {'Rent House':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['house_status'])) &
        (pd.notna(group_df['disaster_exp']))
    ].copy()

    if len(valid_df) < 30:
        continue

    own = valid_df[valid_df['own_house'] == 1]
    rent = valid_df[valid_df['rent_house'] == 1]

    own_rate = (own['disaster_exp'].sum() / len(own) * 100) if len(own) > 0 else np.nan
    rent_rate = (rent['disaster_exp'].sum() / len(rent) * 100) if len(rent) > 0 else np.nan
    gap = rent_rate - own_rate

    if len(own) >= 5 and len(rent) >= 5:
        contingency = pd.crosstab(
            valid_df['rent_house'],
            valid_df['disaster_exp']
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
print("PART 5: VIOLENCE EXPOSURE BY INCOME")
print("=" * 80)
print("\nPsychological Violence by Income (Low <10K vs High >=10K):")
print("-" * 80)
print(f"{'Group':<25} {'Low Income':<15} {'High Income':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['monthly_income'])) &
        (pd.notna(group_df['violence_psych']))
    ].copy()

    if len(valid_df) < 30:
        continue

    low_income = valid_df[valid_df['monthly_income'] < 10000]
    high_income = valid_df[valid_df['monthly_income'] >= 10000]

    low_rate = (low_income['violence_psych'].sum() / len(low_income) * 100) if len(low_income) > 0 else np.nan
    high_rate = (high_income['violence_psych'].sum() / len(high_income) * 100) if len(high_income) > 0 else np.nan
    gap = high_rate - low_rate

    if len(low_income) > 0 and len(high_income) > 0:
        contingency = pd.crosstab(
            valid_df['monthly_income'] >= 10000,
            valid_df['violence_psych']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
