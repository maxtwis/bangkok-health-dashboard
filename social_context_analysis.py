#!/usr/bin/env python3
"""
Social Context Domain Analysis
Analyzes community safety, violence, discrimination, and social support

Indicators:
1. community_safety: 4=Very safe, 3=Moderately safe, 2=Somewhat unsafe, 1=Unsafe
2. physical_violence: 0=Never, 1=Ever experienced
3. psychological_violence: 0=Never, 1=Ever experienced
4. sexual_violence: 0=Never, 1=Ever experienced
5. discrimination: 0=Never, 1=Race, 2=Religion, 3=Gender, 4=Age, 5=Economic status (multiple answers possible)
6. helper: 0=No emergency support, 1=Has friends/family for emergencies
"""

import pandas as pd
import numpy as np
from scipy import stats
import sys

def load_data():
    """Load and prepare the survey data"""
    try:
        df = pd.read_csv('public/data/survey_sampling.csv')
        print(f"Loaded {len(df)} records from survey_sampling.csv\n")
        return df
    except FileNotFoundError:
        print("Error: survey_sampling.csv not found")
        sys.exit(1)

def classify_populations(df):
    """Classify respondents into population groups with priority hierarchy"""
    df['population_group'] = 'general'

    # Priority hierarchy: LGBT+ -> Elderly -> Disabled -> Informal -> General
    informal_mask = (df['occupation_status'] == 1) & (df['occupation_contract'] == 0)
    df.loc[informal_mask, 'population_group'] = 'informal'

    disabled_mask = df['disable_status'] == 1
    df.loc[disabled_mask, 'population_group'] = 'disabled'

    elderly_mask = df['age'] >= 60
    df.loc[elderly_mask, 'population_group'] = 'elderly'

    lgbt_mask = df['sex'] == 'lgbt'
    df.loc[lgbt_mask, 'population_group'] = 'lgbt'

    return df

def calculate_safety_indicators(df):
    """Calculate community safety indicators"""
    # Community safety - convert to binary (safe vs unsafe)
    # 4=Very safe, 3=Moderately safe -> Safe (1)
    # 2=Somewhat unsafe, 1=Unsafe -> Unsafe (0)
    df['feels_safe'] = df['community_safety'].apply(
        lambda x: 1 if x >= 3 else (0 if x >= 1 else np.nan)
    )

    # Also keep ordinal version for more detailed analysis
    df['safety_score'] = df['community_safety'].apply(
        lambda x: x if pd.notna(x) and 1 <= x <= 4 else np.nan
    )

    return df

def calculate_violence_indicators(df):
    """Calculate violence exposure indicators"""
    # Physical violence
    df['physical_violence'] = df['physical_violence'].apply(
        lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
    )

    # Psychological violence
    df['psychological_violence'] = df['psychological_violence'].apply(
        lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
    )

    # Sexual violence
    df['sexual_violence'] = df['sexual_violence'].apply(
        lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
    )

    # Any violence (composite indicator)
    df['any_violence'] = (
        (df['physical_violence'] == 1) |
        (df['psychological_violence'] == 1) |
        (df['sexual_violence'] == 1)
    ).astype(float)
    df.loc[
        df['physical_violence'].isna() &
        df['psychological_violence'].isna() &
        df['sexual_violence'].isna(),
        'any_violence'
    ] = np.nan

    return df

def calculate_discrimination_indicators(df):
    """Calculate discrimination indicators"""
    # Discrimination stored in separate columns:
    # discrimination_0 = Never (1 if never, 0 if experienced)
    # discrimination_1 = Race/ethnicity
    # discrimination_2 = Religion
    # discrimination_3 = Gender
    # discrimination_4 = Age
    # discrimination_5 = Economic status

    # Any discrimination (binary)
    # If discrimination_0 == 1, then never experienced (0)
    # If any of 1-5 == 1, then experienced (1)
    df['any_discrimination'] = (
        (df['discrimination_1'] == 1) |
        (df['discrimination_2'] == 1) |
        (df['discrimination_3'] == 1) |
        (df['discrimination_4'] == 1) |
        (df['discrimination_5'] == 1)
    ).astype(float)

    # Mark as NaN if all discrimination columns are missing
    all_missing = (
        df['discrimination_0'].isna() &
        df['discrimination_1'].isna() &
        df['discrimination_2'].isna() &
        df['discrimination_3'].isna() &
        df['discrimination_4'].isna() &
        df['discrimination_5'].isna()
    )
    df.loc[all_missing, 'any_discrimination'] = np.nan

    # Specific types
    df['discrimination_race'] = df['discrimination_1'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))
    df['discrimination_religion'] = df['discrimination_2'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))
    df['discrimination_gender'] = df['discrimination_3'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))
    df['discrimination_age'] = df['discrimination_4'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))
    df['discrimination_economic'] = df['discrimination_5'].apply(lambda x: 1 if x == 1 else (0 if x == 0 else np.nan))

    return df

