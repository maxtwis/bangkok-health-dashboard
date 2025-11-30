#!/usr/bin/env python3
"""
Discrimination/Violence and Substance Use Cross-Variable Analysis
Tests if discrimination and violence correlate with alcohol/smoking among LGBT+ and other groups

Research Questions:
1. Do LGBT+ who experience discrimination/violence have higher substance use?
2. Do LGBT+ who drink/smoke experience more discrimination/violence?
3. Are these patterns unique to LGBT+ or present in other groups?
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

def calculate_indicators(df):
    """Calculate all needed indicators"""
    # Violence
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

    # Discrimination
    df['any_discrimination'] = (
        (df['discrimination_1'] == 1) |
        (df['discrimination_2'] == 1) |
        (df['discrimination_3'] == 1) |
        (df['discrimination_4'] == 1) |
        (df['discrimination_5'] == 1)
    ).astype(float)

    all_missing = (
        df['discrimination_0'].isna() &
        df['discrimination_1'].isna() &
        df['discrimination_2'].isna() &
        df['discrimination_3'].isna() &
        df['discrimination_4'].isna() &
        df['discrimination_5'].isna()
    )
    df.loc[all_missing, 'any_discrimination'] = np.nan

    # Smoking (smoke_status: 1=current smoker, 0=never/former)
    df['current_smoker'] = df['smoke_status'].apply(
        lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
    )

    # Drinking (drink_status: 1=current drinker, 0=never/former)
    df['current_drinker'] = df['drink_status'].apply(
        lambda x: 1 if x == 1 else (0 if pd.notna(x) else np.nan)
    )

    # Any substance use
    df['any_substance'] = (
        (df['current_smoker'] == 1) |
        (df['current_drinker'] == 1)
    ).astype(float)
    df.loc[df['current_smoker'].isna() & df['current_drinker'].isna(), 'any_substance'] = np.nan

    return df

def analyze_discrimination_by_substance(df):
    """Q1: Do people who experience discrimination/violence use more substances?"""
    print("=" * 80)
    print("Q1: Does Discrimination/Violence Predict Substance Use?")
    print("=" * 80)
    print("Testing: Do people who face discrimination/violence use more alcohol/tobacco?\n")

    groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']

    for group in groups:
        group_df = df[df['population_group'] == group].copy()

        # Test discrimination -> smoking
        valid = group_df[group_df['any_discrimination'].notna() & group_df['current_smoker'].notna()]
        if len(valid) >= 30:
            disc_yes = valid[valid['any_discrimination'] == 1]
            disc_no = valid[valid['any_discrimination'] == 0]

            yes_rate = disc_yes['current_smoker'].mean() * 100 if len(disc_yes) > 0 else 0
            no_rate = disc_no['current_smoker'].mean() * 100 if len(disc_no) > 0 else 0

            if len(disc_yes) >= 10 and len(disc_no) >= 10:
                contingency = pd.crosstab(valid['any_discrimination'], valid['current_smoker'])
                chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

                print(f"{group.upper()} - Discrimination -> Smoking:")
                print(f"  Experienced discrimination: {yes_rate:.1f}% smoke (n={len(disc_yes)})")
                print(f"  No discrimination:          {no_rate:.1f}% smoke (n={len(disc_no)})")
                print(f"  Gap: {yes_rate - no_rate:+.1f} pp, p={p_value:.4f}")

        # Test discrimination -> drinking
        valid = group_df[group_df['any_discrimination'].notna() & group_df['current_drinker'].notna()]
        if len(valid) >= 30:
            disc_yes = valid[valid['any_discrimination'] == 1]
            disc_no = valid[valid['any_discrimination'] == 0]

            yes_rate = disc_yes['current_drinker'].mean() * 100 if len(disc_yes) > 0 else 0
            no_rate = disc_no['current_drinker'].mean() * 100 if len(disc_no) > 0 else 0

            if len(disc_yes) >= 10 and len(disc_no) >= 10:
                contingency = pd.crosstab(valid['any_discrimination'], valid['current_drinker'])
                chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

                print(f"{group.upper()} - Discrimination -> Drinking:")
                print(f"  Experienced discrimination: {yes_rate:.1f}% drink (n={len(disc_yes)})")
                print(f"  No discrimination:          {no_rate:.1f}% drink (n={len(disc_no)})")
                print(f"  Gap: {yes_rate - no_rate:+.1f} pp, p={p_value:.4f}")
                print()

    print("=" * 80 + "\n")

def analyze_substance_by_discrimination(df):
    """Q2: Do people who use substances experience more discrimination/violence?"""
    print("=" * 80)
    print("Q2: Does Substance Use Predict Discrimination/Violence?")
    print("=" * 80)
    print("Testing: Do substance users face more discrimination/violence?\n")

    groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']

    for group in groups:
        group_df = df[df['population_group'] == group].copy()

        print(f"{group.upper()}:")
        print("-" * 80)

        # Test smoking -> discrimination
        valid = group_df[group_df['current_smoker'].notna() & group_df['any_discrimination'].notna()]
        if len(valid) >= 30:
            smokers = valid[valid['current_smoker'] == 1]
            non_smokers = valid[valid['current_smoker'] == 0]

            smoker_rate = smokers['any_discrimination'].mean() * 100 if len(smokers) > 0 else 0
            non_smoker_rate = non_smokers['any_discrimination'].mean() * 100 if len(non_smokers) > 0 else 0

            if len(smokers) >= 10 and len(non_smokers) >= 10:
                contingency = pd.crosstab(valid['current_smoker'], valid['any_discrimination'])
                chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

                print(f"  Smoking -> Discrimination:")
                print(f"    Smokers:     {smoker_rate:.1f}% discriminated (n={len(smokers)})")
                print(f"    Non-smokers: {non_smoker_rate:.1f}% discriminated (n={len(non_smokers)})")
                print(f"    Gap: {smoker_rate - non_smoker_rate:+.1f} pp, p={p_value:.4f}")

        # Test drinking -> discrimination
        valid = group_df[group_df['current_drinker'].notna() & group_df['any_discrimination'].notna()]
        if len(valid) >= 30:
            drinkers = valid[valid['current_drinker'] == 1]
            non_drinkers = valid[valid['current_drinker'] == 0]

            drinker_rate = drinkers['any_discrimination'].mean() * 100 if len(drinkers) > 0 else 0
            non_drinker_rate = non_drinkers['any_discrimination'].mean() * 100 if len(non_drinkers) > 0 else 0

            if len(drinkers) >= 10 and len(non_drinkers) >= 10:
                contingency = pd.crosstab(valid['current_drinker'], valid['any_discrimination'])
                chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

                print(f"  Drinking -> Discrimination:")
                print(f"    Drinkers:     {drinker_rate:.1f}% discriminated (n={len(drinkers)})")
                print(f"    Non-drinkers: {non_drinker_rate:.1f}% discriminated (n={len(non_drinkers)})")
                print(f"    Gap: {drinker_rate - non_drinker_rate:+.1f} pp, p={p_value:.4f}")

        # Test smoking -> violence
        valid = group_df[group_df['current_smoker'].notna() & group_df['any_violence'].notna()]
        if len(valid) >= 30:
            smokers = valid[valid['current_smoker'] == 1]
            non_smokers = valid[valid['current_smoker'] == 0]

            smoker_rate = smokers['any_violence'].mean() * 100 if len(smokers) > 0 else 0
            non_smoker_rate = non_smokers['any_violence'].mean() * 100 if len(non_smokers) > 0 else 0

            if len(smokers) >= 10 and len(non_smokers) >= 10:
                contingency = pd.crosstab(valid['current_smoker'], valid['any_violence'])
                chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

                print(f"  Smoking -> Violence:")
                print(f"    Smokers:     {smoker_rate:.1f}% violence (n={len(smokers)})")
                print(f"    Non-smokers: {non_smoker_rate:.1f}% violence (n={len(non_smokers)})")
                print(f"    Gap: {smoker_rate - non_smoker_rate:+.1f} pp, p={p_value:.4f}")

        # Test drinking -> violence
        valid = group_df[group_df['current_drinker'].notna() & group_df['any_violence'].notna()]
        if len(valid) >= 30:
            drinkers = valid[valid['current_drinker'] == 1]
            non_drinkers = valid[valid['current_drinker'] == 0]

            drinker_rate = drinkers['any_violence'].mean() * 100 if len(drinkers) > 0 else 0
            non_drinker_rate = non_drinkers['any_violence'].mean() * 100 if len(non_drinkers) > 0 else 0

            if len(drinkers) >= 10 and len(non_drinkers) >= 10:
                contingency = pd.crosstab(valid['current_drinker'], valid['any_violence'])
                chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

                print(f"  Drinking -> Violence:")
                print(f"    Drinkers:     {drinker_rate:.1f}% violence (n={len(drinkers)})")
                print(f"    Non-drinkers: {non_drinker_rate:.1f}% violence (n={len(non_drinkers)})")
                print(f"    Gap: {drinker_rate - non_drinker_rate:+.1f} pp, p={p_value:.4f}")

        print()

    print("=" * 80 + "\n")

def main():
    """Run discrimination and substance use analysis"""
    print("\n" + "=" * 80)
    print("DISCRIMINATION/VIOLENCE AND SUBSTANCE USE ANALYSIS")
    print("=" * 80)
    print("\nTesting bidirectional relationships between discrimination/violence")
    print("and substance use (alcohol/tobacco)\n")

    df = load_data()
    df = classify_populations(df)
    df = calculate_indicators(df)

    analyze_discrimination_by_substance(df)
    analyze_substance_by_discrimination(df)

    print("=" * 80)
    print("INTERPRETATION GUIDE")
    print("=" * 80)
    print("\n1. Discrimination -> Substance: Tests stress-coping hypothesis")
    print("2. Substance -> Discrimination: Tests visibility/social context hypothesis")
    print("\nSignificance: p<0.05")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
