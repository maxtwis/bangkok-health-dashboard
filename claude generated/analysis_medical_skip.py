import pandas as pd
import numpy as np
from scipy import stats
import re

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

# Define population groups
def get_population_group(row):
    groups = []
    if pd.notna(row['age']) and row['age'] >= 60:
        groups.append('elderly')
    if row['sex'] == 'lgbt':
        groups.append('lgbt')
    if pd.notna(row['disable_status']) and row['disable_status'] == 1:
        groups.append('disabled')

    # Check if informal worker
    if pd.notna(row['occupation_status']) and row['occupation_status'] == 1:
        if pd.notna(row['occupation_contract']) and row['occupation_contract'] == 0:
            groups.append('informal')

    if len(groups) == 0:
        return 'general'
    return ','.join(groups)

df['pop_group'] = df.apply(get_population_group, axis=1)

# Classify oral health access reasons
def classify_oral_health_reason(reason_text):
    if pd.isna(reason_text) or reason_text == '':
        return 'no_reason'

    text = str(reason_text).lower()

    # Cost/Money related
    if any(keyword in text for keyword in ['แพง', 'สูง', 'ค่า', 'เงิน']):
        return 'cost'

    # Fear related
    if 'กลัว' in text:
        return 'fear'

    # No time
    if 'ไม่มีเวลา' in text or 'เวลา' in text:
        return 'no_time'

    # Distance
    if 'เดิน' in text or 'ไกล' in text:
        return 'distance'

    # Wait time
    if any(keyword in text for keyword in ['รอ', 'นาน', 'คิว']):
        return 'wait_time'

    return 'other'

df['oral_reason_category'] = df['oral_health_access_reason'].apply(classify_oral_health_reason)

# Medical skip indicators (cost-related)
df['medical_skip_any'] = ((df['medical_skip_1'] == 1) |
                           (df['medical_skip_2'] == 1) |
                           (df['medical_skip_3'] == 1)).astype(int)

# Oral health access (0 = didn't access, 1 = accessed)
df['oral_no_access'] = (df['oral_health_access'] == 0).astype(int)

# Income categorization
df['income_category'] = pd.cut(df['income'],
                               bins=[0, 10000, 20000, 50000, np.inf],
                               labels=['<10K', '10K-20K', '20K-50K', '>50K'])

# Employment formality
def get_employment_type(row):
    if pd.notna(row['occupation_status']) and row['occupation_status'] == 1:
        if pd.notna(row['occupation_contract']) and row['occupation_contract'] == 1:
            return 'formal'
        elif pd.notna(row['occupation_contract']) and row['occupation_contract'] == 0:
            return 'informal'
        else:
            return 'unknown_employment'
    return 'not_employed'

df['employment_type'] = df.apply(get_employment_type, axis=1)

# Welfare type
def get_welfare_type(row):
    welfare = row['welfare']
    if pd.isna(welfare):
        return 'none'
    elif welfare == 1:
        return 'civil_servant'
    elif welfare == 2:
        return 'social_security'
    elif welfare == 3:
        return 'universal_30baht'
    else:
        return 'other'

df['welfare_type'] = df.apply(get_welfare_type, axis=1)

print("=" * 80)
print("MEDICAL CARE SKIPPING ANALYSIS - CORRECTED VERSION")
print("=" * 80)

# 1. Cost-related medical skipping by population group
print("\n1. COST-RELATED MEDICAL SKIPPING BY POPULATION GROUP")
print("-" * 80)

for group in ['general', 'elderly', 'lgbt', 'disabled', 'informal']:
    if ',' in group:
        continue

    group_data = df[df['pop_group'].str.contains(group)]
    general_data = df[df['pop_group'] == 'general']

    if len(group_data) == 0:
        continue

    # Medical skip rates
    group_skip = group_data['medical_skip_any'].mean() * 100
    general_skip = general_data['medical_skip_any'].mean() * 100

    # Chi-square test
    contingency = pd.crosstab(
        df['pop_group'].str.contains(group),
        df['medical_skip_any']
    )
    chi2, p_value, _, _ = stats.chi2_contingency(contingency)

    print(f"\n{group.upper()} (n={len(group_data)})")
    print(f"  Medical skip (cost): {group_skip:.1f}% vs General {general_skip:.1f}%")
    print(f"  Gap: {group_skip - general_skip:+.1f} pp (p={p_value:.4f})")

# 2. Oral health access reasons by population group
print("\n\n2. ORAL HEALTH ACCESS BARRIERS BY POPULATION GROUP")
print("-" * 80)

for group in ['general', 'elderly', 'lgbt', 'disabled', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)]

    if len(group_data) == 0:
        continue

    # Filter those who didn't access oral health
    no_access = group_data[group_data['oral_no_access'] == 1]

    if len(no_access) == 0:
        continue

    print(f"\n{group.upper()} - Reasons for not accessing oral health care (n={len(no_access)})")

    reason_counts = no_access['oral_reason_category'].value_counts()
    reason_pct = (reason_counts / len(no_access) * 100)

    for reason, count in reason_counts.items():
        pct = reason_pct[reason]
        print(f"  {reason}: {count} ({pct:.1f}%)")

# 3. Cross-variable analysis: Medical skipping by income
print("\n\n3. MEDICAL SKIPPING BY INCOME LEVEL")
print("-" * 80)

for group in ['elderly', 'disabled', 'lgbt', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)]

    if len(group_data) == 0:
        continue

    print(f"\n{group.upper()}")

    for income_cat in ['<10K', '10K-20K', '20K-50K', '>50K']:
        income_group = group_data[group_data['income_category'] == income_cat]

        if len(income_group) > 10:
            skip_rate = income_group['medical_skip_any'].mean() * 100
            print(f"  {income_cat}: {skip_rate:.1f}% (n={len(income_group)})")

