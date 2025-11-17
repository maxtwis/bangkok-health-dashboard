import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency, f_oneway
import warnings
warnings.filterwarnings('ignore')

print("Loading data...")
df = pd.read_csv('public/data/survey_sampling.csv')
print(f"Total sample: {len(df)}")

# ==============================================================================
# DATA PREPARATION
# ==============================================================================

# Create monthly income
def calculate_monthly_income(row):
    if pd.isna(row['income']):
        return np.nan
    if row['income_type'] == 1:  # Daily income
        return row['income'] * 30
    elif row['income_type'] == 2:  # Monthly income
        return row['income']
    else:
        return np.nan

df['monthly_income'] = df.apply(calculate_monthly_income, axis=1)

# Filter to disabled individuals only
df_disabled = df[df['disable_status'] == 1].copy()
print(f"\nDisabled sample: {len(df_disabled)}")

# For context comparison (optional)
df_non_disabled = df[df['disable_status'] == 0].copy()
print(f"Non-disabled sample: {len(df_non_disabled)}")

# ==============================================================================
# PART 1 (OPTIONAL): DISABLED VS NON-DISABLED CONTEXT COMPARISON
# ==============================================================================

print("\n" + "="*80)
print("PART 1: DISABLED VS NON-DISABLED COMPARISON (Context)")
print("="*80)

comparison_results = []

# Define comparison variables
comparison_vars = {
    # Income and economic
    'monthly_income': ('continuous', 'Monthly income (baht)'),
    'health_expense': ('continuous', 'Personal health expenses (baht/month)'),
    'hh_health_expense': ('continuous', 'Household health expenses (baht/month)'),
    'rent_price': ('continuous', 'Monthly rent (baht)'),
    'working_hours': ('continuous', 'Working hours per day'),

    # Healthcare access
    'medical_skip_1': ('binary', 'Skip medical care due to cost'),
    'oral_health': ('binary', 'Oral health problems'),

    # Health status
    'diseases_status': ('binary', 'Has chronic diseases'),

    # Health behaviors
    'drink_status': ('categorical', 'Alcohol consumption'),
    'smoke_status': ('categorical', 'Smoking status'),
    'exercise_status': ('categorical', 'Exercise frequency'),

    # Work
    'occupation_status': ('binary', 'Currently working'),
    'occupation_contract': ('binary', 'Has employment contract'),
    'occupation_welfare': ('binary', 'Has work benefits'),
    'occupation_injury': ('binary', 'Work injury (serious, past 12 months)'),
    'occupation_small_injury': ('binary', 'Work injury (minor, past 12 months)'),

    # Violence
    'physical_violence': ('binary', 'Experienced physical violence (past 12 months)'),
    'psychological_violence': ('binary', 'Experienced psychological violence (past 12 months)'),
    'sexual_violence': ('binary', 'Experienced sexual violence (past 12 months)'),

    # Food security
    'food_insecurity_1': ('binary', 'Food insecurity (reduced meals)'),
    'food_insecurity_2': ('binary', 'Food insecurity (skip full day)'),

    # Social support
    'family_status': ('binary', 'Lives with family'),
    'helper': ('binary', 'Has emergency support person'),

    # Literacy
    'read': ('binary', 'Can read Thai'),
    'write': ('binary', 'Can write Thai'),
    'math': ('binary', 'Can do basic math'),
    'training': ('binary', 'Participated in training (past 12 months)'),
}

