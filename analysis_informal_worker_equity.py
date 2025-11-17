import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import chi2_contingency, f_oneway, ttest_ind
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("INFORMAL WORKER EQUITY ANALYSIS")
print("="*80)

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')
print(f"\nTotal sample: {len(df)} respondents")

# Calculate monthly income
def calculate_monthly_income(row):
    if pd.isna(row['income_type']) or pd.isna(row['income']):
        return np.nan
    income_val = row['income']
    income_type = row['income_type']

    if income_type == 1:    # Daily income
        return income_val * 30
    elif income_type == 2:  # Monthly income
        return income_val
    else:
        return np.nan

df['monthly_income'] = df.apply(calculate_monthly_income, axis=1)

# Calculate BMI
df['bmi'] = df['weight'] / ((df['height']/100) ** 2)

# ============================================================================
# PART 1: INFORMAL VS FORMAL WORKERS (Context)
# ============================================================================

print("\n" + "="*80)
print("PART 1: INFORMAL VS FORMAL WORKERS COMPARISON (CONTEXT)")
print("="*80)

# Define working population (all ages, currently working)
df_workers = df[df['occupation_status'] == 1].copy()
print(f"\nWorking population (all ages, currently working): {len(df_workers)} respondents")

# Define informal workers (occupation_type = '6') and formal workers ('1', '2', '3')
# Note: occupation_type is stored as string in the data
df_workers['worker_type'] = df_workers['occupation_type'].apply(
    lambda x: 'Informal' if str(x) == '6' else 'Formal' if str(x) in ['1', '2', '3'] else 'Other'
)

df_informal = df_workers[df_workers['worker_type'] == 'Informal'].copy()
df_formal = df_workers[df_workers['worker_type'] == 'Formal'].copy()

print(f"Informal workers (occupation_type=6): {len(df_informal)} respondents")
print(f"Formal workers (occupation_type=1,2,3): {len(df_formal)} respondents")

# Quick comparison table
comparison_results = []

def compare_groups(outcome_var, outcome_label, is_binary=True):
    """Compare informal vs formal workers"""
    if outcome_var not in df_workers.columns:
        return None

    df_temp = df_workers[['worker_type', outcome_var]].dropna()
    df_temp = df_temp[df_temp['worker_type'].isin(['Informal', 'Formal'])]

    if len(df_temp) < 30:
        return None

    informal_vals = df_temp[df_temp['worker_type'] == 'Informal'][outcome_var]
    formal_vals = df_temp[df_temp['worker_type'] == 'Formal'][outcome_var]

    if len(informal_vals) < 10 or len(formal_vals) < 10:
        return None

    if is_binary:
        # Calculate percentages for binary outcomes
        informal_pct = (informal_vals == 1).sum() / len(informal_vals) * 100
        formal_pct = (formal_vals == 1).sum() / len(formal_vals) * 100
        gap = informal_pct - formal_pct

        # Chi-square test
        contingency = pd.crosstab(df_temp['worker_type'], df_temp[outcome_var])
        if (contingency >= 5).all().all():
            chi2, p_value, _, _ = chi2_contingency(contingency)

            return {
                'outcome': outcome_label,
                'informal_value': f"{informal_pct:.1f}%",
                'formal_value': f"{formal_pct:.1f}%",
                'gap': f"{gap:+.1f} pp",
                'p_value': p_value,
                'informal_n': len(informal_vals),
                'formal_n': len(formal_vals)
            }
    else:
        # Calculate means for continuous outcomes
        informal_mean = informal_vals.mean()
        formal_mean = formal_vals.mean()
        gap = informal_mean - formal_mean
        gap_pct = (gap / formal_mean * 100) if formal_mean != 0 else 0

        # T-test
        t_stat, p_value = ttest_ind(informal_vals, formal_vals, nan_policy='omit')

        return {
            'outcome': outcome_label,
            'informal_value': f"{informal_mean:,.0f}",
            'formal_value': f"{formal_mean:,.0f}",
            'gap': f"{gap:+,.0f} ({gap_pct:+.0f}%)",
            'p_value': p_value,
            'informal_n': len(informal_vals),
            'formal_n': len(formal_vals)
        }

    return None

# Key comparisons
print("\n" + "-"*80)
print("KEY COMPARISONS: INFORMAL VS FORMAL WORKERS")
print("-"*80)

