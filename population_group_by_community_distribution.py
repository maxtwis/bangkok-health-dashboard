"""
Population Group Distribution by Community Type
Shows which vulnerable populations are concentrated in which community types

Uses same priority logic as population_group_inequality_analysis.py:
1. Disabled (highest priority)
2. Elderly (if not disabled)
3. Informal Workers
4. LGBTQ+
5. General Population
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("POPULATION GROUP DISTRIBUTION BY COMMUNITY TYPE")
print("="*80)

# Load data
community_df = pd.read_csv('public/data/community_data.csv', encoding='utf-8-sig')
weight_df = pd.read_csv('public/data/statistical checking/weight_by_district.csv', encoding='utf-8-sig')

print(f"\nCommunity data loaded: {len(community_df)} respondents")

# Apply master weight and population group assignment
def apply_master_weight(row, weight_df):
    """
    Apply master weight based on population group and district
    Same logic as population_group_inequality_analysis.py
    """
    district_code = row.get('dcode', None)

    # PRIORITY 1: Disabled
    if row.get('disable_status', 0) == 1:
        if district_code and district_code in weight_df['dcode'].values:
            weight = weight_df[weight_df['dcode'] == district_code]['Weight_Disabled'].values[0]
        else:
            weight = 1.0
        group = 'Disabled'

    # PRIORITY 2: Elderly
    elif row.get('age', 0) >= 60:
        if district_code and district_code in weight_df['dcode'].values:
            weight = weight_df[weight_df['dcode'] == district_code]['Weight_Elderly'].values[0]
        else:
            weight = 1.0
        group = 'Elderly'

    # PRIORITY 3: Informal Workers
    elif row.get('occupation_status', 0) == 1 and row.get('occupation_contract', 0) == 0:
        weight = 0.6611
        group = 'Informal Workers'

    # PRIORITY 4: LGBTQ+
    elif row.get('sex', '') == 'lgbt':
        weight = 1.0
        group = 'LGBTQ+'

    # PRIORITY 5: General Population
    else:
        weight = 2.5
        group = 'General Population'

    return pd.Series({'master_weight': weight, 'population_group': group})

# Apply weights and group assignment
community_df[['master_weight', 'population_group']] = community_df.apply(
    lambda row: apply_master_weight(row, weight_df), axis=1
)

print("\nPopulation group distribution (overall):")
print(community_df['population_group'].value_counts())

print("\nCommunity type distribution (overall):")
print(community_df['community_type'].value_counts())

# Community type mapping
community_types = {
    'ชุมชนชานเมือง': 'Suburban Community',
    'ชุมชนหมู่บ้านจัดสรร': 'Housing Estate',
    'ชุมชนอาคารสูง': 'High-rise/Condo',
    'ชุมชนเมือง': 'Urban Community',
    'ชุมชนแออัด': 'Crowded Community'
}

# Create cross-tabulation
print("\n" + "="*80)
print("CROSS-TABULATION: POPULATION GROUP x COMMUNITY TYPE")
print("="*80)

# Count distribution
crosstab_counts = pd.crosstab(
    community_df['population_group'],
    community_df['community_type'],
    margins=True,
    margins_name='Total'
)

# Rename columns to English
crosstab_counts.columns = [community_types.get(col, col) for col in crosstab_counts.columns]

print("\nAbsolute Counts:")
print(crosstab_counts.to_string())

# Row percentages (within each population group, what % is in each community type)
print("\n" + "="*80)
print("ROW PERCENTAGES - Distribution of Each Population Group Across Community Types")
print("(Within each population group, what % lives in each community type)")
print("="*80)

crosstab_row_pct = pd.crosstab(
    community_df['population_group'],
    community_df['community_type'],
    normalize='index'
) * 100

crosstab_row_pct.columns = [community_types.get(col, col) for col in crosstab_row_pct.columns]
print(crosstab_row_pct.round(2).to_string())

# Column percentages (within each community type, what % is each population group)
print("\n" + "="*80)
print("COLUMN PERCENTAGES - Composition of Each Community Type by Population Group")
print("(Within each community type, what % belongs to each population group)")
print("="*80)

crosstab_col_pct = pd.crosstab(
    community_df['population_group'],
    community_df['community_type'],
    normalize='columns'
) * 100

crosstab_col_pct.columns = [community_types.get(col, col) for col in crosstab_col_pct.columns]
print(crosstab_col_pct.round(2).to_string())

# Create comprehensive results dataframe
results = []

for pop_group in sorted(community_df['population_group'].unique()):
    group_data = community_df[community_df['population_group'] == pop_group]

    row = {
        'Population Group': pop_group,
        'Total N': len(group_data),
        'Total %': (len(group_data) / len(community_df)) * 100
    }

    # Add distribution across community types
    for thai_name, eng_name in community_types.items():
        comm_count = len(group_data[group_data['community_type'] == thai_name])
        row[f'{eng_name} N'] = comm_count
        row[f'{eng_name} %'] = (comm_count / len(group_data)) * 100 if len(group_data) > 0 else 0

    results.append(row)

results_df = pd.DataFrame(results)

# Save to CSV
results_df.to_csv('population_group_by_community_distribution.csv', index=False, encoding='utf-8-sig')

# Save crosstabs
crosstab_counts.to_csv('crosstab_population_community_counts.csv', encoding='utf-8-sig')
crosstab_row_pct.to_csv('crosstab_population_community_row_pct.csv', encoding='utf-8-sig')
crosstab_col_pct.to_csv('crosstab_population_community_col_pct.csv', encoding='utf-8-sig')

# Key findings
print("\n" + "="*80)
print("KEY FINDINGS")
print("="*80)

# Find which community type has highest concentration of each vulnerable group
print("\nHighest Concentrations of Vulnerable Groups:")

for pop_group in ['Disabled', 'Elderly', 'Informal Workers', 'LGBTQ+']:
    group_data = community_df[community_df['population_group'] == pop_group]

    comm_dist = []
    for thai_name, eng_name in community_types.items():
        count = len(group_data[group_data['community_type'] == thai_name])
        pct = (count / len(group_data)) * 100 if len(group_data) > 0 else 0
        comm_dist.append((eng_name, count, pct))

    # Sort by percentage
    comm_dist.sort(key=lambda x: x[2], reverse=True)

    print(f"\n{pop_group} (N={len(group_data)}):")
    print(f"  Highest: {comm_dist[0][0]} - {comm_dist[0][1]} people ({comm_dist[0][2]:.1f}%)")
    print(f"  Lowest:  {comm_dist[-1][0]} - {comm_dist[-1][1]} people ({comm_dist[-1][2]:.1f}%)")

# Find which community type has highest % of vulnerable residents
print("\n" + "="*80)
print("Community Types with Highest Vulnerable Population Shares:")
print("="*80)

for thai_name, eng_name in community_types.items():
    comm_data = community_df[community_df['community_type'] == thai_name]

    vulnerable_groups = ['Disabled', 'Elderly', 'Informal Workers', 'LGBTQ+']
    vulnerable_count = len(comm_data[comm_data['population_group'].isin(vulnerable_groups)])
    vulnerable_pct = (vulnerable_count / len(comm_data)) * 100 if len(comm_data) > 0 else 0

    print(f"\n{eng_name} (N={len(comm_data)}):")
    print(f"  Vulnerable Groups: {vulnerable_count} people ({vulnerable_pct:.1f}%)")

    # Breakdown by group
    for group in vulnerable_groups:
        group_count = len(comm_data[comm_data['population_group'] == group])
        group_pct = (group_count / len(comm_data)) * 100 if len(comm_data) > 0 else 0
        print(f"    - {group}: {group_count} ({group_pct:.1f}%)")

# Age distribution by community type
print("\n" + "="*80)
print("AGE DISTRIBUTION BY COMMUNITY TYPE")
print("="*80)

for thai_name, eng_name in community_types.items():
    comm_data = community_df[community_df['community_type'] == thai_name]

    if len(comm_data) > 0:
        print(f"\n{eng_name}:")
        print(f"  Mean Age: {comm_data['age'].mean():.1f} years")
        print(f"  Median Age: {comm_data['age'].median():.1f} years")
        print(f"  Age Range: {comm_data['age'].min():.0f} - {comm_data['age'].max():.0f} years")
        print(f"  Children (<15): {len(comm_data[comm_data['age'] < 15])} ({len(comm_data[comm_data['age'] < 15])/len(comm_data)*100:.1f}%)")
        print(f"  Working Age (15-60): {len(comm_data[(comm_data['age'] >= 15) & (comm_data['age'] < 60)])} ({len(comm_data[(comm_data['age'] >= 15) & (comm_data['age'] < 60)])/len(comm_data)*100:.1f}%)")
        print(f"  Elderly (60+): {len(comm_data[comm_data['age'] >= 60])} ({len(comm_data[comm_data['age'] >= 60])/len(comm_data)*100:.1f}%)")

print("\n" + "="*80)
print("FILES SAVED:")
print("  - population_group_by_community_distribution.csv")
print("  - crosstab_population_community_counts.csv")
print("  - crosstab_population_community_row_pct.csv")
print("  - crosstab_population_community_col_pct.csv")
print("="*80)
