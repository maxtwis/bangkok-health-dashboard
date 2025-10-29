import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency, ttest_ind
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

# Load data
print("Loading data...")
df = pd.read_csv(r'c:\Users\ion_l_uhhlu4p.MAXTWIS\bangkok-health-dashboard\public\data\survey_sampling.csv', encoding='utf-8-sig')

# Convert data types
df['welfare'] = pd.to_numeric(df['welfare'], errors='coerce')
df['age'] = pd.to_numeric(df['age'], errors='coerce')
df['education'] = pd.to_numeric(df['education'], errors='coerce')
df['income'] = pd.to_numeric(df['income'], errors='coerce')
df['diseases_status'] = pd.to_numeric(df['diseases_status'], errors='coerce')
df['exercise_status'] = pd.to_numeric(df['exercise_status'], errors='coerce')
df['disable_status'] = pd.to_numeric(df['disable_status'], errors='coerce')
df['occupation_status'] = pd.to_numeric(df['occupation_status'], errors='coerce')
df['occupation_contract'] = pd.to_numeric(df['occupation_contract'], errors='coerce')
df['house_status'] = pd.to_numeric(df['house_status'], errors='coerce')
df['food_insecurity_1'] = pd.to_numeric(df['food_insecurity_1'], errors='coerce')
df['food_insecurity_2'] = pd.to_numeric(df['food_insecurity_2'], errors='coerce')
df['medical_skip_1'] = pd.to_numeric(df['medical_skip_1'], errors='coerce')
df['medical_skip_2'] = pd.to_numeric(df['medical_skip_2'], errors='coerce')
df['medical_skip_3'] = pd.to_numeric(df['medical_skip_3'], errors='coerce')

# Define population groups
def classify_population_group(row):
    groups = []
    if pd.notna(row['age']) and row['age'] >= 60:
        groups.append('elderly')
    if pd.notna(row['disable_status']) and row['disable_status'] == 1:
        groups.append('disabled')
    if (pd.notna(row['occupation_status']) and row['occupation_status'] == 1 and
        pd.notna(row['occupation_contract']) and row['occupation_contract'] == 0):
        groups.append('informal_worker')
    if not groups:
        groups.append('general')
    return groups

df['population_groups'] = df.apply(classify_population_group, axis=1)

def chi_square_test(df_subset, var1, var2):
    contingency = pd.crosstab(df_subset[var1], df_subset[var2])
    if contingency.size < 4 or contingency.sum().sum() < 30:
        return None, None, None
    try:
        chi2, p_value, dof, expected = chi2_contingency(contingency)
        return chi2, p_value, contingency
    except:
        return None, None, None

print("\n" + "="*80)
print("ADDITIONAL CROSS-DOMAIN RELATIONSHIP ANALYSIS")
print("="*80)

# 1. Education -> Healthcare Access (using medical skip instead of welfare)
print("\n1. EDUCATION -> HEALTHCARE ACCESS (MEDICAL CARE AVOIDANCE)")
print("-" * 80)

for pop_group in ['general', 'elderly', 'disabled', 'informal_worker']:
    df_filtered = df[df['population_groups'].apply(lambda x: pop_group in x)].copy()
    df_filtered = df_filtered[df_filtered['education'].notna()].copy()

    # Create medical skip indicator (skipped care for any reason)
    df_filtered['skipped_care'] = df_filtered.apply(
        lambda row: 1 if (row['medical_skip_1'] == 1 or row['medical_skip_2'] == 1 or row['medical_skip_3'] == 1) else 0,
        axis=1
    )

    df_filtered = df_filtered[df_filtered['skipped_care'].notna()]

    if len(df_filtered) < 30:
        continue

    df_filtered['education_grouped'] = df_filtered['education'].apply(
        lambda x: 'low' if x <= 3 else ('medium' if x <= 6 else 'high')
    )

    chi2, p_value, contingency = chi_square_test(df_filtered, 'education_grouped', 'skipped_care')

    if p_value is not None and p_value < 0.05:
        print(f"\n  Population: {pop_group.upper()}")
        print(f"  Sample size: {len(df_filtered)}")
        print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")

        for edu_level in ['low', 'medium', 'high']:
            subset = df_filtered[df_filtered['education_grouped'] == edu_level]
            if len(subset) > 0:
                skip_pct = (subset['skipped_care'].sum() / len(subset)) * 100
                print(f"    {edu_level.capitalize()} education: {skip_pct:.1f}% skipped medical care (n={len(subset)})")

# 2. Income -> Healthcare Access (medical skip)
print("\n\n2. INCOME -> HEALTHCARE ACCESS (MEDICAL CARE AVOIDANCE)")
print("-" * 80)

for pop_group in ['general', 'elderly', 'disabled', 'informal_worker']:
    df_filtered = df[df['population_groups'].apply(lambda x: pop_group in x)].copy()
    df_filtered = df_filtered[df_filtered['income'].notna()].copy()

    df_filtered['skipped_care'] = df_filtered.apply(
        lambda row: 1 if (row['medical_skip_1'] == 1 or row['medical_skip_2'] == 1 or row['medical_skip_3'] == 1) else 0,
        axis=1
    )

    df_filtered = df_filtered[df_filtered['skipped_care'].notna()]

    if len(df_filtered) < 30:
        continue

    df_filtered['income_level'] = pd.qcut(df_filtered['income'], q=3, labels=['low', 'medium', 'high'], duplicates='drop')

    chi2, p_value, contingency = chi_square_test(df_filtered, 'income_level', 'skipped_care')

    if p_value is not None and p_value < 0.05:
        print(f"\n  Population: {pop_group.upper()}")
        print(f"  Sample size: {len(df_filtered)}")
        print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")

        for income_level in ['low', 'medium', 'high']:
            subset = df_filtered[df_filtered['income_level'] == income_level]
            if len(subset) > 0:
                skip_pct = (subset['skipped_care'].sum() / len(subset)) * 100
                avg_income = subset['income'].mean()
                print(f"    {income_level.capitalize()} income (avg: {avg_income:,.0f} THB): {skip_pct:.1f}% skipped care (n={len(subset)})")

