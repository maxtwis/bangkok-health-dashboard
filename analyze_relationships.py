import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency, ttest_ind
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

# Load data
print("Loading data...")
df = pd.read_csv(r'c:\Users\ion_l_uhhlu4p.MAXTWIS\bangkok-health-dashboard\public\data\survey_sampling.csv', encoding='utf-8-sig')
print(f"Total records: {len(df)}")
print(f"Columns: {df.columns.tolist()[:20]}...")  # Print first 20 columns

# Convert data types
# Welfare is categorical (0=none, 1=30 baht, 2=social security, 3=government employee, 4=other)
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

# Define population groups
def classify_population_group(row):
    """Classify individuals into population groups"""
    groups = []

    # Elderly (60+)
    if pd.notna(row['age']) and row['age'] >= 60:
        groups.append('elderly')

    # Disabled
    if pd.notna(row['disable_status']) and row['disable_status'] == 1:
        groups.append('disabled')

    # Informal workers (no contract)
    if (pd.notna(row['occupation_status']) and row['occupation_status'] == 1 and
        pd.notna(row['occupation_contract']) and row['occupation_contract'] == 0):
        groups.append('informal_worker')

    # General population if no specific group
    if not groups:
        groups.append('general')

    return groups

# Add population group classifications
df['population_groups'] = df.apply(classify_population_group, axis=1)

print("\nPopulation group distribution:")
all_groups = defaultdict(int)
for groups_list in df['population_groups']:
    for group in groups_list:
        all_groups[group] += 1
for group, count in all_groups.items():
    print(f"  {group}: {count}")

# Helper functions
def chi_square_test(df_subset, var1, var2):
    """Perform chi-square test for two categorical variables"""
    # Create contingency table
    contingency = pd.crosstab(df_subset[var1], df_subset[var2])

    # Check if we have enough data
    if contingency.size < 4 or contingency.sum().sum() < 30:
        return None, None, None

    try:
        chi2, p_value, dof, expected = chi2_contingency(contingency)
        return chi2, p_value, contingency
    except:
        return None, None, None

def t_test_continuous(df_subset, grouping_var, continuous_var):
    """Perform t-test for continuous variable across groups"""
    groups = df_subset[grouping_var].unique()
    if len(groups) != 2:
        return None, None, None, None

    group1_data = df_subset[df_subset[grouping_var] == groups[0]][continuous_var].dropna()
    group2_data = df_subset[df_subset[grouping_var] == groups[1]][continuous_var].dropna()

    if len(group1_data) < 5 or len(group2_data) < 5:
        return None, None, None, None

    try:
        t_stat, p_value = ttest_ind(group1_data, group2_data)
        return groups, (group1_data.mean(), group2_data.mean()), (len(group1_data), len(group2_data)), p_value
    except:
        return None, None, None, None

print("\n" + "="*80)
print("CROSS-DOMAIN RELATIONSHIP ANALYSIS")
print("="*80)

# 1. Education -> Healthcare Access (Welfare Coverage)
print("\n1. EDUCATION -> HEALTHCARE ACCESS (WELFARE COVERAGE)")
print("-" * 80)

for pop_group in ['general', 'elderly', 'disabled', 'informal_worker']:
    # Filter data
    df_filtered = df[df['population_groups'].apply(lambda x: pop_group in x)].copy()
    df_filtered = df_filtered[df_filtered['education'].notna() & df_filtered['welfare'].notna()]

    if len(df_filtered) < 30:
        continue

    # Group education levels
    df_filtered['education_grouped'] = df_filtered['education'].apply(
        lambda x: 'low' if x <= 3 else ('medium' if x <= 6 else 'high')
    )

    # Group welfare coverage
    df_filtered['has_welfare'] = df_filtered['welfare'].apply(lambda x: 1 if x > 0 else 0)

    chi2, p_value, contingency = chi_square_test(df_filtered, 'education_grouped', 'has_welfare')

    if p_value is not None and p_value < 0.05:
        print(f"\n  Population: {pop_group.upper()}")
        print(f"  Sample size: {len(df_filtered)}")
        print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")

        # Calculate percentages
        for edu_level in ['low', 'medium', 'high']:
            subset = df_filtered[df_filtered['education_grouped'] == edu_level]
            if len(subset) > 0:
                welfare_pct = (subset['has_welfare'].sum() / len(subset)) * 100
                print(f"    {edu_level.capitalize()} education: {welfare_pct:.1f}% have welfare coverage (n={len(subset)})")

