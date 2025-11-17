import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import chi2_contingency, f_oneway, ttest_ind, mannwhitneyu, kruskal
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("ELDERLY EQUITY ANALYSIS: Descriptive Statistics with Statistical Testing")
print("="*80)

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')
print(f"\nTotal sample: {len(df)} respondents")

# Filter elderly (age 60+)
df_elderly = df[df['age'] >= 60].copy()
print(f"Elderly sample (age 60+): {len(df_elderly)} respondents")

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

df_elderly['monthly_income'] = df_elderly.apply(calculate_monthly_income, axis=1)

# Calculate BMI
df_elderly['bmi'] = df_elderly['weight'] / ((df_elderly['height']/100) ** 2)

# Create stratification variables
# Income groups (tertiles)
df_elderly['income_group'] = pd.cut(df_elderly['monthly_income'],
                                     bins=[0, 12000, 15000, 1000000],
                                     labels=['Low', 'Middle', 'High'])

# Education groups
df_elderly['education_group'] = pd.cut(df_elderly['education'],
                                        bins=[-1, 2, 3, 8],
                                        labels=['Low', 'Middle', 'High'])

# Age groups
df_elderly['age_group'] = pd.cut(df_elderly['age'],
                                  bins=[59, 69, 79, 150],
                                  labels=['60-69', '70-79', '80+'])

# Working status
df_elderly['working'] = df_elderly['occupation_status']

# Gender
df_elderly['gender'] = df_elderly['sex'].map({1: 'Male', 2: 'Female', 3: 'LGBT'})

# Home ownership
df_elderly['homeowner'] = df_elderly['house_status'].apply(lambda x: 'Owner' if x == 1 else 'Renter' if x == 2 else 'Other')

# Disability
df_elderly['disabled'] = df_elderly['disable_status']

print("\n" + "="*80)
print("STRATIFICATION GROUP DEFINITIONS")
print("="*80)

# Show income group definitions
print("\nINCOME GROUPS:")
income_stats = df_elderly.groupby('income_group')['monthly_income'].agg(['count', 'min', 'max', 'mean', 'median'])
print(income_stats.round(0))

# Show education group definitions
print("\nEDUCATION GROUPS:")
education_stats = df_elderly.groupby('education_group')['education'].agg(['count', 'min', 'max'])
print(education_stats)

# Show age group definitions
print("\nAGE GROUPS:")
age_stats = df_elderly.groupby('age_group')['age'].agg(['count', 'min', 'max', 'mean'])
print(age_stats.round(1))

# Show other group distributions
print("\nGENDER DISTRIBUTION:")
print(df_elderly['gender'].value_counts())

print("\nWORKING STATUS:")
print(df_elderly['working'].value_counts())

print("\nHOME OWNERSHIP:")
print(df_elderly['homeowner'].value_counts())

print("\nDISABILITY STATUS:")
print(df_elderly['disabled'].value_counts())

# ============================================================================
# FUNCTIONS FOR STATISTICAL TESTING
# ============================================================================

def cramers_v(chi2, n, k, r):
    """Calculate Cramer's V effect size for chi-square test"""
    return np.sqrt(chi2 / (n * min(k-1, r-1)))

