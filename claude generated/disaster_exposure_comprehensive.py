"""
Comprehensive Disaster Exposure Analysis
Uses community_disaster_1-8 (ALL disaster types including epidemic and pollution)
"""

import pandas as pd
import numpy as np
from scipy import stats

df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("COMPREHENSIVE DISASTER EXPOSURE ANALYSIS (Types 1-8)")
print("=" * 80)
print()

# Population classification
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

# Comprehensive disaster definition - ALL types
df['disaster_comprehensive'] = (
    (df['community_disaster_1'] == 1) |  # Flooding
    (df['community_disaster_2'] == 1) |  # Extreme heat
    (df['community_disaster_3'] == 1) |  # Extreme cold
    (df['community_disaster_4'] == 1) |  # Fire
    (df['community_disaster_5'] == 1) |  # Earthquake
    (df['community_disaster_6'] == 1) |  # Epidemic
    (df['community_disaster_7'] == 1) |  # Sinkhole/Subsidence
    (df['community_disaster_8'] == 1)    # Pollution/Dust
).astype(int)

# Dashboard definition (for comparison)
df['disaster_dashboard'] = (
    (df['community_disaster_1'] == 1) |
    (df['community_disaster_2'] == 1) |
    (df['community_disaster_3'] == 1) |
    (df['community_disaster_4'] == 1)
).astype(int)

# Monthly income
def get_monthly_income(row):
    if pd.isna(row['income']) or pd.isna(row['income_type']):
        return np.nan
    if row['income_type'] == 1:
        return row['income'] * 30
    elif row['income_type'] == 2:
        return row['income']
    return np.nan

df['monthly_income'] = df.apply(get_monthly_income, axis=1)

# Housing status
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

print("PART 1: DISASTER EXPOSURE COMPARISON (Dashboard vs Comprehensive)")
print("=" * 80)
print()

print("Group                   Dashboard    Comprehensive  Difference")
print("                        (Types 1-4)  (Types 1-8)")
print("-" * 75)

for group in groups:
    group_df = df[df['pop_group'] == group]

    dash_rate = group_df['disaster_dashboard'].mean() * 100
    comp_rate = group_df['disaster_comprehensive'].mean() * 100
    diff = comp_rate - dash_rate

    print("%-23s %6.1f%%        %6.1f%%        +%.1f pp" % (
        group_names[group], dash_rate, comp_rate, diff
    ))

print()
print()
print("PART 2: COMPREHENSIVE DISASTER RATES BY POPULATION GROUP")
print("=" * 80)
print()

print("Group                   Disaster Rate    n          Gap vs General")
print("-" * 75)

general_rate = df[df['pop_group'] == 'general']['disaster_comprehensive'].mean() * 100

for group in groups:
    group_df = df[df['pop_group'] == group]
    valid = group_df[group_df['disaster_comprehensive'].notna()]

    if len(valid) >= 30:
        rate = valid['disaster_comprehensive'].mean() * 100
        gap = rate - general_rate

        # Statistical test vs general population
        if group != 'general':
            general_df = df[df['pop_group'] == 'general']
            general_valid = general_df[general_df['disaster_comprehensive'].notna()]

            contingency = pd.DataFrame({
                'Disaster': [valid['disaster_comprehensive'].sum(), general_valid['disaster_comprehensive'].sum()],
                'No Disaster': [len(valid) - valid['disaster_comprehensive'].sum(),
                               len(general_valid) - general_valid['disaster_comprehensive'].sum()]
            }, index=[group, 'general'])

            chi2, p_val, dof, expected = stats.chi2_contingency(contingency)

            sig = 'p<0.001' if p_val < 0.001 else 'p=%.3f' % p_val

            print("%-23s %6.1f%%        %5d      %+6.1f pp (%s)" % (
                group_names[group], rate, len(valid), gap, sig
            ))
        else:
            print("%-23s %6.1f%%        %5d      (baseline)" % (
                group_names[group], rate, len(valid)
            ))

print()
print()
print("PART 3: DISASTER EXPOSURE BY HOUSING TENURE (Comprehensive)")
print("=" * 80)
print()

print("Group                   Own House  Rent House  Gap        p-value   n")
print("-" * 75)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid = group_df[
        (pd.notna(group_df['disaster_comprehensive'])) &
        ((group_df['own_house'] == 1) | (group_df['rent_house'] == 1))
    ]

    if len(valid) < 30:
        continue

    own = valid[valid['own_house'] == 1]
    rent = valid[valid['rent_house'] == 1]

    if len(own) >= 10 and len(rent) >= 10:
        own_rate = own['disaster_comprehensive'].mean() * 100
        rent_rate = rent['disaster_comprehensive'].mean() * 100
        gap = own_rate - rent_rate

        contingency = pd.crosstab(
            valid['own_house'],
            valid['disaster_comprehensive']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)

        print("%-23s %6.1f%%    %6.1f%%    %+6.1f pp  %7.4f   %d" % (
            group_names[group], own_rate, rent_rate, gap, p_val, len(valid)
        ))

print()
print()
print("PART 4: DISASTER EXPOSURE BY INCOME LEVEL (Comprehensive)")
print("=" * 80)
print()

print("Group                   Low Income High Income Gap        p-value   n")
print("-" * 75)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid = group_df[
        (pd.notna(group_df['monthly_income'])) &
        (pd.notna(group_df['disaster_comprehensive']))
    ]

    if len(valid) < 30:
        continue

    low_income = valid[valid['monthly_income'] < 10000]
    high_income = valid[valid['monthly_income'] >= 10000]

    if len(low_income) >= 10 and len(high_income) >= 10:
        low_rate = low_income['disaster_comprehensive'].mean() * 100
        high_rate = high_income['disaster_comprehensive'].mean() * 100
        gap = high_rate - low_rate

        contingency = pd.crosstab(
            valid['monthly_income'] >= 10000,
            valid['disaster_comprehensive']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)

        print("%-23s %6.1f%%    %6.1f%%    %+6.1f pp  %7.4f   %d" % (
            group_names[group], low_rate, high_rate, gap, p_val, len(valid)
        ))

print()
print()
print("PART 5: BREAKDOWN BY DISASTER TYPE")
print("=" * 80)
print()

disaster_types = {
    1: 'Flooding',
    2: 'Extreme heat',
    3: 'Extreme cold',
    4: 'Fire',
    5: 'Earthquake',
    6: 'Epidemic',
    7: 'Sinkhole/Subsidence',
    8: 'Pollution/Dust'
}

print("Disaster Type               General   Elderly   Disabled  LGBT+  Informal")
print("-" * 80)

for dtype, dname in disaster_types.items():
    col = 'community_disaster_%d' % dtype
    rates = []
    for group in groups:
        group_df = df[df['pop_group'] == group]
        rate = (group_df[col] == 1).mean() * 100
        rates.append(rate)

    print("%-27s %5.1f%%    %5.1f%%    %5.1f%%   %5.1f%%   %5.1f%%" % (
        dname, rates[0], rates[1], rates[2], rates[3], rates[4]
    ))

print()
print("=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
