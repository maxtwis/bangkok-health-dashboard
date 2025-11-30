#!/usr/bin/env python3
"""
Pollution-Related Health Cross-Variable Analysis
Tests hypotheses for why elderly/disabled/informal report LOWER pollution health than general population

Hypotheses to test:
1. Income effect: Lower income → less awareness/attribution of health problems to pollution
2. Education effect: Lower education → less health literacy about pollution health impacts
3. Housing tenure effect: Homeownership vs renting affects location/exposure patterns
4. Disaster-health correlation: Pollution disaster exposure vs pollution health problems
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
    # Initialize all as general population
    df['population_group'] = 'general'

    # Priority hierarchy: LGBT+ → Elderly → Disabled → Informal → General
    # Informal workers: employed (occupation_status=1) AND no contract (occupation_contract=0)
    informal_mask = (df['occupation_status'] == 1) & (df['occupation_contract'] == 0)
    df.loc[informal_mask, 'population_group'] = 'informal'

    # Disabled: disable_status = 1
    disabled_mask = df['disable_status'] == 1
    df.loc[disabled_mask, 'population_group'] = 'disabled'

    # Elderly: age >= 60
    elderly_mask = df['age'] >= 60
    df.loc[elderly_mask, 'population_group'] = 'elderly'

    # LGBT+: sex = 3
    lgbt_mask = df['sex'] == 3
    df.loc[lgbt_mask, 'population_group'] = 'lgbt'

    return df

def get_monthly_income(row):
    """Convert income to monthly equivalent"""
    if pd.isna(row['income']) or pd.isna(row['income_type']):
        return np.nan
    if row['income_type'] == 1:  # Daily wage
        return row['income'] * 30
    elif row['income_type'] == 2:  # Monthly salary
        return row['income']
    else:
        return np.nan

def calculate_pollution_health(df):
    """Calculate pollution-related health problems indicator"""
    # health_pollution = 1 means pollution-related health problems
    df['pollution_health'] = df['health_pollution'].apply(
        lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
    )
    return df

def calculate_pollution_disaster(df):
    """Calculate pollution disaster exposure (community_disaster_8)"""
    df['pollution_disaster'] = df['community_disaster_8'].apply(
        lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
    )
    return df

def analyze_by_income(df):
    """Hypothesis 1: Income affects pollution health awareness"""
    print("=" * 80)
    print("HYPOTHESIS 1: Income Effect on Pollution Health Awareness")
    print("=" * 80)
    print("Theory: Lower income -> less awareness/attribution of health problems to pollution\n")

    # Calculate monthly income
    df['monthly_income'] = df.apply(get_monthly_income, axis=1)
    df['low_income'] = (df['monthly_income'] < 10000).astype(float)
    df.loc[df['monthly_income'].isna(), 'low_income'] = np.nan

    for group in ['general', 'elderly', 'disabled', 'informal']:
        group_df = df[df['population_group'] == group].copy()

        # Filter for valid data
        valid_mask = group_df['pollution_health'].notna() & group_df['low_income'].notna()
        analysis_df = group_df[valid_mask]

        if len(analysis_df) < 30:
            print(f"\n{group.upper()}: Insufficient data (n={len(analysis_df)})")
            continue

        # Calculate rates by income level
        low_income_df = analysis_df[analysis_df['low_income'] == 1]
        high_income_df = analysis_df[analysis_df['low_income'] == 0]

        low_rate = low_income_df['pollution_health'].mean() * 100
        high_rate = high_income_df['pollution_health'].mean() * 100

        # Chi-square test
        contingency = pd.crosstab(analysis_df['low_income'], analysis_df['pollution_health'])
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

        print(f"\n{group.upper()}:")
        print(f"  Low income (<10K):  {low_rate:.1f}% (n={len(low_income_df)})")
        print(f"  High income (>=10K): {high_rate:.1f}% (n={len(high_income_df)})")
        print(f"  Difference: {low_rate - high_rate:+.1f} percentage points")
        print(f"  Chi-square test: X2={chi2:.3f}, p={p_value:.4f}", end="")
        if p_value < 0.001:
            print(" ***")
        elif p_value < 0.05:
            print(" *")
        else:
            print(" (not significant)")

    print("\n" + "=" * 80 + "\n")

def analyze_by_education(df):
    """Hypothesis 2: Education affects health literacy about pollution"""
    print("=" * 80)
    print("HYPOTHESIS 2: Education Effect on Pollution Health Literacy")
    print("=" * 80)
    print("Theory: Lower education -> less understanding of pollution health impacts\n")

    # Education levels: 1=Primary or less, 2=Secondary, 3=Vocational, 4=Bachelor+
    df['low_education'] = (df['education'] <= 2).astype(float)
    df.loc[df['education'].isna(), 'low_education'] = np.nan

    for group in ['general', 'elderly', 'disabled', 'informal']:
        group_df = df[df['population_group'] == group].copy()

        # Filter for valid data
        valid_mask = group_df['pollution_health'].notna() & group_df['low_education'].notna()
        analysis_df = group_df[valid_mask]

        if len(analysis_df) < 30:
            print(f"\n{group.upper()}: Insufficient data (n={len(analysis_df)})")
            continue

        # Calculate rates by education level
        low_edu_df = analysis_df[analysis_df['low_education'] == 1]
        high_edu_df = analysis_df[analysis_df['low_education'] == 0]

        low_rate = low_edu_df['pollution_health'].mean() * 100
        high_rate = high_edu_df['pollution_health'].mean() * 100

        # Chi-square test
        contingency = pd.crosstab(analysis_df['low_education'], analysis_df['pollution_health'])
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

        print(f"\n{group.upper()}:")
        print(f"  Low education (<=Secondary):  {low_rate:.1f}% (n={len(low_edu_df)})")
        print(f"  High education (>Secondary): {high_rate:.1f}% (n={len(high_edu_df)})")
        print(f"  Difference: {low_rate - high_rate:+.1f} percentage points")
        print(f"  Chi-square test: X2={chi2:.3f}, p={p_value:.4f}", end="")
        if p_value < 0.001:
            print(" ***")
        elif p_value < 0.05:
            print(" *")
        else:
            print(" (not significant)")

    print("\n" + "=" * 80 + "\n")

def analyze_by_housing(df):
    """Hypothesis 3: Housing tenure indicates location/exposure differences"""
    print("=" * 80)
    print("HYPOTHESIS 3: Housing Tenure Effect on Pollution Health")
    print("=" * 80)
    print("Theory: Homeowners vs renters live in different locations with different exposure\n")

    # house_status: 1=Own, 2=Rent
    df['own_house'] = df['house_status'].apply(
        lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
    )

    for group in ['general', 'elderly', 'disabled', 'informal']:
        group_df = df[df['population_group'] == group].copy()

        # Filter for valid data
        valid_mask = group_df['pollution_health'].notna() & group_df['own_house'].notna()
        analysis_df = group_df[valid_mask]

        if len(analysis_df) < 30:
            print(f"\n{group.upper()}: Insufficient data (n={len(analysis_df)})")
            continue

        # Calculate rates by housing tenure
        own_df = analysis_df[analysis_df['own_house'] == 1]
        rent_df = analysis_df[analysis_df['own_house'] == 0]

        own_rate = own_df['pollution_health'].mean() * 100
        rent_rate = rent_df['pollution_health'].mean() * 100

        # Chi-square test
        contingency = pd.crosstab(analysis_df['own_house'], analysis_df['pollution_health'])
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

        print(f"\n{group.upper()}:")
        print(f"  Homeowners: {own_rate:.1f}% (n={len(own_df)})")
        print(f"  Renters:    {rent_rate:.1f}% (n={len(rent_df)})")
        print(f"  Difference: {own_rate - rent_rate:+.1f} percentage points")
        print(f"  Chi-square test: X2={chi2:.3f}, p={p_value:.4f}", end="")
        if p_value < 0.001:
            print(" ***")
        elif p_value < 0.05:
            print(" *")
        else:
            print(" (not significant)")

    print("\n" + "=" * 80 + "\n")

def analyze_disaster_health_correlation(df):
    """Hypothesis 4: Correlation between pollution disaster and pollution health"""
    print("=" * 80)
    print("HYPOTHESIS 4: Pollution Disaster vs Pollution Health Correlation")
    print("=" * 80)
    print("Theory: Pollution disaster exposure should correlate with pollution health problems\n")

    for group in ['general', 'elderly', 'disabled', 'informal']:
        group_df = df[df['population_group'] == group].copy()

        # Filter for valid data
        valid_mask = group_df['pollution_health'].notna() & group_df['pollution_disaster'].notna()
        analysis_df = group_df[valid_mask]

        if len(analysis_df) < 30:
            print(f"\n{group.upper()}: Insufficient data (n={len(analysis_df)})")
            continue

        # Calculate rates
        disaster_yes = analysis_df[analysis_df['pollution_disaster'] == 1]
        disaster_no = analysis_df[analysis_df['pollution_disaster'] == 0]

        yes_rate = disaster_yes['pollution_health'].mean() * 100
        no_rate = disaster_no['pollution_health'].mean() * 100

        # Point-biserial correlation
        correlation, p_value = stats.pointbiserialr(
            analysis_df['pollution_disaster'],
            analysis_df['pollution_health']
        )

        # Chi-square test
        contingency = pd.crosstab(analysis_df['pollution_disaster'], analysis_df['pollution_health'])
        chi2, chi_p, dof, expected = stats.chi2_contingency(contingency)

        print(f"\n{group.upper()}:")
        print(f"  Pollution disaster YES: {yes_rate:.1f}% report health problems (n={len(disaster_yes)})")
        print(f"  Pollution disaster NO:  {no_rate:.1f}% report health problems (n={len(disaster_no)})")
        print(f"  Difference: {yes_rate - no_rate:+.1f} percentage points")
        print(f"  Point-biserial correlation: r={correlation:.3f}, p={p_value:.4f}", end="")
        if p_value < 0.001:
            print(" ***")
        elif p_value < 0.05:
            print(" *")
        else:
            print(" (not significant)")
        print(f"  Chi-square test: X2={chi2:.3f}, p={chi_p:.4f}")

    print("\n" + "=" * 80 + "\n")

def main():
    """Run all cross-variable analyses"""
    print("\n" + "=" * 80)
    print("POLLUTION-RELATED HEALTH CROSS-VARIABLE ANALYSIS")
    print("=" * 80)
    print("\nTesting hypotheses for why elderly/disabled/informal report LOWER")
    print("pollution health problems than general population\n")

    # Load and prepare data
    df = load_data()
    df = classify_populations(df)
    df = calculate_pollution_health(df)
    df = calculate_pollution_disaster(df)

    # Run analyses
    analyze_by_income(df)
    analyze_by_education(df)
    analyze_by_housing(df)
    analyze_disaster_health_correlation(df)

    print("=" * 80)
    print("SUMMARY OF FINDINGS")
    print("=" * 80)
    print("\nCheck each hypothesis to determine which factors explain the lower")
    print("pollution health reporting in vulnerable populations:")
    print("\n1. Income effect: Do low-income groups report less pollution health?")
    print("2. Education effect: Does education affect health attribution?")
    print("3. Housing tenure: Do homeowners vs renters differ in exposure?")
    print("4. Disaster-health correlation: Is there disconnect between exposure and health?")
    print("\nSignificance levels: *** p<0.001, * p<0.05")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
