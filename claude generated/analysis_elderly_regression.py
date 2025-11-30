"""
Multiple Regression Analysis for Elderly Population
====================================================

This script performs multiple regression analysis on elderly population (age 60+)
to identify true predictors of health, economic, and social outcomes while
controlling for confounding variables.

Based on: REGRESSION_ANALYSIS_DESIGN.md
"""

import pandas as pd
import numpy as np
from scipy import stats
import statsmodels.api as sm
from statsmodels.formula.api import logit, ols
import warnings
warnings.filterwarnings('ignore')

def load_elderly_data():
    """Load and filter elderly population (age 60+)"""
    print("Loading data...")
    df = pd.read_csv('public/data/survey_sampling.csv')

    # Filter elderly only (age >= 60)
    elderly = df[df['age'] >= 60].copy()
    print(f"Elderly sample size: {len(elderly)}")

    return elderly

def prepare_variables(df):
    """Prepare variables for regression analysis"""
    print("\nPreparing variables...")

    # Calculate monthly income
    def calculate_monthly_income(row):
        if pd.isna(row['income_type']) or pd.isna(row['income']):
            return np.nan
        income_val = row['income']
        income_type = row['income_type']

        if income_type == 1:    # Daily
            return income_val * 30
        elif income_type == 2:  # Monthly
            return income_val
        else:
            return np.nan

    df['income_monthly'] = df.apply(calculate_monthly_income, axis=1)

    # Calculate BMI
    df['BMI'] = df.apply(lambda row: row['weight'] / ((row['height']/100) ** 2)
                         if pd.notna(row['weight']) and pd.notna(row['height']) and row['height'] > 0
                         else np.nan, axis=1)

    # Create gender dummies
    df['sex_male'] = (df['sex'] == 1).astype(int)
    df['sex_female'] = (df['sex'] == 2).astype(int)

    # Create age groups
    df['age_60_69'] = ((df['age'] >= 60) & (df['age'] < 70)).astype(int)
    df['age_70_79'] = ((df['age'] >= 70) & (df['age'] < 80)).astype(int)
    df['age_80_plus'] = (df['age'] >= 80).astype(int)

    # Create income tertiles
    income_valid = df['income_monthly'].dropna()
    if len(income_valid) > 0:
        p33 = income_valid.quantile(0.33)
        p67 = income_valid.quantile(0.67)

        df['income_low'] = (df['income_monthly'] <= p33).astype(int)
        df['income_middle'] = ((df['income_monthly'] > p33) & (df['income_monthly'] <= p67)).astype(int)
        df['income_high'] = (df['income_monthly'] > p67).astype(int)

    # Create education levels
    # Education: 0=Never, 1-2=Primary, 3-4=Secondary, 5-6=Vocational, 7-8=Bachelor+
    if 'education' in df.columns:
        df['edu_low'] = (df['education'].isin([0, 1, 2])).astype(int)  # None or Primary
        df['edu_medium'] = (df['education'].isin([3, 4, 5, 6])).astype(int)  # Secondary/Vocational
        df['edu_high'] = (df['education'].isin([7, 8])).astype(int)  # Bachelor+

    # Create discrimination indicator (any discrimination)
    discrimination_cols = ['discrimination_1', 'discrimination_2', 'discrimination_3',
                          'discrimination_4', 'discrimination_5']
    if all(col in df.columns for col in discrimination_cols):
        df['discrimination'] = (df[discrimination_cols].sum(axis=1) > 0).astype(int)

    print("Variables prepared successfully")
    return df

