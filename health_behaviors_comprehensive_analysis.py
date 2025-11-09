"""
Comprehensive Health Behaviors Analysis with Cross-Variable Relationships

This script analyzes health behaviors (exercise, smoking, drinking) with correct survey logic
and explores cross-variable relationships with income, education, and employment.

Survey Logic:
- exercise_status: 0=ไม่ได้ออกกำลังกาย 1=ไม่เกิน 3 ครั้งต่อสัปดาห์ 2=3-4 ครั้งต่อสัปดาห์ 3=ตั้งแต่ 5 ครั้งขึ้นไปต่อสัปดาห์
- smoke_status: 0=ไม่เคยสูบ 1=เคยสูบ แต่เลิกแล้ว 2=นาน ๆ สูบ 3=สูบประจำ
- drink_status: 1=ดื่ม 2=เคยดื่ม แต่เลิกแล้ว 0=ไม่ดื่ม
- drink_rate (if drink_status=1): 1=ดื่มประจำ 2=นาน ๆ ดื่มที
"""

import pandas as pd
import numpy as np
from scipy import stats

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("COMPREHENSIVE HEALTH BEHAVIORS ANALYSIS")
print("=" * 80)

# Define population groups (MATCHES dashboard logic exactly - IndicatorAnalysis.jsx)
def classify_population_group(row):
    """Classify respondent into population groups - PRIORITY ORDER MATTERS"""
    # Priority 1: LGBT (regardless of age/disability/occupation)
    if row['sex'] == 'lgbt':
        return 'lgbt'
    # Priority 2: Elderly (60+)
    elif row['age'] >= 60:
        return 'elderly'
    # Priority 3: Disabled
    elif row['disable_status'] == 1:
        return 'disabled'
    # Priority 4: Informal workers (has job but no contract)
    # CORRECT: occupation_status=1 AND occupation_contract=0 (n=2,645)
    # WRONG: occupation_type='2' (n=70)
    elif row['occupation_status'] == 1 and row['occupation_contract'] == 0:
        return 'informal'
    else:
        return 'general'

df['pop_group'] = df.apply(classify_population_group, axis=1)

# Verify population group counts
print("\nPopulation Group Counts:")
print(df['pop_group'].value_counts())
print()

# Process monthly income (convert daily to monthly)
def get_monthly_income(row):
    """Convert income to monthly equivalent based on income_type"""
    if pd.isna(row['income']) or pd.isna(row['income_type']):
        return np.nan
    if row['income_type'] == 1:  # Daily income
        return row['income'] * 30
    elif row['income_type'] == 2:  # Already monthly
        return row['income']
    else:
        return np.nan

df['monthly_income'] = df.apply(get_monthly_income, axis=1)

# Process Education Levels
# education: 0=ไม่ได้เรียน 1-2=ประถม 3-4=มัธยม 5-6=ปวช/ปวส 7-8=ปริญญาตรีขึ้นไป
df['education_low'] = df['education'].apply(lambda x: 1 if x in [0, 1, 2] else (0 if pd.notna(x) else np.nan))
df['education_high'] = df['education'].apply(lambda x: 1 if x in [7, 8] else (0 if pd.notna(x) else np.nan))

# EXERCISE CATEGORIES (using correct logic)
# 0=none, 1=<3/week, 2=3-4/week, 3=5+/week
df['exercise_none'] = df['exercise_status'].apply(lambda x: 1 if x == 0 else (0 if pd.notna(x) else np.nan))
df['exercise_low'] = df['exercise_status'].apply(lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan))
df['exercise_moderate'] = df['exercise_status'].apply(lambda x: 1 if x == 2 else (0 if pd.notna(x) else np.nan))
df['exercise_high'] = df['exercise_status'].apply(lambda x: 1 if x == 3 else (0 if pd.notna(x) else np.nan))
df['exercise_regular'] = df['exercise_status'].apply(lambda x: 1 if x in [2, 3] else (0 if x in [0, 1] else np.nan))