def cohens_d(group1, group2):
    """Calculate Cohen's d effect size for t-test"""
    n1, n2 = len(group1), len(group2)
    var1, var2 = np.var(group1, ddof=1), np.var(group2, ddof=1)
    pooled_std = np.sqrt(((n1-1)*var1 + (n2-1)*var2) / (n1+n2-2))
    return (np.mean(group1) - np.mean(group2)) / pooled_std

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
    # Remove missing values
    df_test = df[[outcome_var, stratify_var]].dropna()

    if len(df_test) < 30:
        return None

    # Create contingency table
    contingency = pd.crosstab(df_test[stratify_var], df_test[outcome_var])

    # Skip if any group has < 5 observations
    if (contingency < 5).any().any():
        return None

    # Perform chi-square test
    chi2, p_value, dof, expected = chi2_contingency(contingency)

    # Calculate Cramer's V
    n = contingency.sum().sum()
    k = contingency.shape[0]  # number of rows
    r = contingency.shape[1]  # number of columns
    cramers = cramers_v(chi2, n, k, r)

    # Calculate percentages by group
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
    # Remove missing values
    df_test = df[[outcome_var, stratify_var]].dropna()

    if len(df_test) < 30:
        return None

    # Get groups
    groups = [group[outcome_var].values for name, group in df_test.groupby(stratify_var)]

    # Check if we have enough groups with enough data
    if len(groups) < 2 or any(len(g) < 5 for g in groups):
        return None

    # Perform ANOVA
    f_stat, p_value = f_oneway(*groups)

    # Calculate descriptive stats by group
    group_stats = df_test.groupby(stratify_var)[outcome_var].agg(['count', 'mean', 'std', 'median'])

    # Calculate effect size (eta-squared)
    # SS_between / SS_total
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
# DEFINE OUTCOME VARIABLES AND DOMAINS
# ============================================================================

# Categorical outcomes (0/1 or ordinal)
categorical_outcomes = {
    # Health outcomes
    'medical_skip_1': 'Skip medical care due to cost',
    'oral_health': 'Oral health problems',
    'oral_health_access': 'Access to dental care (if problems)',
    'diseases_status': 'Has chronic diseases',
    'disable_status': 'Has disability',
    'health_pollution': 'Health impact from air pollution',

    # Health behaviors
    'smoke_status': 'Smoking status',
    'drink_status': 'Alcohol consumption',
    'exercise_status': 'Exercise frequency',

    # Economic security
    'food_insecurity_1': 'Food insecurity (reduced meals)',
    'food_insecurity_2': 'Food insecurity (skip full day)',

    # Literacy
    'speak': 'Can speak Thai',
    'read': 'Can read Thai',
    'write': 'Can write Thai',
    'math': 'Can do basic math',
    'training': 'Participated in training (past 12 months)',

    # Employment
    'occupation_status': 'Currently working',
    'occupation_contract': 'Has employment contract',
    'occupation_welfare': 'Has work benefits',
    'occupation_injury': 'Work injury (serious, past 12 months)',
    'occupation_small_injury': 'Work injury (minor, past 12 months)',

    # Violence & safety
    'physical_violence': 'Experienced physical violence (past 12 months)',
    'psychological_violence': 'Experienced psychological violence (past 12 months)',
    'sexual_violence': 'Experienced sexual violence (past 12 months)',
    'community_safety': 'Community safety perception',
    'discrimination': 'Experienced discrimination (past 12 months)',
    'helper': 'Has emergency support person',

    # Housing
    'house_status': 'Home ownership status',

    # Household composition
    'family_status': 'Lives with family',
}

# Continuous outcomes
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

# Stratification variables
stratify_vars = {
    'income_group': 'Income Level',
    'education_group': 'Education Level',
    'age_group': 'Age Group',
    'gender': 'Gender',
    'working': 'Working Status',
    'homeowner': 'Home Ownership',
    'disabled': 'Disability Status',
}

# ============================================================================
# RUN ANALYSES
# ============================================================================

all_results = []

print("\n" + "="*80)
print("RUNNING STATISTICAL TESTS")
print("="*80)

