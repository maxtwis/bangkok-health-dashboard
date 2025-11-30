import pandas as pd
import numpy as np
from scipy import stats
import warnings
import sys
warnings.filterwarnings('ignore')

# Set output encoding to UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

# Convert income to monthly basis
df['monthly_income'] = df.apply(
    lambda row: row['income'] * 30 if row['income_type'] == 1 else row['income'],
    axis=1
)

# Define population groups
df['is_elderly'] = df['age'] >= 60
df['is_disabled'] = df['disable_status'] == 1
df['is_lgbt'] = df['sex'] == 'lgbt'
df['is_informal'] = df['occupation_freelance_type'].notna()

# Define general population (not in any priority group)
df['is_general'] = ~(df['is_elderly'] | df['is_disabled'] | df['is_lgbt'] | df['is_informal'])

print("="*80)
print("CHRONIC DISEASE CROSS-VARIABLE ANALYSIS BY POPULATION GROUP")
print("Bangkok Health Dashboard - SDHE Analysis")
print("="*80)

groups = {
    'General Population': 'is_general',
    'Elderly (60+)': 'is_elderly',
    'Disabled': 'is_disabled',
    'LGBT+': 'is_lgbt',
    'Informal Workers': 'is_informal'
}

print("\n" + "="*80)
print("POPULATION GROUP SAMPLE SIZES")
print("="*80)
for group_name, group_col in groups.items():
    n = df[df[group_col]].shape[0]
    disease_rate = df[df[group_col]]['diseases_status'].mean() * 100
    print(f"{group_name:25s}: n={n:5,} | Disease rate: {disease_rate:.1f}%")

# ==============================================================================
# INCOME × CHRONIC DISEASE BY POPULATION GROUP
# ==============================================================================

print("\n" + "="*80)
print("1. INCOME × CHRONIC DISEASE BY POPULATION GROUP")
print("="*80)

for group_name, group_col in groups.items():
    group_data = df[df[group_col] & df['monthly_income'].notna()].copy()

    if len(group_data) < 30:
        print(f"\n{group_name}: Insufficient data (n={len(group_data)})")
        continue

    print(f"\n{group_name} (n={len(group_data):,})")
    print("-" * 60)

    # Disease by income
    disease_income = group_data[group_data['diseases_status']==1]['monthly_income']
    no_disease_income = group_data[group_data['diseases_status']==0]['monthly_income']

    if len(disease_income) > 5 and len(no_disease_income) > 5:
        print(f"  Avg income - With disease:    {disease_income.mean():>10,.0f} THB")
        print(f"  Avg income - Without disease: {no_disease_income.mean():>10,.0f} THB")
        print(f"  Median income - With disease:    {disease_income.median():>10,.0f} THB")
        print(f"  Median income - Without disease: {no_disease_income.median():>10,.0f} THB")

        # Statistical test
        t_stat, p_value = stats.ttest_ind(disease_income, no_disease_income)
        sig = "✓" if p_value < 0.05 else "✗"
        print(f"  T-test: t={t_stat:.2f}, p={p_value:.4f} {sig}")

        # Income quartiles
        group_data['income_quartile'] = pd.qcut(group_data['monthly_income'], q=4,
                                                 labels=['Q1', 'Q2', 'Q3', 'Q4'],
                                                 duplicates='drop')
        print(f"\n  Disease Rate by Income Quartile:")
        for q in ['Q1', 'Q2', 'Q3', 'Q4']:
            q_data = group_data[group_data['income_quartile'] == q]
            if len(q_data) > 0:
                rate = q_data['diseases_status'].mean() * 100
                print(f"    {q}: {rate:5.1f}% (n={len(q_data):4,})")

# ==============================================================================
# EDUCATION × CHRONIC DISEASE BY POPULATION GROUP
# ==============================================================================

print("\n" + "="*80)
print("2. EDUCATION × CHRONIC DISEASE BY POPULATION GROUP")
print("="*80)

