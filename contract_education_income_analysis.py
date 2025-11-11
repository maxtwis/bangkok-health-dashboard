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

# Population classification with priority order (matches ANALYSIS_METHODOLOGY_LOGIC.md)
def classify_population_group(row):
    # Priority 1: LGBT+
    if row['sex'] == 'lgbt':
        return 'lgbt'
    # Priority 2: Elderly (60+)
    elif row['age'] >= 60:
        return 'elderly'
    # Priority 3: Disabled
    elif row['disable_status'] == 1:
        return 'disabled'
    # Priority 4: Informal workers (has job but no contract)
    elif row['occupation_status'] == 1 and row['occupation_contract'] == 0:
        return 'informal'
    # Priority 5: General population
    else:
        return 'general'

df['pop_group'] = df.apply(classify_population_group, axis=1)

# Education categorization
# education: 1=ป.6 ลงมา, 2=ม.ต้น, 3=ม.ปลาย, 4=ปวช/ปวส, 5=ปริญญาตรี, 6=สูงกว่าปริญญาตรี, 7=ไม่ได้เรียน
df['low_education'] = (df['education'] <= 1).astype(int)  # Primary or less
df['high_education'] = (df['education'] >= 5).astype(int)  # Bachelor+

print("=" * 100)
print("CONTRACT STATUS BY EDUCATION LEVEL - INCOME ANALYSIS")
print("=" * 100)

# Analyze for each group
for group_name in ['elderly', 'disabled', 'informal']:
    print(f"\n\n{'='*100}")
    print(f"{group_name.upper()}")
    print('='*100)

    # Filter to this group
    group_data = df[df['pop_group'] == group_name].copy()

    # Filter to employed only
    employed = group_data[group_data['occupation_status'] == 1]

    print(f"\nTotal {group_name}: {len(group_data)}")
    print(f"Employed {group_name}: {len(employed)} ({len(employed)/len(group_data)*100:.1f}%)")

    if len(employed) == 0:
        print(f"No employed {group_name} found, skipping.")
        continue

    # Filter to those with income data
    employed_with_income = employed[employed['monthly_income'].notna()].copy()
    print(f"Employed with income data: {len(employed_with_income)}")

    if len(employed_with_income) == 0:
        print(f"No income data available, skipping.")
        continue

    # ========== CONTRACT RATE BY EDUCATION ==========
    print(f"\n{'='*50}")
    print("CONTRACT RATE BY EDUCATION LEVEL")
    print('='*50)

    for edu_label, edu_filter in [('Low (≤ Primary)', 'low_education'),
                                    ('Higher (> Primary)', 'high_education')]:
        edu_group = employed_with_income[employed_with_income[edu_filter] == 1]

        if len(edu_group) == 0:
            print(f"\n{edu_label}: No data")
            continue

        # For informal workers, they are DEFINED as having no contract, so contract rate = 0%
        if group_name == 'informal':
            contract_rate = 0.0
            n_with_contract = 0
        else:
            n_with_contract = edu_group['occupation_contract'].sum()
            contract_rate = (n_with_contract / len(edu_group)) * 100

        print(f"\n{edu_label}:")
        print(f"  Total: {len(edu_group)}")
        print(f"  With formal contract: {n_with_contract} ({contract_rate:.1f}%)")

    # Calculate contract rate gap by education
    low_edu = employed_with_income[employed_with_income['low_education'] == 1]
    high_edu = employed_with_income[employed_with_income['high_education'] == 1]

    if len(low_edu) > 0 and len(high_edu) > 0:
        if group_name == 'informal':
            low_contract_rate = 0.0
            high_contract_rate = 0.0
        else:
            low_contract_rate = (low_edu['occupation_contract'].sum() / len(low_edu)) * 100
            high_contract_rate = (high_edu['occupation_contract'].sum() / len(high_edu)) * 100

        contract_gap = high_contract_rate - low_contract_rate

        print(f"\n*** CONTRACT RATE GAP BY EDUCATION ***")
        print(f"  Low education: {low_contract_rate:.1f}%")
        print(f"  High education: {high_contract_rate:.1f}%")
        print(f"  Gap: {contract_gap:.1f} percentage points")

        # Statistical test (chi-square)
        if group_name != 'informal' and len(low_edu) > 0 and len(high_edu) > 0:
            # Create education binary: 1 if high edu, 0 if low edu
            edu_combined = pd.concat([
                low_edu.assign(edu_binary=0),
                high_edu.assign(edu_binary=1)
            ])
            contingency_table = pd.crosstab(
                edu_combined['edu_binary'],
                edu_combined['occupation_contract']
            )
            if contingency_table.shape == (2, 2):
                chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
                sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))
                print(f"  p-value: {p_value:.4f} {sig}")

    # ========== INCOME BY CONTRACT STATUS ==========
    print(f"\n{'='*50}")
    print("INCOME BY CONTRACT STATUS")
    print('='*50)

    # Note: For informal workers, by definition occupation_contract = 0
    # But let's still show their income distribution

    if group_name == 'informal':
        print(f"\nNote: {group_name.capitalize()} workers are defined as having NO contract")
        print(f"  Median income (no contract): {employed_with_income['monthly_income'].median():.0f} THB")
        print(f"  Mean income (no contract): {employed_with_income['monthly_income'].mean():.0f} THB")
        print(f"  Sample size: {len(employed_with_income)}")
    else:
        no_contract = employed_with_income[employed_with_income['occupation_contract'] == 0]
        with_contract = employed_with_income[employed_with_income['occupation_contract'] == 1]

        print(f"\nWithout contract:")
        if len(no_contract) > 0:
            print(f"  Median income: {no_contract['monthly_income'].median():.0f} THB")
            print(f"  Mean income: {no_contract['monthly_income'].mean():.0f} THB")
            print(f"  Sample size: {len(no_contract)}")
        else:
            print(f"  No data")

        print(f"\nWith contract:")
        if len(with_contract) > 0:
            print(f"  Median income: {with_contract['monthly_income'].median():.0f} THB")
            print(f"  Mean income: {with_contract['monthly_income'].mean():.0f} THB")
            print(f"  Sample size: {len(with_contract)}")
        else:
            print(f"  No data")

        # Income difference
        if len(no_contract) > 0 and len(with_contract) > 0:
            median_gap = with_contract['monthly_income'].median() - no_contract['monthly_income'].median()
            pct_diff = (median_gap / no_contract['monthly_income'].median()) * 100

            print(f"\n*** INCOME DIFFERENCE BY CONTRACT ***")
            print(f"  Median gap: {median_gap:.0f} THB ({pct_diff:.1f}% higher with contract)")

            # Statistical test
            t_stat, p_value = stats.ttest_ind(with_contract['monthly_income'],
                                               no_contract['monthly_income'])
            sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))
            print(f"  p-value: {p_value:.4f} {sig}")