for var, (var_type, label) in comparison_vars.items():
    if var not in df.columns:
        continue

    df_test = df[[var, 'disable_status']].dropna()

    if len(df_test) < 30:
        continue

    disabled_data = df_test[df_test['disable_status'] == 1][var]
    non_disabled_data = df_test[df_test['disable_status'] == 0][var]

    if len(disabled_data) < 10 or len(non_disabled_data) < 10:
        continue

    if var_type == 'continuous':
        from scipy.stats import ttest_ind

        disabled_mean = disabled_data.mean()
        disabled_median = disabled_data.median()
        non_disabled_mean = non_disabled_data.mean()
        non_disabled_median = non_disabled_data.median()

        stat, p_value = ttest_ind(disabled_data, non_disabled_data, nan_policy='omit')

        gap = disabled_mean - non_disabled_mean
        gap_pct = (gap / non_disabled_mean * 100) if non_disabled_mean != 0 else 0

        comparison_results.append({
            'outcome_variable': var,
            'outcome_label': label,
            'disabled_value': disabled_mean,
            'disabled_median': disabled_median,
            'disabled_n': len(disabled_data),
            'non_disabled_value': non_disabled_mean,
            'non_disabled_median': non_disabled_median,
            'non_disabled_n': len(non_disabled_data),
            'gap': gap,
            'gap_percent': gap_pct,
            'p_value': p_value,
            'significant': 'Yes' if p_value < 0.05 else 'No'
        })

    elif var_type in ['binary', 'categorical']:
        contingency = pd.crosstab(df_test['disable_status'], df_test[var])

        if (contingency < 5).sum().sum() > contingency.size * 0.2:
            continue

        chi2, p_value, dof, expected = chi2_contingency(contingency)

        if var_type == 'binary':
            disabled_pct = (disabled_data == 1).sum() / len(disabled_data) * 100
            non_disabled_pct = (non_disabled_data == 1).sum() / len(non_disabled_data) * 100
            gap = disabled_pct - non_disabled_pct

            comparison_results.append({
                'outcome_variable': var,
                'outcome_label': label,
                'disabled_value': disabled_pct,
                'disabled_median': None,
                'disabled_n': len(disabled_data),
                'non_disabled_value': non_disabled_pct,
                'non_disabled_median': None,
                'non_disabled_n': len(non_disabled_data),
                'gap': gap,
                'gap_percent': None,
                'p_value': p_value,
                'significant': 'Yes' if p_value < 0.05 else 'No'
            })

# Save Part 1 results
df_comparison = pd.DataFrame(comparison_results)
df_comparison = df_comparison.sort_values('p_value')
df_comparison.to_csv('disabled_vs_non_disabled_comparison.csv', index=False, encoding='utf-8-sig')

print(f"\nTotal comparisons: {len(df_comparison)}")
print(f"Significant differences (p < 0.05): {len(df_comparison[df_comparison['significant'] == 'Yes'])}")

# ==============================================================================
# PART 2: WITHIN DISABLED POPULATION EQUITY ANALYSIS
# ==============================================================================

print("\n" + "="*80)
print("PART 2: WITHIN DISABLED POPULATION EQUITY ANALYSIS")
print("="*80)

print(f"\nDisabled sample for equity analysis: {len(df_disabled)}")

# Create stratification variables

# Income groups
df_disabled['income_group'] = pd.cut(df_disabled['monthly_income'],
                                       bins=[0, 10000, 15000, 1000000],
                                       labels=['Low', 'Middle', 'High'])

# Age groups
df_disabled['age_group'] = pd.cut(df_disabled['age'],
                                   bins=[14, 29, 44, 59, 150],
                                   labels=['15-29', '30-44', '45-59', '60+'])

# Education groups
df_disabled['education_group'] = pd.cut(df_disabled['education'],
                                         bins=[-1, 2, 4, 8],
                                         labels=['Low', 'Middle', 'High'])

# Work hours groups (only for working people)
df_disabled['work_hours_group'] = pd.cut(df_disabled['working_hours'],
                                          bins=[0, 8, 10, 24],
                                          labels=['<8 hrs', '8-10 hrs', '>10 hrs'])

# Home ownership
df_disabled['homeowner'] = df_disabled['house_status'].apply(
    lambda x: 'Owner' if x == 1 else 'Renter' if x == 2 else 'Other'
)

# Has children under 5
df_disabled['has_children'] = (df_disabled['hh_child_count'] > 0).astype(int)

# Can work status (specific to disabled)
df_disabled['can_work'] = df_disabled['disable_work_status']

# Gender
df_disabled['gender'] = df_disabled['sex'].apply(
    lambda x: 'Male' if str(x).lower() == 'male' else 'Female' if str(x).lower() == 'female' else 'Other'
)

# Stratification variables
stratify_vars = {
    'income_group': 'Income Level',
    'age_group': 'Age Group',
    'education_group': 'Education Level',
    'work_hours_group': 'Work Hours',
    'homeowner': 'Home Ownership',
    'has_children': 'Has Children (<5)',
    'can_work': 'Can Work (if disabled)',
    'gender': 'Gender',
}

# Outcome variables
outcome_vars = comparison_vars.copy()