for group_name, group_col in groups.items():
    group_data = df[df[group_col] & df['education'].notna()].copy()

    if len(group_data) < 30:
        print(f"\n{group_name}: Insufficient data (n={len(group_data)})")
        continue

    print(f"\n{group_name} (n={len(group_data):,})")
    print("-" * 60)

    # Disease by education
    disease_edu = group_data[group_data['diseases_status']==1]['education']
    no_disease_edu = group_data[group_data['diseases_status']==0]['education']

    if len(disease_edu) > 5 and len(no_disease_edu) > 5:
        print(f"  Avg education - With disease:    {disease_edu.mean():.2f}")
        print(f"  Avg education - Without disease: {no_disease_edu.mean():.2f}")

        # Statistical test
        t_stat, p_value = stats.ttest_ind(disease_edu, no_disease_edu)
        sig = "✓" if p_value < 0.05 else "✗"
        print(f"  T-test: t={t_stat:.2f}, p={p_value:.4f} {sig}")

        # Education levels
        group_data['edu_level'] = pd.cut(group_data['education'],
                                          bins=[-1, 2, 5, 8],
                                          labels=['Primary or less', 'Secondary/Vocational', 'Bachelor+'])
        print(f"\n  Disease Rate by Education Level:")
        for edu in ['Primary or less', 'Secondary/Vocational', 'Bachelor+']:
            edu_data = group_data[group_data['edu_level'] == edu]
            if len(edu_data) > 0:
                rate = edu_data['diseases_status'].mean() * 100
                print(f"    {edu:25s}: {rate:5.1f}% (n={len(edu_data):4,})")

# ==============================================================================
# INCOME + EDUCATION INTERACTION BY POPULATION GROUP
# ==============================================================================

print("\n" + "="*80)
print("3. INCOME + EDUCATION INTERACTION BY POPULATION GROUP")
print("="*80)

for group_name, group_col in groups.items():
    group_data = df[df[group_col] & df['monthly_income'].notna() & df['education'].notna()].copy()

    if len(group_data) < 50:
        print(f"\n{group_name}: Insufficient data (n={len(group_data)})")
        continue

    print(f"\n{group_name} (n={len(group_data):,})")
    print("-" * 60)

    # Create binary categories
    group_data['low_income'] = group_data['monthly_income'] < group_data['monthly_income'].median()
    group_data['low_education'] = group_data['education'] <= 3

    # Four risk profiles
    profiles = [
        ('Low Income + Low Education', group_data['low_income'] & group_data['low_education']),
        ('Low Income + High Education', group_data['low_income'] & ~group_data['low_education']),
        ('High Income + Low Education', ~group_data['low_income'] & group_data['low_education']),
        ('High Income + High Education', ~group_data['low_income'] & ~group_data['low_education'])
    ]

    print(f"\n  Disease Rate by Risk Profile:")
    for profile_name, mask in profiles:
        profile_data = group_data[mask]
        if len(profile_data) > 5:
            rate = profile_data['diseases_status'].mean() * 100
            avg_income = profile_data['monthly_income'].mean()
            print(f"    {profile_name:30s}: {rate:5.1f}% (n={len(profile_data):4,}, avg income={avg_income:>8,.0f} THB)")

# ==============================================================================
# COMPARISON TABLE: GENERAL POP vs PRIORITY GROUPS
# ==============================================================================

print("\n" + "="*80)
print("4. SUMMARY COMPARISON: INCOME/EDUCATION EFFECTS")
print("="*80)

print("\n| Population Group | With Disease Avg Income | Without Disease Avg Income | Gap | p-value |")
print("|------------------|------------------------|---------------------------|-----|---------|")

for group_name, group_col in groups.items():
    group_data = df[df[group_col] & df['monthly_income'].notna()].copy()

    if len(group_data) >= 30:
        disease_income = group_data[group_data['diseases_status']==1]['monthly_income']
        no_disease_income = group_data[group_data['diseases_status']==0]['monthly_income']

        if len(disease_income) > 5 and len(no_disease_income) > 5:
            gap = disease_income.mean() - no_disease_income.mean()
            t_stat, p_value = stats.ttest_ind(disease_income, no_disease_income)
            p_str = f"{p_value:.3f}" if p_value >= 0.001 else "< 0.001"

            print(f"| {group_name:20s} | {disease_income.mean():>19,.0f} THB | {no_disease_income.mean():>22,.0f} THB | {gap:>6,.0f} | {p_str:>7s} |")

print("\n| Population Group | With Disease Avg Edu | Without Disease Avg Edu | Gap | p-value |")
print("|------------------|---------------------|------------------------|-----|---------|")

for group_name, group_col in groups.items():
    group_data = df[df[group_col] & df['education'].notna()].copy()

    if len(group_data) >= 30:
        disease_edu = group_data[group_data['diseases_status']==1]['education']
        no_disease_edu = group_data[group_data['diseases_status']==0]['education']

        if len(disease_edu) > 5 and len(no_disease_edu) > 5:
            gap = disease_edu.mean() - no_disease_edu.mean()
            t_stat, p_value = stats.ttest_ind(disease_edu, no_disease_edu)
            p_str = f"{p_value:.3f}" if p_value >= 0.001 else "< 0.001"

            print(f"| {group_name:20s} | {disease_edu.mean():>17.2f} | {no_disease_edu.mean():>20.2f} | {gap:>5.2f} | {p_str:>7s} |")

print("\n" + "="*80)
print("Analysis completed!")
print("="*80)
