"""
Unemployment Rate Analysis by Community Type
Filtered for Working Age Population (15-60 years)

This analysis provides accurate unemployment rates by excluding:
- Children (age < 15)
- Elderly (age >= 60)
"""

import pandas as pd
import numpy as np

print("="*80)
print("UNEMPLOYMENT RATE ANALYSIS BY COMMUNITY TYPE")
print("Working Age Population Only (15-60 years)")
print("="*80)

# Load data
community_df = pd.read_csv('public/data/community_data.csv', encoding='utf-8-sig')
full_survey_df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')

print(f"\nTotal community data: {len(community_df)} respondents")
print(f"Total full survey: {len(full_survey_df)} respondents")

# Filter for working age (15-60 years)
community_working = community_df[(community_df['age'] >= 15) & (community_df['age'] < 60)].copy()
full_working = full_survey_df[(full_survey_df['age'] >= 15) & (full_survey_df['age'] < 60)].copy()

print(f"\nWorking age in community data: {len(community_working)} ({len(community_working)/len(community_df)*100:.1f}%)")
print(f"Working age in full survey: {len(full_working)} ({len(full_working)/len(full_survey_df)*100:.1f}%)")

# Calculate employment indicators
def calculate_employment_indicators(df):
    """Calculate various employment indicators"""

    # Basic employment status
    df['employed'] = df['occupation_status'].apply(lambda x: 1 if x == 1 else 0)
    df['unemployed'] = df['occupation_status'].apply(lambda x: 1 if x == 0 else 0)

    # For employed: formal vs informal
    df['has_contract'] = df.apply(
        lambda row: 1 if row.get('occupation_status', 0) == 1 and row.get('occupation_contract', 0) == 1 else 0,
        axis=1
    )
    df['no_contract'] = df.apply(
        lambda row: 1 if row.get('occupation_status', 0) == 1 and row.get('occupation_contract', 0) == 0 else 0,
        axis=1
    )

    df['has_welfare'] = df.apply(
        lambda row: 1 if row.get('occupation_status', 0) == 1 and row.get('occupation_welfare', 0) == 1 else 0,
        axis=1
    )
    df['no_welfare'] = df.apply(
        lambda row: 1 if row.get('occupation_status', 0) == 1 and row.get('occupation_welfare', 0) == 0 else 0,
        axis=1
    )

    # Vulnerable employment (employed but no contract AND no welfare)
    df['vulnerable_employment'] = df.apply(
        lambda row: 1 if row.get('occupation_status', 0) == 1 and
                         row.get('occupation_contract', 0) == 0 and
                         row.get('occupation_welfare', 0) == 0 else 0,
        axis=1
    )

    # Formal employment (has contract AND welfare)
    df['formal_employment'] = df.apply(
        lambda row: 1 if row.get('occupation_status', 0) == 1 and
                         row.get('occupation_contract', 0) == 1 and
                         row.get('occupation_welfare', 0) == 1 else 0,
        axis=1
    )

    return df

# Calculate for both datasets
community_working = calculate_employment_indicators(community_working)
full_working = calculate_employment_indicators(full_working)

# Community type mapping
community_types = {
    'ชุมชนชานเมือง': 'Suburban Community',
    'ชุมชนหมู่บ้านจัดสรร': 'Housing Estate',
    'ชุมชนอาคารสูง': 'High-rise/Condo',
    'ชุมชนเมือง': 'Urban Community',
    'ชุมชนแออัด': 'Crowded Community'
}

# Calculate statistics
results = []

# Bangkok Average (Full Survey - Working Age)
bangkok_stats = {
    'Community Type': 'Bangkok Average (Full Survey)',
    'N Total': len(full_working),
    'N Employed': full_working['employed'].sum(),
    'N Unemployed': full_working['unemployed'].sum(),
    'Employment Rate (%)': (full_working['employed'].sum() / len(full_working)) * 100,
    'Unemployment Rate (%)': (full_working['unemployed'].sum() / len(full_working)) * 100,
    'Formal Employment (%)': (full_working['formal_employment'].sum() / full_working['employed'].sum()) * 100 if full_working['employed'].sum() > 0 else 0,
    'Has Contract (%)': (full_working['has_contract'].sum() / full_working['employed'].sum()) * 100 if full_working['employed'].sum() > 0 else 0,
    'Has Welfare (%)': (full_working['has_welfare'].sum() / full_working['employed'].sum()) * 100 if full_working['employed'].sum() > 0 else 0,
    'Vulnerable Employment (%)': (full_working['vulnerable_employment'].sum() / full_working['employed'].sum()) * 100 if full_working['employed'].sum() > 0 else 0,
}
results.append(bangkok_stats)