def calculate_social_support(df):
    """Calculate social support indicators"""
    # Helper/emergency support
    df['has_emergency_support'] = df['helper'].apply(
        lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
    )

    return df

def analyze_community_safety(df):
    """Analyze community safety by population group"""
    print("=" * 80)
    print("COMMUNITY SAFETY ANALYSIS")
    print("=" * 80)
    print("Question: How safe do different population groups feel?\n")

    groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']
    results = []

    for group in groups:
        group_df = df[df['population_group'] == group]

        # Filter for valid data
        valid = group_df[group_df['feels_safe'].notna()]

        if len(valid) < 30:
            print(f"{group.upper()}: Insufficient data (n={len(valid)})")
            continue

        safe_rate = valid['feels_safe'].mean() * 100
        n = len(valid)

        # Calculate mean safety score (1-4 scale)
        safety_scores = group_df[group_df['safety_score'].notna()]
        mean_score = safety_scores['safety_score'].mean()

        results.append({
            'group': group,
            'safe_rate': safe_rate,
            'n': n,
            'mean_score': mean_score
        })

        print(f"{group.upper()}:")
        print(f"  Feels safe (>=moderately): {safe_rate:.1f}% (n={n})")
        print(f"  Mean safety score (1-4):  {mean_score:.2f}")
        print()

    # Compare to general population
    general_rate = next((r['safe_rate'] for r in results if r['group'] == 'general'), None)
    if general_rate:
        print("\nComparison to General Population:")
        for r in results:
            if r['group'] != 'general':
                gap = r['safe_rate'] - general_rate

                # Chi-square test
                general_data = df[df['population_group'] == 'general']['feels_safe']
                group_data = df[df['population_group'] == r['group']]['feels_safe']

                contingency = pd.crosstab(
                    pd.Series(['general'] * len(general_data.dropna()) + [r['group']] * len(group_data.dropna())),
                    pd.concat([general_data.dropna(), group_data.dropna()])
                )

                if contingency.shape[0] > 1 and contingency.shape[1] > 1:
                    chi2, p_value, dof, expected = stats.chi2_contingency(contingency)
                    sig = "***" if p_value < 0.001 else ("*" if p_value < 0.05 else "ns")
                    print(f"  {r['group'].upper()}: {gap:+.1f} pp (p={p_value:.4f}) {sig}")

    print("\n" + "=" * 80 + "\n")
    return results

def analyze_violence(df):
    """Analyze violence exposure by population group"""
    print("=" * 80)
    print("VIOLENCE EXPOSURE ANALYSIS")
    print("=" * 80)
    print("Question: What are the rates of violence exposure?\n")

    groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']

    for violence_type in ['physical_violence', 'psychological_violence', 'sexual_violence', 'any_violence']:
        print(f"\n{violence_type.replace('_', ' ').upper()}:")
        print("-" * 80)

        results = []
        for group in groups:
            group_df = df[df['population_group'] == group]
            valid = group_df[group_df[violence_type].notna()]

            if len(valid) < 30:
                continue

            rate = valid[violence_type].mean() * 100
            n = len(valid)

            results.append({
                'group': group,
                'rate': rate,
                'n': n
            })

            print(f"  {group.upper():15} {rate:6.1f}% (n={n:,})")

        # Statistical comparison to general
        general_rate = next((r['rate'] for r in results if r['group'] == 'general'), None)
        if general_rate and len(results) > 1:
            print(f"\n  Gaps vs General ({general_rate:.1f}%):")
            for r in results:
                if r['group'] != 'general':
                    gap = r['rate'] - general_rate

                    # Chi-square test
                    general_data = df[df['population_group'] == 'general'][violence_type]
                    group_data = df[df['population_group'] == r['group']][violence_type]

                    contingency = pd.crosstab(
                        pd.Series(['general'] * len(general_data.dropna()) + [r['group']] * len(group_data.dropna())),
                        pd.concat([general_data.dropna(), group_data.dropna()])
                    )

                    if contingency.shape[0] > 1 and contingency.shape[1] > 1:
                        chi2, p_value, dof, expected = stats.chi2_contingency(contingency)
                        sig = "***" if p_value < 0.001 else ("*" if p_value < 0.05 else "ns")
                        print(f"    {r['group'].upper():15} {gap:+6.1f} pp (p={p_value:.4f}) {sig}")

    print("\n" + "=" * 80 + "\n")

