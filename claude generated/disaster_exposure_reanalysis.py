"""
Disaster Exposure Re-Analysis using Dashboard Definition
Uses community_disaster_1-4 (community-level disasters) instead of self_disaster_1
"""

import pandas as pd
import numpy as np
from scipy import stats

df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("DISASTER EXPOSURE RE-ANALYSIS (Dashboard Definition)")
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

# CORRECT disaster definition - matches dashboard
df['disaster_experience'] = (
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

print("PART 1: DISASTER EXPOSURE RATES BY POPULATION GROUP")
print("=" * 80)
print()

print("Group                   Disaster Rate    n")
print("-" * 60)

for group in groups:
    group_df = df[df['pop_group'] == group]
    valid = group_df[group_df['disaster_experience'].notna()]
    
    if len(valid) >= 30:
        rate = valid['disaster_experience'].mean() * 100
        
        # Statistical test vs general population
        if group != 'general':
            general_df = df[df['pop_group'] == 'general']
            general_valid = general_df[general_df['disaster_experience'].notna()]
            
            contingency = pd.DataFrame({
                'Disaster': [valid['disaster_experience'].sum(), general_valid['disaster_experience'].sum()],
                'No Disaster': [len(valid) - valid['disaster_experience'].sum(), 
                               len(general_valid) - general_valid['disaster_experience'].sum()]
            }, index=[group, 'general'])
            
            chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
            gap = rate - (general_valid['disaster_experience'].mean() * 100)
            
            print("%-23s %6.1f%%        %5d (Gap: %+5.1f pp, p=%.4f)" % (
                group_names[group], rate, len(valid), gap, p_val
            ))
        else:
            print("%-23s %6.1f%%        %5d (baseline)" % (
                group_names[group], rate, len(valid)
            ))

print()
print()
print("PART 2: DISASTER EXPOSURE BY HOUSING TENURE")
print("=" * 80)
print()

print("Group                   Own House  Rent House  Gap        p-value   n")
print("-" * 75)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()
    
    # Filter valid data
    valid = group_df[
        (pd.notna(group_df['disaster_experience'])) &
        ((group_df['own_house'] == 1) | (group_df['rent_house'] == 1))
    ]
    
    if len(valid) < 30:
        continue
    
    own = valid[valid['own_house'] == 1]
    rent = valid[valid['rent_house'] == 1]
    
    if len(own) >= 10 and len(rent) >= 10:
        own_rate = own['disaster_experience'].mean() * 100
        rent_rate = rent['disaster_experience'].mean() * 100
        gap = own_rate - rent_rate
        
        # Chi-square test
        contingency = pd.crosstab(
            valid['own_house'],
            valid['disaster_experience']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        
        effect = 'Significant' if p_val < 0.05 else 'No effect'
        
        print("%-23s %6.1f%%    %6.1f%%    %+6.1f pp  %7.4f   %d" % (
            group_names[group], own_rate, rent_rate, gap, p_val, len(valid)
        ))

print()
print()
print("PART 3: DISASTER EXPOSURE BY INCOME LEVEL")
print("=" * 80)
print()

print("Group                   Low Income High Income Gap        p-value   n")
print("-" * 75)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()
    
    valid = group_df[
        (pd.notna(group_df['monthly_income'])) &
        (pd.notna(group_df['disaster_experience']))
    ]
    
    if len(valid) < 30:
        continue
    
    low_income = valid[valid['monthly_income'] < 10000]
    high_income = valid[valid['monthly_income'] >= 10000]
    
    if len(low_income) >= 10 and len(high_income) >= 10:
        low_rate = low_income['disaster_experience'].mean() * 100
        high_rate = high_income['disaster_experience'].mean() * 100
        gap = high_rate - low_rate
        
        contingency = pd.crosstab(
            valid['monthly_income'] >= 10000,
            valid['disaster_experience']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        
        print("%-23s %6.1f%%    %6.1f%%    %+6.1f pp  %7.4f   %d" % (
            group_names[group], low_rate, high_rate, gap, p_val, len(valid)
        ))

print()
print("=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