# 2. Healthcare Access (Welfare) -> Chronic Disease
print("\n\n2. HEALTHCARE ACCESS (WELFARE COVERAGE) -> CHRONIC DISEASE")
print("-" * 80)

for pop_group in ['general', 'elderly', 'disabled', 'informal_worker']:
    df_filtered = df[df['population_groups'].apply(lambda x: pop_group in x)].copy()
    df_filtered = df_filtered[df_filtered['welfare'].notna() & df_filtered['diseases_status'].notna()]

    if len(df_filtered) < 30:
        continue

    df_filtered['has_welfare'] = df_filtered['welfare'].apply(lambda x: 1 if x > 0 else 0)
    df_filtered['has_chronic'] = df_filtered['diseases_status']

    chi2, p_value, contingency = chi_square_test(df_filtered, 'has_welfare', 'has_chronic')

    if p_value is not None and p_value < 0.05:
        print(f"\n  Population: {pop_group.upper()}")
        print(f"  Sample size: {len(df_filtered)}")
        print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")

        # Calculate percentages
        for welfare_status in [0, 1]:
            subset = df_filtered[df_filtered['has_welfare'] == welfare_status]
            if len(subset) > 0:
                chronic_pct = (subset['has_chronic'].sum() / len(subset)) * 100
                welfare_label = "WITH welfare" if welfare_status == 1 else "WITHOUT welfare"
                print(f"    {welfare_label}: {chronic_pct:.1f}% have chronic disease (n={len(subset)})")

        # Calculate difference
        with_welfare = df_filtered[df_filtered['has_welfare'] == 1]
        without_welfare = df_filtered[df_filtered['has_welfare'] == 0]
        if len(with_welfare) > 0 and len(without_welfare) > 0:
            diff = ((with_welfare['has_chronic'].sum() / len(with_welfare)) -
                   (without_welfare['has_chronic'].sum() / len(without_welfare))) * 100
            print(f"    Difference: {diff:+.1f} percentage points")

# 3. Chronic Disease -> Health Behaviors (Exercise)
print("\n\n3. CHRONIC DISEASE -> HEALTH BEHAVIORS (EXERCISE)")
print("-" * 80)

for pop_group in ['general', 'elderly', 'disabled', 'informal_worker']:
    df_filtered = df[df['population_groups'].apply(lambda x: pop_group in x)].copy()
    df_filtered = df_filtered[df_filtered['diseases_status'].notna() & df_filtered['exercise_status'].notna()]

    if len(df_filtered) < 30:
        continue

    df_filtered['has_chronic'] = df_filtered['diseases_status']
    df_filtered['exercises_regularly'] = df_filtered['exercise_status'].apply(lambda x: 1 if x in [1, 2] else 0)

    chi2, p_value, contingency = chi_square_test(df_filtered, 'has_chronic', 'exercises_regularly')

    if p_value is not None and p_value < 0.05:
        print(f"\n  Population: {pop_group.upper()}")
        print(f"  Sample size: {len(df_filtered)}")
        print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")

        # Calculate percentages
        for chronic_status in [0, 1]:
            subset = df_filtered[df_filtered['has_chronic'] == chronic_status]
            if len(subset) > 0:
                exercise_pct = (subset['exercises_regularly'].sum() / len(subset)) * 100
                chronic_label = "WITH chronic disease" if chronic_status == 1 else "WITHOUT chronic disease"
                print(f"    {chronic_label}: {exercise_pct:.1f}% exercise regularly (n={len(subset)})")

        # Calculate difference
        with_chronic = df_filtered[df_filtered['has_chronic'] == 1]
        without_chronic = df_filtered[df_filtered['has_chronic'] == 0]
        if len(with_chronic) > 0 and len(without_chronic) > 0:
            diff = ((with_chronic['exercises_regularly'].sum() / len(with_chronic)) -
                   (without_chronic['exercises_regularly'].sum() / len(without_chronic))) * 100
            print(f"    Difference: {diff:+.1f} percentage points")