def run_logistic_regression(df, dependent_var, independent_vars, model_name):
    """
    Run logistic regression for binary outcomes
    Returns: model results and coefficients table
    """
    print(f"\n{'='*80}")
    print(f"Model: {model_name}")
    print(f"Dependent Variable: {dependent_var}")
    print(f"{'='*80}")

    # Create formula
    formula = f"{dependent_var} ~ " + " + ".join(independent_vars)

    # Filter data with non-missing values
    vars_needed = [dependent_var] + independent_vars
    df_model = df[vars_needed].dropna()

    print(f"Sample size (complete cases): {len(df_model)}")

    if len(df_model) < 100:
        print(f"WARNING: Small sample size ({len(df_model)}). Results may be unreliable.")
        return None, None

    try:
        # Fit logistic regression
        model = logit(formula, data=df_model).fit(disp=0)

        # Extract results
        results = {
            'model_name': model_name,
            'dependent_var': dependent_var,
            'model_type': 'Logistic Regression',
            'sample_size': len(df_model),
            'num_predictors': len(independent_vars),
            'pseudo_r_squared': model.prsquared,
            'llr_pvalue': model.llr_pvalue
        }

        # Extract coefficients
        coef_df = pd.DataFrame({
            'model_name': model_name,
            'predictor': model.params.index,
            'coefficient': model.params.values,
            'std_error': model.bse.values,
            'odds_ratio': np.exp(model.params.values),
            'p_value': model.pvalues.values,
            'ci_lower': model.conf_int()[0].values,
            'ci_upper': model.conf_int()[1].values
        })

        # Add significance flag
        coef_df['significant'] = coef_df['p_value'] < 0.05

        # Print summary
        print(f"\nPseudo R-squared: {model.prsquared:.4f}")
        print(f"Model p-value: {model.llr_pvalue:.4e}")
        print(f"\nSignificant Predictors (p < 0.05):")
        sig_coefs = coef_df[coef_df['significant'] & (coef_df['predictor'] != 'Intercept')]
        if len(sig_coefs) > 0:
            for _, row in sig_coefs.iterrows():
                print(f"  {row['predictor']:30s}: OR={row['odds_ratio']:6.3f}, p={row['p_value']:.4f}")
        else:
            print("  No significant predictors found")

        return results, coef_df

    except Exception as e:
        print(f"ERROR: Model fitting failed - {e}")
        return None, None

def run_ols_regression(df, dependent_var, independent_vars, model_name):
    """
    Run OLS regression for continuous outcomes
    Returns: model results and coefficients table
    """
    print(f"\n{'='*80}")
    print(f"Model: {model_name}")
    print(f"Dependent Variable: {dependent_var}")
    print(f"{'='*80}")

    # Create formula
    formula = f"{dependent_var} ~ " + " + ".join(independent_vars)

    # Filter data with non-missing values
    vars_needed = [dependent_var] + independent_vars
    df_model = df[vars_needed].dropna()

    print(f"Sample size (complete cases): {len(df_model)}")

    if len(df_model) < 100:
        print(f"WARNING: Small sample size ({len(df_model)}). Results may be unreliable.")
        return None, None

    try:
        # Fit OLS regression
        model = ols(formula, data=df_model).fit()

        # Extract results
        results = {
            'model_name': model_name,
            'dependent_var': dependent_var,
            'model_type': 'OLS Linear Regression',
            'sample_size': int(model.nobs),
            'num_predictors': len(independent_vars),
            'r_squared': model.rsquared,
            'adj_r_squared': model.rsquared_adj,
            'f_statistic': model.fvalue,
            'f_pvalue': model.f_pvalue
        }

        # Extract coefficients
        coef_df = pd.DataFrame({
            'model_name': model_name,
            'predictor': model.params.index,
            'coefficient': model.params.values,
            'std_error': model.bse.values,
            'p_value': model.pvalues.values,
            'ci_lower': model.conf_int()[0].values,
            'ci_upper': model.conf_int()[1].values
        })

        # Add standardized coefficients (beta)
        # Standardize by dividing coefficient by ratio of std devs
        X_vars = [v for v in independent_vars if v in df_model.columns]
        y_std = df_model[dependent_var].std()

        std_coefs = []
        for var in coef_df['predictor']:
            if var == 'Intercept':
                std_coefs.append(np.nan)
            elif var in df_model.columns:
                x_std = df_model[var].std()
                coef = coef_df[coef_df['predictor'] == var]['coefficient'].values[0]
                std_coefs.append(coef * x_std / y_std)
            else:
                std_coefs.append(np.nan)

        coef_df['std_coefficient'] = std_coefs

        # Add significance flag
        coef_df['significant'] = coef_df['p_value'] < 0.05

        # Print summary
        print(f"\nR-squared: {model.rsquared:.4f}")
        print(f"Adjusted R-squared: {model.rsquared_adj:.4f}")
        print(f"F-statistic p-value: {model.f_pvalue:.4e}")
        print(f"\nSignificant Predictors (p < 0.05):")
        sig_coefs = coef_df[coef_df['significant'] & (coef_df['predictor'] != 'Intercept')]
        if len(sig_coefs) > 0:
            for _, row in sig_coefs.iterrows():
                print(f"  {row['predictor']:30s}: beta={row['coefficient']:8.3f}, p={row['p_value']:.4f}")
        else:
            print("  No significant predictors found")

        return results, coef_df

    except Exception as e:
        print(f"ERROR: Model fitting failed - {e}")
        return None, None

