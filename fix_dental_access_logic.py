"""
Fix Dental Access Logic Across All Analysis Files

INCORRECT LOGIC (current):
- If no oral health problem → dental_access = 1 (counts as "good access")
- If had problem and got treatment → dental_access = 1
- If had problem and no treatment → dental_access = 0
Result: ~90% access rate (inflated by people with no problems)

CORRECT LOGIC:
- Dental Access Rate = Among those who HAD oral health problems, what % got treatment?
- Exclude people with no problems from calculation
- If had problem (oral_health=1) and got treatment (oral_health_access=1) → 1
- If had problem (oral_health=1) and no treatment (oral_health_access=0) → 0
- If no problem (oral_health=0) → NaN (not included in denominator)
"""

import pandas as pd
import numpy as np

print("="*80)
print("ANALYZING DENTAL ACCESS - COMPARING OLD VS NEW LOGIC")
print("="*80)

# Test with community data
df = pd.read_csv('public/data/community_data.csv', encoding='utf-8-sig')

print(f"\nTotal respondents: {len(df)}")
print(f"Had oral health problem (oral_health=1): {len(df[df['oral_health']==1])} ({len(df[df['oral_health']==1])/len(df)*100:.1f}%)")
print(f"No oral health problem (oral_health=0): {len(df[df['oral_health']==0])} ({len(df[df['oral_health']==0])/len(df)*100:.1f}%)")

# Among those with problems
had_problem = df[df['oral_health'] == 1]
print(f"\nAmong {len(had_problem)} people with oral health problems:")
print(f"  Got treatment (oral_health_access=1): {len(had_problem[had_problem['oral_health_access']==1])} ({len(had_problem[had_problem['oral_health_access']==1])/len(had_problem)*100:.1f}%)")
print(f"  Didn't get treatment (oral_health_access=0): {len(had_problem[had_problem['oral_health_access']==0])} ({len(had_problem[had_problem['oral_health_access']==0])/len(had_problem)*100:.1f}%)")

# OLD LOGIC (incorrect)
df['dental_access_OLD'] = df.apply(
    lambda row: (1 if row.get('oral_health_access', 0) == 1 else 0) if row.get('oral_health', 0) == 1 else 1,
    axis=1
)

old_access_rate = (df['dental_access_OLD'].sum() / len(df)) * 100
print(f"\nOLD LOGIC (incorrect):")
print(f"  Dental Access Rate: {old_access_rate:.2f}%")
print(f"  Denominator: All {len(df)} respondents")
print(f"  Numerator: {df['dental_access_OLD'].sum()} (includes {len(df[df['oral_health']==0])} with no problems)")

# NEW LOGIC (correct)
df['dental_access_NEW'] = df.apply(
    lambda row: (1 if row.get('oral_health_access', 0) == 1 else 0) if row.get('oral_health', 0) == 1 else np.nan,
    axis=1
)

new_access_rate = (df['dental_access_NEW'].sum() / df['dental_access_NEW'].notna().sum()) * 100 if df['dental_access_NEW'].notna().sum() > 0 else np.nan
print(f"\nNEW LOGIC (correct):")
print(f"  Dental Access Rate: {new_access_rate:.2f}%")
print(f"  Denominator: {df['dental_access_NEW'].notna().sum()} respondents (only those with problems)")
print(f"  Numerator: {df['dental_access_NEW'].sum()} (got treatment)")

print(f"\n" + "="*80)
print(f"DIFFERENCE: {old_access_rate - new_access_rate:.2f} percentage points")
print(f"The OLD logic inflated access rate by including people with no problems!")
print("="*80)

# Test by community type
print("\n" + "="*80)
print("DENTAL ACCESS BY COMMUNITY TYPE - COMPARING METHODS")
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
    comm_df = df[df['community_type'] == thai_name]

    n_total = len(comm_df)
    n_had_problem = len(comm_df[comm_df['oral_health'] == 1])
    n_got_treatment = len(comm_df[(comm_df['oral_health'] == 1) & (comm_df['oral_health_access'] == 1)])

    old_rate = (comm_df['dental_access_OLD'].sum() / len(comm_df)) * 100 if len(comm_df) > 0 else np.nan
    new_rate = (n_got_treatment / n_had_problem) * 100 if n_had_problem > 0 else np.nan

    results.append({
        'Community Type': eng_name,
        'N Total': n_total,
        'N Had Problem': n_had_problem,
        'N Got Treatment': n_got_treatment,
        'OLD Rate (%)': old_rate,
        'NEW Rate (%)': new_rate,
        'Difference': old_rate - new_rate if pd.notna(new_rate) else np.nan
    })

results_df = pd.DataFrame(results)
print(results_df.to_string(index=False))

print("\n" + "="*80)
print("CONCLUSION:")
print("The dental access indicator should ONLY measure access among those")
print("who HAD oral health problems, not the entire population.")
print("Current ~90% rate is inflated because most people had no problems.")
print("="*80)
