#!/usr/bin/env python3
"""
Statistical Population Analysis with Confidence Intervals and Significance Testing
Handles unequal sample sizes across districts using proper statistical methods
"""

import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import chi2_contingency, fisher_exact
import warnings
warnings.filterwarnings('ignore')

def load_data():
    """Load survey data, district code mapping, and district population"""
    try:
        # Load survey data
        survey_df = pd.read_csv('public/data/survey_sampling.csv')
        print(f"Loaded {len(survey_df)} survey responses")

        # Load district code mapping
        district_df = pd.read_csv('public/data/district_code.csv')
        district_df.columns = district_df.columns.str.replace('\ufeff', '')
        print(f"Loaded {len(district_df)} district mappings")

        # Load district population for weighting
        try:
            population_df = pd.read_csv('public/data/district_population.csv')
            population_df.columns = population_df.columns.str.replace('\ufeff', '')
            print(f"Loaded district population data")
        except FileNotFoundError:
            print("Warning: district_population.csv not found, skipping population weighting")
            population_df = None

        return survey_df, district_df, population_df
    except FileNotFoundError as e:
        print(f"Error loading data files: {e}")
        return None, None, None

def calculate_confidence_interval(proportion, sample_size, confidence=0.95):
    """
    Calculate confidence interval for a proportion using Wilson score interval
    More accurate for small samples and extreme proportions than normal approximation
    """
    if sample_size == 0:
        return 0, 0, 0

    z = stats.norm.ppf((1 + confidence) / 2)  # 1.96 for 95% CI

    # Wilson score interval (more accurate than normal approximation)
    denominator = 1 + z**2 / sample_size
    center = (proportion + z**2 / (2 * sample_size)) / denominator
    margin = z * np.sqrt((proportion * (1 - proportion) / sample_size + z**2 / (4 * sample_size**2))) / denominator

    ci_lower = max(0, center - margin)
    ci_upper = min(1, center + margin)

    return ci_lower, ci_upper, margin

def calculate_margin_of_error(proportion, sample_size, confidence=0.95):
    """Calculate margin of error for a proportion"""
    if sample_size == 0:
        return 0

    z = stats.norm.ppf((1 + confidence) / 2)
    moe = z * np.sqrt((proportion * (1 - proportion)) / sample_size)
    return moe

def calculate_population_groups(survey_df):
    """Calculate population group classifications"""
    survey_df.columns = survey_df.columns.str.replace('\ufeff', '')

    survey_df['elderly'] = (survey_df['age'] >= 60).astype(int)
    survey_df['lgbt'] = (survey_df['sex'] == 'lgbt').astype(int)
    survey_df['disabled'] = (survey_df['disable_status'] == 1).astype(int)
    survey_df['informal'] = (survey_df['occupation_contract'] == 0).astype(int)
    survey_df['general'] = (
        (survey_df['elderly'] == 0) &
        (survey_df['lgbt'] == 0) &
        (survey_df['disabled'] == 0) &
        (survey_df['informal'] == 0)
    ).astype(int)

    return survey_df