# Statistical tests
def chi_square_test(df, outcome_var, stratify_var):
    """Perform chi-square test for categorical outcome"""
    df_test = df[[outcome_var, stratify_var]].dropna()

    if len(df_test) < 30:
        return None

    contingency = pd.crosstab(df_test[stratify_var], df_test[outcome_var])

    if (contingency < 5).any().any():
        return None

    chi2, p_value, dof, expected = chi2_contingency(contingency)

    n = contingency.sum().sum()
    k = contingency.shape[0]
    r = contingency.shape[1]
    cramers_v = np.sqrt(chi2 / (n * min(k-1, r-1)))

    percentages = contingency.div(contingency.sum(axis=1), axis=0) * 100

    return {
        'chi2': chi2,
        'p_value': p_value,
        'cramers_v': cramers_v,
        'contingency': contingency,
        'percentages': percentages,
        'n': n
    }

def anova_test(df, outcome_var, stratify_var):
    """Perform ANOVA for continuous outcome"""
    df_test = df[[outcome_var, stratify_var]].dropna()

    if len(df_test) < 30:
        return None

    groups = [group[outcome_var].values for name, group in df_test.groupby(stratify_var)]

    groups = [g for g in groups if len(g) >= 5]

    if len(groups) < 2:
        return None

    f_stat, p_value = f_oneway(*groups)

    group_means = [np.mean(g) for g in groups]
    grand_mean = df_test[outcome_var].mean()

    ss_between = sum([len(g) * (np.mean(g) - grand_mean)**2 for g in groups])
    ss_total = sum([(x - grand_mean)**2 for g in groups for x in g])

    eta_squared = ss_between / ss_total if ss_total > 0 else 0

    summary = df_test.groupby(stratify_var)[outcome_var].agg(['mean', 'median', 'count'])

    return {
        'f_stat': f_stat,
        'p_value': p_value,
        'eta_squared': eta_squared,
        'summary': summary,
        'n': len(df_test)
    }

# Run all combinations
all_tests = []
crosstab_data = []

for outcome_var, (outcome_type, outcome_label) in outcome_vars.items():
    if outcome_var not in df_disabled.columns:
        continue

    for stratify_var, stratify_label in stratify_vars.items():
        if stratify_var not in df_disabled.columns:
            continue

        if outcome_type == 'continuous':
            result = anova_test(df_disabled, outcome_var, stratify_var)

            if result is None:
                continue

            if result['p_value'] >= 0.05:
                continue

            max_mean = result['summary']['mean'].max()
            min_mean = result['summary']['mean'].min()
            equity_gap = max_mean - min_mean

            highest_group = result['summary']['mean'].idxmax()
            lowest_group = result['summary']['mean'].idxmin()

            if result['eta_squared'] < 0.01:
                effect_interp = 'negligible'
            elif result['eta_squared'] < 0.06:
                effect_interp = 'small'
            elif result['eta_squared'] < 0.14:
                effect_interp = 'medium'
            else:
                effect_interp = 'large'

            all_tests.append({
                'outcome_variable': outcome_var,
                'outcome_label': outcome_label,
                'stratify_variable': stratify_var,
                'stratify_label': stratify_label,
                'test_type': 'anova',
                'test_statistic': result['f_stat'],
                'p_value': result['p_value'],
                'effect_size_value': result['eta_squared'],
                'effect_size_interpretation': effect_interp,
                'equity_gap': equity_gap,
                'equity_gap_unit': outcome_label.split('(')[-1].rstrip(')') if '(' in outcome_label else '',
                'highest_group': highest_group,
                'lowest_group': lowest_group,
                'sample_size': result['n'],
                'significant': 'Yes'
            })

            for group_name, row in result['summary'].iterrows():
                crosstab_data.append({
                    'outcome_variable': outcome_var,
                    'outcome_label': outcome_label,
                    'outcome_value': 'continuous',
                    'stratify_variable': stratify_var,
                    'stratify_label': stratify_label,
                    'stratify_group': group_name,
                    'count': None,
                    'mean': row['mean'],
                    'std': None,
                    'median': row['median'],
                    'min': None,
                    'max': None,
                    'percentage': None,
                    'group_total': row['count']
                })

        elif outcome_type in ['binary', 'categorical']:
            result = chi_square_test(df_disabled, outcome_var, stratify_var)

            if result is None:
                continue

            if result['p_value'] >= 0.05:
                continue

            if outcome_type == 'binary':
                percentages_outcome_1 = result['percentages'][1] if 1 in result['percentages'].columns else result['percentages'].iloc[:, -1]
                equity_gap = percentages_outcome_1.max() - percentages_outcome_1.min()
                highest_group = percentages_outcome_1.idxmax()
                lowest_group = percentages_outcome_1.idxmin()
            else:
                equity_gap = None
                highest_group = None
                lowest_group = None

            if result['cramers_v'] < 0.10:
                effect_interp = 'negligible'
            elif result['cramers_v'] < 0.30:
                effect_interp = 'small'
            elif result['cramers_v'] < 0.50:
                effect_interp = 'medium'
            else:
                effect_interp = 'large'

            all_tests.append({
                'outcome_variable': outcome_var,
                'outcome_label': outcome_label,
                'stratify_variable': stratify_var,
                'stratify_label': stratify_label,
                'test_type': 'chi_square',
                'test_statistic': result['chi2'],
                'p_value': result['p_value'],
                'effect_size_value': result['cramers_v'],
                'effect_size_interpretation': effect_interp,
                'equity_gap': equity_gap,
                'equity_gap_unit': 'percentage points' if outcome_type == 'binary' else '',
                'highest_group': highest_group,
                'lowest_group': lowest_group,
                'sample_size': result['n'],
                'significant': 'Yes'
            })

            if outcome_type == 'binary':
                for group_name in result['contingency'].index:
                    for outcome_value in result['contingency'].columns:
                        count = result['contingency'].loc[group_name, outcome_value]
                        total = result['contingency'].loc[group_name].sum()
                        pct = result['percentages'].loc[group_name, outcome_value]

                        crosstab_data.append({
                            'outcome_variable': outcome_var,
                            'outcome_label': outcome_label,
                            'outcome_value': outcome_value,
                            'stratify_variable': stratify_var,
                            'stratify_label': stratify_label,
                            'stratify_group': group_name,
                            'count': count,
                            'mean': None,
                            'std': None,
                            'median': None,
                            'min': None,
                            'max': None,
                            'percentage': pct,
                            'group_total': total
                        })