# SMOKING CATEGORIES (using correct logic)
# 0=never, 1=quit, 2=occasional, 3=regular
df['smoke_never'] = df['smoke_status'].apply(lambda x: 1 if x == 0 else (0 if pd.notna(x) else np.nan))
df['smoke_quit'] = df['smoke_status'].apply(lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan))
df['smoke_occasional'] = df['smoke_status'].apply(lambda x: 1 if x == 2 else (0 if pd.notna(x) else np.nan))
df['smoke_regular'] = df['smoke_status'].apply(lambda x: 1 if x == 3 else (0 if pd.notna(x) else np.nan))
df['smoke_current'] = df['smoke_status'].apply(lambda x: 1 if x in [2, 3] else (0 if x in [0, 1] else np.nan))

# DRINKING CATEGORIES (using correct logic)
# drink_status: 1=drink, 2=quit, 0=never
df['drink_never'] = df['drink_status'].apply(lambda x: 1 if x == 0 else (0 if pd.notna(x) else np.nan))
df['drink_quit'] = df['drink_status'].apply(lambda x: 1 if x == 2 else (0 if pd.notna(x) else np.nan))
df['drink_current'] = df['drink_status'].apply(lambda x: 1 if x == 1 else (0 if x in [0, 2] else np.nan))
# For current drinkers, check if regular
df['drink_regular'] = df.apply(
    lambda row: 1 if (row['drink_status'] == 1 and row['drink_rate'] == 1) else
                (0 if pd.notna(row['drink_status']) else np.nan),
    axis=1
)
df['drink_occasional'] = df.apply(
    lambda row: 1 if (row['drink_status'] == 1 and row['drink_rate'] == 2) else
                (0 if pd.notna(row['drink_status']) else np.nan),
    axis=1
)

groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']
group_names = {
    'general': 'General Population',
    'elderly': 'Elderly (60+)',
    'disabled': 'Disabled',
    'lgbt': 'LGBT+',
    'informal': 'Informal Workers'
}

print("\n" + "=" * 80)
print("PART 1: EXERCISE BEHAVIOR PATTERNS BY POPULATION GROUP")
print("=" * 80)

