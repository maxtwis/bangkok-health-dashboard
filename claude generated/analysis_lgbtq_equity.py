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

# Define LGBTQ+ status
# sex variable: we need to identify LGBTQ+ based on the 'sex' column
# Assuming 'sex' contains: 1=male, 2=female, 3=lgbt (or similar coding)
# Let's check the unique values first and filter accordingly

print("\nChecking sex variable unique values:")
print(df['sex'].value_counts())

# Create LGBTQ+ identifier based on sex column (male/female/lgbt)
df['lgbtq_status'] = df['sex'].apply(lambda x: 'LGBTQ+' if str(x).lower() == 'lgbt' else 'General' if str(x).lower() in ['male', 'female'] else 'Unknown')

# Filter to only LGBTQ+ and General populations
df_analysis = df[df['lgbtq_status'].isin(['LGBTQ+', 'General'])].copy()

print(f"\nLGBTQ+ sample: {len(df_analysis[df_analysis['lgbtq_status'] == 'LGBTQ+'])}")
print(f"General population sample: {len(df_analysis[df_analysis['lgbtq_status'] == 'General'])}")

# ==============================================================================
# PART 1: LGBTQ+ VS GENERAL POPULATION COMPARISON
# ==============================================================================

print("\n" + "="*80)
print("PART 1: LGBTQ+ VS GENERAL POPULATION COMPARISON")
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
    'disable_status': ('binary', 'Has disability'),

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

    # Violence and discrimination
    'physical_violence': ('binary', 'Experienced physical violence (past 12 months)'),
    'psychological_violence': ('binary', 'Experienced psychological violence (past 12 months)'),
    'sexual_violence': ('binary', 'Experienced sexual violence (past 12 months)'),
    'discrimination': ('binary', 'Experienced discrimination (past 12 months)'),

    # Food security
    'food_insecurity_1': ('binary', 'Food insecurity (reduced meals)'),
    'food_insecurity_2': ('binary', 'Food insecurity (skip full day)'),

    # Social support
    'family_status': ('binary', 'Lives with family'),
    'helper': ('binary', 'Has emergency support person'),
    'community_safety': ('categorical', 'Community safety perception'),

    # Environmental
    'health_pollution': ('binary', 'Health impact from air pollution'),

    # Literacy
    'read': ('binary', 'Can read Thai'),
    'write': ('binary', 'Can write Thai'),
    'math': ('binary', 'Can do basic math'),
    'training': ('binary', 'Participated in training (past 12 months)'),
}

for var, (var_type, label) in comparison_vars.items():
    if var not in df_analysis.columns:
        continue

    df_test = df_analysis[[var, 'lgbtq_status']].dropna()

    if len(df_test) < 30:
        continue

    lgbtq_data = df_test[df_test['lgbtq_status'] == 'LGBTQ+'][var]
    general_data = df_test[df_test['lgbtq_status'] == 'General'][var]

    if len(lgbtq_data) < 10 or len(general_data) < 10:
        continue

    if var_type == 'continuous':
        # T-test / ANOVA
        from scipy.stats import ttest_ind

        lgbtq_mean = lgbtq_data.mean()
        lgbtq_median = lgbtq_data.median()
        general_mean = general_data.mean()
        general_median = general_data.median()

        stat, p_value = ttest_ind(lgbtq_data, general_data, nan_policy='omit')

        gap = lgbtq_mean - general_mean
        gap_pct = (gap / general_mean * 100) if general_mean != 0 else 0

        comparison_results.append({
            'outcome_variable': var,
            'outcome_label': label,
            'lgbtq_value': lgbtq_mean,
            'lgbtq_median': lgbtq_median,
            'lgbtq_n': len(lgbtq_data),
            'general_value': general_mean,
            'general_median': general_median,
            'general_n': len(general_data),
            'gap': gap,
            'gap_percent': gap_pct,
            'p_value': p_value,
            'significant': 'Yes' if p_value < 0.05 else 'No'
        })

    elif var_type in ['binary', 'categorical']:
        # Chi-square test
        contingency = pd.crosstab(df_test['lgbtq_status'], df_test[var])

        if (contingency < 5).sum().sum() > contingency.size * 0.2:
            continue

        chi2, p_value, dof, expected = chi2_contingency(contingency)

        # Calculate percentages for binary outcomes
        if var_type == 'binary':
            lgbtq_pct = (lgbtq_data == 1).sum() / len(lgbtq_data) * 100
            general_pct = (general_data == 1).sum() / len(general_data) * 100
            gap = lgbtq_pct - general_pct

            comparison_results.append({
                'outcome_variable': var,
                'outcome_label': label,
                'lgbtq_value': lgbtq_pct,
                'lgbtq_median': None,
                'lgbtq_n': len(lgbtq_data),
                'general_value': general_pct,
                'general_median': None,
                'general_n': len(general_data),
                'gap': gap,
                'gap_percent': None,
                'p_value': p_value,
                'significant': 'Yes' if p_value < 0.05 else 'No'
            })