# 4. Medical skipping by employment type
print("\n\n4. MEDICAL SKIPPING BY EMPLOYMENT TYPE")
print("-" * 80)

for emp_type in ['formal', 'informal', 'not_employed']:
    emp_data = df[df['employment_type'] == emp_type]

    if len(emp_data) > 0:
        skip_rate = emp_data['medical_skip_any'].mean() * 100
        print(f"{emp_type}: {skip_rate:.1f}% (n={len(emp_data)})")

# 5. Medical skipping by welfare type
print("\n\n5. MEDICAL SKIPPING BY WELFARE TYPE")
print("-" * 80)

for welfare in ['civil_servant', 'social_security', 'universal_30baht', 'other']:
    welfare_data = df[df['welfare_type'] == welfare]

    if len(welfare_data) > 0:
        skip_rate = welfare_data['medical_skip_any'].mean() * 100
        print(f"{welfare}: {skip_rate:.1f}% (n={len(welfare_data)})")

# 6. Cross-tabulation: Income x Employment x Medical Skip
print("\n\n6. INTERACTION EFFECTS: INCOME × EMPLOYMENT TYPE")
print("-" * 80)

crosstab = pd.crosstab(
    [df['income_category'], df['employment_type']],
    df['medical_skip_any'],
    normalize='index'
) * 100

print("\nPercentage skipping medical care by income and employment:")
print(crosstab[1].round(1))

# 7. Detailed analysis for LGBT+ group (dual barriers)
print("\n\n7. LGBT+ DETAILED ANALYSIS: FINANCIAL AND FEAR BARRIERS")
print("-" * 80)

lgbt_data = df[df['pop_group'].str.contains('lgbt')]

# Cost-related medical skip
lgbt_skip_cost = lgbt_data['medical_skip_any'].mean() * 100
general_skip_cost = df[df['pop_group'] == 'general']['medical_skip_any'].mean() * 100

# Oral health fear
lgbt_no_access = lgbt_data[lgbt_data['oral_no_access'] == 1]
lgbt_fear = len(lgbt_no_access[lgbt_no_access['oral_reason_category'] == 'fear'])
lgbt_fear_pct = (lgbt_fear / len(lgbt_data)) * 100 if len(lgbt_data) > 0 else 0

general_no_access = df[(df['pop_group'] == 'general') & (df['oral_no_access'] == 1)]
general_fear = len(general_no_access[general_no_access['oral_reason_category'] == 'fear'])
general_fear_pct = (general_fear / len(df[df['pop_group'] == 'general'])) * 100

print(f"\nLGBT+ (n={len(lgbt_data)})")
print(f"  Cost barrier (medical skip): {lgbt_skip_cost:.1f}% vs General {general_skip_cost:.1f}%")
print(f"  Gap: {lgbt_skip_cost - general_skip_cost:+.1f} pp")
print(f"\n  Fear barrier (oral health): {lgbt_fear_pct:.1f}% vs General {general_fear_pct:.1f}%")
print(f"  Gap: {lgbt_fear_pct - general_fear_pct:+.1f} pp")

# 8. Statistical significance tests
print("\n\n8. STATISTICAL SIGNIFICANCE TESTS")
print("-" * 80)

# Test: Income predicts medical skipping within disabled group
disabled_data = df[df['pop_group'].str.contains('disabled')].copy()
disabled_data['low_income'] = (disabled_data['income'] < 10000).astype(int)

if len(disabled_data) > 0:
    low_income_disabled = disabled_data[disabled_data['low_income'] == 1]
    high_income_disabled = disabled_data[disabled_data['low_income'] == 0]

    low_skip = low_income_disabled['medical_skip_any'].mean() * 100
    high_skip = high_income_disabled['medical_skip_any'].mean() * 100

    contingency = pd.crosstab(disabled_data['low_income'], disabled_data['medical_skip_any'])
    chi2, p_value, _, _ = stats.chi2_contingency(contingency)

    print(f"\nDISABLED: Income effect on medical skipping")
    print(f"  Low income (<10K): {low_skip:.1f}% skip (n={len(low_income_disabled)})")
    print(f"  Higher income: {high_skip:.1f}% skip (n={len(high_income_disabled)})")
    print(f"  Gap: {low_skip - high_skip:.1f} pp (p={p_value:.4f})")

# Test: Income predicts medical skipping within elderly group
elderly_data = df[df['pop_group'].str.contains('elderly')].copy()
elderly_data['low_income'] = (elderly_data['income'] < 10000).astype(int)

if len(elderly_data) > 0:
    low_income_elderly = elderly_data[elderly_data['low_income'] == 1]
    high_income_elderly = elderly_data[elderly_data['low_income'] == 0]

    low_skip = low_income_elderly['medical_skip_any'].mean() * 100
    high_skip = high_income_elderly['medical_skip_any'].mean() * 100

    contingency = pd.crosstab(elderly_data['low_income'], elderly_data['medical_skip_any'])
    chi2, p_value, _, _ = stats.chi2_contingency(contingency)

    print(f"\nELDERLY: Income effect on medical skipping")
    print(f"  Low income (<10K): {low_skip:.1f}% skip (n={len(low_income_elderly)})")
    print(f"  Higher income: {high_skip:.1f}% skip (n={len(high_income_elderly)})")
    print(f"  Gap: {low_skip - high_skip:.1f} pp (p={p_value:.4f})")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