def analyze_discrimination(df):
    """Analyze discrimination by population group"""
    print("=" * 80)
    print("DISCRIMINATION ANALYSIS")
    print("=" * 80)
    print("Question: What are the rates of discrimination?\n")

    groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']
    results = []

    for group in groups:
        group_df = df[df['population_group'] == group]
        valid = group_df[group_df['any_discrimination'].notna()]

        if len(valid) < 30:
            print(f"{group.upper()}: Insufficient data (n={len(valid)})")
            continue

        rate = valid['any_discrimination'].mean() * 100
        n = len(valid)

        results.append({
            'group': group,
            'rate': rate,
            'n': n
        })

        print(f"{group.upper()}:")
        print(f"  Experienced discrimination: {rate:.1f}% (n={n:,})")

    # Statistical comparison
    general_rate = next((r['rate'] for r in results if r['group'] == 'general'), None)
    if general_rate and len(results) > 1:
        print(f"\nGaps vs General ({general_rate:.1f}%):")
        for r in results:
            if r['group'] != 'general':
                gap = r['rate'] - general_rate

                # Chi-square test
                general_data = df[df['population_group'] == 'general']['any_discrimination']
                group_data = df[df['population_group'] == r['group']]['any_discrimination']

                contingency = pd.crosstab(
                    pd.Series(['general'] * len(general_data.dropna()) + [r['group']] * len(group_data.dropna())),
                    pd.concat([general_data.dropna(), group_data.dropna()])
                )

                if contingency.shape[0] > 1 and contingency.shape[1] > 1:
                    chi2, p_value, dof, expected = stats.chi2_contingency(contingency)
                    sig = "***" if p_value < 0.001 else ("*" if p_value < 0.05 else "ns")
                    print(f"  {r['group'].upper()}: {gap:+.1f} pp (p={p_value:.4f}) {sig}")

    print("\n" + "=" * 80 + "\n")

def analyze_social_support(df):
    """Analyze emergency social support by population group"""
    print("=" * 80)
    print("EMERGENCY SOCIAL SUPPORT ANALYSIS")
    print("=" * 80)
    print("Question: Who has friends/family to rely on in emergencies?\n")

    groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']
    results = []

    for group in groups:
        group_df = df[df['population_group'] == group]
        valid = group_df[group_df['has_emergency_support'].notna()]

        if len(valid) < 30:
            print(f"{group.upper()}: Insufficient data (n={len(valid)})")
            continue

        rate = valid['has_emergency_support'].mean() * 100
        n = len(valid)

        results.append({
            'group': group,
            'rate': rate,
            'n': n
        })

        print(f"{group.upper()}:")
        print(f"  Has emergency support: {rate:.1f}% (n={n:,})")

    # Statistical comparison
    general_rate = next((r['rate'] for r in results if r['group'] == 'general'), None)
    if general_rate and len(results) > 1:
        print(f"\nGaps vs General ({general_rate:.1f}%):")
        for r in results:
            if r['group'] != 'general':
                gap = r['rate'] - general_rate

                # Chi-square test
                general_data = df[df['population_group'] == 'general']['has_emergency_support']
                group_data = df[df['population_group'] == r['group']]['has_emergency_support']

                contingency = pd.crosstab(
                    pd.Series(['general'] * len(general_data.dropna()) + [r['group']] * len(group_data.dropna())),
                    pd.concat([general_data.dropna(), group_data.dropna()])
                )

                if contingency.shape[0] > 1 and contingency.shape[1] > 1:
                    chi2, p_value, dof, expected = stats.chi2_contingency(contingency)
                    sig = "***" if p_value < 0.001 else ("*" if p_value < 0.05 else "ns")
                    print(f"  {r['group'].upper()}: {gap:+.1f} pp (p={p_value:.4f}) {sig}")

    print("\n" + "=" * 80 + "\n")

def main():
    """Run all social context analyses"""
    print("\n" + "=" * 80)
    print("SOCIAL CONTEXT DOMAIN ANALYSIS")
    print("=" * 80)
    print("\nAnalyzing: Community Safety, Violence, Discrimination, Social Support\n")

    # Load and prepare data
    df = load_data()
    df = classify_populations(df)
    df = calculate_safety_indicators(df)
    df = calculate_violence_indicators(df)
    df = calculate_discrimination_indicators(df)
    df = calculate_social_support(df)

    # Run analyses
    analyze_community_safety(df)
    analyze_violence(df)
    analyze_discrimination(df)
    analyze_social_support(df)

    print("=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80)
    print("\nSignificance levels: *** p<0.001, * p<0.05, ns = not significant\n")

if __name__ == "__main__":
    main()
