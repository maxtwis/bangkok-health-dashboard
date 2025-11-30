#!/usr/bin/env python3
"""
Discrimination Types Analysis
Breaks down discrimination by specific types for each population group

Types:
1 = Race/Ethnicity (เชื้อชาติ)
2 = Religion (ศาสนา)
3 = Gender (เพศ)
4 = Age (อายุ)
5 = Economic status (สถานะทางเศรษฐกิจ)
"""

import pandas as pd
import numpy as np
from scipy import stats

def load_data():
    """Load and prepare the survey data"""
    df = pd.read_csv('public/data/survey_sampling.csv')
    print(f"Loaded {len(df)} records\n")
    return df

def classify_populations(df):
    """Classify respondents into population groups"""
    df['population_group'] = 'general'

    informal_mask = (df['occupation_status'] == 1) & (df['occupation_contract'] == 0)
    df.loc[informal_mask, 'population_group'] = 'informal'

    disabled_mask = df['disable_status'] == 1
    df.loc[disabled_mask, 'population_group'] = 'disabled'

    elderly_mask = df['age'] >= 60
    df.loc[elderly_mask, 'population_group'] = 'elderly'

    lgbt_mask = df['sex'] == 'lgbt'
    df.loc[lgbt_mask, 'population_group'] = 'lgbt'

    return df

def analyze_discrimination_types(df):
    """Analyze discrimination by type for each population group"""
    print("=" * 80)
    print("DISCRIMINATION BY TYPE ANALYSIS")
    print("=" * 80)
    print("\n")

    groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']

    discrimination_types = {
        'discrimination_1': 'Race/Ethnicity',
        'discrimination_2': 'Religion',
        'discrimination_3': 'Gender',
        'discrimination_4': 'Age',
        'discrimination_5': 'Economic Status'
    }

    # Store results for table
    results = []

    for group in groups:
        group_df = df[df['population_group'] == group]

        print(f"{group.upper()}:")
        print("-" * 80)

        group_results = {'group': group}

        for disc_col, disc_name in discrimination_types.items():
            valid = group_df[group_df[disc_col].notna()]

            if len(valid) < 30:
                print(f"  {disc_name:20} Insufficient data (n={len(valid)})")
                group_results[disc_name] = np.nan
                continue

            rate = (valid[disc_col] == 1).mean() * 100
            n = len(valid)

            print(f"  {disc_name:20} {rate:6.1f}% (n={n:,})")
            group_results[disc_name] = rate

        # Calculate any discrimination
        any_disc = (
            (group_df['discrimination_1'] == 1) |
            (group_df['discrimination_2'] == 1) |
            (group_df['discrimination_3'] == 1) |
            (group_df['discrimination_4'] == 1) |
            (group_df['discrimination_5'] == 1)
        )
        any_disc_rate = any_disc.mean() * 100
        print(f"  {'ANY Discrimination':20} {any_disc_rate:6.1f}%")
        group_results['Any'] = any_disc_rate

        results.append(group_results)
        print()

    # Create comparison table
    print("\n" + "=" * 80)
    print("DISCRIMINATION TYPES COMPARISON TABLE")
    print("=" * 80)
    print("\n")

    print("| Population Group | Race/Ethnicity | Religion | Gender | Age | Economic Status | ANY |")
    print("|---|---|---|---|---|---|---|")

    for r in results:
        group_name = r['group'].upper()
        race = f"{r.get('Race/Ethnicity', 0):.1f}%" if not pd.isna(r.get('Race/Ethnicity')) else "n/a"
        religion = f"{r.get('Religion', 0):.1f}%" if not pd.isna(r.get('Religion')) else "n/a"
        gender = f"{r.get('Gender', 0):.1f}%" if not pd.isna(r.get('Gender')) else "n/a"
        age = f"{r.get('Age', 0):.1f}%" if not pd.isna(r.get('Age')) else "n/a"
        economic = f"{r.get('Economic Status', 0):.1f}%" if not pd.isna(r.get('Economic Status')) else "n/a"
        any_disc = f"{r.get('Any', 0):.1f}%"

        print(f"| **{group_name}** | {race} | {religion} | {gender} | {age} | {economic} | **{any_disc}** |")

    print("\n" + "=" * 80)
    print("\nKEY PATTERNS:")
    print("=" * 80)

    # Find highest rates for each type
    print("\nHighest rates by discrimination type:")
    for disc_col, disc_name in discrimination_types.items():
        rates = [(r['group'], r.get(disc_name, 0)) for r in results if not pd.isna(r.get(disc_name))]
        if rates:
            highest = max(rates, key=lambda x: x[1])
            print(f"  {disc_name:20} {highest[0].upper()} ({highest[1]:.1f}%)")

    # LGBT+ specific patterns
    lgbt_results = next((r for r in results if r['group'] == 'lgbt'), None)
    if lgbt_results:
        print(f"\nLGBT+ discrimination breakdown (n=685):")
        for disc_col, disc_name in discrimination_types.items():
            rate = lgbt_results.get(disc_name)
            if not pd.isna(rate):
                print(f"  {disc_name:20} {rate:6.1f}%")

    print("\n" + "=" * 80 + "\n")

def main():
    """Run discrimination types analysis"""
    df = load_data()
    df = classify_populations(df)
    analyze_discrimination_types(df)

if __name__ == "__main__":
    main()