comparisons = [
    ('monthly_income', 'Monthly income (baht)', False),
    ('occupation_contract', 'Has employment contract', True),
    ('occupation_welfare', 'Has work benefits', True),
    ('occupation_injury', 'Work injury (serious, past 12 months)', True),
    ('occupation_small_injury', 'Work injury (minor, past 12 months)', True),
    ('medical_skip_1', 'Skip medical care due to cost', True),
    ('food_insecurity_1', 'Food insecurity (reduced meals)', True),
    ('working_hours', 'Working hours per day', False),
]

for outcome_var, outcome_label, is_binary in comparisons:
    result = compare_groups(outcome_var, outcome_label, is_binary)
    if result:
        comparison_results.append(result)
        print(f"\n{outcome_label}:")
        print(f"  Informal: {result['informal_value']} (n={result['informal_n']})")
        print(f"  Formal:   {result['formal_value']} (n={result['formal_n']})")
        print(f"  Gap:      {result['gap']}")
        print(f"  P-value:  {result['p_value']:.4f} {'***' if result['p_value'] < 0.001 else '**' if result['p_value'] < 0.01 else '*' if result['p_value'] < 0.05 else 'ns'}")

# Save comparison results
comparison_df = pd.DataFrame(comparison_results)
comparison_df.to_csv('informal_vs_formal_comparison.csv', index=False, encoding='utf-8-sig')
print(f"\n\nSaved comparison: informal_vs_formal_comparison.csv")

# ============================================================================
# PART 2: WITHIN INFORMAL WORKERS ANALYSIS (Main Focus)
# ============================================================================

print("\n" + "="*80)
print("PART 2: WITHIN INFORMAL WORKERS EQUITY ANALYSIS")
print("="*80)

print(f"\nInformal worker sample: {len(df_informal)} respondents")

# Create stratification variables
# Income groups (tertiles)
df_informal['income_group'] = pd.cut(df_informal['monthly_income'],
                                      bins=[0, 10000, 15000, 1000000],
                                      labels=['Low', 'Middle', 'High'])

# Education groups
df_informal['education_group'] = pd.cut(df_informal['education'],
                                         bins=[-1, 2, 4, 8],
                                         labels=['Low', 'Middle', 'High'])

# Age groups (include all ages including elderly)
df_informal['age_group'] = pd.cut(df_informal['age'],
                                   bins=[14, 29, 44, 59, 150],
                                   labels=['15-29', '30-44', '45-59', '60+'])

# Working hours groups
df_informal['work_hours_group'] = pd.cut(df_informal['working_hours'],
                                          bins=[0, 8, 10, 24],
                                          labels=['<8 hrs', '8-10 hrs', '>10 hrs'])

# Gender
df_informal['gender'] = df_informal['sex'].map({1: 'Male', 2: 'Female', 3: 'LGBT'})

# Home ownership
df_informal['homeowner'] = df_informal['house_status'].apply(
    lambda x: 'Owner' if x == 1 else 'Renter' if x == 2 else 'Other'
)

# Disability
df_informal['disabled'] = df_informal['disable_status']

# Has dependents (children or elderly in household)
df_informal['has_children'] = (df_informal['hh_child_count'] > 0).astype(int)
df_informal['has_elderly'] = (df_informal['hh_elder_count'] > 0).astype(int)

print("\n" + "="*80)
print("STRATIFICATION GROUP DEFINITIONS (INFORMAL WORKERS)")
print("="*80)

# Show income group definitions
print("\nINCOME GROUPS:")
income_stats = df_informal.groupby('income_group')['monthly_income'].agg(['count', 'min', 'max', 'mean', 'median'])
print(income_stats.round(0))

# Show education group definitions
print("\nEDUCATION GROUPS:")
education_stats = df_informal.groupby('education_group')['education'].agg(['count', 'min', 'max'])
print(education_stats)

# Show age group definitions
print("\nAGE GROUPS:")
age_stats = df_informal.groupby('age_group')['age'].agg(['count', 'min', 'max', 'mean'])
print(age_stats.round(1))

# Show work hours group definitions
print("\nWORK HOURS GROUPS:")
work_hours_stats = df_informal.groupby('work_hours_group')['working_hours'].agg(['count', 'min', 'max', 'mean'])
print(work_hours_stats.round(1))