# Test categorical outcomes
for outcome_var, outcome_label in categorical_outcomes.items():
    if outcome_var not in df_elderly.columns:
        continue

    print(f"\nTesting: {outcome_label}")

    for stratify_var, stratify_label in stratify_vars.items():
        if stratify_var not in df_elderly.columns:
            continue

        result = chi_square_test(df_elderly, outcome_var, stratify_var)

        if result is not None:
            # Calculate equity gap (highest - lowest group percentage)
            percentages = result['percentages']
            if outcome_var in ['medical_skip_1', 'food_insecurity_1', 'food_insecurity_2',
                               'physical_violence', 'psychological_violence', 'sexual_violence',
                               'discrimination', 'health_pollution', 'occupation_injury',
                               'occupation_small_injury', 'oral_health', 'disable_status',
                               'diseases_status']:
                # For "bad" outcomes, use column 1 (has problem)
                if 1 in percentages.columns:
                    group_pcts = percentages[1]
                    equity_gap = group_pcts.max() - group_pcts.min()
                    highest_group = group_pcts.idxmax()
                    lowest_group = group_pcts.idxmin()
                else:
                    continue
            else:
                # For other outcomes, just report without gap
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
    if outcome_var not in df_elderly.columns:
        continue

    print(f"\nTesting: {outcome_label}")

    for stratify_var, stratify_label in stratify_vars.items():
        if stratify_var not in df_elderly.columns:
            continue

        result = anova_test(df_elderly, outcome_var, stratify_var)

        if result is not None:
            # Calculate equity gap (highest - lowest group mean)
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
results_df = results_df.sort_values(['significant', 'p_value'], ascending=[False, True])

# Save all results
results_df.to_csv('elderly_equity_statistical_tests_all.csv', index=False, encoding='utf-8-sig')
print(f"\n\nSaved all results: elderly_equity_statistical_tests_all.csv ({len(results_df)} tests)")

# Save only significant results
significant_df = results_df[results_df['significant'] == 'Yes']
significant_df.to_csv('elderly_equity_statistical_tests_significant.csv', index=False, encoding='utf-8-sig')
print(f"Saved significant results: elderly_equity_statistical_tests_significant.csv ({len(significant_df)} tests)")

# ============================================================================
# CREATE DETAILED CROSSTABS FOR TOP FINDINGS
# ============================================================================

print("\n" + "="*80)
print("GENERATING DETAILED CROSSTABS FOR TOP EQUITY GAPS")
print("="*80)

# Get top 20 findings by equity gap
top_findings = significant_df.nlargest(20, 'equity_gap_percentage_points')

detailed_results = []

for idx, row in top_findings.iterrows():
    outcome_var = row['outcome_variable']
    stratify_var = row['stratify_variable']

    print(f"\n{row['outcome_label']} by {row['stratify_label']}")

    # Create detailed crosstab
    df_temp = df_elderly[[outcome_var, stratify_var]].dropna()

    if len(df_temp) < 30:
        continue

    # For categorical outcomes
    if row['test_type'] == 'chi_square':
        contingency = pd.crosstab(df_temp[stratify_var], df_temp[outcome_var], margins=True)
        percentages = pd.crosstab(df_temp[stratify_var], df_temp[outcome_var], normalize='index') * 100

        print("Counts:")
        print(contingency)
        print("\nPercentages:")
        print(percentages.round(1))

        # Save to detailed results
        for group in contingency.index[:-1]:  # Exclude 'All' row
            for value in contingency.columns[:-1]:  # Exclude 'All' column
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

    # For continuous outcomes
    elif row['test_type'] == 'anova':
        group_stats = df_temp.groupby(stratify_var)[outcome_var].agg(['count', 'mean', 'std', 'median', 'min', 'max'])
        print(group_stats.round(1))

        # Save to detailed results
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

# Save detailed crosstabs
detailed_df = pd.DataFrame(detailed_results)
detailed_df.to_csv('elderly_equity_detailed_crosstabs.csv', index=False, encoding='utf-8-sig')
print(f"\n\nSaved detailed crosstabs: elderly_equity_detailed_crosstabs.csv ({len(detailed_df)} group-level results)")

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
print("\nFiles generated:")
print("1. elderly_equity_statistical_tests_all.csv - All statistical tests")
print("2. elderly_equity_statistical_tests_significant.csv - Significant results only")
print("3. elderly_equity_detailed_crosstabs.csv - Detailed percentages and counts")
