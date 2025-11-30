import pandas as pd
import numpy as np
from scipy import stats

# Read the survey data
df = pd.read_csv('public/data/survey_sampling.csv')

# CRITICAL: Convert income to monthly equivalent (following ANALYSIS_METHODOLOGY_LOGIC.md)
def convert_to_monthly_income(row):
    """Convert income to monthly equivalent"""
    if pd.isna(row['income']) or row['income'] == 0:
        return np.nan

    # If daily income, multiply by 30 to get monthly
    if row['income_type'] == 1:
        return row['income'] * 30

    # If monthly income, use as-is
    elif row['income_type'] == 2:
        return row['income']

    else:
        return np.nan

df['monthly_income'] = df.apply(convert_to_monthly_income, axis=1)

# Define elderly (age 60+)
df['is_elderly'] = df['age'] >= 60

# Define housing status
house_status_mapping = {
    1: 'Own house',
    2: 'Rent',
    3: 'Employer-provided',
    4: 'Other'
}

print("=" * 80)
print("ELDERLY HOUSEHOLD CHARACTERISTICS ANALYSIS (CORRECTED)")
print("=" * 80)
print()

# INCOME ANALYSIS - CORRECTED
print("=" * 80)
print("INCOME CHARACTERISTICS (MONTHLY INCOME - CORRECTED)")
print("=" * 80)
print()

elderly_respondents = df[df['is_elderly'] == True]
general_population = df[df['is_elderly'] == False]

# Filter for those with monthly_income data
elderly_income = elderly_respondents[elderly_respondents['monthly_income'].notna()].copy()
general_income = general_population[general_population['monthly_income'].notna()].copy()

print(f"Respondents with income data:")
print(f"  Elderly: {len(elderly_income)} ({len(elderly_income)/len(elderly_respondents)*100:.1f}%)")
print(f"  General: {len(general_income)} ({len(general_income)/len(general_population)*100:.1f}%)")
print()

# Show breakdown by income_type
print("Income type breakdown:")
elderly_daily = elderly_respondents[(elderly_respondents['income'].notna()) & (elderly_respondents['income_type'] == 1)]
elderly_monthly = elderly_respondents[(elderly_respondents['income'].notna()) & (elderly_respondents['income_type'] == 2)]
print(f"  Elderly - Daily income: {len(elderly_daily)} ({len(elderly_daily)/len(elderly_income)*100:.1f}%)")
print(f"  Elderly - Monthly income: {len(elderly_monthly)} ({len(elderly_monthly)/len(elderly_income)*100:.1f}%)")

general_daily = general_population[(general_population['income'].notna()) & (general_population['income_type'] == 1)]
general_monthly = general_population[(general_population['income'].notna()) & (general_population['income_type'] == 2)]
print(f"  General - Daily income: {len(general_daily)} ({len(general_daily)/len(general_income)*100:.1f}%)")
print(f"  General - Monthly income: {len(general_monthly)} ({len(general_monthly)/len(general_income)*100:.1f}%)")
print()

print("-" * 80)
print("MONTHLY INCOME STATISTICS (CORRECTED)")
print("-" * 80)
print()

print(f"Elderly respondents (60+):")
print(f"  Mean income: {elderly_income['monthly_income'].mean():,.0f} THB/month")
print(f"  Median income: {elderly_income['monthly_income'].median():,.0f} THB/month")
print(f"  Min: {elderly_income['monthly_income'].min():,.0f} THB/month")
print(f"  Max: {elderly_income['monthly_income'].max():,.0f} THB/month")
print(f"  25th percentile: {elderly_income['monthly_income'].quantile(0.25):,.0f} THB/month")
print(f"  75th percentile: {elderly_income['monthly_income'].quantile(0.75):,.0f} THB/month")
print()

print(f"General population (<60):")
print(f"  Mean income: {general_income['monthly_income'].mean():,.0f} THB/month")
print(f"  Median income: {general_income['monthly_income'].median():,.0f} THB/month")
print(f"  Min: {general_income['monthly_income'].min():,.0f} THB/month")
print(f"  Max: {general_income['monthly_income'].max():,.0f} THB/month")
print(f"  25th percentile: {general_income['monthly_income'].quantile(0.25):,.0f} THB/month")
print(f"  75th percentile: {general_income['monthly_income'].quantile(0.75):,.0f} THB/month")
print()