# Show other group distributions
print("\nGENDER DISTRIBUTION:")
print(df_informal['gender'].value_counts())

print("\nHOME OWNERSHIP:")
print(df_informal['homeowner'].value_counts())

print("\nDISABILITY STATUS:")
print(df_informal['disabled'].value_counts())

print("\nHAS CHILDREN (<5 years):")
print(df_informal['has_children'].value_counts())

# ============================================================================
# STATISTICAL TESTING FUNCTIONS
# ============================================================================

def cramers_v(chi2, n, k, r):
    """Calculate Cramer's V effect size for chi-square test"""
    return np.sqrt(chi2 / (n * min(k-1, r-1)))

def interpret_effect_size(effect_size, test_type='cramers_v'):
    """Interpret effect size magnitude"""
    if test_type == 'cramers_v':
        if effect_size < 0.1:
            return 'negligible'
        elif effect_size < 0.3:
            return 'small'
        elif effect_size < 0.5:
            return 'medium'
        else:
            return 'large'
    elif test_type == 'cohens_d':
        abs_d = abs(effect_size)
        if abs_d < 0.2:
            return 'negligible'
        elif abs_d < 0.5:
            return 'small'
        elif abs_d < 0.8:
            return 'medium'
        else:
            return 'large'

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
    cramers = cramers_v(chi2, n, k, r)

    percentages = contingency.div(contingency.sum(axis=1), axis=0) * 100

    return {
        'chi2': chi2,
        'p_value': p_value,
        'cramers_v': cramers,
        'effect_size': interpret_effect_size(cramers, 'cramers_v'),
        'contingency': contingency,
        'percentages': percentages,
        'n': n
    }

def anova_test(df, outcome_var, stratify_var):
    """Perform ANOVA for continuous outcome across groups"""
    df_test = df[[outcome_var, stratify_var]].dropna()

    if len(df_test) < 30:
        return None

    groups = [group[outcome_var].values for name, group in df_test.groupby(stratify_var)]

    if len(groups) < 2 or any(len(g) < 5 for g in groups):
        return None

    f_stat, p_value = f_oneway(*groups)

    group_stats = df_test.groupby(stratify_var)[outcome_var].agg(['count', 'mean', 'std', 'median'])

    grand_mean = df_test[outcome_var].mean()
    ss_between = sum(len(g) * (np.mean(g) - grand_mean)**2 for g in groups)
    ss_total = sum((df_test[outcome_var] - grand_mean)**2)
    eta_squared = ss_between / ss_total if ss_total > 0 else 0

    return {
        'f_stat': f_stat,
        'p_value': p_value,
        'eta_squared': eta_squared,
        'effect_size': interpret_effect_size(np.sqrt(eta_squared), 'cohens_d'),
        'group_stats': group_stats,
        'n': len(df_test)
    }

# ============================================================================
# DEFINE OUTCOME VARIABLES
# ============================================================================

categorical_outcomes = {
    'medical_skip_1': 'Skip medical care due to cost',
    'oral_health': 'Oral health problems',
    'diseases_status': 'Has chronic diseases',
    'disable_status': 'Has disability',
    'health_pollution': 'Health impact from air pollution',
    'smoke_status': 'Smoking status',
    'drink_status': 'Alcohol consumption',
    'exercise_status': 'Exercise frequency',
    'food_insecurity_1': 'Food insecurity (reduced meals)',
    'food_insecurity_2': 'Food insecurity (skip full day)',
    'speak': 'Can speak Thai',
    'read': 'Can read Thai',
    'write': 'Can write Thai',
    'math': 'Can do basic math',
    'training': 'Participated in training (past 12 months)',
    'occupation_contract': 'Has employment contract',
    'occupation_welfare': 'Has work benefits',
    'occupation_injury': 'Work injury (serious, past 12 months)',
    'occupation_small_injury': 'Work injury (minor, past 12 months)',
    'physical_violence': 'Experienced physical violence (past 12 months)',
    'psychological_violence': 'Experienced psychological violence (past 12 months)',
    'sexual_violence': 'Experienced sexual violence (past 12 months)',
    'community_safety': 'Community safety perception',
    'discrimination': 'Experienced discrimination (past 12 months)',
    'helper': 'Has emergency support person',
    'house_status': 'Home ownership status',
    'family_status': 'Lives with family',
}