def calculate_district_statistics(survey_df, district_df, min_sample_size=30):
    """
    Calculate district-level statistics with confidence intervals and sample size flags
    """
    district_df.columns = district_df.columns.str.replace('\ufeff', '')

    # Group by district
    district_groups = survey_df.groupby('dname')

    results = []

    for district_code, group in district_groups:
        n = len(group)

        # Calculate proportions
        general_prop = group['general'].mean()
        lgbt_prop = group['lgbt'].mean()
        elderly_prop = group['elderly'].mean()
        disabled_prop = group['disabled'].mean()
        informal_prop = group['informal'].mean()

        # Calculate confidence intervals
        general_ci = calculate_confidence_interval(general_prop, n)
        lgbt_ci = calculate_confidence_interval(lgbt_prop, n)
        elderly_ci = calculate_confidence_interval(elderly_prop, n)
        disabled_ci = calculate_confidence_interval(disabled_prop, n)
        informal_ci = calculate_confidence_interval(informal_prop, n)

        # Calculate margins of error
        general_moe = calculate_margin_of_error(general_prop, n)
        lgbt_moe = calculate_margin_of_error(lgbt_prop, n)
        elderly_moe = calculate_margin_of_error(elderly_prop, n)
        disabled_moe = calculate_margin_of_error(disabled_prop, n)
        informal_moe = calculate_margin_of_error(informal_prop, n)

        # Get district name
        district_name = district_df[district_df['dcode'] == district_code]['dname'].values
        district_name = district_name[0] if len(district_name) > 0 else 'Unknown'

        # Statistical reliability flag
        reliability = 'High' if n >= 100 else 'Medium' if n >= 50 else 'Low' if n >= 30 else 'Very Low'

        results.append({
            'district_code': district_code,
            'district_name': district_name,
            'sample_size': n,
            'reliability': reliability,
            'sufficient_sample': 'Yes' if n >= min_sample_size else 'No',

            # General Population
            'general_pct': round(general_prop * 100, 1),
            'general_ci_lower': round(general_ci[0] * 100, 1),
            'general_ci_upper': round(general_ci[1] * 100, 1),
            'general_moe': round(general_moe * 100, 1),

            # LGBT+
            'lgbt_pct': round(lgbt_prop * 100, 1),
            'lgbt_ci_lower': round(lgbt_ci[0] * 100, 1),
            'lgbt_ci_upper': round(lgbt_ci[1] * 100, 1),
            'lgbt_moe': round(lgbt_moe * 100, 1),

            # Elderly
            'elderly_pct': round(elderly_prop * 100, 1),
            'elderly_ci_lower': round(elderly_ci[0] * 100, 1),
            'elderly_ci_upper': round(elderly_ci[1] * 100, 1),
            'elderly_moe': round(elderly_moe * 100, 1),

            # Disabled
            'disabled_pct': round(disabled_prop * 100, 1),
            'disabled_ci_lower': round(disabled_ci[0] * 100, 1),
            'disabled_ci_upper': round(disabled_ci[1] * 100, 1),
            'disabled_moe': round(disabled_moe * 100, 1),

            # Informal Workers
            'informal_pct': round(informal_prop * 100, 1),
            'informal_ci_lower': round(informal_ci[0] * 100, 1),
            'informal_ci_upper': round(informal_ci[1] * 100, 1),
            'informal_moe': round(informal_moe * 100, 1),
        })

    return pd.DataFrame(results).sort_values('district_code')

def compare_two_districts(survey_df, district_a, district_b, population_group='elderly'):
    """
    Statistical comparison between two districts for a specific population group
    Returns chi-square test results and interpretation
    """
    group_a = survey_df[survey_df['dname'] == district_a]
    group_b = survey_df[survey_df['dname'] == district_b]

    n_a = len(group_a)
    n_b = len(group_b)

    count_a = group_a[population_group].sum()
    count_b = group_b[population_group].sum()

    # Create contingency table
    contingency_table = np.array([
        [count_a, n_a - count_a],
        [count_b, n_b - count_b]
    ])

    # Perform chi-square test
    if min(contingency_table.flatten()) >= 5:
        chi2, p_value, dof, expected = chi2_contingency(contingency_table)
        test_used = 'Chi-Square'
    else:
        # Use Fisher's exact test for small samples
        odds_ratio, p_value = fisher_exact(contingency_table)
        chi2 = None
        test_used = "Fisher's Exact"

    # Calculate effect size (Cohen's h)
    prop_a = count_a / n_a if n_a > 0 else 0
    prop_b = count_b / n_b if n_b > 0 else 0

    # Cohen's h for proportions
    cohens_h = 2 * (np.arcsin(np.sqrt(prop_a)) - np.arcsin(np.sqrt(prop_b)))

    # Interpretation
    if abs(cohens_h) < 0.2:
        effect_size_interpretation = 'Small'
    elif abs(cohens_h) < 0.5:
        effect_size_interpretation = 'Medium'
    else:
        effect_size_interpretation = 'Large'

    return {
        'district_a': district_a,
        'district_b': district_b,
        'population_group': population_group,
        'n_a': n_a,
        'n_b': n_b,
        'proportion_a': round(prop_a * 100, 1),
        'proportion_b': round(prop_b * 100, 1),
        'difference': round((prop_a - prop_b) * 100, 1),
        'test_used': test_used,
        'chi2_statistic': round(chi2, 3) if chi2 else None,
        'p_value': round(p_value, 4),
        'statistically_significant': 'Yes' if p_value < 0.05 else 'No',
        'cohens_h': round(cohens_h, 3),
        'effect_size': effect_size_interpretation,
        'interpretation': interpret_comparison(p_value, cohens_h, n_a, n_b)
    }

