"""
Analysis: Working Hours and Exercise Behavior
Examines whether working hours affect exercise patterns across population groups
"""

import pandas as pd
import numpy as np
from scipy import stats

df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("WORKING HOURS AND EXERCISE BEHAVIOR ANALYSIS")
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

# Exercise regular (3+ times/week)
df['exercise_regular'] = df['exercise_status'].apply(
    lambda x: 1 if x in [2, 3] else (0 if x in [0, 1] else np.nan)
)

# ANALYSIS 1: Working Hours Categories
print("PART 1: WORKING HOURS AND EXERCISE - BY HOURS CATEGORY")
print("=" * 80)
print()

# Categorize working hours
df['hours_category'] = pd.cut(
    df['working_hours'], 
    bins=[0, 8, 10, 15, 25],
    labels=['Low (≤8h)', 'Medium (8-10h)', 'High (10-15h)', 'Very High (>15h)'],
    include_lowest=True
)

print("Working Hours Categories and Exercise Rates:")
print("-" * 80)
print(f"{'Hours Category':<20} {'Exercise Rate':<15} {'n':<10}")
print("-" * 80)

for cat in ['Low (≤8h)', 'Medium (8-10h)', 'High (10-15h)', 'Very High (>15h)']:
    subset = df[df['hours_category'] == cat]
    valid = subset[subset['exercise_regular'].notna()]
    if len(valid) >= 30:
        rate = valid['exercise_regular'].mean() * 100
        print(f"{cat:<20} {rate:>6.1f}%        {len(valid):>8}")

print()

# ANALYSIS 2: By Population Group
groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']
group_names = {
    'general': 'General Population',
    'elderly': 'Elderly (60+)',
    'disabled': 'Disabled',
    'lgbt': 'LGBT+',
    'informal': 'Informal Workers'
}

print()
print("PART 2: WORKING HOURS AND EXERCISE - BY POPULATION GROUP")
print("=" * 80)
print()

for group in groups:
    group_df = df[df['pop_group'] == group].copy()
    
    # Only analyze those with both working_hours and exercise data
    valid = group_df[
        (pd.notna(group_df['working_hours'])) &
        (pd.notna(group_df['exercise_regular']))
    ]
    
    if len(valid) < 30:
        continue
    
    # Split by median working hours
    median_hours = valid['working_hours'].median()
    low_hours = valid[valid['working_hours'] <= median_hours]
    high_hours = valid[valid['working_hours'] > median_hours]
    
    if len(low_hours) >= 10 and len(high_hours) >= 10:
        low_rate = low_hours['exercise_regular'].mean() * 100
        high_rate = high_hours['exercise_regular'].mean() * 100
        gap = high_rate - low_rate
        
        # Chi-square test
        contingency = pd.crosstab(
            valid['working_hours'] > median_hours,
            valid['exercise_regular']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        
        print(f"{group_names[group]}:")
        print(f"  Median hours: {median_hours:.1f}")
        print(f"  Low hours (≤{median_hours:.1f}): {low_rate:.1f}% exercise (n={len(low_hours)})")
        print(f"  High hours (>{median_hours:.1f}): {high_rate:.1f}% exercise (n={len(high_hours)})")
        print(f"  Gap: {gap:+.1f} pp")
        print(f"  p-value: {p_val:.4f}")
        print(f"  Effect: {'✓ Significant' if p_val < 0.05 else '✗ No effect'}")
        print()

# ANALYSIS 3: Correlation Analysis
print()
print("PART 3: CORRELATION BETWEEN WORKING HOURS AND EXERCISE")
print("=" * 80)
print()

print(f"{'Population Group':<25} {'Correlation (r)':<18} {'p-value':<12} {'n':<8} {'Effect'}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()
    
    valid = group_df[
        (pd.notna(group_df['working_hours'])) &
        (pd.notna(group_df['exercise_regular']))
    ]
    
    if len(valid) >= 30:
        correlation, p_val = stats.pointbiserialr(
            valid['exercise_regular'],
            valid['working_hours']
        )
        
        effect = '✓ Significant' if p_val < 0.05 else '✗ No effect'
        
        print(f"{group_names[group]:<25} {correlation:>+7.4f}          {p_val:>8.4f}    {len(valid):>6}  {effect}")

print()

# ANALYSIS 4: Extreme Working Hours
print()
print("PART 4: EXTREME WORKING HOURS (<8h vs >12h)")
print("=" * 80)
print()

print(f"{'Population Group':<25} {'Low (<8h)':<15} {'High (>12h)':<15} {'Gap':<12} {'p-value':<10} {'n'}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()
    
    valid = group_df[
        (pd.notna(group_df['working_hours'])) &
        (pd.notna(group_df['exercise_regular']))
    ]
    
    if len(valid) < 30:
        continue
    
    low_hours = valid[valid['working_hours'] < 8]
    high_hours = valid[valid['working_hours'] > 12]
    
    if len(low_hours) >= 10 and len(high_hours) >= 10:
        low_rate = low_hours['exercise_regular'].mean() * 100
        high_rate = high_hours['exercise_regular'].mean() * 100
        gap = high_rate - low_rate
        
        # T-test
        t_stat, p_val = stats.ttest_ind(
            high_hours['exercise_regular'],
            low_hours['exercise_regular']
        )
        
        print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid):>6}")

print()
print("=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
