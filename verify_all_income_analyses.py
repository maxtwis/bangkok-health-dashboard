import pandas as pd
import numpy as np
from scipy import stats
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

# CRITICAL: Convert daily income to monthly equivalent
def get_monthly_income(row):
    """Convert income to monthly equivalent based on income_type"""
    if pd.isna(row['income']) or pd.isna(row['income_type']):
        return np.nan
    if row['income_type'] == 1:  # Daily income
        return row['income'] * 30  # Assume 30 working days
    elif row['income_type'] == 2:  # Already monthly
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

# Medical skip
df['medical_skip_any'] = ((df['medical_skip_1'] == 1) |
                           (df['medical_skip_2'] == 1) |
                           (df['medical_skip_3'] == 1)).astype(int)

# Low income binary
df['low_income'] = (df['monthly_income'] < 10000).astype(int)

print("=" * 80)
print("COMPREHENSIVE INCOME-RELATED ANALYSIS VERIFICATION")
print("=" * 80)

# ========================================================================
# 1. HEALTHCARE ACCESS - Medical Skipping by Income
# ========================================================================
print("\n\n1. HEALTHCARE ACCESS DOMAIN - Medical Care Skipping by Income")
print("-" * 80)
print("\nClaim in report: 'Income is the strongest predictor of healthcare access'")
print("\nVERIFICATION:")

for group in ['disabled', 'elderly', 'informal', 'lgbt']:
    group_data = df[df['pop_group'].str.contains(group)].copy()

    if len(group_data) == 0:
        continue

    low = group_data[group_data['low_income'] == 1]
    high = group_data[group_data['low_income'] == 0]

    if len(low) > 0 and len(high) > 0:
        low_skip = low['medical_skip_any'].mean() * 100
        high_skip = high['medical_skip_any'].mean() * 100
        gap = low_skip - high_skip

        contingency = pd.crosstab(group_data['low_income'], group_data['medical_skip_any'])
        if contingency.shape == (2, 2):
            chi2, p_value, _, _ = stats.chi2_contingency(contingency)

            print(f"\n{group.upper()} (n={len(group_data)}):")
            print(f"  Low income (<10K): {low_skip:.1f}% skip (n={len(low)})")
            print(f"  Higher income: {high_skip:.1f}% skip (n={len(high)})")
            print(f"  Gap: {gap:.1f} pp, p={p_value:.4f}")

# ========================================================================
# 2. EMPLOYMENT & INCOME - Income levels mentioned in report
# ========================================================================
print("\n\n2. EMPLOYMENT & INCOME DOMAIN - Income Disparities")
print("-" * 80)
print("\nClaim: 'Employed elderly earn 14,770 THB monthly vs 30,543 THB general'")
print("Claim: 'Disabled earn 20,252 THB'")
print("\nVERIFICATION (using monthly_income):")

general_data = df[df['pop_group'] == 'general']
elderly_data = df[df['pop_group'].str.contains('elderly')]
disabled_data = df[df['pop_group'].str.contains('disabled')]

general_income = general_data['monthly_income'].mean()
elderly_income = elderly_data['monthly_income'].mean()
disabled_income = disabled_data['monthly_income'].mean()

print(f"\nGeneral population: {general_income:.0f} THB/month (n={len(general_data[general_data['monthly_income'].notna()])})")
print(f"Elderly: {elderly_income:.0f} THB/month (n={len(elderly_data[elderly_data['monthly_income'].notna()])})")
print(f"  Gap: {general_income - elderly_income:.0f} THB ({(general_income - elderly_income)/general_income*100:.1f}% less)")
print(f"Disabled: {disabled_income:.0f} THB/month (n={len(disabled_data[disabled_data['monthly_income'].notna()])})")
print(f"  Gap: {general_income - disabled_income:.0f} THB ({(general_income - disabled_income)/general_income*100:.1f}% less)")

# Education level within elderly
print("\n\nClaim: 'Elderly with primary education earn 2,797 THB vs 9,728 THB with higher education'")
print("VERIFICATION:")

elderly_low_edu = elderly_data[elderly_data['education'] <= 1]  # Primary or less
elderly_high_edu = elderly_data[elderly_data['education'] > 1]  # Above primary

low_edu_income = elderly_low_edu['monthly_income'].mean()
high_edu_income = elderly_high_edu['monthly_income'].mean()

print(f"Elderly with primary education: {low_edu_income:.0f} THB (n={len(elderly_low_edu[elderly_low_edu['monthly_income'].notna()])})")
print(f"Elderly with higher education: {high_edu_income:.0f} THB (n={len(elderly_high_edu[elderly_high_edu['monthly_income'].notna()])})")
print(f"  Gap: {high_edu_income - low_edu_income:.0f} THB")

# Contract status within employed elderly
print("\n\nClaim: 'Employed elderly with contracts earn 14,654 THB vs 3,553 THB without'")
print("VERIFICATION:")

elderly_employed = elderly_data[elderly_data['occupation_status'] == 1]
elderly_contract = elderly_employed[elderly_employed['occupation_contract'] == 1]
elderly_no_contract = elderly_employed[elderly_employed['occupation_contract'] == 0]

contract_income = elderly_contract['monthly_income'].mean()
no_contract_income = elderly_no_contract['monthly_income'].mean()