print("\n\n" + "=" * 100)
print("SUMMARY TABLE FOR REPORT - EDUCATION × CONTRACT INTERACTION")
print("=" * 100)
print("\n| Population Group | Education Level | Contract Rate | Mean Income (No Contract) | Mean Income (With Contract) | Income Gap by Contract | Sample Size |")
print("|---|---|---|---|---|---|---|")

for group_name in ['elderly', 'disabled', 'informal']:
    group_data = df[df['pop_group'] == group_name].copy()
    employed = group_data[group_data['occupation_status'] == 1]
    employed_with_income = employed[employed['monthly_income'].notna()].copy()

    if len(employed_with_income) == 0:
        continue

    # Calculate for low education
    low_edu = employed_with_income[employed_with_income['low_education'] == 1]
    if len(low_edu) > 0:
        if group_name == 'informal':
            low_contract_rate = 0.0
            low_income_no_contract = low_edu['monthly_income'].mean()
            low_income_with_contract = np.nan
        else:
            low_contract_rate = (low_edu['occupation_contract'].sum() / len(low_edu)) * 100
            low_no_contract = low_edu[low_edu['occupation_contract'] == 0]
            low_with_contract = low_edu[low_edu['occupation_contract'] == 1]
            low_income_no_contract = low_no_contract['monthly_income'].mean() if len(low_no_contract) > 0 else np.nan
            low_income_with_contract = low_with_contract['monthly_income'].mean() if len(low_with_contract) > 0 else np.nan

        if pd.notna(low_income_with_contract) and pd.notna(low_income_no_contract):
            low_income_diff = low_income_with_contract - low_income_no_contract
            low_pct_diff = (low_income_diff / low_income_no_contract) * 100
            # Calculate p-value
            if len(low_no_contract) > 0 and len(low_with_contract) > 0:
                t_stat, p_value = stats.ttest_ind(low_with_contract['monthly_income'], low_no_contract['monthly_income'])
                sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))
                p_str = f"p={p_value:.3f} {sig}" if p_value >= 0.001 else "p<0.001 ***"
            else:
                p_str = "N/A"
            low_income_diff_str = f"**+{low_income_diff:.0f} THB ({low_pct_diff:.0f}%)** {p_str}"
        else:
            low_income_diff_str = "N/A"
            p_str = "N/A"

        print(f"| {group_name.capitalize()} | Low (≤ Primary) | {low_contract_rate:.1f}% | {low_income_no_contract:.0f} THB | {low_income_with_contract if pd.notna(low_income_with_contract) else 'N/A'} | {low_income_diff_str} | n={len(low_edu)} |")

    # Calculate for high education
    high_edu = employed_with_income[employed_with_income['high_education'] == 1]
    if len(high_edu) > 0:
        if group_name == 'informal':
            high_contract_rate = 0.0
            high_income_no_contract = high_edu['monthly_income'].mean()
            high_income_with_contract = np.nan
        else:
            high_contract_rate = (high_edu['occupation_contract'].sum() / len(high_edu)) * 100
            high_no_contract = high_edu[high_edu['occupation_contract'] == 0]
            high_with_contract = high_edu[high_edu['occupation_contract'] == 1]
            high_income_no_contract = high_no_contract['monthly_income'].mean() if len(high_no_contract) > 0 else np.nan
            high_income_with_contract = high_with_contract['monthly_income'].mean() if len(high_with_contract) > 0 else np.nan

        if pd.notna(high_income_with_contract) and pd.notna(high_income_no_contract):
            high_income_diff = high_income_with_contract - high_income_no_contract
            high_pct_diff = (high_income_diff / high_income_no_contract) * 100
            # Calculate p-value
            if len(high_no_contract) > 0 and len(high_with_contract) > 0:
                t_stat, p_value = stats.ttest_ind(high_with_contract['monthly_income'], high_no_contract['monthly_income'])
                sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))
                p_str = f"p={p_value:.3f} {sig}" if p_value >= 0.001 else "p<0.001 ***"
            else:
                p_str = "N/A"
            high_income_diff_str = f"**+{high_income_diff:.0f} THB ({high_pct_diff:.0f}%)** {p_str}"
        else:
            high_income_diff_str = "N/A"
            p_str = "N/A"

        print(f"| {group_name.capitalize()} | Higher (> Primary) | {high_contract_rate:.1f}% | {high_income_no_contract if pd.notna(high_income_no_contract) else 'N/A'} | {high_income_with_contract if pd.notna(high_income_with_contract) else 'N/A'} | {high_income_diff_str} | n={len(high_edu)} |")

print("\n\n" + "=" * 100)
print("ANALYSIS COMPLETE")
print("=" * 100)