# Save results
df_all_tests = pd.DataFrame(all_tests)
df_all_tests = df_all_tests.sort_values('p_value')

df_significant = df_all_tests[df_all_tests['significant'] == 'Yes'].copy()

df_all_tests.to_csv('disabled_equity_tests_all.csv', index=False, encoding='utf-8-sig')
df_significant.to_csv('disabled_equity_tests_significant.csv', index=False, encoding='utf-8-sig')

df_crosstabs = pd.DataFrame(crosstab_data)
df_crosstabs.to_csv('disabled_equity_crosstabs.csv', index=False, encoding='utf-8-sig')

print(f"\nTotal tests performed: {len(df_all_tests)}")
print(f"Significant findings (p < 0.05): {len(df_significant)}")

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
print("\nFiles generated:")
print("1. disabled_vs_non_disabled_comparison.csv - Disabled vs non-disabled comparisons (context)")
print("2. disabled_equity_tests_all.csv - All within-disabled equity tests")
print("3. disabled_equity_tests_significant.csv - Significant within-disabled findings")
print("4. disabled_equity_crosstabs.csv - Detailed crosstabs for significant findings")

# Print top gaps
print("\n" + "="*80)
print("TOP 10 DISABLED VS NON-DISABLED GAPS (by p-value)")
print("="*80)
if len(df_comparison) > 0:
    top_comparison = df_comparison.head(10)
    for idx, row in top_comparison.iterrows():
        if pd.notna(row['gap_percent']):
            print(f"{row['outcome_label']}: {row['gap']:.1f} ({row['gap_percent']:+.1f}%), p={row['p_value']:.4f}")
        else:
            print(f"{row['outcome_label']}: {row['gap']:+.1f} pp, p={row['p_value']:.4f}")

print("\n" + "="*80)
print("TOP 10 WITHIN-DISABLED EQUITY GAPS (by effect size)")
print("="*80)
if len(df_significant) > 0:
    top_equity = df_significant.nlargest(10, 'equity_gap')
    for idx, row in top_equity.iterrows():
        print(f"{row['outcome_label']} by {row['stratify_label']}: {row['equity_gap']:.1f} {row['equity_gap_unit']}")
