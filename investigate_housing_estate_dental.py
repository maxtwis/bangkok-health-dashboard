"""
Investigate Housing Estate Dental Access
Why is it so low (11.1%)?
"""

import pandas as pd
import numpy as np

print("="*80)
print("INVESTIGATING HOUSING ESTATE DENTAL ACCESS")
print("="*80)

# Load community data
community_df = pd.read_csv('public/data/community_data.csv', encoding='utf-8-sig')

# Filter Housing Estate
housing_estate = community_df[community_df['community_type'] == 'ชุมชนหมู่บ้านจัดสรร']

print(f"\nHousing Estate Total: {len(housing_estate)} respondents")

# Analyze oral health status
print("\n" + "="*80)
print("ORAL HEALTH STATUS")
print("="*80)

print(f"Had oral health problem (oral_health=1): {len(housing_estate[housing_estate['oral_health']==1])}")
print(f"No oral health problem (oral_health=0): {len(housing_estate[housing_estate['oral_health']==0])}")

had_problem = housing_estate[housing_estate['oral_health'] == 1]
print(f"\nAmong {len(had_problem)} people with oral health problems:")

if len(had_problem) > 0:
    print("\noral_health_access values:")
    print(had_problem['oral_health_access'].value_counts())

    got_treatment = len(had_problem[had_problem['oral_health_access'] == 1])
    no_treatment = len(had_problem[had_problem['oral_health_access'] == 0])

    print(f"\nGot treatment (oral_health_access=1): {got_treatment}")
    print(f"Didn't get treatment (oral_health_access=0): {no_treatment}")

    if len(had_problem) > 0:
        access_rate = (got_treatment / len(had_problem)) * 100
        print(f"\nDental Access Rate: {access_rate:.2f}%")
        print(f"Calculation: {got_treatment} / {len(had_problem)} * 100 = {access_rate:.2f}%")

# Check for data quality issues
print("\n" + "="*80)
print("DATA QUALITY CHECK")
print("="*80)

# Check for missing/NaN values
print(f"Missing oral_health values: {housing_estate['oral_health'].isna().sum()}")
print(f"Missing oral_health_access values: {housing_estate['oral_health_access'].isna().sum()}")

# Check for people with oral_health=1 but missing oral_health_access
problematic = housing_estate[(housing_estate['oral_health'] == 1) & (housing_estate['oral_health_access'].isna())]
print(f"People with problem BUT missing access data: {len(problematic)}")

# Show age distribution of Housing Estate
print("\n" + "="*80)
print("DEMOGRAPHIC PROFILE")
print("="*80)
print(f"Mean age: {housing_estate['age'].mean():.1f} years")
print(f"Median age: {housing_estate['age'].median():.1f} years")
print(f"Age range: {housing_estate['age'].min()} - {housing_estate['age'].max()}")

# Compare with other community types
print("\n" + "="*80)
print("COMPARISON WITH OTHER COMMUNITY TYPES")
print("="*80)

community_types = {
    'ชุมชนชานเมือง': 'Suburban',
    'ชุมชนหมู่บ้านจัดสรร': 'Housing Estate',
    'ชุมชนอาคารสูง': 'High-rise',
    'ชุมชนเมือง': 'Urban',
    'ชุมชนแออัด': 'Crowded'
}

results = []
for thai_name, eng_name in community_types.items():
    comm = community_df[community_df['community_type'] == thai_name]

    n_total = len(comm)
    n_had_problem = len(comm[comm['oral_health'] == 1])
    n_got_treatment = len(comm[(comm['oral_health'] == 1) & (comm['oral_health_access'] == 1)])

    problem_rate = (n_had_problem / n_total) * 100 if n_total > 0 else 0
    access_rate = (n_got_treatment / n_had_problem) * 100 if n_had_problem > 0 else np.nan

    results.append({
        'Community Type': eng_name,
        'N Total': n_total,
        'N Had Problem': n_had_problem,
        'Problem Rate (%)': problem_rate,
        'N Got Treatment': n_got_treatment,
        'Access Rate (%)': access_rate
    })

results_df = pd.DataFrame(results)
print(results_df.to_string(index=False))

# Analyze why Housing Estate is so low
print("\n" + "="*80)
print("WHY IS HOUSING ESTATE DENTAL ACCESS SO LOW?")
print("="*80)

housing_row = results_df[results_df['Community Type'] == 'Housing Estate'].iloc[0]

