import pandas as pd
import numpy as np
from scipy import stats
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

# Convert daily income to monthly equivalent
def get_monthly_income(row):
    if pd.isna(row['income']) or pd.isna(row['income_type']):
        return np.nan
    if row['income_type'] == 1:  # Daily
        return row['income'] * 30
    elif row['income_type'] == 2:  # Monthly
        return row['income']
    else:
        return np.nan

df['monthly_income'] = df.apply(get_monthly_income, axis=1)

# Define population groups
def get_population_group(row):
    groups = []
    if pd.notna(row['age']) and row['age'] >= 60:
        groups.append('elderly')
    if row['sex'] == 'lgbt':
        groups.append('lgbt')
    if pd.notna(row['disable_status']) and row['disable_status'] == 1:
        groups.append('disabled')
    if pd.notna(row['occupation_status']) and row['occupation_status'] == 1:
        if pd.notna(row['occupation_contract']) and row['occupation_contract'] == 0:
            groups.append('informal')
    if len(groups) == 0:
        return 'general'
    return ','.join(groups)

df['pop_group'] = df.apply(get_population_group, axis=1)

# Education categorization
# education: 1=ป.6 ลงมา, 2=ม.ต้น, 3=ม.ปลาย, 4=ปวช/ปวส, 5=ปริญญาตรี, 6=สูงกว่าปริญญาตรี, 7=ไม่ได้เรียน
df['low_education'] = (df['education'] <= 1).astype(int)  # Primary or less
df['high_education'] = (df['education'] >= 5).astype(int)  # Bachelor+

print("=" * 80)
print("EDUCATION-INCOME RELATIONSHIP ACROSS ALL GROUPS")
print("=" * 80)

# Analyze for each group
for group in ['general', 'elderly', 'lgbt', 'disabled', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)].copy()

    if len(group_data) == 0:
        continue

    print(f"\n\n{'='*80}")
    print(f"{group.upper()} (Total n={len(group_data)})")
    print('='*80)

    # Filter to those with income data
    group_with_income = group_data[group_data['monthly_income'].notna()]

    # Education distribution
    print(f"\nEducation distribution (n={len(group_with_income)} with income):")
    edu_dist = group_with_income['education'].value_counts().sort_index()
    edu_labels = {
        1: 'Primary (ป.6↓)',
        2: 'Lower sec (ม.ต้น)',
        3: 'Upper sec (ม.ปลาย)',
        4: 'Vocational (ปวช/ปวส)',
        5: 'Bachelor (ปริญญาตรี)',
        6: 'Higher (>ปริญญาตรี)',
        7: 'No education'
    }
    for edu_level, count in edu_dist.items():
        pct = count / len(group_with_income) * 100
        label = edu_labels.get(edu_level, f'Level {edu_level}')
        print(f"  {label}: {count} ({pct:.1f}%)")

    # Income by education level
    print(f"\nAverage monthly income by education level:")
    for edu_level in sorted(group_with_income['education'].unique()):
        if pd.notna(edu_level):
            edu_group = group_with_income[group_with_income['education'] == edu_level]
            avg_income = edu_group['monthly_income'].mean()
            label = edu_labels.get(edu_level, f'Level {edu_level}')
            print(f"  {label}: {avg_income:.0f} THB (n={len(edu_group)})")

    # Low vs High education comparison
    low_edu = group_with_income[group_with_income['low_education'] == 1]
    high_edu = group_with_income[group_with_income['high_education'] == 1]

    if len(low_edu) > 0 and len(high_edu) > 0:
        low_income = low_edu['monthly_income'].mean()
        high_income = high_edu['monthly_income'].mean()
        gap = high_income - low_income
        ratio = high_income / low_income

        print(f"\n*** PRIMARY vs BACHELOR+ COMPARISON ***")
        print(f"  Primary education or less: {low_income:.0f} THB (n={len(low_edu)})")
        print(f"  Bachelor+ degree: {high_income:.0f} THB (n={len(high_edu)})")
        print(f"  Gap: {gap:.0f} THB ({(gap/low_income)*100:.1f}% higher)")
        print(f"  Ratio: {ratio:.2f}× (Bachelor+ earn {ratio:.2f} times more)")

        # Statistical test
        t_stat, p_value = stats.ttest_ind(high_edu['monthly_income'], low_edu['monthly_income'])
        sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))
        print(f"  p-value: {p_value:.4f} {sig}")

    # Employment status check (for elderly)
    if group == 'elderly':
        employed = group_with_income[group_with_income['occupation_status'] == 1]
        not_employed = group_with_income[group_with_income['occupation_status'] != 1]

        print(f"\n*** EMPLOYMENT STATUS ***")
        print(f"  Employed: n={len(employed)} ({len(employed)/len(group_with_income)*100:.1f}%)")
        print(f"  Not employed: n={len(not_employed)} ({len(not_employed)/len(group_with_income)*100:.1f}%)")

        if len(employed) > 0:
            print(f"\n  Among EMPLOYED elderly only:")
            employed_low = employed[employed['low_education'] == 1]
            employed_high = employed[employed['high_education'] == 1]

            if len(employed_low) > 0 and len(employed_high) > 0:
                emp_low_income = employed_low['monthly_income'].mean()
                emp_high_income = employed_high['monthly_income'].mean()
                emp_gap = emp_high_income - emp_low_income
                emp_ratio = emp_high_income / emp_low_income

                print(f"    Primary education: {emp_low_income:.0f} THB (n={len(employed_low)})")
                print(f"    Bachelor+ education: {emp_high_income:.0f} THB (n={len(employed_high)})")
                print(f"    Gap: {emp_gap:.0f} THB ({(emp_gap/emp_low_income)*100:.1f}% higher)")
                print(f"    Ratio: {emp_ratio:.2f}×")

print("\n\n" + "=" * 80)
print("SUMMARY TABLE FOR REPORT")
print("=" * 80)
print("\n| Group | Primary (≤ป.6) | Bachelor+ | Gap | Ratio | p-value |")
print("|---|---|---|---|---|---|")

for group in ['general', 'elderly', 'lgbt', 'disabled', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)].copy()
    group_with_income = group_data[group_data['monthly_income'].notna()]

    low_edu = group_with_income[group_with_income['low_education'] == 1]
    high_edu = group_with_income[group_with_income['high_education'] == 1]

    if len(low_edu) > 0 and len(high_edu) > 0:
        low_income = low_edu['monthly_income'].mean()
        high_income = high_edu['monthly_income'].mean()
        gap = high_income - low_income
        ratio = high_income / low_income

        t_stat, p_value = stats.ttest_ind(high_edu['monthly_income'], low_edu['monthly_income'])
        sig = "< 0.001" if p_value < 0.001 else f"{p_value:.3f}"

        print(f"| {group.capitalize()} | {low_income:.0f} THB | {high_income:.0f} THB | **+{gap:.0f} THB** ({ratio:.2f}×) | {sig} |")

print("\n\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