continuous_outcomes = {
    'bmi': 'Body Mass Index (BMI)',
    'health_expense': 'Personal health expenses (baht/month)',
    'hh_health_expense': 'Household health expenses (baht/month)',
    'monthly_income': 'Monthly income (baht)',
    'working_hours': 'Working hours per day',
    'rent_price': 'Monthly rent (baht)',
    'hh_child_count': 'Number of children (<5) in household',
    'hh_worker_count': 'Number of workers (15-59) in household',
    'hh_elder_count': 'Number of elderly (60+) in household',
}

stratify_vars = {
    'income_group': 'Income Level',
    'education_group': 'Education Level',
    'age_group': 'Age Group',
    'work_hours_group': 'Work Hours',
    'gender': 'Gender',
    'homeowner': 'Home Ownership',
    'disabled': 'Disability Status',
    'has_children': 'Has Children (<5)',
}

# ============================================================================
# RUN ANALYSES
# ============================================================================

all_results = []

print("\n" + "="*80)
print("RUNNING STATISTICAL TESTS (WITHIN INFORMAL WORKERS)")
print("="*80)

# Test categorical outcomes
for outcome_var, outcome_label in categorical_outcomes.items():
    if outcome_var not in df_informal.columns:
        continue

    print(f"\nTesting: {outcome_label}")

    for stratify_var, stratify_label in stratify_vars.items():
        if stratify_var not in df_informal.columns:
            continue

        result = chi_square_test(df_informal, outcome_var, stratify_var)

        if result is not None:
            percentages = result['percentages']
            if outcome_var in ['medical_skip_1', 'food_insecurity_1', 'food_insecurity_2',
                               'physical_violence', 'psychological_violence', 'sexual_violence',
                               'discrimination', 'health_pollution', 'occupation_injury',
                               'occupation_small_injury', 'oral_health', 'disable_status',
                               'diseases_status']:
                if 1 in percentages.columns:
                    group_pcts = percentages[1]
                    equity_gap = group_pcts.max() - group_pcts.min()
                    highest_group = group_pcts.idxmax()
                    lowest_group = group_pcts.idxmin()
                else:
                    continue
            else:
                equity_gap = np.nan
                highest_group = ''
                lowest_group = ''

            all_results.append({
                'outcome_variable': outcome_var,
                'outcome_label': outcome_label,
                'stratify_variable': stratify_var,
                'stratify_label': stratify_label,
                'test_type': 'chi_square',
                'test_statistic': result['chi2'],
                'p_value': result['p_value'],
                'effect_size_value': result['cramers_v'],
                'effect_size_interpretation': result['effect_size'],
                'equity_gap_percentage_points': equity_gap,
                'highest_group': highest_group,
                'lowest_group': lowest_group,
                'sample_size': result['n'],
                'significant': 'Yes' if result['p_value'] < 0.05 else 'No'
            })

            if result['p_value'] < 0.05:
                print(f"  - {stratify_label}: chi2={result['chi2']:.1f}, p={result['p_value']:.4f}, Cramer's V={result['cramers_v']:.3f} ({result['effect_size']})")

# Test continuous outcomes
for outcome_var, outcome_label in continuous_outcomes.items():
    if outcome_var not in df_informal.columns:
        continue

    print(f"\nTesting: {outcome_label}")

    for stratify_var, stratify_label in stratify_vars.items():
        if stratify_var not in df_informal.columns:
            continue

        result = anova_test(df_informal, outcome_var, stratify_var)

        if result is not None:
            group_means = result['group_stats']['mean']
            equity_gap = group_means.max() - group_means.min()
            highest_group = group_means.idxmax()
            lowest_group = group_means.idxmin()

            all_results.append({
                'outcome_variable': outcome_var,
                'outcome_label': outcome_label,
                'stratify_variable': stratify_var,
                'stratify_label': stratify_label,
                'test_type': 'anova',
                'test_statistic': result['f_stat'],
                'p_value': result['p_value'],
                'effect_size_value': result['eta_squared'],
                'effect_size_interpretation': result['effect_size'],
                'equity_gap_percentage_points': equity_gap,
                'highest_group': highest_group,
                'lowest_group': lowest_group,
                'sample_size': result['n'],
                'significant': 'Yes' if result['p_value'] < 0.05 else 'No'
            })

            if result['p_value'] < 0.05:
                print(f"  - {stratify_label}: F={result['f_stat']:.1f}, p={result['p_value']:.4f}, eta2={result['eta_squared']:.3f} ({result['effect_size']})")