print(f"\n1. SAMPLE SIZE: {int(housing_row['N Total'])} total respondents")
print(f"   - This is the SMALLEST community type")
print(f"   - Small N can lead to unstable estimates")

print(f"\n2. ORAL HEALTH PROBLEM RATE: {housing_row['Problem Rate (%)']:.1f}%")
print(f"   - Only {int(housing_row['N Had Problem'])} people had problems")
print(f"   - Very small denominator for calculating access rate")

print(f"\n3. TREATMENT RATE: {int(housing_row['N Got Treatment'])} out of {int(housing_row['N Had Problem'])} got treatment")
print(f"   - Access Rate: {housing_row['Access Rate (%)']:.1f}%")

if housing_row['N Had Problem'] < 30:
    print(f"\n** WARNING: Sample size too small (N={int(housing_row['N Had Problem'])})")
    print("   - Estimates based on <30 observations are unreliable")
    print("   - Consider excluding or combining with other community types")
    print("   - Or report with wide confidence intervals")

# Check if this is statistically meaningful
print("\n" + "="*80)
print("STATISTICAL VALIDITY")
print("="*80)

from scipy import stats

# Compare Housing Estate vs Bangkok average
bangkok_had_problem = len(community_df[community_df['oral_health'] == 1])
bangkok_got_treatment = len(community_df[(community_df['oral_health'] == 1) & (community_df['oral_health_access'] == 1)])
bangkok_access_rate = (bangkok_got_treatment / bangkok_had_problem) * 100

print(f"\nBangkok Average Dental Access: {bangkok_access_rate:.1f}%")
print(f"Housing Estate Dental Access: {housing_row['Access Rate (%)']:.1f}%")
print(f"Difference: {housing_row['Access Rate (%)'] - bangkok_access_rate:.1f} percentage points")

# Fisher's exact test (better for small samples)
housing_yes = int(housing_row['N Got Treatment'])
housing_no = int(housing_row['N Had Problem']) - housing_yes
bangkok_yes = bangkok_got_treatment - housing_yes
bangkok_no = (bangkok_had_problem - int(housing_row['N Had Problem'])) - bangkok_yes

from scipy.stats import fisher_exact
oddsratio, p_value = fisher_exact([[housing_yes, housing_no], [bangkok_yes, bangkok_no]])

print(f"\nFisher's Exact Test:")
print(f"  p-value: {p_value:.4f}")
print(f"  Statistically significant at p<0.05: {'Yes' if p_value < 0.05 else 'No'}")

if p_value >= 0.05:
    print("\n** The difference is NOT statistically significant!")
    print("   This could be due to random variation with small sample size")

# Calculate 95% confidence interval for Housing Estate
def wilson_ci(successes, trials, confidence=0.95):
    """Wilson score confidence interval"""
    if trials == 0:
        return (0, 0)

    z = stats.norm.ppf((1 + confidence) / 2)
    p_hat = successes / trials

    denominator = 1 + z**2 / trials
    centre = (p_hat + z**2 / (2 * trials)) / denominator
    margin = z * np.sqrt((p_hat * (1 - p_hat) + z**2 / (4 * trials)) / trials) / denominator

    return (max(0, centre - margin) * 100, min(1, centre + margin) * 100)

lower, upper = wilson_ci(housing_yes, int(housing_row['N Had Problem']))

print(f"\n95% Confidence Interval for Housing Estate:")
print(f"  Point Estimate: {housing_row['Access Rate (%)']:.1f}%")
print(f"  95% CI: [{lower:.1f}%, {upper:.1f}%]")
print(f"  Interval Width: {upper - lower:.1f} percentage points")

if (upper - lower) > 40:
    print("\n** Very wide confidence interval (>40 points)")
    print("   Estimate is highly uncertain due to small sample size")

print("\n" + "="*80)
print("RECOMMENDATION")
print("="*80)

if housing_row['N Had Problem'] < 30 and p_value >= 0.05:
    print("\n** CAUTION ADVISED:")
    print("   - Sample size too small (N=9) for reliable estimate")
    print("   - Difference not statistically significant")
    print("   - Report should include confidence intervals or suppress estimate")
    print("\n   SUGGESTED REPORTING:")
    print(f"   'Housing Estate dental access: {housing_row['Access Rate (%)']:.1f}% (95% CI: {lower:.1f}%-{upper:.1f}%, N={int(housing_row['N Had Problem'])})'")
    print("   or")
    print("   'Estimate suppressed due to small sample size (N<30)'")
else:
    print("\nEstimate appears valid - proceed with caution about interpretation")