# Save Part 1 results
df_comparison = pd.DataFrame(comparison_results)
df_comparison = df_comparison.sort_values('p_value')
df_comparison.to_csv('lgbtq_vs_general_comparison.csv', index=False, encoding='utf-8-sig')

print(f"\nTotal comparisons: {len(df_comparison)}")
print(f"Significant differences (p < 0.05): {len(df_comparison[df_comparison['significant'] == 'Yes'])}")

# ==============================================================================
# PART 2: WITHIN LGBTQ+ EQUITY ANALYSIS
# ==============================================================================

print("\n" + "="*80)
print("PART 2: WITHIN LGBTQ+ EQUITY ANALYSIS")
print("="*80)

# Filter to LGBTQ+ only
df_lgbtq = df_analysis[df_analysis['lgbtq_status'] == 'LGBTQ+'].copy()
print(f"\nLGBTQ+ sample for equity analysis: {len(df_lgbtq)}")

# Create stratification variables

# Income groups
df_lgbtq['income_group'] = pd.cut(df_lgbtq['monthly_income'],
                                    bins=[0, 10000, 15000, 1000000],
                                    labels=['Low', 'Middle', 'High'])

# Age groups
df_lgbtq['age_group'] = pd.cut(df_lgbtq['age'],
                                bins=[14, 29, 44, 59, 150],
                                labels=['15-29', '30-44', '45-59', '60+'])

# Education groups (simplified)
df_lgbtq['education_group'] = pd.cut(df_lgbtq['education'],
                                       bins=[-1, 2, 4, 8],
                                       labels=['Low', 'Middle', 'High'])

# Work hours groups (only for working people)
df_lgbtq['work_hours_group'] = pd.cut(df_lgbtq['working_hours'],
                                        bins=[0, 8, 10, 24],
                                        labels=['<8 hrs', '8-10 hrs', '>10 hrs'])

# Home ownership
df_lgbtq['homeowner'] = df_lgbtq['house_status'].apply(
    lambda x: 'Owner' if x == 1 else 'Renter' if x == 2 else 'Other'
)

# Has children under 5
df_lgbtq['has_children'] = (df_lgbtq['hh_child_count'] > 0).astype(int)

# Disability
df_lgbtq['disabled'] = df_lgbtq['disable_status']

# Stratification variables
stratify_vars = {
    'income_group': 'Income Level',
    'age_group': 'Age Group',
    'education_group': 'Education Level',
    'work_hours_group': 'Work Hours',
    'homeowner': 'Home Ownership',
    'has_children': 'Has Children (<5)',
    'disabled': 'Disability Status',
}

# Outcome variables (same as comparison vars)
outcome_vars = comparison_vars.copy()