print("\nDetailed Exercise Frequency Distribution:")
print("-" * 80)
print(f"{'Group':<25} {'None':<10} {'<3/week':<10} {'3-4/week':<10} {'5+/week':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group]
    total = group_df['exercise_status'].notna().sum()

    if total < 10:
        continue

    none_pct = (group_df['exercise_none'].sum() / total * 100) if total > 0 else 0
    low_pct = (group_df['exercise_low'].sum() / total * 100) if total > 0 else 0
    mod_pct = (group_df['exercise_moderate'].sum() / total * 100) if total > 0 else 0
    high_pct = (group_df['exercise_high'].sum() / total * 100) if total > 0 else 0

    print(f"{group_names[group]:<25} {none_pct:>6.1f}%    {low_pct:>6.1f}%    {mod_pct:>6.1f}%    {high_pct:>6.1f}%    {total:>6}")

print("\n" + "=" * 80)
print("PART 2: SMOKING BEHAVIOR PATTERNS BY POPULATION GROUP")
print("=" * 80)

print("\nDetailed Smoking Status Distribution:")
print("-" * 80)
print(f"{'Group':<25} {'Never':<10} {'Quit':<10} {'Occasional':<12} {'Regular':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group]
    total = group_df['smoke_status'].notna().sum()

    if total < 10:
        continue

    never_pct = (group_df['smoke_never'].sum() / total * 100) if total > 0 else 0
    quit_pct = (group_df['smoke_quit'].sum() / total * 100) if total > 0 else 0
    occ_pct = (group_df['smoke_occasional'].sum() / total * 100) if total > 0 else 0
    reg_pct = (group_df['smoke_regular'].sum() / total * 100) if total > 0 else 0

    print(f"{group_names[group]:<25} {never_pct:>6.1f}%    {quit_pct:>6.1f}%    {occ_pct:>8.1f}%    {reg_pct:>6.1f}%    {total:>6}")

print("\n" + "=" * 80)
print("PART 3: DRINKING BEHAVIOR PATTERNS BY POPULATION GROUP")
print("=" * 80)

print("\nDetailed Drinking Status Distribution:")
print("-" * 80)
print(f"{'Group':<25} {'Never':<10} {'Quit':<10} {'Occasional':<12} {'Regular':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group]
    total = group_df['drink_status'].notna().sum()

    if total < 10:
        continue

    never_pct = (group_df['drink_never'].sum() / total * 100) if total > 0 else 0
    quit_pct = (group_df['drink_quit'].sum() / total * 100) if total > 0 else 0
    occ_pct = (group_df['drink_occasional'].sum() / total * 100) if total > 0 else 0
    reg_pct = (group_df['drink_regular'].sum() / total * 100) if total > 0 else 0

    print(f"{group_names[group]:<25} {never_pct:>6.1f}%    {quit_pct:>6.1f}%    {occ_pct:>8.1f}%    {reg_pct:>6.1f}%    {total:>6}")

print("\n" + "=" * 80)
print("PART 4: CROSS-VARIABLE ANALYSIS - EXERCISE BY INCOME")
print("=" * 80)

print("\nRegular Exercise Rates by Income Level (Low < 10K, High >= 10K):")
print("-" * 80)
print(f"{'Group':<25} {'Low Income':<15} {'High Income':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    # Filter valid data
    valid_df = group_df[
        (pd.notna(group_df['monthly_income'])) &
        (pd.notna(group_df['exercise_regular']))
    ].copy()

    if len(valid_df) < 30:
        continue

    low_income = valid_df[valid_df['monthly_income'] < 10000]
    high_income = valid_df[valid_df['monthly_income'] >= 10000]

    low_rate = (low_income['exercise_regular'].sum() / len(low_income) * 100) if len(low_income) > 0 else np.nan
    high_rate = (high_income['exercise_regular'].sum() / len(high_income) * 100) if len(high_income) > 0 else np.nan
    gap = high_rate - low_rate

    # Chi-square test
    if len(low_income) > 0 and len(high_income) > 0:
        contingency = pd.crosstab(
            valid_df['monthly_income'] >= 10000,
            valid_df['exercise_regular']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("PART 5: CROSS-VARIABLE ANALYSIS - EXERCISE BY EDUCATION")
print("=" * 80)

print("\nRegular Exercise Rates by Education Level:")
print("-" * 80)
print(f"{'Group':<25} {'Primary/Less':<15} {'Bachelor+':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    # Filter valid data
    valid_df = group_df[
        (pd.notna(group_df['education_low'])) &
        (pd.notna(group_df['exercise_regular']))
    ].copy()

    if len(valid_df) < 30:
        continue

    low_ed = valid_df[valid_df['education_low'] == 1]
    high_ed = valid_df[valid_df['education_high'] == 1]

    low_rate = (low_ed['exercise_regular'].sum() / len(low_ed) * 100) if len(low_ed) > 0 else np.nan
    high_rate = (high_ed['exercise_regular'].sum() / len(high_ed) * 100) if len(high_ed) > 0 else np.nan
    gap = high_rate - low_rate

    # Chi-square test
    if len(low_ed) > 5 and len(high_ed) > 5:
        low_ex = low_ed['exercise_regular'].sum()
        low_total = len(low_ed)
        high_ex = high_ed['exercise_regular'].sum()
        high_total = len(high_ed)

        contingency = [[low_ex, low_total - low_ex],
                      [high_ex, high_total - high_ex]]
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("PART 6: CROSS-VARIABLE ANALYSIS - SMOKING BY INCOME")
print("=" * 80)

print("\nCurrent Smoking Rates by Income Level:")
print("-" * 80)
print(f"{'Group':<25} {'Low Income':<15} {'High Income':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['monthly_income'])) &
        (pd.notna(group_df['smoke_current']))
    ].copy()

    if len(valid_df) < 30:
        continue

    low_income = valid_df[valid_df['monthly_income'] < 10000]
    high_income = valid_df[valid_df['monthly_income'] >= 10000]

    low_rate = (low_income['smoke_current'].sum() / len(low_income) * 100) if len(low_income) > 0 else np.nan
    high_rate = (high_income['smoke_current'].sum() / len(high_income) * 100) if len(high_income) > 0 else np.nan
    gap = high_rate - low_rate

    if len(low_income) > 0 and len(high_income) > 0:
        contingency = pd.crosstab(
            valid_df['monthly_income'] >= 10000,
            valid_df['smoke_current']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("PART 7: CROSS-VARIABLE ANALYSIS - DRINKING BY INCOME")
print("=" * 80)

print("\nCurrent Drinking Rates by Income Level:")
print("-" * 80)
print(f"{'Group':<25} {'Low Income':<15} {'High Income':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[
        (pd.notna(group_df['monthly_income'])) &
        (pd.notna(group_df['drink_current']))
    ].copy()

    if len(valid_df) < 30:
        continue

    low_income = valid_df[valid_df['monthly_income'] < 10000]
    high_income = valid_df[valid_df['monthly_income'] >= 10000]

    low_rate = (low_income['drink_current'].sum() / len(low_income) * 100) if len(low_income) > 0 else np.nan
    high_rate = (high_income['drink_current'].sum() / len(high_income) * 100) if len(high_income) > 0 else np.nan
    gap = high_rate - low_rate

    if len(low_income) > 0 and len(high_income) > 0:
        contingency = pd.crosstab(
            valid_df['monthly_income'] >= 10000,
            valid_df['drink_current']
        )
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    else:
        p_val = np.nan

    print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_df):>6}")

print("\n" + "=" * 80)
print("PART 8: COMBINED UNHEALTHY BEHAVIORS BY SOCIOECONOMIC STATUS")
print("=" * 80)

print("\nUnhealthy Behavior Clustering (No Exercise + Current Smoker + Current Drinker):")
print("-" * 80)
print(f"{'Group':<25} {'Low Income':<15} {'High Income':<15} {'Gap':<12} {'p-value':<10} {'n':<8}")
print("-" * 80)

# Calculate triple risk behavior
df['no_exercise'] = 1 - df['exercise_regular']
df['triple_risk'] = df.apply(
    lambda row: 1 if (row['no_exercise'] == 1 and row['smoke_current'] == 1 and row['drink_current'] == 1)
                  else (0 if pd.notna(row['no_exercise']) and pd.notna(row['smoke_current']) and pd.notna(row['drink_current']) else np.nan),
    axis=1
)

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    valid_df = group_df[pd.notna(group_df['triple_risk'])].copy()

    if len(valid_df) < 30:
        continue

    # By income with statistical testing
    valid_income = valid_df[pd.notna(valid_df['monthly_income'])].copy()
    if len(valid_income) >= 30:
        low_income = valid_income[valid_income['monthly_income'] < 10000]
        high_income = valid_income[valid_income['monthly_income'] >= 10000]

        low_rate = (low_income['triple_risk'].sum() / len(low_income) * 100) if len(low_income) > 0 else np.nan
        high_rate = (high_income['triple_risk'].sum() / len(high_income) * 100) if len(high_income) > 0 else np.nan
        gap = low_rate - high_rate

        # Chi-square test for statistical significance
        if len(low_income) > 0 and len(high_income) > 0:
            contingency = pd.crosstab(
                valid_income['monthly_income'] < 10000,
                valid_income['triple_risk']
            )
            chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        else:
            p_val = np.nan

        print(f"{group_names[group]:<25} {low_rate:>6.1f}%        {high_rate:>6.1f}%        {gap:>+6.1f} pp   {p_val:>8.4f}   {len(valid_income):>6}")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