def interpret_comparison(p_value, cohens_h, n_a, n_b):
    """Provide human-readable interpretation of statistical comparison"""
    if p_value >= 0.05:
        return "No statistically significant difference detected"
    else:
        if abs(cohens_h) < 0.2:
            return "Statistically significant but small practical difference"
        elif abs(cohens_h) < 0.5:
            return "Statistically significant with moderate practical difference"
        else:
            return "Statistically significant with large practical difference"

def calculate_weighted_citywide_estimates(survey_df, population_df):
    """
    Calculate weighted city-wide estimates using district population as weights
    """
    if population_df is None:
        return None

    # Aggregate population by district
    district_pop = population_df.groupby('dcode')['population'].sum().reset_index()
    district_pop.columns = ['dcode', 'total_population']

    # Merge survey data with population weights
    district_summary = survey_df.groupby('dname').agg({
        'general': 'mean',
        'lgbt': 'mean',
        'elderly': 'mean',
        'disabled': 'mean',
        'informal': 'mean'
    }).reset_index()

    district_summary = district_summary.merge(
        district_pop,
        left_on='dname',
        right_on='dcode',
        how='left'
    )

    # Handle missing population data
    if district_summary['total_population'].isna().any():
        print("Warning: Some districts missing population data, using unweighted estimates")
        return None

    total_population = district_summary['total_population'].sum()

    # Calculate weighted averages
    weighted_estimates = {}
    for group in ['general', 'lgbt', 'elderly', 'disabled', 'informal']:
        district_summary[f'{group}_weighted'] = (
            district_summary[group] * district_summary['total_population']
        )
        weighted_estimates[group] = district_summary[f'{group}_weighted'].sum() / total_population

    return {
        'general_weighted_pct': round(weighted_estimates['general'] * 100, 1),
        'lgbt_weighted_pct': round(weighted_estimates['lgbt'] * 100, 1),
        'elderly_weighted_pct': round(weighted_estimates['elderly'] * 100, 1),
        'disabled_weighted_pct': round(weighted_estimates['disabled'] * 100, 1),
        'informal_weighted_pct': round(weighted_estimates['informal'] * 100, 1),
    }

def generate_comparison_matrix(survey_df, district_codes, population_group='elderly', min_sample_size=30):
    """
    Generate pairwise comparison matrix for all districts
    Only includes districts with sufficient sample size
    """
    # Filter districts with sufficient sample size
    district_sizes = survey_df.groupby('dname').size()
    valid_districts = district_sizes[district_sizes >= min_sample_size].index.tolist()

    comparisons = []

    for i, dist_a in enumerate(valid_districts):
        for dist_b in valid_districts[i+1:]:
            result = compare_two_districts(survey_df, dist_a, dist_b, population_group)
            comparisons.append(result)

    return pd.DataFrame(comparisons)