# Calculate for each community type
for thai_name, eng_name in community_types.items():
    comm_data = community_working[community_working['community_type'] == thai_name]

    if len(comm_data) > 0:
        n_employed = comm_data['employed'].sum()

        stats = {
            'Community Type': eng_name,
            'N Total': len(comm_data),
            'N Employed': n_employed,
            'N Unemployed': comm_data['unemployed'].sum(),
            'Employment Rate (%)': (n_employed / len(comm_data)) * 100,
            'Unemployment Rate (%)': (comm_data['unemployed'].sum() / len(comm_data)) * 100,
            'Formal Employment (%)': (comm_data['formal_employment'].sum() / n_employed) * 100 if n_employed > 0 else 0,
            'Has Contract (%)': (comm_data['has_contract'].sum() / n_employed) * 100 if n_employed > 0 else 0,
            'Has Welfare (%)': (comm_data['has_welfare'].sum() / n_employed) * 100 if n_employed > 0 else 0,
            'Vulnerable Employment (%)': (comm_data['vulnerable_employment'].sum() / n_employed) * 100 if n_employed > 0 else 0,
        }

        # Calculate gaps from Bangkok average
        stats['Unemployment Gap'] = stats['Unemployment Rate (%)'] - bangkok_stats['Unemployment Rate (%)']
        stats['Vulnerable Employment Gap'] = stats['Vulnerable Employment (%)'] - bangkok_stats['Vulnerable Employment (%)']

        results.append(stats)

# Create results dataframe
results_df = pd.DataFrame(results)

print("\n" + "="*80)
print("EMPLOYMENT STATISTICS BY COMMUNITY TYPE (Working Age 15-60)")
print("="*80)
print(results_df.to_string(index=False))

# Save results
results_df.to_csv('unemployment_by_community_working_age.csv', index=False, encoding='utf-8-sig')

# Generate summary analysis
print("\n" + "="*80)
print("KEY FINDINGS")
print("="*80)

# Find highest/lowest unemployment
sorted_by_unemployment = results_df[results_df['Community Type'] != 'Bangkok Average (Full Survey)'].sort_values('Unemployment Rate (%)', ascending=False)
print(f"\nHighest Unemployment Rate:")
print(f"  {sorted_by_unemployment.iloc[0]['Community Type']}: {sorted_by_unemployment.iloc[0]['Unemployment Rate (%)']:.2f}%")
print(f"  Gap from Bangkok: +{sorted_by_unemployment.iloc[0]['Unemployment Gap']:.2f} percentage points")

print(f"\nLowest Unemployment Rate:")
print(f"  {sorted_by_unemployment.iloc[-1]['Community Type']}: {sorted_by_unemployment.iloc[-1]['Unemployment Rate (%)']:.2f}%")
print(f"  Gap from Bangkok: {sorted_by_unemployment.iloc[-1]['Unemployment Gap']:.2f} percentage points")

# Find highest/lowest vulnerable employment
sorted_by_vulnerable = results_df[results_df['Community Type'] != 'Bangkok Average (Full Survey)'].sort_values('Vulnerable Employment (%)', ascending=False)
print(f"\nHighest Vulnerable Employment Rate (among employed):")
print(f"  {sorted_by_vulnerable.iloc[0]['Community Type']}: {sorted_by_vulnerable.iloc[0]['Vulnerable Employment (%)']:.2f}%")
print(f"  Gap from Bangkok: +{sorted_by_vulnerable.iloc[0]['Vulnerable Employment Gap']:.2f} percentage points")

print(f"\nLowest Vulnerable Employment Rate (among employed):")
print(f"  {sorted_by_vulnerable.iloc[-1]['Community Type']}: {sorted_by_vulnerable.iloc[-1]['Vulnerable Employment (%)']:.2f}%")
print(f"  Gap from Bangkok: {sorted_by_vulnerable.iloc[-1]['Vulnerable Employment Gap']:.2f} percentage points")

# Calculate correlation between unemployment and vulnerable employment
print(f"\n" + "="*80)
print("EMPLOYMENT QUALITY ANALYSIS")
print("="*80)

for idx, row in results_df.iterrows():
    if row['Community Type'] != 'Bangkok Average (Full Survey)':
        print(f"\n{row['Community Type']}:")
        print(f"  Working Age Population: {int(row['N Total']):,}")
        print(f"  Employment Rate: {row['Employment Rate (%)']:.1f}%")
        print(f"  Unemployment Rate: {row['Unemployment Rate (%)']:.1f}%")
        print(f"  Among Employed:")
        print(f"    - Formal (contract + welfare): {row['Formal Employment (%)']:.1f}%")
        print(f"    - Has Contract: {row['Has Contract (%)']:.1f}%")
        print(f"    - Has Welfare: {row['Has Welfare (%)']:.1f}%")
        print(f"    - Vulnerable (no contract, no welfare): {row['Vulnerable Employment (%)']:.1f}%")

print("\n" + "="*80)
print("SAVED TO: unemployment_by_community_working_age.csv")
print("="*80)
