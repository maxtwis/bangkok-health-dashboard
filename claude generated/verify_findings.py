import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency

# Load data
df = pd.read_csv(r'c:\Users\ion_l_uhhlu4p.MAXTWIS\bangkok-health-dashboard\public\data\survey_sampling.csv', encoding='utf-8-sig')

# Convert data types
df['age'] = pd.to_numeric(df['age'], errors='coerce')
df['diseases_status'] = pd.to_numeric(df['diseases_status'], errors='coerce')
df['exercise_status'] = pd.to_numeric(df['exercise_status'], errors='coerce')
df['income'] = pd.to_numeric(df['income'], errors='coerce')
df['medical_skip_1'] = pd.to_numeric(df['medical_skip_1'], errors='coerce')
df['medical_skip_2'] = pd.to_numeric(df['medical_skip_2'], errors='coerce')
df['medical_skip_3'] = pd.to_numeric(df['medical_skip_3'], errors='coerce')

print("VERIFICATION OF KEY FINDINGS")
print("="*80)

# Verify Finding 1: Chronic Disease -> Exercise (Elderly)
print("\n1. ELDERLY: Chronic Disease -> Exercise")
print("-"*80)
elderly = df[df['age'] >= 60].copy()
elderly = elderly[elderly['diseases_status'].notna() & elderly['exercise_status'].notna()]
elderly['exercises_regularly'] = elderly['exercise_status'].apply(lambda x: 1 if x in [1, 2] else 0)

print(f"Total elderly sample: {len(elderly)}")

without_chronic = elderly[elderly['diseases_status'] == 0]
with_chronic = elderly[elderly['diseases_status'] == 1]

print(f"\nWithout chronic disease (n={len(without_chronic)}):")
if len(without_chronic) > 0:
    pct = (without_chronic['exercises_regularly'].sum() / len(without_chronic)) * 100
    print(f"  Exercise regularly: {pct:.1f}%")

print(f"\nWith chronic disease (n={len(with_chronic)}):")
if len(with_chronic) > 0:
    pct = (with_chronic['exercises_regularly'].sum() / len(with_chronic)) * 100
    print(f"  Exercise regularly: {pct:.1f}%")

# Chi-square test
contingency = pd.crosstab(elderly['diseases_status'], elderly['exercises_regularly'])
chi2, p_value, dof, expected = chi2_contingency(contingency)
print(f"\np-value: {p_value:.6f}")

# Verify Finding 2: Income -> Healthcare Access (Elderly)
print("\n\n2. ELDERLY: Income -> Healthcare Access (Medical Skip)")
print("-"*80)
elderly_income = elderly[elderly['income'].notna()].copy()
elderly_income['skipped_care'] = elderly_income.apply(
    lambda row: 1 if (row['medical_skip_1'] == 1 or row['medical_skip_2'] == 1 or row['medical_skip_3'] == 1) else 0,
    axis=1
)
elderly_income = elderly_income[elderly_income['skipped_care'].notna()]

print(f"Total elderly with income data: {len(elderly_income)}")

# Group by income terciles
elderly_income['income_level'] = pd.qcut(elderly_income['income'], q=3, labels=['low', 'medium', 'high'], duplicates='drop')

print("\nIncome levels and medical care avoidance:")
for income_level in ['low', 'medium', 'high']:
    subset = elderly_income[elderly_income['income_level'] == income_level]
    if len(subset) > 0:
        skip_pct = (subset['skipped_care'].sum() / len(subset)) * 100
        avg_income = subset['income'].mean()
        print(f"  {income_level.capitalize()} income (avg: {avg_income:,.0f} THB): {skip_pct:.1f}% skipped care (n={len(subset)})")

# Chi-square test
contingency = pd.crosstab(elderly_income['income_level'], elderly_income['skipped_care'])
chi2, p_value, dof, expected = chi2_contingency(contingency)
print(f"\np-value: {p_value:.6f}")

# Verify Finding 3: Education -> Income (Informal Workers)
print("\n\n3. INFORMAL WORKERS: Education -> Income")
print("-"*80)

df['occupation_status'] = pd.to_numeric(df['occupation_status'], errors='coerce')
df['occupation_contract'] = pd.to_numeric(df['occupation_contract'], errors='coerce')
df['education'] = pd.to_numeric(df['education'], errors='coerce')

informal = df[(df['occupation_status'] == 1) & (df['occupation_contract'] == 0)].copy()
informal = informal[informal['education'].notna() & informal['income'].notna()]

print(f"Total informal workers: {len(informal)}")

informal['education_grouped'] = informal['education'].apply(
    lambda x: 'low' if x <= 3 else ('medium' if x <= 6 else 'high')
)

print("\nEducation levels and income:")
for edu_level in ['low', 'medium', 'high']:
    subset = informal[informal['education_grouped'] == edu_level]
    if len(subset) > 0:
        avg_income = subset['income'].mean()
        print(f"  {edu_level.capitalize()} education: {avg_income:,.0f} THB/month (n={len(subset)})")

# ANOVA test
from scipy.stats import f_oneway
low_income = informal[informal['education_grouped'] == 'low']['income']
medium_income = informal[informal['education_grouped'] == 'medium']['income']
high_income = informal[informal['education_grouped'] == 'high']['income']

f_stat, p_value = f_oneway(low_income, medium_income, high_income)
print(f"\np-value: {p_value:.6f}")
print(f"Income difference (High - Low): {high_income.mean() - low_income.mean():+,.0f} THB")

print("\n" + "="*80)
print("VERIFICATION COMPLETE")