# ============================================================================
# SAVE RESULTS
# ============================================================================

results_df = pd.DataFrame(all_results)
if len(results_df) > 0:
    results_df = results_df.sort_values(['significant', 'p_value'], ascending=[False, True])
else:
    print("\nNo results found!")

results_df.to_csv('informal_worker_equity_tests_all.csv', index=False, encoding='utf-8-sig')
print(f"\n\nSaved all results: informal_worker_equity_tests_all.csv ({len(results_df)} tests)")

significant_df = results_df[results_df['significant'] == 'Yes']
significant_df.to_csv('informal_worker_equity_tests_significant.csv', index=False, encoding='utf-8-sig')
print(f"Saved significant results: informal_worker_equity_tests_significant.csv ({len(significant_df)} tests)")

# ============================================================================
# CREATE DETAILED CROSSTABS
# ============================================================================

print("\n" + "="*80)
print("GENERATING DETAILED CROSSTABS FOR TOP FINDINGS")
print("="*80)

top_findings = significant_df.nlargest(20, 'equity_gap_percentage_points')

detailed_results = []

for idx, row in top_findings.iterrows():
    outcome_var = row['outcome_variable']
    stratify_var = row['stratify_variable']

    print(f"\n{row['outcome_label']} by {row['stratify_label']}")

    df_temp = df_informal[[outcome_var, stratify_var]].dropna()

    if len(df_temp) < 30:
        continue

    if row['test_type'] == 'chi_square':
        contingency = pd.crosstab(df_temp[stratify_var], df_temp[outcome_var], margins=True)
        percentages = pd.crosstab(df_temp[stratify_var], df_temp[outcome_var], normalize='index') * 100

        print("Counts:")
        print(contingency)
        print("\nPercentages:")
        print(percentages.round(1))

        for group in contingency.index[:-1]:
            for value in contingency.columns[:-1]:
                detailed_results.append({
                    'outcome_variable': outcome_var,
                    'outcome_label': row['outcome_label'],
                    'outcome_value': value,
                    'stratify_variable': stratify_var,
                    'stratify_label': row['stratify_label'],
                    'stratify_group': group,
                    'count': contingency.loc[group, value],
                    'percentage': percentages.loc[group, value] if group in percentages.index else np.nan,
                    'group_total': contingency.loc[group, 'All'] if 'All' in contingency.columns else np.nan,
                })

    elif row['test_type'] == 'anova':
        group_stats = df_temp.groupby(stratify_var)[outcome_var].agg(['count', 'mean', 'std', 'median', 'min', 'max'])
        print(group_stats.round(1))

        for group in group_stats.index:
            detailed_results.append({
                'outcome_variable': outcome_var,
                'outcome_label': row['outcome_label'],
                'outcome_value': 'continuous',
                'stratify_variable': stratify_var,
                'stratify_label': row['stratify_label'],
                'stratify_group': group,
                'count': group_stats.loc[group, 'count'],
                'mean': group_stats.loc[group, 'mean'],
                'std': group_stats.loc[group, 'std'],
                'median': group_stats.loc[group, 'median'],
                'min': group_stats.loc[group, 'min'],
                'max': group_stats.loc[group, 'max'],
            })

detailed_df = pd.DataFrame(detailed_results)
detailed_df.to_csv('informal_worker_equity_crosstabs.csv', index=False, encoding='utf-8-sig')
print(f"\n\nSaved detailed crosstabs: informal_worker_equity_crosstabs.csv ({len(detailed_df)} group-level results)")

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
print("\nFiles generated:")
print("1. informal_vs_formal_comparison.csv - Informal vs Formal workers comparison")
print("2. informal_worker_equity_tests_all.csv - All statistical tests (within informal)")
print("3. informal_worker_equity_tests_significant.csv - Significant results only")
print("4. informal_worker_equity_crosstabs.csv - Detailed percentages and counts")