# Income gap
mean_gap = elderly_income['monthly_income'].mean() - general_income['monthly_income'].mean()
median_gap = elderly_income['monthly_income'].median() - general_income['monthly_income'].median()

print(f"Income gap (Elderly - General):")
print(f"  Mean gap: {mean_gap:,.0f} THB ({mean_gap/general_income['monthly_income'].mean()*100:.1f}%)")
print(f"  Median gap: {median_gap:,.0f} THB ({median_gap/general_income['monthly_income'].median()*100:.1f}%)")

# Statistical test
if len(elderly_income) > 0 and len(general_income) > 0:
    stat, p_value = stats.ttest_ind(elderly_income['monthly_income'], general_income['monthly_income'])
    print(f"  p-value: {p_value:.4f}")
print()

# Income distribution by brackets
print("-" * 80)
print("MONTHLY INCOME DISTRIBUTION (CORRECTED)")
print("-" * 80)
print()

income_brackets = [
    (0, 3000, 'Very Low (<3K)'),
    (3000, 10000, 'Low (3K-10K)'),
    (10000, 20000, 'Medium (10K-20K)'),
    (20000, 50000, 'High (20K-50K)'),
    (50000, float('inf'), 'Very High (50K+)')
]

print(f"{'Income Bracket':<25} {'Elderly':>15} {'General':>15} {'Gap':>15}")
print("-" * 70)

for low, high, label in income_brackets:
    elderly_count = len(elderly_income[(elderly_income['monthly_income'] >= low) & (elderly_income['monthly_income'] < high)])
    general_count = len(general_income[(general_income['monthly_income'] >= low) & (general_income['monthly_income'] < high)])

    elderly_pct = elderly_count / len(elderly_income) * 100
    general_pct = general_count / len(general_income) * 100
    gap = elderly_pct - general_pct

    print(f"{label:<25} {elderly_pct:>14.1f}% {general_pct:>14.1f}% {gap:>+14.1f}pp")
print()

# HOUSING TENURE ANALYSIS
print("=" * 80)
print("HOUSING TENURE CHARACTERISTICS")
print("=" * 80)
print()

# Filter for those with housing status data
elderly_housing = elderly_respondents[elderly_respondents['house_status'].notna()].copy()
general_housing = general_population[general_population['house_status'].notna()].copy()

print(f"Respondents with housing data:")
print(f"  Elderly: {len(elderly_housing)} ({len(elderly_housing)/len(elderly_respondents)*100:.1f}%)")
print(f"  General: {len(general_housing)} ({len(general_housing)/len(general_population)*100:.1f}%)")
print()

print("-" * 80)
print("HOUSING TENURE DISTRIBUTION")
print("-" * 80)
print()

print(f"{'Housing Status':<25} {'Elderly':>15} {'General':>15} {'Gap':>15}")
print("-" * 70)

for status_code, status_name in sorted(house_status_mapping.items()):
    elderly_count = len(elderly_housing[elderly_housing['house_status'] == status_code])
    general_count = len(general_housing[general_housing['house_status'] == status_code])

    elderly_pct = elderly_count / len(elderly_housing) * 100
    general_pct = general_count / len(general_housing) * 100
    gap = elderly_pct - general_pct

    print(f"{status_name:<25} {elderly_pct:>14.1f}% {general_pct:>14.1f}% {gap:>+14.1f}pp")

# Chi-square test for housing status
elderly_housing_counts = elderly_housing['house_status'].value_counts().sort_index()
general_housing_counts = general_housing['house_status'].value_counts().sort_index()

# Ensure both have same categories
all_categories = sorted(set(elderly_housing_counts.index) | set(general_housing_counts.index))
elderly_array = [elderly_housing_counts.get(cat, 0) for cat in all_categories]
general_array = [general_housing_counts.get(cat, 0) for cat in all_categories]

chi2, p_value = stats.chi2_contingency([elderly_array, general_array])[:2]
print()
print(f"Chi-square test p-value: {p_value:.4f}")
print()

# Rent analysis for those who rent
print("-" * 80)
print("RENT ANALYSIS (For Those Who Rent)")
print("-" * 80)
print()