# Statistical tests
def chi_square_test(df, outcome_var, stratify_var):
    """Perform chi-square test for categorical outcome"""
    df_test = df[[outcome_var, stratify_var]].dropna()

    if len(df_test) < 30:
        return None

    contingency = pd.crosstab(df_test[stratify_var], df_test[outcome_var])

    # Check if any expected frequency < 5
    if (contingency < 5).any().any():
        return None

    chi2, p_value, dof, expected = chi2_contingency(contingency)

    # Calculate Cramer's V
    n = contingency.sum().sum()
    k = contingency.shape[0]
    r = contingency.shape[1]
    cramers_v = np.sqrt(chi2 / (n * min(k-1, r-1)))

    # Calculate percentages
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

    # Remove groups with < 5 observations
    groups = [g for g in groups if len(g) >= 5]

    if len(groups) < 2:
        return None

    f_stat, p_value = f_oneway(*groups)

    # Calculate eta-squared (effect size)
    group_means = [np.mean(g) for g in groups]
    grand_mean = df_test[outcome_var].mean()

    ss_between = sum([len(g) * (np.mean(g) - grand_mean)**2 for g in groups])
    ss_total = sum([(x - grand_mean)**2 for g in groups for x in g])

    eta_squared = ss_between / ss_total if ss_total > 0 else 0

    # Calculate summary statistics by group
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
    if outcome_var not in df_lgbtq.columns:
        continue

    for stratify_var, stratify_label in stratify_vars.items():
        if stratify_var not in df_lgbtq.columns:
            continue

        if outcome_type == 'continuous':
            result = anova_test(df_lgbtq, outcome_var, stratify_var)

            if result is None:
                continue

            if result['p_value'] >= 0.05:
                continue

            # Calculate equity gap
            max_mean = result['summary']['mean'].max()
            min_mean = result['summary']['mean'].min()
            equity_gap = max_mean - min_mean

            highest_group = result['summary']['mean'].idxmax()
            lowest_group = result['summary']['mean'].idxmin()

            # Effect size interpretation
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

            # Save crosstab data for reporting
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
            result = chi_square_test(df_lgbtq, outcome_var, stratify_var)

            if result is None:
                continue

            if result['p_value'] >= 0.05:
                continue

            # Calculate equity gap (for binary outcomes)
            if outcome_type == 'binary':
                percentages_outcome_1 = result['percentages'][1] if 1 in result['percentages'].columns else result['percentages'].iloc[:, -1]
                equity_gap = percentages_outcome_1.max() - percentages_outcome_1.min()
                highest_group = percentages_outcome_1.idxmax()
                lowest_group = percentages_outcome_1.idxmin()
            else:
                equity_gap = None
                highest_group = None
                lowest_group = None

            # Effect size interpretation
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

            # Save crosstab data for binary outcomes
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

# Separate significant and all
df_significant = df_all_tests[df_all_tests['significant'] == 'Yes'].copy()

df_all_tests.to_csv('lgbtq_equity_tests_all.csv', index=False, encoding='utf-8-sig')
df_significant.to_csv('lgbtq_equity_tests_significant.csv', index=False, encoding='utf-8-sig')

df_crosstabs = pd.DataFrame(crosstab_data)
df_crosstabs.to_csv('lgbtq_equity_crosstabs.csv', index=False, encoding='utf-8-sig')

print(f"\nTotal tests performed: {len(df_all_tests)}")
print(f"Significant findings (p < 0.05): {len(df_significant)}")

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
print("\nFiles generated:")
print("1. lgbtq_vs_general_comparison.csv - LGBTQ+ vs General population comparisons")
print("2. lgbtq_equity_tests_all.csv - All within-LGBTQ+ equity tests")
print("3. lgbtq_equity_tests_significant.csv - Significant within-LGBTQ+ findings")
print("4. lgbtq_equity_crosstabs.csv - Detailed crosstabs for significant findings")

# Print top gaps
print("\n" + "="*80)
print("TOP 10 LGBTQ+ VS GENERAL GAPS (by p-value)")
print("="*80)
if len(df_comparison) > 0:
    top_comparison = df_comparison.head(10)
    for idx, row in top_comparison.iterrows():
        if pd.notna(row['gap_percent']):
            print(f"{row['outcome_label']}: {row['gap']:.1f} ({row['gap_percent']:+.1f}%), p={row['p_value']:.4f}")
        else:
            print(f"{row['outcome_label']}: {row['gap']:+.1f} pp, p={row['p_value']:.4f}")

print("\n" + "="*80)
print("TOP 10 WITHIN-LGBTQ+ EQUITY GAPS (by effect size)")
print("="*80)
if len(df_significant) > 0:
    top_equity = df_significant.nlargest(10, 'equity_gap')
    for idx, row in top_equity.iterrows():
        print(f"{row['outcome_label']} by {row['stratify_label']}: {row['equity_gap']:.1f} {row['equity_gap_unit']}")
