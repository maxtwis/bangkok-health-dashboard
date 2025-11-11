#!/usr/bin/env python3
"""
Pollution Health and Housing Analysis
Tests if air pollution exposure (community_disaster_8) correlates with health symptoms (health_pollution)
and whether housing conditions (overcrowding, tenure) affect vulnerability to pollution health impacts

Research Questions:
1. Do people who experienced air pollution disasters report more health symptoms?
2. Does overcrowding increase pollution health symptoms?
3. Does housing tenure (rent vs own) affect pollution health symptoms?
4. Does the combination matter (e.g., renters in overcrowded housing)?
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

def calculate_indicators(df):
    """Calculate pollution health and exposure indicators"""
    # Air pollution disaster exposure (community_disaster_8)
    df['air_pollution_disaster'] = df['community_disaster_8'].apply(
        lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
    )

    # Health symptoms from air pollution (health_pollution)
    # Question: In past 12 months, experienced health impacts from air pollution? (cough, sneeze, nosebleed)
    df['pollution_health_symptoms'] = df['health_pollution'].apply(
        lambda x: 1 if x == 1 else (0 if x == 0 else np.nan)
    )

    # Housing tenure
    df['owns_house'] = df['house_status'].apply(
        lambda x: 1 if x == 1 else (0 if x == 2 else np.nan)
    )

    # Overcrowding (community_environment_1 OR community_environment_2)
    df['overcrowded'] = (
        (df['community_environment_1'] == 1) |
        (df['community_environment_2'] == 1)
    ).astype(int)
    df.loc[df['community_environment_1'].isna() & df['community_environment_2'].isna(), 'overcrowded'] = np.nan

    return df

def analyze_pollution_disaster_vs_health(df):
    """Q1: Do people who experienced air pollution report more health symptoms?"""
    print("=" * 80)
    print("QUESTION 1: Air Pollution Disaster Exposure vs Health Symptoms")
    print("=" * 80)
    print("Testing: Do people who faced air pollution (PM2.5/dust) report more symptoms?\n")

    for group in ['general', 'elderly', 'disabled', 'lgbt', 'informal']:
        group_df = df[df['population_group'] == group].copy()

        # Filter for valid data
        valid_mask = (
            group_df['air_pollution_disaster'].notna() &
            group_df['pollution_health_symptoms'].notna()
        )
        analysis_df = group_df[valid_mask]

        if len(analysis_df) < 30:
            print(f"\n{group.upper()}: Insufficient data (n={len(analysis_df)})")
            continue

        # Calculate rates by disaster exposure
        disaster_yes = analysis_df[analysis_df['air_pollution_disaster'] == 1]
        disaster_no = analysis_df[analysis_df['air_pollution_disaster'] == 0]

        yes_rate = disaster_yes['pollution_health_symptoms'].mean() * 100
        no_rate = disaster_no['pollution_health_symptoms'].mean() * 100

        # Point-biserial correlation
        correlation, p_value = stats.pointbiserialr(
            analysis_df['air_pollution_disaster'],
            analysis_df['pollution_health_symptoms']
        )

        # Chi-square test
        contingency = pd.crosstab(
            analysis_df['air_pollution_disaster'],
            analysis_df['pollution_health_symptoms']
        )
        chi2, chi_p, dof, expected = stats.chi2_contingency(contingency)

        print(f"\n{group.upper()}:")
        print(f"  Experienced air pollution: {yes_rate:.1f}% report symptoms (n={len(disaster_yes)})")
        print(f"  No air pollution:          {no_rate:.1f}% report symptoms (n={len(disaster_no)})")
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

def analyze_overcrowding_effect(df):
    """Q2: Does overcrowding increase pollution health symptoms?"""
    print("=" * 80)
    print("QUESTION 2: Overcrowding Effect on Pollution Health Symptoms")
    print("=" * 80)
    print("Testing: Do people in overcrowded housing report more pollution symptoms?\n")

    for group in ['general', 'elderly', 'disabled', 'lgbt', 'informal']:
        group_df = df[df['population_group'] == group].copy()

        # Filter for valid data
        valid_mask = (
            group_df['overcrowded'].notna() &
            group_df['pollution_health_symptoms'].notna()
        )
        analysis_df = group_df[valid_mask]

        if len(analysis_df) < 30:
            print(f"\n{group.upper()}: Insufficient data (n={len(analysis_df)})")
            continue

        # Calculate rates by overcrowding
        overcrowded = analysis_df[analysis_df['overcrowded'] == 1]
        not_overcrowded = analysis_df[analysis_df['overcrowded'] == 0]

        overcrowded_rate = overcrowded['pollution_health_symptoms'].mean() * 100
        not_overcrowded_rate = not_overcrowded['pollution_health_symptoms'].mean() * 100

        # Chi-square test
        contingency = pd.crosstab(
            analysis_df['overcrowded'],
            analysis_df['pollution_health_symptoms']
        )
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

        print(f"\n{group.upper()}:")
        print(f"  Overcrowded housing:     {overcrowded_rate:.1f}% report symptoms (n={len(overcrowded)})")
        print(f"  Not overcrowded:         {not_overcrowded_rate:.1f}% report symptoms (n={len(not_overcrowded)})")
        print(f"  Difference: {overcrowded_rate - not_overcrowded_rate:+.1f} percentage points")
        print(f"  Chi-square test: X2={chi2:.3f}, p={p_value:.4f}", end="")
        if p_value < 0.001:
            print(" ***")
        elif p_value < 0.05:
            print(" *")
        else:
            print(" (not significant)")

    print("\n" + "=" * 80 + "\n")

def analyze_housing_tenure_effect(df):
    """Q3: Does housing tenure affect pollution health symptoms?"""
    print("=" * 80)
    print("QUESTION 3: Housing Tenure Effect on Pollution Health Symptoms")
    print("=" * 80)
    print("Testing: Do renters report more pollution symptoms than homeowners?\n")

    for group in ['general', 'elderly', 'disabled', 'lgbt', 'informal']:
        group_df = df[df['population_group'] == group].copy()

        # Filter for valid data
        valid_mask = (
            group_df['owns_house'].notna() &
            group_df['pollution_health_symptoms'].notna()
        )
        analysis_df = group_df[valid_mask]

        if len(analysis_df) < 30:
            print(f"\n{group.upper()}: Insufficient data (n={len(analysis_df)})")
            continue

        # Calculate rates by tenure
        owners = analysis_df[analysis_df['owns_house'] == 1]
        renters = analysis_df[analysis_df['owns_house'] == 0]

        owner_rate = owners['pollution_health_symptoms'].mean() * 100
        renter_rate = renters['pollution_health_symptoms'].mean() * 100

        # Chi-square test
        contingency = pd.crosstab(
            analysis_df['owns_house'],
            analysis_df['pollution_health_symptoms']
        )
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

        print(f"\n{group.upper()}:")
        print(f"  Homeowners: {owner_rate:.1f}% report symptoms (n={len(owners)})")
        print(f"  Renters:    {renter_rate:.1f}% report symptoms (n={len(renters)})")
        print(f"  Difference: {renter_rate - owner_rate:+.1f} percentage points")
        print(f"  Chi-square test: X2={chi2:.3f}, p={p_value:.4f}", end="")
        if p_value < 0.001:
            print(" ***")
        elif p_value < 0.05:
            print(" *")
        else:
            print(" (not significant)")

    print("\n" + "=" * 80 + "\n")

def analyze_combined_effects(df):
    """Q4: Combined effects of housing conditions"""
    print("=" * 80)
    print("QUESTION 4: Combined Housing Conditions Effect")
    print("=" * 80)
    print("Testing: Does combination of renting + overcrowding increase symptoms?\n")

    for group in ['general', 'elderly', 'disabled', 'lgbt', 'informal']:
        group_df = df[df['population_group'] == group].copy()

        # Filter for valid data
        valid_mask = (
            group_df['owns_house'].notna() &
            group_df['overcrowded'].notna() &
            group_df['pollution_health_symptoms'].notna()
        )
        analysis_df = group_df[valid_mask]

        if len(analysis_df) < 30:
            print(f"\n{group.upper()}: Insufficient data (n={len(analysis_df)})")
            continue

        # Create categories
        own_not_crowded = analysis_df[(analysis_df['owns_house'] == 1) & (analysis_df['overcrowded'] == 0)]
        own_crowded = analysis_df[(analysis_df['owns_house'] == 1) & (analysis_df['overcrowded'] == 1)]
        rent_not_crowded = analysis_df[(analysis_df['owns_house'] == 0) & (analysis_df['overcrowded'] == 0)]
        rent_crowded = analysis_df[(analysis_df['owns_house'] == 0) & (analysis_df['overcrowded'] == 1)]

        if len(own_not_crowded) < 10 or len(rent_crowded) < 10:
            print(f"\n{group.upper()}: Insufficient data for combined analysis")
            continue

        rate1 = own_not_crowded['pollution_health_symptoms'].mean() * 100
        rate2 = own_crowded['pollution_health_symptoms'].mean() * 100
        rate3 = rent_not_crowded['pollution_health_symptoms'].mean() * 100
        rate4 = rent_crowded['pollution_health_symptoms'].mean() * 100

        print(f"\n{group.upper()}:")
        print(f"  Own + Not crowded: {rate1:.1f}% (n={len(own_not_crowded)})")
        print(f"  Own + Crowded:     {rate2:.1f}% (n={len(own_crowded)})")
        print(f"  Rent + Not crowded:{rate3:.1f}% (n={len(rent_not_crowded)})")
        print(f"  Rent + Crowded:    {rate4:.1f}% (n={len(rent_crowded)})")
        print(f"  Worst vs Best: {max(rate1,rate2,rate3,rate4) - min(rate1,rate2,rate3,rate4):.1f} pp difference")

    print("\n" + "=" * 80 + "\n")

def analyze_among_pollution_exposed(df):
    """BONUS: Among those who experienced air pollution, what predicts symptoms?"""
    print("=" * 80)
    print("BONUS ANALYSIS: Among Air Pollution Exposed, What Predicts Symptoms?")
    print("=" * 80)
    print("Among people who experienced air pollution disasters, who reports symptoms?\n")

    for group in ['general', 'elderly', 'disabled', 'lgbt', 'informal']:
        group_df = df[df['population_group'] == group].copy()

        # Filter for those who experienced air pollution
        exposed = group_df[group_df['air_pollution_disaster'] == 1].copy()

        # Filter for valid housing data
        valid_mask = (
            exposed['owns_house'].notna() &
            exposed['overcrowded'].notna() &
            exposed['pollution_health_symptoms'].notna()
        )
        analysis_df = exposed[valid_mask]

        if len(analysis_df) < 30:
            print(f"\n{group.upper()}: Insufficient data (n={len(analysis_df)})")
            continue

        # Housing tenure among exposed
        owners = analysis_df[analysis_df['owns_house'] == 1]
        renters = analysis_df[analysis_df['owns_house'] == 0]

        owner_symptoms = owners['pollution_health_symptoms'].mean() * 100 if len(owners) > 0 else 0
        renter_symptoms = renters['pollution_health_symptoms'].mean() * 100 if len(renters) > 0 else 0

        # Overcrowding among exposed
        crowded = analysis_df[analysis_df['overcrowded'] == 1]
        not_crowded = analysis_df[analysis_df['overcrowded'] == 0]

        crowded_symptoms = crowded['pollution_health_symptoms'].mean() * 100 if len(crowded) > 0 else 0
        not_crowded_symptoms = not_crowded['pollution_health_symptoms'].mean() * 100 if len(not_crowded) > 0 else 0

        print(f"\n{group.upper()} (among air pollution exposed, n={len(analysis_df)}):")
        print(f"  Homeowners report symptoms: {owner_symptoms:.1f}% (n={len(owners)})")
        print(f"  Renters report symptoms:    {renter_symptoms:.1f}% (n={len(renters)})")
        print(f"  Tenure gap: {renter_symptoms - owner_symptoms:+.1f} pp")
        print(f"  ")
        print(f"  Overcrowded report symptoms:     {crowded_symptoms:.1f}% (n={len(crowded)})")
        print(f"  Not overcrowded report symptoms: {not_crowded_symptoms:.1f}% (n={len(not_crowded)})")
        print(f"  Overcrowding gap: {crowded_symptoms - not_crowded_symptoms:+.1f} pp")

    print("\n" + "=" * 80 + "\n")

def main():
    """Run all analyses"""
    print("\n" + "=" * 80)
    print("POLLUTION HEALTH AND HOUSING CONDITIONS ANALYSIS")
    print("=" * 80)
    print("\nResearch Focus: Testing if housing conditions affect vulnerability to")
    print("air pollution health impacts (cough, sneeze, nosebleed)\n")

    # Load and prepare data
    df = load_data()
    df = classify_populations(df)
    df = calculate_indicators(df)

    # Run analyses
    analyze_pollution_disaster_vs_health(df)
    analyze_overcrowding_effect(df)
    analyze_housing_tenure_effect(df)
    analyze_combined_effects(df)
    analyze_among_pollution_exposed(df)

    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print("\n1. Does air pollution exposure predict symptoms?")
    print("   -> Check correlation strength (r values) and gaps")
    print("\n2. Does overcrowding increase vulnerability?")
    print("   -> Compare overcrowded vs not overcrowded rates")
    print("\n3. Does rental housing provide less protection?")
    print("   -> Compare renter vs homeowner symptom rates")
    print("\n4. Combined effects matter?")
    print("   -> Check if rent+crowded has highest symptom rates")
    print("\nSignificance: *** p<0.001, * p<0.05")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
