"""
Check all columns used in the analysis for data type issues
"""
import pandas as pd
import numpy as np

df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
elderly = df[(df['age'] >= 60) & (df['disable_status'] != 1)]

print("="*80)
print("DATA TYPE CHECK FOR ALL INDICATORS")
print("="*80)

# List of columns used in analysis
columns_to_check = [
    # Economic Security
    'occupation_status', 'occupation_contract', 'occupation_welfare',
    'food_insecurity_1', 'food_insecurity_2', 'occupation_injury',
    'income_type', 'income', 'hh_health_expense',

    # Healthcare Access
    'welfare', 'medical_skip_1', 'oral_health', 'oral_health_access',

    # Physical Environment
    'house_status', 'community_environment_1', 'community_environment_2',
    'community_environment_3', 'community_environment_4', 'community_environment_5',
    'community_environment_6', 'community_disaster_1', 'health_pollution',
    'community_amenity_type_1', 'community_amenity_type_2',
    'community_amenity_type_3', 'community_amenity_type_4',

    # Social Context
    'community_safety', 'physical_violence', 'psychological_violence',
    'sexual_violence', 'discrimination_1', 'helper',

    # Health Behaviors
    'drink_status', 'smoke_status', 'exercise_status', 'height', 'weight',

    # Health Outcomes
    'diseases_status'
]

# Add disease types
for i in range(1, 22):
    columns_to_check.append(f'diseases_type_{i}')

print("\n" + "="*80)
print("COLUMN DATA TYPES AND UNIQUE VALUES")
print("="*80)

issues_found = []

for col in columns_to_check:
    if col in elderly.columns:
        dtype = elderly[col].dtype
        unique_vals = elderly[col].dropna().unique()
        n_unique = len(unique_vals)

        print(f"\n{col}:")
        print(f"  Type: {dtype}")
        print(f"  Unique values ({n_unique}): {sorted(unique_vals)[:20]}")  # Show first 20

        # Check for potential issues
        if dtype == 'object':
            # Check if it should be numeric
            try:
                numeric_vals = pd.to_numeric(elderly[col], errors='coerce')
                non_null_count = elderly[col].notna().sum()
                converted_count = numeric_vals.notna().sum()

                if converted_count > 0 and converted_count < non_null_count:
                    # Some values can't be converted - mixed types
                    issues_found.append({
                        'column': col,
                        'issue': 'Mixed numeric and non-numeric values',
                        'dtype': dtype,
                        'example_values': list(unique_vals[:10])
                    })
                    print(f"  ⚠️  WARNING: Mixed types detected!")
                elif converted_count == non_null_count and converted_count > 0:
                    # All values are numeric but stored as string
                    issues_found.append({
                        'column': col,
                        'issue': 'Numeric values stored as strings',
                        'dtype': dtype,
                        'example_values': list(unique_vals[:10])
                    })
                    print(f"  ⚠️  WARNING: Numeric values stored as strings!")
            except:
                pass

print("\n" + "="*80)
print("SUMMARY OF ISSUES FOUND")
print("="*80)

if issues_found:
    for i, issue in enumerate(issues_found, 1):
        print(f"\n{i}. {issue['column']}")
        print(f"   Issue: {issue['issue']}")
        print(f"   Current type: {issue['dtype']}")
        print(f"   Example values: {issue['example_values']}")
else:
    print("\nNo issues found - all data types are consistent!")

print("\n" + "="*80)
print("SPECIAL CHECK: Binary Indicators (should be 0/1)")
print("="*80)

binary_cols = [
    'occupation_status', 'occupation_contract', 'occupation_welfare',
    'food_insecurity_1', 'food_insecurity_2', 'occupation_injury',
    'medical_skip_1', 'oral_health', 'oral_health_access',
    'community_disaster_1', 'health_pollution',
    'physical_violence', 'psychological_violence', 'sexual_violence',
    'discrimination_1', 'helper', 'diseases_status'
]

for col in binary_cols:
    if col in elderly.columns:
        unique_vals = elderly[col].dropna().unique()
        if len(unique_vals) > 2:
            print(f"\n⚠️  {col}: Expected binary (0/1) but has {len(unique_vals)} unique values: {sorted(unique_vals)}")
        elif not all(v in [0, 1, '0', '1', 0.0, 1.0] for v in unique_vals):
            print(f"\n⚠️  {col}: Non-binary values found: {sorted(unique_vals)}")

print("\n" + "="*80)
print("CHECK COMPLETE")
print("="*80)