elderly_renters = elderly_housing[elderly_housing['house_status'] == 2]
general_renters = general_housing[general_housing['house_status'] == 2]

elderly_rent = elderly_renters[elderly_renters['rent_price'].notna()]
general_rent = general_renters[general_renters['rent_price'].notna()]

if len(elderly_rent) > 0:
    print(f"Elderly renters with rent data: {len(elderly_rent)}")
    print(f"  Mean rent: {elderly_rent['rent_price'].mean():,.0f} THB/month")
    print(f"  Median rent: {elderly_rent['rent_price'].median():,.0f} THB/month")
    print(f"  Range: {elderly_rent['rent_price'].min():,.0f} - {elderly_rent['rent_price'].max():,.0f} THB/month")
else:
    print("No elderly renters with rent data")
print()

if len(general_rent) > 0:
    print(f"General renters with rent data: {len(general_rent)}")
    print(f"  Mean rent: {general_rent['rent_price'].mean():,.0f} THB/month")
    print(f"  Median rent: {general_rent['rent_price'].median():,.0f} THB/month")
    print(f"  Range: {general_rent['rent_price'].min():,.0f} - {general_rent['rent_price'].max():,.0f} THB/month")
else:
    print("No general population renters with rent data")
print()

if len(elderly_rent) > 0 and len(general_rent) > 0:
    rent_gap = elderly_rent['rent_price'].median() - general_rent['rent_price'].median()
    print(f"Median rent gap (Elderly - General): {rent_gap:,.0f} THB/month")
    stat, p_value = stats.ttest_ind(elderly_rent['rent_price'], general_rent['rent_price'])
    print(f"p-value: {p_value:.4f}")
print()

# COMBINED ANALYSIS
print("=" * 80)
print("ELDERLY HOUSEHOLD PROFILES BY HOUSING TENURE")
print("=" * 80)
print()

for status_code, status_name in sorted(house_status_mapping.items()):
    # Merge housing and income data
    elderly_status = elderly_housing[elderly_housing['house_status'] == status_code].copy()

    if len(elderly_status) == 0:
        continue

    print(f"{status_name} (n={len(elderly_status)}, {len(elderly_status)/len(elderly_housing)*100:.1f}%):")

    # Monthly income for this housing status (CORRECTED)
    elderly_status_income = elderly_status[elderly_status.index.isin(elderly_income.index)]

    if len(elderly_status_income) > 0:
        # Get monthly income values for this subset
        monthly_incomes = elderly_income.loc[elderly_income.index.isin(elderly_status_income.index), 'monthly_income']
        if len(monthly_incomes) > 0:
            print(f"  Monthly income (n={len(monthly_incomes)}): mean={monthly_incomes.mean():,.0f}, median={monthly_incomes.median():,.0f} THB/month")

    # Household size
    if len(elderly_status['hhsize'].dropna()) > 0:
        print(f"  Household size: mean={elderly_status['hhsize'].mean():.1f}, median={elderly_status['hhsize'].median():.0f}")

    # Elderly per household
    if len(elderly_status['hh_elder_count'].dropna()) > 0:
        print(f"  Elderly per HH: mean={elderly_status['hh_elder_count'].mean():.1f}, median={elderly_status['hh_elder_count'].median():.0f}")

    print()

print("=" * 80)
print("COMPARISON: RAW vs CORRECTED INCOME VALUES")
print("=" * 80)
print()

# Show the difference
elderly_with_both = elderly_respondents[elderly_respondents['income'].notna()].copy()
elderly_with_both['monthly_income_corrected'] = elderly_with_both.apply(convert_to_monthly_income, axis=1)

print("Sample of corrections (first 10 elderly with income):")
print(f"{'Raw Income':>12} {'Income Type':>12} {'Monthly (Corrected)':>20}")
print("-" * 50)
for idx, row in elderly_with_both.head(10).iterrows():
    income_type_label = "Daily" if row['income_type'] == 1 else "Monthly" if row['income_type'] == 2 else "Unknown"
    print(f"{row['income']:>12,.0f} {income_type_label:>12} {row['monthly_income_corrected']:>20,.0f}")

print("\n" + "=" * 80)
