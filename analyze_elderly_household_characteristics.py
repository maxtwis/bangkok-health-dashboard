import pandas as pd
import numpy as np
from scipy import stats

# Read the survey data
df = pd.read_csv('public/data/survey_sampling.csv')

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
print("ELDERLY HOUSEHOLD CHARACTERISTICS ANALYSIS")
print("=" * 80)
print()

# Calculate household elderly count
print("-" * 80)
print("HOUSEHOLD ELDERLY COMPOSITION")
print("-" * 80)

elderly_respondents = df[df['is_elderly'] == True]
general_population = df[df['is_elderly'] == False]

print(f"\nElderly respondents (60+): {len(elderly_respondents)}")
print(f"General population (<60): {len(general_population)}")
print()

# Elderly count per household
elderly_hh_count = elderly_respondents['hh_elder_count'].dropna()
general_hh_count = general_population['hh_elder_count'].dropna()

print(f"Elderly persons per household:")
print(f"  Elderly respondents: mean={elderly_hh_count.mean():.2f}, median={elderly_hh_count.median():.0f}")
print(f"  General population: mean={general_hh_count.mean():.2f}, median={general_hh_count.median():.0f}")
print(f"  Gap: {elderly_hh_count.mean() - general_hh_count.mean():.2f} persons")

# Statistical test
if len(elderly_hh_count) > 0 and len(general_hh_count) > 0:
    stat, p_value = stats.ttest_ind(elderly_hh_count, general_hh_count)
    print(f"  p-value: {p_value:.4f}")
print()

# Total household size
elderly_hhsize = elderly_respondents['hhsize'].dropna()
general_hhsize = general_population['hhsize'].dropna()

print(f"Total household size:")
print(f"  Elderly respondents: mean={elderly_hhsize.mean():.2f}, median={elderly_hhsize.median():.0f}")
print(f"  General population: mean={general_hhsize.mean():.2f}, median={general_hhsize.median():.0f}")

if len(elderly_hhsize) > 0 and len(general_hhsize) > 0:
    stat, p_value = stats.ttest_ind(elderly_hhsize, general_hhsize)
    print(f"  p-value: {p_value:.4f}")
print()

# INCOME ANALYSIS
print("=" * 80)
print("INCOME CHARACTERISTICS")
print("=" * 80)
print()

# Filter for those with income data
elderly_income = elderly_respondents[elderly_respondents['income'].notna()].copy()
general_income = general_population[general_population['income'].notna()].copy()

print(f"Respondents with income data:")
print(f"  Elderly: {len(elderly_income)} ({len(elderly_income)/len(elderly_respondents)*100:.1f}%)")
print(f"  General: {len(general_income)} ({len(general_income)/len(general_population)*100:.1f}%)")
print()

print("-" * 80)
print("INCOME STATISTICS")
print("-" * 80)
print()

print(f"Elderly respondents (60+):")
print(f"  Mean income: {elderly_income['income'].mean():,.0f} THB")
print(f"  Median income: {elderly_income['income'].median():,.0f} THB")
print(f"  Min: {elderly_income['income'].min():,.0f} THB")
print(f"  Max: {elderly_income['income'].max():,.0f} THB")
print(f"  25th percentile: {elderly_income['income'].quantile(0.25):,.0f} THB")
print(f"  75th percentile: {elderly_income['income'].quantile(0.75):,.0f} THB")
print()

print(f"General population (<60):")
print(f"  Mean income: {general_income['income'].mean():,.0f} THB")
print(f"  Median income: {general_income['income'].median():,.0f} THB")
print(f"  Min: {general_income['income'].min():,.0f} THB")
print(f"  Max: {general_income['income'].max():,.0f} THB")
print(f"  25th percentile: {general_income['income'].quantile(0.25):,.0f} THB")
print(f"  75th percentile: {general_income['income'].quantile(0.75):,.0f} THB")
print()

# Income gap
mean_gap = elderly_income['income'].mean() - general_income['income'].mean()
median_gap = elderly_income['income'].median() - general_income['income'].median()

print(f"Income gap (Elderly - General):")
print(f"  Mean gap: {mean_gap:,.0f} THB ({mean_gap/general_income['income'].mean()*100:.1f}%)")
print(f"  Median gap: {median_gap:,.0f} THB ({median_gap/general_income['income'].median()*100:.1f}%)")

# Statistical test
if len(elderly_income) > 0 and len(general_income) > 0:
    stat, p_value = stats.ttest_ind(elderly_income['income'], general_income['income'])
    print(f"  p-value: {p_value:.4f}")
print()

# Income distribution by brackets
print("-" * 80)
print("INCOME DISTRIBUTION")
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
    elderly_count = len(elderly_income[(elderly_income['income'] >= low) & (elderly_income['income'] < high)])
    general_count = len(general_income[(general_income['income'] >= low) & (general_income['income'] < high)])

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
    print(f"  Mean rent: {elderly_rent['rent_price'].mean():,.0f} THB")
    print(f"  Median rent: {elderly_rent['rent_price'].median():,.0f} THB")
    print(f"  Range: {elderly_rent['rent_price'].min():,.0f} - {elderly_rent['rent_price'].max():,.0f} THB")
else:
    print("No elderly renters with rent data")
print()

if len(general_rent) > 0:
    print(f"General renters with rent data: {len(general_rent)}")
    print(f"  Mean rent: {general_rent['rent_price'].mean():,.0f} THB")
    print(f"  Median rent: {general_rent['rent_price'].median():,.0f} THB")
    print(f"  Range: {general_rent['rent_price'].min():,.0f} - {general_rent['rent_price'].max():,.0f} THB")
else:
    print("No general population renters with rent data")
print()

if len(elderly_rent) > 0 and len(general_rent) > 0:
    rent_gap = elderly_rent['rent_price'].median() - general_rent['rent_price'].median()
    print(f"Median rent gap (Elderly - General): {rent_gap:,.0f} THB")
    stat, p_value = stats.ttest_ind(elderly_rent['rent_price'], general_rent['rent_price'])
    print(f"p-value: {p_value:.4f}")
print()

# COMBINED ANALYSIS
print("=" * 80)
print("ELDERLY HOUSEHOLD PROFILES")
print("=" * 80)
print()

# Elderly households by housing status and income
print("Elderly households by housing tenure and income level:")
print()

for status_code, status_name in sorted(house_status_mapping.items()):
    elderly_status = elderly_housing[elderly_housing['house_status'] == status_code]

    if len(elderly_status) == 0:
        continue

    print(f"{status_name} (n={len(elderly_status)}, {len(elderly_status)/len(elderly_housing)*100:.1f}%):")

    # Income for this housing status
    elderly_status_income = elderly_status[elderly_status['income'].notna()]
    if len(elderly_status_income) > 0:
        print(f"  Income: mean={elderly_status_income['income'].mean():,.0f}, median={elderly_status_income['income'].median():,.0f} THB")

    # Household size
    if len(elderly_status['hhsize'].dropna()) > 0:
        print(f"  Household size: mean={elderly_status['hhsize'].mean():.1f}, median={elderly_status['hhsize'].median():.0f}")

    # Elderly per household
    if len(elderly_status['hh_elder_count'].dropna()) > 0:
        print(f"  Elderly per HH: mean={elderly_status['hh_elder_count'].mean():.1f}, median={elderly_status['hh_elder_count'].median():.0f}")

    print()

print("=" * 80)