# 3. Welfare Coverage -> Medical Care Avoidance
print("\n\n3. WELFARE COVERAGE -> MEDICAL CARE AVOIDANCE")
print("-" * 80)

for pop_group in ['general', 'elderly', 'disabled', 'informal_worker']:
    df_filtered = df[df['population_groups'].apply(lambda x: pop_group in x)].copy()
    df_filtered = df_filtered[df_filtered['welfare'].notna()].copy()

    df_filtered['skipped_care'] = df_filtered.apply(
        lambda row: 1 if (row['medical_skip_1'] == 1 or row['medical_skip_2'] == 1 or row['medical_skip_3'] == 1) else 0,
        axis=1
    )

    df_filtered = df_filtered[df_filtered['skipped_care'].notna()]
    df_filtered['has_welfare'] = df_filtered['welfare'].apply(lambda x: 1 if x > 0 else 0)

    if len(df_filtered) < 30:
        continue

    chi2, p_value, contingency = chi_square_test(df_filtered, 'has_welfare', 'skipped_care')

    if p_value is not None and p_value < 0.05:
        print(f"\n  Population: {pop_group.upper()}")
        print(f"  Sample size: {len(df_filtered)}")
        print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")

        for welfare_status in [1, 0]:
            subset = df_filtered[df_filtered['has_welfare'] == welfare_status]
            if len(subset) > 0:
                skip_pct = (subset['skipped_care'].sum() / len(subset)) * 100
                welfare_label = "WITH welfare" if welfare_status == 1 else "WITHOUT welfare"
                print(f"    {welfare_label}: {skip_pct:.1f}% skipped medical care (n={len(subset)})")

        # Calculate difference
        with_welfare = df_filtered[df_filtered['has_welfare'] == 1]
        without_welfare = df_filtered[df_filtered['has_welfare'] == 0]
        if len(with_welfare) > 0 and len(without_welfare) > 0:
            diff = ((without_welfare['skipped_care'].sum() / len(without_welfare)) -
                   (with_welfare['skipped_care'].sum() / len(with_welfare))) * 100
            print(f"    Difference: {diff:+.1f} percentage points (protection effect)")

# 4. Contract Status -> Welfare Coverage
print("\n\n4. CONTRACT STATUS -> WELFARE COVERAGE")
print("-" * 80)

for pop_group in ['general', 'elderly', 'informal_worker']:
    df_filtered = df[df['population_groups'].apply(lambda x: pop_group in x)].copy()
    df_filtered = df_filtered[df_filtered['occupation_status'] == 1].copy()  # Only employed
    df_filtered = df_filtered[df_filtered['occupation_contract'].notna() & df_filtered['welfare'].notna()]

    if len(df_filtered) < 30:
        continue

    df_filtered['has_contract'] = df_filtered['occupation_contract']
    df_filtered['has_welfare'] = df_filtered['welfare'].apply(lambda x: 1 if x > 0 else 0)

    chi2, p_value, contingency = chi_square_test(df_filtered, 'has_contract', 'has_welfare')

    if p_value is not None and p_value < 0.05:
        print(f"\n  Population: {pop_group.upper()}")
        print(f"  Sample size: {len(df_filtered)}")
        print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")

        for contract_status in [1, 0]:
            subset = df_filtered[df_filtered['has_contract'] == contract_status]
            if len(subset) > 0:
                welfare_pct = (subset['has_welfare'].sum() / len(subset)) * 100
                contract_label = "WITH contract" if contract_status == 1 else "WITHOUT contract (informal)"
                print(f"    {contract_label}: {welfare_pct:.1f}% have welfare coverage (n={len(subset)})")

# 5. Education -> Income
print("\n\n5. EDUCATION -> INCOME")
print("-" * 80)

for pop_group in ['general', 'elderly', 'informal_worker']:
    df_filtered = df[df['population_groups'].apply(lambda x: pop_group in x)].copy()
    df_filtered = df_filtered[df_filtered['education'].notna() & df_filtered['income'].notna()]

    if len(df_filtered) < 30:
        continue

    df_filtered['education_grouped'] = df_filtered['education'].apply(
        lambda x: 'low' if x <= 3 else ('medium' if x <= 6 else 'high')
    )

    # ANOVA-style analysis
    from scipy.stats import f_oneway

    low_income = df_filtered[df_filtered['education_grouped'] == 'low']['income']
    medium_income = df_filtered[df_filtered['education_grouped'] == 'medium']['income']
    high_income = df_filtered[df_filtered['education_grouped'] == 'high']['income']

    if len(low_income) >= 5 and len(medium_income) >= 5 and len(high_income) >= 5:
        try:
            f_stat, p_value = f_oneway(low_income, medium_income, high_income)

            if p_value < 0.05:
                print(f"\n  Population: {pop_group.upper()}")
                print(f"  Sample size: {len(df_filtered)}")
                print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")

                print(f"    Low education: {low_income.mean():,.0f} THB/month (n={len(low_income)})")
                print(f"    Medium education: {medium_income.mean():,.0f} THB/month (n={len(medium_income)})")
                print(f"    High education: {high_income.mean():,.0f} THB/month (n={len(high_income)})")
                print(f"    Difference (High - Low): {high_income.mean() - low_income.mean():+,.0f} THB")
        except:
            pass

print("\n\n" + "="*80)
print("EXTENDED ANALYSIS COMPLETE")
print("="*80)
