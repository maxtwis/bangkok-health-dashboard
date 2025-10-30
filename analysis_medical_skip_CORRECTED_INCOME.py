import pandas as pd
import numpy as np
from scipy import stats

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

# CRITICAL FIX: Convert daily income to monthly equivalent
def get_monthly_income(row):
    """Convert income to monthly equivalent based on income_type"""
    if pd.isna(row['income']) or pd.isna(row['income_type']):
        return np.nan

    if row['income_type'] == 1:  # Daily income
        # Assume 30 working days per month
        return row['income'] * 30
    elif row['income_type'] == 2:  # Already monthly
        return row['income']
    else:
        return np.nan

df['monthly_income'] = df.apply(get_monthly_income, axis=1)

print("=" * 80)
print("INCOME VERIFICATION - CHECKING CONVERSION")
print("=" * 80)
print("\nOriginal income column stats:")
print(df['income'].describe())
print("\nMonthly income (converted) stats:")
print(df['monthly_income'].describe())
print("\nSample conversions:")
print(df[['income', 'income_type', 'monthly_income']].head(20))

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

# Medical skip indicators (cost-related)
df['medical_skip_any'] = ((df['medical_skip_1'] == 1) |
                           (df['medical_skip_2'] == 1) |
                           (df['medical_skip_3'] == 1)).astype(int)

# Income categorization using MONTHLY income
df['income_category'] = pd.cut(df['monthly_income'],
                               bins=[0, 10000, 20000, 50000, np.inf],
                               labels=['<10K', '10K-20K', '20K-50K', '>50K'])

print("\n" + "=" * 80)
print("CORRECTED ANALYSIS - INCOME EFFECT ON MEDICAL SKIPPING")
print("=" * 80)

for group in ['elderly', 'disabled', 'lgbt', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)].copy()

    if len(group_data) == 0:
        continue

    print(f"\n{group.upper()}")
    print(f"Total n={len(group_data)}")

    # Income distribution
    print(f"\nIncome distribution:")
    for income_cat in ['<10K', '10K-20K', '20K-50K', '>50K']:
        income_group = group_data[group_data['income_category'] == income_cat]
        if len(income_group) > 0:
            print(f"  {income_cat}: n={len(income_group)}")

    # Low vs high income comparison
    group_data['low_income'] = (group_data['monthly_income'] < 10000).astype(int)

    low_income = group_data[group_data['low_income'] == 1]
    high_income = group_data[group_data['low_income'] == 0]

    if len(low_income) > 0 and len(high_income) > 0:
        low_skip = low_income['medical_skip_any'].mean() * 100
        high_skip = high_income['medical_skip_any'].mean() * 100

        # Statistical test
        contingency = pd.crosstab(group_data['low_income'], group_data['medical_skip_any'])

        if contingency.shape == (2, 2):
            chi2, p_value, _, _ = stats.chi2_contingency(contingency)
            sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))

            print(f"\nMedical care skipping by income:")
            print(f"  Low income (<10K/month): {low_skip:.1f}% skip (n={len(low_income)})")
            print(f"  Higher income (≥10K/month): {high_skip:.1f}% skip (n={len(high_income)})")
            print(f"  Gap: {low_skip - high_skip:.1f} pp (p={p_value:.4f}) {sig}")
        else:
            print(f"\nInsufficient data for chi-square test")

    # Detailed breakdown by income category
    print(f"\nDetailed breakdown by income level:")
    for income_cat in ['<10K', '10K-20K', '20K-50K', '>50K']:
        income_group = group_data[group_data['income_category'] == income_cat]
        if len(income_group) > 10:
            skip_rate = income_group['medical_skip_any'].mean() * 100
            print(f"  {income_cat}: {skip_rate:.1f}% skip (n={len(income_group)})")

# Summary table for report
print("\n" + "=" * 80)
print("SUMMARY TABLE FOR REPORT - CORRECTED INCOME")
print("=" * 80)
print("\n| Population Group | Low Income (<10K) | Higher Income (≥10K) | Gap | p-value | n |")
print("|---|---|---|---|---|---|")

for group in ['disabled', 'elderly', 'lgbt', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)].copy()

    if len(group_data) == 0:
        continue

    group_data['low_income'] = (group_data['monthly_income'] < 10000).astype(int)

    low_income = group_data[group_data['low_income'] == 1]
    high_income = group_data[group_data['low_income'] == 0]

    if len(low_income) > 0 and len(high_income) > 0:
        low_skip = low_income['medical_skip_any'].mean() * 100
        high_skip = high_income['medical_skip_any'].mean() * 100
        gap = low_skip - high_skip

        contingency = pd.crosstab(group_data['low_income'], group_data['medical_skip_any'])

        if contingency.shape == (2, 2):
            chi2, p_value, _, _ = stats.chi2_contingency(contingency)
            sig = "< 0.001" if p_value < 0.001 else f"{p_value:.3f}"
            sig_marker = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))

            print(f"| {group.capitalize()} | {low_skip:.1f}% | {high_skip:.1f}% | **{gap:.1f} pp** | {sig} {sig_marker} | n={len(group_data)} |")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