def main():
    print("="*80)
    print("MULTIPLE REGRESSION ANALYSIS - ELDERLY POPULATION")
    print("="*80)

    # Load data
    df = load_elderly_data()
    df = prepare_variables(df)

    # Storage for all results
    all_model_results = []
    all_coefficients = []

    # =========================================================================
    # MODEL 1A: Physical Health (BMI)
    # =========================================================================
    if 'BMI' in df.columns:
        independent_vars = [
            'age', 'sex_female', 'income_monthly',
            'exercise_status', 'smoke_status', 'drink_status',
            'diseases_status', 'disable_status', 'food_insecurity_1',
            'hh_elder_count'
        ]
        # Filter to only include variables that exist
        independent_vars = [v for v in independent_vars if v in df.columns]

        results, coefs = run_ols_regression(
            df, 'BMI', independent_vars,
            'Model 1A: Physical Health (BMI)'
        )
        if results:
            all_model_results.append(results)
            all_coefficients.append(coefs)

    # =========================================================================
    # MODEL 1B: Healthcare Access (medical_skip_1)
    # =========================================================================
    if 'medical_skip_1' in df.columns:
        independent_vars = [
            'income_monthly', 'education',
            'welfare', 'diseases_status', 'disable_status',
            'food_insecurity_1', 'food_insecurity_2',
            'house_status', 'rent_price', 'family_status'
        ]
        independent_vars = [v for v in independent_vars if v in df.columns]

        results, coefs = run_logistic_regression(
            df, 'medical_skip_1', independent_vars,
            'Model 1B: Healthcare Access (Skip Medical Care)'
        )
        if results:
            all_model_results.append(results)
            all_coefficients.append(coefs)

    # =========================================================================
    # MODEL 1C: Health Expenses
    # =========================================================================
    if 'health_expense' in df.columns:
        independent_vars = [
            'income_monthly', 'age', 'diseases_status', 'disable_status',
            'disable_work_status', 'welfare', 'occupation_status',
            'family_status', 'hh_health_expense'
        ]
        independent_vars = [v for v in independent_vars if v in df.columns]

        results, coefs = run_ols_regression(
            df, 'health_expense', independent_vars,
            'Model 1C: Individual Health Expenses'
        )
        if results:
            all_model_results.append(results)
            all_coefficients.append(coefs)

    # =========================================================================
    # MODEL 2A: Food Insecurity (food_insecurity_2 - going hungry)
    # =========================================================================
    if 'food_insecurity_2' in df.columns:
        independent_vars = [
            'income_monthly', 'education', 'occupation_status',
            'working_hours', 'occupation_contract', 'occupation_welfare',
            'house_status', 'rent_price', 'family_status',
            'hh_child_count', 'hh_worker_count', 'hh_elder_count',
            'medical_skip_1'
        ]
        independent_vars = [v for v in independent_vars if v in df.columns]

        results, coefs = run_logistic_regression(
            df, 'food_insecurity_2', independent_vars,
            'Model 2A: Severe Food Insecurity (Going Hungry)'
        )
        if results:
            all_model_results.append(results)
            all_coefficients.append(coefs)

    # =========================================================================
    # MODEL 2B: Income Level
    # =========================================================================
    if 'income_monthly' in df.columns:
        independent_vars = [
            'age', 'sex_female', 'education',
            'occupation_type', 'occupation_status',
            'working_hours', 'occupation_contract', 'occupation_welfare',
            'disable_status', 'disable_work_status', 'training'
        ]
        independent_vars = [v for v in independent_vars if v in df.columns]

        results, coefs = run_ols_regression(
            df, 'income_monthly', independent_vars,
            'Model 2B: Monthly Income Level'
        )
        if results:
            all_model_results.append(results)
            all_coefficients.append(coefs)

    # =========================================================================
    # MODEL 3A: Physical Violence
    # =========================================================================
    if 'physical_violence' in df.columns:
        independent_vars = [
            'sex_female', 'age', 'income_monthly', 'education',
            'occupation_status', 'house_status', 'rent_price',
            'family_status', 'disable_status',
            'community_safety', 'discrimination',
            'psychological_violence', 'sexual_violence',
            'helper'
        ]
        independent_vars = [v for v in independent_vars if v in df.columns]

        results, coefs = run_logistic_regression(
            df, 'physical_violence', independent_vars,
            'Model 3A: Physical Violence Victimization'
        )
        if results:
            all_model_results.append(results)
            all_coefficients.append(coefs)

    # =========================================================================
    # MODEL 3B: Psychological Violence
    # =========================================================================
    if 'psychological_violence' in df.columns:
        independent_vars = [
            'sex_female', 'age', 'income_monthly', 'education',
            'disable_status', 'family_status', 'occupation_status',
            'discrimination', 'community_safety', 'helper'
        ]
        independent_vars = [v for v in independent_vars if v in df.columns]

        results, coefs = run_logistic_regression(
            df, 'psychological_violence', independent_vars,
            'Model 3B: Psychological Violence Victimization'
        )
        if results:
            all_model_results.append(results)
            all_coefficients.append(coefs)

    # =========================================================================
    # MODEL 4A: Math Ability
    # =========================================================================
    if 'math' in df.columns:
        independent_vars = [
            'age', 'sex_female', 'education',
            'speak', 'read', 'write',
            'training', 'occupation_status', 'income_monthly'
        ]
        independent_vars = [v for v in independent_vars if v in df.columns]

        results, coefs = run_logistic_regression(
            df, 'math', independent_vars,
            'Model 4A: Mathematical Literacy'
        )
        if results:
            all_model_results.append(results)
            all_coefficients.append(coefs)

    # =========================================================================
    # MODEL 5A: Living Arrangement (family_status)
    # =========================================================================
    if 'family_status' in df.columns:
        independent_vars = [
            'age', 'sex_female', 'income_monthly', 'education',
            'disable_status', 'hh_elder_count', 'hh_child_count',
            'hh_worker_count', 'house_status'
        ]
        independent_vars = [v for v in independent_vars if v in df.columns]

        results, coefs = run_logistic_regression(
            df, 'family_status', independent_vars,
            'Model 5A: Living with Family vs Alone'
        )
        if results:
            all_model_results.append(results)
            all_coefficients.append(coefs)

    # =========================================================================
    # SAVE RESULTS
    # =========================================================================
    print("\n" + "="*80)
    print("SAVING RESULTS")
    print("="*80)

    if all_model_results:
        # Save model summary
        models_df = pd.DataFrame(all_model_results)
        models_df.to_csv('regression_models_summary.csv', index=False)
        print(f"\nSaved: regression_models_summary.csv ({len(models_df)} models)")

        # Save all coefficients
        all_coefs_df = pd.concat(all_coefficients, ignore_index=True)
        all_coefs_df.to_csv('regression_coefficients_all.csv', index=False)
        print(f"Saved: regression_coefficients_all.csv ({len(all_coefs_df)} coefficients)")

        # Save significant coefficients only
        sig_coefs_df = all_coefs_df[
            (all_coefs_df['significant']) &
            (all_coefs_df['predictor'] != 'Intercept')
        ].copy()
        sig_coefs_df = sig_coefs_df.sort_values(['model_name', 'p_value'])
        sig_coefs_df.to_csv('regression_coefficients_significant.csv', index=False)
        print(f"Saved: regression_coefficients_significant.csv ({len(sig_coefs_df)} significant predictors)")

        print("\n" + "="*80)
        print("ANALYSIS COMPLETE")
        print("="*80)
        print(f"\nTotal models run: {len(all_model_results)}")
        print(f"Total significant predictors found: {len(sig_coefs_df)}")

    else:
        print("\nWARNING: No models completed successfully")

if __name__ == "__main__":
    main()