def main():
    """Main function to generate statistical analysis"""
    print("Starting Statistical Population Analysis...")
    print("=" * 80)

    # Load data
    survey_df, district_df, population_df = load_data()
    if survey_df is None or district_df is None:
        return

    # Calculate population groups
    print("\nCalculating population group classifications...")
    survey_df = calculate_population_groups(survey_df)

    # Generate district statistics with confidence intervals
    print("\nGenerating district-level statistics with confidence intervals...")
    district_stats = calculate_district_statistics(survey_df, district_df, min_sample_size=30)
    district_stats.to_csv('district_statistics_with_ci.csv', index=False, encoding='utf-8-sig')
    print(f"[OK] Saved: district_statistics_with_ci.csv")

    # Calculate weighted city-wide estimates
    if population_df is not None:
        print("\nCalculating population-weighted city-wide estimates...")
        weighted_estimates = calculate_weighted_citywide_estimates(survey_df, population_df)
        if weighted_estimates:
            weighted_df = pd.DataFrame([weighted_estimates])
            weighted_df.to_csv('citywide_weighted_estimates.csv', index=False, encoding='utf-8-sig')
            print(f"[OK] Saved: citywide_weighted_estimates.csv")

    # Example: Compare specific districts
    print("\nGenerating example district comparisons...")

    # Get top 5 districts by sample size
    top_districts = survey_df.groupby('dname').size().nlargest(5).index.tolist()

    if len(top_districts) >= 2:
        example_comparisons = []
        for group in ['elderly', 'lgbt', 'disabled', 'informal']:
            comparison = compare_two_districts(
                survey_df,
                top_districts[0],
                top_districts[1],
                population_group=group
            )
            example_comparisons.append(comparison)

        comparison_df = pd.DataFrame(example_comparisons)
        comparison_df.to_csv('example_district_comparisons.csv', index=False, encoding='utf-8-sig')
        print(f"[OK] Saved: example_district_comparisons.csv")

    # Generate pairwise comparison matrix for elderly population
    print("\nGenerating pairwise comparison matrix for elderly population...")
    print("(This may take a moment for all district pairs...)")

    elderly_comparisons = generate_comparison_matrix(
        survey_df,
        district_df['dcode'].tolist(),
        population_group='elderly',
        min_sample_size=30
    )
    elderly_comparisons.to_csv('elderly_pairwise_comparisons.csv', index=False, encoding='utf-8-sig')
    print(f"[OK] Saved: elderly_pairwise_comparisons.csv ({len(elderly_comparisons)} comparisons)")

    # Summary statistics
    print("\n" + "=" * 80)
    print("[SUMMARY] Statistical Analysis Summary:")
    print(f"   Total districts analyzed: {len(district_stats)}")
    print(f"   Districts with high reliability (n>=100): {len(district_stats[district_stats['reliability'] == 'High'])}")
    print(f"   Districts with medium reliability (50<=n<100): {len(district_stats[district_stats['reliability'] == 'Medium'])}")
    print(f"   Districts with low reliability (30<=n<50): {len(district_stats[district_stats['reliability'] == 'Low'])}")
    print(f"   Districts with very low reliability (n<30): {len(district_stats[district_stats['reliability'] == 'Very Low'])}")

    print(f"\n   Average margin of error for elderly %:")
    print(f"   - High reliability districts: {district_stats[district_stats['reliability'] == 'High']['elderly_moe'].mean():.1f}%")
    print(f"   - Medium reliability districts: {district_stats[district_stats['reliability'] == 'Medium']['elderly_moe'].mean():.1f}%")
    print(f"   - Low reliability districts: {district_stats[district_stats['reliability'] == 'Low']['elderly_moe'].mean():.1f}%")

    if len(district_stats[district_stats['reliability'] == 'Very Low']) > 0:
        print(f"   - Very low reliability districts: {district_stats[district_stats['reliability'] == 'Very Low']['elderly_moe'].mean():.1f}%")

    print("\n[COMPLETE] Statistical analysis complete! All CSV files generated.")
    print("\nGenerated files:")
    print("  1. district_statistics_with_ci.csv - District stats with confidence intervals")
    print("  2. example_district_comparisons.csv - Example statistical comparisons")
    print("  3. elderly_pairwise_comparisons.csv - All pairwise district comparisons")
    if population_df is not None:
        print("  4. citywide_weighted_estimates.csv - Population-weighted city estimates")

if __name__ == "__main__":
    main()