# 4. Income -> Food Security
print("\n\n4. INCOME -> FOOD SECURITY")
print("-" * 80)

for pop_group in ['general', 'elderly', 'disabled', 'informal_worker']:
    df_filtered = df[df['population_groups'].apply(lambda x: pop_group in x)].copy()
    df_filtered = df_filtered[df_filtered['income'].notna() &
                              (df_filtered['food_insecurity_1'].notna() | df_filtered['food_insecurity_2'].notna())]

    if len(df_filtered) < 30:
        continue

    # Create food insecurity indicator
    df_filtered['food_insecure'] = df_filtered.apply(
        lambda row: 1 if (row['food_insecurity_1'] == 1 or row['food_insecurity_2'] == 1) else 0,
        axis=1
    )

    # Group income levels (using quartiles)
    df_filtered['income_level'] = pd.qcut(df_filtered['income'], q=3, labels=['low', 'medium', 'high'], duplicates='drop')

    chi2, p_value, contingency = chi_square_test(df_filtered, 'income_level', 'food_insecure')

    if p_value is not None and p_value < 0.05:
        print(f"\n  Population: {pop_group.upper()}")
        print(f"  Sample size: {len(df_filtered)}")
        print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")

        # Calculate percentages and income ranges
        for income_level in ['low', 'medium', 'high']:
            subset = df_filtered[df_filtered['income_level'] == income_level]
            if len(subset) > 0:
                food_insec_pct = (subset['food_insecure'].sum() / len(subset)) * 100
                avg_income = subset['income'].mean()
                print(f"    {income_level.capitalize()} income (avg: {avg_income:,.0f} THB): {food_insec_pct:.1f}% food insecure (n={len(subset)})")

# 5. Housing Ownership -> Income/Health
print("\n\n5. HOUSING OWNERSHIP -> INCOME/HEALTH OUTCOMES")
print("-" * 80)

for pop_group in ['general', 'elderly', 'disabled', 'informal_worker']:
    df_filtered = df[df['population_groups'].apply(lambda x: pop_group in x)].copy()
    df_filtered = df_filtered[df_filtered['house_status'].notna()]

    # Create ownership indicator (assuming 1=own, 2=rent, 3=free, 4=other)
    df_filtered['owns_house'] = df_filtered['house_status'].apply(lambda x: 1 if x == 1 else 0)

    # 5a. Housing → Income
    df_income = df_filtered[df_filtered['income'].notna()].copy()
    if len(df_income) >= 30:
        groups, means, sizes, p_value = t_test_continuous(df_income, 'owns_house', 'income')

        if p_value is not None and p_value < 0.05:
            print(f"\n  Population: {pop_group.upper()} - Housing -> Income")
            print(f"  Sample size: {sum(sizes)}")
            print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")
            print(f"    Owners: {means[0]:,.0f} THB/month (n={sizes[0]})")
            print(f"    Renters: {means[1]:,.0f} THB/month (n={sizes[1]})")
            print(f"    Difference: {means[0] - means[1]:+,.0f} THB")

    # 5b. Housing -> Chronic Disease
    df_health = df_filtered[df_filtered['diseases_status'].notna()].copy()
    if len(df_health) >= 30:
        chi2, p_value, contingency = chi_square_test(df_health, 'owns_house', 'diseases_status')

        if p_value is not None and p_value < 0.05:
            print(f"\n  Population: {pop_group.upper()} - Housing -> Chronic Disease")
            print(f"  Sample size: {len(df_health)}")
            print(f"  p-value: {p_value:.4f} {'***' if p_value < 0.001 else '**' if p_value < 0.01 else '*'}")

            for ownership in [1, 0]:
                subset = df_health[df_health['owns_house'] == ownership]
                if len(subset) > 0:
                    chronic_pct = (subset['diseases_status'].sum() / len(subset)) * 100
                    ownership_label = "Owners" if ownership == 1 else "Renters"
                    print(f"    {ownership_label}: {chronic_pct:.1f}% have chronic disease (n={len(subset)})")

print("\n\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