print(f"Elderly with contract: {contract_income:.0f} THB (n={len(elderly_contract[elderly_contract['monthly_income'].notna()])})")
print(f"Elderly without contract: {no_contract_income:.0f} THB (n={len(elderly_no_contract[elderly_no_contract['monthly_income'].notna()])})")
print(f"  Gap: {contract_income - no_contract_income:.0f} THB")

# ========================================================================
# 3. FOOD SECURITY - Income and food insecurity
# ========================================================================
print("\n\n3. FOOD SECURITY DOMAIN - Income Effect")
print("-" * 80)
print("\nClaim: '16.9% of higher-income informal workers report food insecurity")
print("        vs 8.3% of lower-income informal workers'")
print("\nVERIFICATION:")

informal_data = df[df['pop_group'].str.contains('informal')].copy()

# Food insecurity indicators
informal_data['food_insecure'] = ((informal_data['food_insecurity_1'] == 1) |
                                   (informal_data['food_insecurity_2'] == 1)).astype(int)

low_income_informal = informal_data[informal_data['low_income'] == 1]
high_income_informal = informal_data[informal_data['low_income'] == 0]

low_food = low_income_informal['food_insecure'].mean() * 100
high_food = high_income_informal['food_insecure'].mean() * 100

print(f"\nInformal workers - Food insecurity:")
print(f"  Low income (<10K): {low_food:.1f}% (n={len(low_income_informal)})")
print(f"  Higher income: {high_food:.1f}% (n={len(high_income_informal)})")
print(f"  Gap: {high_food - low_food:.1f} pp")

# ========================================================================
# 4. CROSS-SECTIONAL ANALYSIS - Income stratification
# ========================================================================
print("\n\n4. CROSS-SECTIONAL ANALYSIS - Within-Group Income Stratification")
print("-" * 80)

for group in ['elderly', 'lgbt', 'disabled', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)].copy()

    if len(group_data) == 0:
        continue

    print(f"\n{group.upper()} - Income stratification effects:")

    # Medical skipping
    low = group_data[group_data['low_income'] == 1]
    high = group_data[group_data['low_income'] == 0]

    if len(low) > 0 and len(high) > 0:
        low_skip = low['medical_skip_any'].mean() * 100
        high_skip = high['medical_skip_any'].mean() * 100

        print(f"  Medical skipping: Low {low_skip:.1f}% vs High {high_skip:.1f}% (gap: {low_skip - high_skip:.1f} pp)")

        # Income difference
        low_income_avg = low['monthly_income'].mean()
        high_income_avg = high['monthly_income'].mean()

        print(f"  Average income: Low {low_income_avg:.0f} THB vs High {high_income_avg:.0f} THB")

# ========================================================================
# 5. SUMMARY TABLE FOR REPORT UPDATE
# ========================================================================
print("\n\n" + "=" * 80)
print("CORRECTED INCOME-RELATED CLAIMS FOR REPORT")
print("=" * 80)

print("\n1. HEALTHCARE ACCESS - Medical Skipping Table:")
print("\n| Population Group | Low Income (<10K) | Higher Income (≥10K) | Gap | p-value | n |")
print("|---|---|---|---|---|---|")

for group in ['disabled', 'elderly', 'informal', 'lgbt']:
    group_data = df[df['pop_group'].str.contains(group)].copy()
    low = group_data[group_data['low_income'] == 1]
    high = group_data[group_data['low_income'] == 0]

    if len(low) > 0 and len(high) > 0:
        low_skip = low['medical_skip_any'].mean() * 100
        high_skip = high['medical_skip_any'].mean() * 100
        gap = low_skip - high_skip

        contingency = pd.crosstab(group_data['low_income'], group_data['medical_skip_any'])
        if contingency.shape == (2, 2):
            chi2, p_value, _, _ = stats.chi2_contingency(contingency)
            sig = "< 0.001" if p_value < 0.001 else f"{p_value:.3f}"

            print(f"| {group.capitalize()} | {low_skip:.1f}% | {high_skip:.1f}% | **{gap:.1f} pp** | {sig} | n={len(group_data)} |")

print("\n\n2. EMPLOYMENT & INCOME - Average Monthly Income:")
print(f"\nGeneral population: {general_income:.0f} THB/month")
print(f"Elderly: {elderly_income:.0f} THB/month (Gap: {general_income - elderly_income:.0f} THB)")
print(f"Disabled: {disabled_income:.0f} THB/month (Gap: {general_income - disabled_income:.0f} THB)")

print("\n\n3. EDUCATION STRATIFICATION (Elderly):")
print(f"Primary education: {low_edu_income:.0f} THB/month")
print(f"Higher education: {high_edu_income:.0f} THB/month")
print(f"Gap: {high_edu_income - low_edu_income:.0f} THB")

print("\n\n4. CONTRACT STRATIFICATION (Employed Elderly):")
print(f"With contract: {contract_income:.0f} THB/month")
print(f"Without contract: {no_contract_income:.0f} THB/month")
print(f"Gap: {contract_income - no_contract_income:.0f} THB")

print("\n\n" + "=" * 80)
print("VERIFICATION COMPLETE")
print("=" * 80)
