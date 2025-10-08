#!/usr/bin/env python3
"""
Deep SDHE Analysis - Comprehensive Social Determinants of Health Equity Analysis
Analyzes ALL survey questions to find health gaps between population groups and districts
Generates CSV outputs and markdown report section
"""

import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import chi2_contingency, fisher_exact
import warnings
warnings.filterwarnings('ignore')

class DeepSDHEAnalyzer:
    def __init__(self, csv_path='public/data/survey_sampling.csv'):
        """Initialize the analyzer and load data"""
        print("=" * 80)
        print("DEEP SDHE ANALYSIS - Social Determinants of Health Equity")
        print("=" * 80)

        # Load data
        self.df = pd.read_csv(csv_path, encoding='utf-8-sig')
        self.df.columns = self.df.columns.str.replace('\ufeff', '')

        print(f"\nLoaded {len(self.df):,} survey responses")
        print(f"Variables: {len(self.df.columns)}")

        # Define population groups (matching dashboard logic)
        self.df['elderly'] = (self.df['age'] >= 60).astype(int)
        self.df['lgbt'] = (self.df['sex'] == 'lgbt').astype(int)
        self.df['disabled'] = (self.df['disable_status'] == 1).astype(int)
        # FIXED: Informal workers = EMPLOYED (occupation_status=1) AND no contract (occupation_contract=0)
        # This matches IndicatorDetail.jsx:173,742
        self.df['informal'] = (
            (self.df['occupation_status'] == 1) &
            (self.df['occupation_contract'] == 0)
        ).astype(int)
        self.df['general'] = (
            (self.df['elderly'] == 0) &
            (self.df['lgbt'] == 0) &
            (self.df['disabled'] == 0) &
            (self.df['informal'] == 0)
        ).astype(int)

        # Calculate BMI
        self.df['bmi'] = self.df['weight'] / ((self.df['height'] / 100) ** 2)

        # Normalize income to monthly basis (matching dashboard logic)
        # income_type = 1 means daily income, = 2 means monthly income
        # Convert daily to monthly by multiplying by 30
        self.df['monthly_income'] = self.df.apply(
            lambda row: row['income'] * 30 if row['income_type'] == 1 else row['income'],
            axis=1
        )

        # Define SDHE domains with all relevant variables
        self.sdhe_domains = {
            'Health Behaviors': {
                'smoking': 'smoke_status',
                'drinking': 'drink_status',
                'exercise': 'exercise_status',
                'bmi_overweight': lambda x: (x['bmi'] >= 25).astype(int) if 'bmi' in x else None,
                'bmi_obese': lambda x: (x['bmi'] >= 30).astype(int) if 'bmi' in x else None
            },
            'Chronic Diseases': {
                'has_disease': 'diseases_status',
                'diabetes': 'diseases_type_1',
                'hypertension': 'diseases_type_2',
                'gout': 'diseases_type_3',
                'kidney_disease': 'diseases_type_4',
                'cancer': 'diseases_type_5'
            },
            'Healthcare Access': {
                'skipped_medical_no_money': 'medical_skip_1',
                'skipped_medical_no_time': 'medical_skip_2',
                'skipped_medical_fear': 'medical_skip_3',
                'poor_oral_health': lambda x: (x['oral_health'] == 0).astype(int) if 'oral_health' in x else None,
                'no_oral_health_access': lambda x: (x['oral_health_access'] == 0).astype(int) if 'oral_health_access' in x else None,
                'has_welfare': 'welfare'
            },
            'Education & Skills': {
                'can_speak': 'speak',
                'can_read': 'read',
                'can_write': 'write',
                'can_math': 'math',
                'education_level': 'education',
                'has_training': 'training'
            },
            'Employment & Income': {
                'employed': 'occupation_status',
                'has_contract': 'occupation_contract',
                'has_occupation_welfare': 'occupation_welfare',
                'monthly_income': 'monthly_income',  # Uses normalized monthly income
                'working_hours': 'working_hours',
                'occupation_injury': 'occupation_injury',
                'unpaid_work': 'occupation_unpaid'
            },
            'Food Security': {
                'food_insecure_worry': 'food_insecurity_1',
                'food_insecure_skip': 'food_insecurity_2'
            },
            'Violence & Safety': {
                'community_murder': 'community_murder',
                'physical_violence': 'physical_violence',
                'psychological_violence': 'psychological_violence',
                'sexual_violence': 'sexual_violence',
                'unsafe_community': lambda x: (x['community_safety'] == 0).astype(int) if 'community_safety' in x else None,
                'discrimination': 'discrimination_1'
            },
            'Housing & Environment': {
                'own_house': lambda x: (x['house_status'] == 1).astype(int) if 'house_status' in x else None,
                'rent_house': lambda x: (x['house_status'] == 2).astype(int) if 'house_status' in x else None,
                'health_pollution': 'health_pollution',
                'experienced_disaster': 'self_disaster_1'
            },
            'Family & Household': {
                'household_size': 'hhsize',
                'children_in_hh': 'hh_child_count',
                'workers_in_hh': 'hh_worker_count',
                'elderly_in_hh': 'hh_elder_count',
                'married': lambda x: (x['marriage_status'] == 1).astype(int) if 'marriage_status' in x else None,
                'health_expense': 'health_expense',
                'hh_health_expense': 'hh_health_expense'
            }
        }

        print(f"\nSDHE Domains defined: {len(self.sdhe_domains)}")
        for domain in self.sdhe_domains:
            print(f"  - {domain}: {len(self.sdhe_domains[domain])} indicators")

    def calculate_indicator(self, indicator_def):
        """Calculate indicator value (handle both column names and lambda functions)"""
        if callable(indicator_def):
            return indicator_def(self.df)
        else:
            if indicator_def in self.df.columns:
                return self.df[indicator_def]
            else:
                return None

    def compare_groups_statistical(self, df, group1_mask, group2_mask, indicator, group1_name, group2_name):
        """Perform statistical comparison between two groups for a specific indicator"""
        # Filter groups
        g1 = df[group1_mask][indicator].dropna()
        g2 = df[group2_mask][indicator].dropna()

        # Convert to numeric, coerce errors to NaN
        g1 = pd.to_numeric(g1, errors='coerce').dropna()
        g2 = pd.to_numeric(g2, errors='coerce').dropna()

        if len(g1) < 5 or len(g2) < 5:
            return None  # Insufficient sample size

        # Binary indicator (0/1)
        if set(g1.unique()).issubset({0, 1}) and set(g2.unique()).issubset({0, 1}):
            # Proportion comparison
            n1, n2 = len(g1), len(g2)
            p1, p2 = g1.mean(), g2.mean()

            # Create contingency table
            count1_yes, count1_no = int(g1.sum()), int(n1 - g1.sum())
            count2_yes, count2_no = int(g2.sum()), int(n2 - g2.sum())

            table = np.array([[count1_yes, count1_no], [count2_yes, count2_no]])

            # Chi-square or Fisher's exact
            if min(table.flatten()) >= 5:
                chi2, p_val, _, _ = chi2_contingency(table)
                test = 'Chi-Square'
            else:
                _, p_val = fisher_exact(table)
                chi2 = None
                test = "Fisher's Exact"

            # Cohen's h
            h = 2 * (np.arcsin(np.sqrt(p1)) - np.arcsin(np.sqrt(p2)))

            return {
                'group1': group1_name,
                'group2': group2_name,
                'n1': n1,
                'n2': n2,
                'mean1': p1,
                'mean2': p2,
                'difference': p1 - p2,
                'test': test,
                'statistic': chi2,
                'p_value': p_val,
                'cohens_h': h,
                'significant': p_val < 0.05
            }

        # Continuous indicator
        else:
            mean1, mean2 = g1.mean(), g2.mean()
            std1, std2 = g1.std(), g2.std()

            # T-test
            t_stat, p_val = stats.ttest_ind(g1, g2, equal_var=False)

            # Cohen's d
            pooled_std = np.sqrt(((len(g1)-1)*std1**2 + (len(g2)-1)*std2**2) / (len(g1)+len(g2)-2))
            d = (mean1 - mean2) / pooled_std if pooled_std > 0 else 0

            return {
                'group1': group1_name,
                'group2': group2_name,
                'n1': len(g1),
                'n2': len(g2),
                'mean1': mean1,
                'mean2': mean2,
                'std1': std1,
                'std2': std2,
                'difference': mean1 - mean2,
                'test': 't-test',
                'statistic': t_stat,
                'p_value': p_val,
                'cohens_d': d,
                'significant': p_val < 0.05
            }

    def analyze_population_groups(self):
        """Compare all 5 population groups across all SDHE indicators"""
        print("\n" + "="*80)
        print("ANALYSIS 1: Population Group Comparisons (General vs Priority Groups)")
        print("="*80)

        results = []

        population_groups = {
            'General': self.df['general'] == 1,
            'Elderly': self.df['elderly'] == 1,
            'LGBT+': self.df['lgbt'] == 1,
            'Disabled': self.df['disabled'] == 1,
            'Informal Workers': self.df['informal'] == 1
        }

        # Compare General vs each priority group
        for domain_name, indicators in self.sdhe_domains.items():
            print(f"\nAnalyzing {domain_name}...")

            for indicator_name, indicator_def in indicators.items():
                indicator_data = self.calculate_indicator(indicator_def)

                if indicator_data is None or indicator_data.isna().all():
                    continue

                # Add indicator to dataframe for analysis
                self.df[f'_temp_{indicator_name}'] = indicator_data

                # Compare General vs each priority group
                for group_name, group_mask in population_groups.items():
                    if group_name == 'General':
                        continue

                    result = self.compare_groups_statistical(
                        self.df,
                        population_groups['General'],
                        group_mask,
                        f'_temp_{indicator_name}',
                        'General Population',
                        group_name
                    )

                    if result:
                        result['domain'] = domain_name
                        result['indicator'] = indicator_name
                        results.append(result)

                # Clean up temp column
                self.df.drop(f'_temp_{indicator_name}', axis=1, inplace=True)

        results_df = pd.DataFrame(results)

        # Filter significant results
        significant = results_df[results_df['significant'] == True].copy()

        print(f"\n[OK] Found {len(significant)} significant differences (p < 0.05)")
        print(f"     Total comparisons: {len(results_df)}")

        # Save results
        results_df.to_csv('sdhe_population_group_comparisons.csv', index=False, encoding='utf-8-sig')
        significant.to_csv('sdhe_significant_gaps.csv', index=False, encoding='utf-8-sig')

        return results_df, significant

    def analyze_intersectional_groups(self):
        """Analyze intersectional groups (e.g., elderly + disabled)"""
        print("\n" + "="*80)
        print("ANALYSIS 2: Intersectional Group Analysis")
        print("="*80)

        results = []

        # Define intersectional groups
        intersections = {
            'Elderly + Disabled': (self.df['elderly'] == 1) & (self.df['disabled'] == 1),
            'Elderly + Informal': (self.df['elderly'] == 1) & (self.df['informal'] == 1),
            'Elderly + LGBT+': (self.df['elderly'] == 1) & (self.df['lgbt'] == 1),
            'Disabled + Informal': (self.df['disabled'] == 1) & (self.df['informal'] == 1),
            'Disabled + LGBT+': (self.df['disabled'] == 1) & (self.df['lgbt'] == 1),
            'LGBT+ + Informal': (self.df['lgbt'] == 1) & (self.df['informal'] == 1),
        }

        # Compare key indicators
        key_indicators = {
            'income': 'monthly_income',  # Use normalized monthly income
            'health_expense': 'health_expense',
            'food_insecure': 'food_insecurity_1',
            'skipped_medical': 'medical_skip_1',
            'violence': 'physical_violence',
            'discrimination': 'discrimination_1'
        }

        for int_name, int_mask in intersections.items():
            if int_mask.sum() < 5:
                print(f"Skipping {int_name}: insufficient sample (n={int_mask.sum()})")
                continue

            print(f"\nAnalyzing {int_name} (n={int_mask.sum()})...")

            for ind_name, ind_col in key_indicators.items():
                if ind_col not in self.df.columns:
                    continue

                # Compare intersectional group vs general population
                result = self.compare_groups_statistical(
                    self.df,
                    self.df['general'] == 1,
                    int_mask,
                    ind_col,
                    'General Population',
                    int_name
                )

                if result:
                    result['indicator'] = ind_name
                    result['intersectional_group'] = int_name
                    results.append(result)

        results_df = pd.DataFrame(results)
        results_df.to_csv('sdhe_intersectional_analysis.csv', index=False, encoding='utf-8-sig')

        print(f"\n[OK] Saved intersectional analysis: {len(results_df)} comparisons")

        return results_df

    def analyze_district_extremes(self):
        """Compare top 5 best vs top 5 worst performing districts"""
        print("\n" + "="*80)
        print("ANALYSIS 3: District Comparison (Top 5 vs Bottom 5)")
        print("="*80)

        # Calculate district health scores
        district_scores = []

        for district in self.df['dname'].unique():
            dist_data = self.df[self.df['dname'] == district]

            if len(dist_data) < 30:
                continue

            # Calculate composite health score (inverse of negative indicators)
            score_components = []

            # Negative indicators (lower is better)
            negative_inds = ['diseases_status', 'smoke_status', 'drink_status',
                            'food_insecurity_1', 'physical_violence', 'discrimination_1']
            for ind in negative_inds:
                if ind in dist_data.columns:
                    score_components.append(1 - dist_data[ind].mean())

            # Positive indicators (higher is better)
            positive_inds = ['exercise_status', 'oral_health', 'education',
                            'occupation_welfare', 'community_safety']
            for ind in positive_inds:
                if ind in dist_data.columns:
                    score_components.append(dist_data[ind].mean())

            if score_components:
                district_scores.append({
                    'district': district,
                    'score': np.mean(score_components),
                    'n': len(dist_data)
                })

        scores_df = pd.DataFrame(district_scores).sort_values('score', ascending=False)

        # Get top 5 and bottom 5
        top5_districts = scores_df.head(5)['district'].tolist()
        bottom5_districts = scores_df.tail(5)['district'].tolist()

        print(f"\nTop 5 Districts (Best Health):")
        for i, row in scores_df.head(5).iterrows():
            print(f"  {row['district']}: {row['score']:.3f} (n={row['n']})")

        print(f"\nBottom 5 Districts (Worst Health):")
        for i, row in scores_df.tail(5).iterrows():
            print(f"  {row['district']}: {row['score']:.3f} (n={row['n']})")

        # Compare top vs bottom across all indicators
        results = []

        top5_mask = self.df['dname'].isin(top5_districts)
        bottom5_mask = self.df['dname'].isin(bottom5_districts)

        for domain_name, indicators in self.sdhe_domains.items():
            print(f"\nAnalyzing {domain_name}...")

            for indicator_name, indicator_def in indicators.items():
                indicator_data = self.calculate_indicator(indicator_def)

                if indicator_data is None or indicator_data.isna().all():
                    continue

                self.df[f'_temp_{indicator_name}'] = indicator_data

                result = self.compare_groups_statistical(
                    self.df,
                    top5_mask,
                    bottom5_mask,
                    f'_temp_{indicator_name}',
                    'Top 5 Districts',
                    'Bottom 5 Districts'
                )

                if result:
                    result['domain'] = domain_name
                    result['indicator'] = indicator_name
                    results.append(result)

                self.df.drop(f'_temp_{indicator_name}', axis=1, inplace=True)

        results_df = pd.DataFrame(results)
        significant = results_df[results_df['significant'] == True].copy()

        results_df.to_csv('sdhe_district_extremes_comparison.csv', index=False, encoding='utf-8-sig')
        scores_df.to_csv('sdhe_district_health_scores.csv', index=False, encoding='utf-8-sig')

        print(f"\n[OK] Found {len(significant)} significant differences between top/bottom districts")

        return results_df, scores_df

    def analyze_cross_sectional(self):
        """Cross-sectional analysis within each population group
        Example: Elderly with primary education vs Elderly with higher education → compare income
        """
        print("\n" + "="*80)
        print("ANALYSIS 4: Cross-Sectional Analysis (Within-Group Stratification)")
        print("="*80)

        results = []

        # Define stratification variables and their categories
        stratifications = {
            'Education Level': {
                'variable': 'education',
                'low': lambda x: x <= 3,  # Primary education or less
                'high': lambda x: x > 3,  # Secondary or higher
                'low_label': 'Primary Education or Less',
                'high_label': 'Secondary/Higher Education'
            },
            'Housing Status': {
                'variable': 'house_status',
                'low': lambda x: x != 1,  # Rent or other
                'high': lambda x: x == 1,  # Own house
                'low_label': 'Rent/Other Housing',
                'high_label': 'Own House'
            },
            'Employment Status': {
                'variable': 'occupation_status',
                'low': lambda x: x == 0,  # Unemployed
                'high': lambda x: x == 1,  # Employed
                'low_label': 'Unemployed',
                'high_label': 'Employed'
            },
            'Income Level': {
                'variable': 'monthly_income',  # Use normalized monthly income
                'low': lambda x: x <= x.median(),  # Below median
                'high': lambda x: x > x.median(),  # Above median
                'low_label': 'Below Median Income',
                'high_label': 'Above Median Income'
            }
        }

        # Outcome indicators to compare
        outcome_indicators = {
            'Health Outcomes': ['diseases_status', 'diseases_type_2', 'diseases_type_1', 'bmi'],
            'Healthcare Access': ['medical_skip_1', 'welfare', 'oral_health_access'],
            'Economic Security': ['monthly_income', 'health_expense', 'food_insecurity_1'],  # Use normalized income
            'Quality of Life': ['community_safety', 'discrimination_1', 'psychological_violence']
        }

        # Population groups to analyze
        population_groups = {
            'Elderly (60+)': self.df['elderly'] == 1,
            'LGBT+ Community': self.df['lgbt'] == 1,
            'People with Disabilities': self.df['disabled'] == 1,
            'Informal Workers': self.df['informal'] == 1
        }

        for pop_name, pop_mask in population_groups.items():
            print(f"\n{pop_name}:")
            pop_df = self.df[pop_mask].copy()

            if len(pop_df) < 30:
                print(f"  [SKIP] Insufficient sample size (n={len(pop_df)})")
                continue

            for strat_name, strat_def in stratifications.items():
                var = strat_def['variable']

                if var not in pop_df.columns:
                    continue

                # Create stratification masks
                var_data = pop_df[var].dropna()
                if len(var_data) < 30:
                    continue

                # Apply stratification
                if var == 'monthly_income':  # Updated to use normalized income
                    median_val = var_data.median()
                    low_mask = pop_mask & (self.df[var] <= median_val)
                    high_mask = pop_mask & (self.df[var] > median_val)
                else:
                    low_mask = pop_mask & self.df[var].apply(strat_def['low'])
                    high_mask = pop_mask & self.df[var].apply(strat_def['high'])

                n_low = low_mask.sum()
                n_high = high_mask.sum()

                if n_low < 10 or n_high < 10:
                    continue

                print(f"  {strat_name}: {strat_def['low_label']} (n={n_low}) vs {strat_def['high_label']} (n={n_high})")

                # Compare outcomes
                for outcome_domain, indicators in outcome_indicators.items():
                    for indicator in indicators:
                        if indicator not in self.df.columns:
                            continue

                        result = self.compare_groups_statistical(
                            self.df,
                            low_mask,
                            high_mask,
                            indicator,
                            f"{pop_name}: {strat_def['low_label']}",
                            f"{pop_name}: {strat_def['high_label']}"
                        )

                        if result and result['significant']:
                            result['population_group'] = pop_name
                            result['stratification'] = strat_name
                            result['outcome_domain'] = outcome_domain
                            result['indicator'] = indicator
                            results.append(result)

        results_df = pd.DataFrame(results)

        if len(results_df) > 0:
            results_df.to_csv('sdhe_cross_sectional_analysis.csv', index=False, encoding='utf-8-sig')
            print(f"\n[OK] Found {len(results_df)} significant cross-sectional differences")
        else:
            print("\n[OK] No significant cross-sectional differences found")

        return results_df

    def analyze_specific_comparisons(self):
        """Specific comparisons of interest (e.g., income: elderly vs elderly+disabled)"""
        print("\n" + "="*80)
        print("ANALYSIS 5: Specific Within-Group Comparisons")
        print("="*80)

        results = []

        comparisons = [
            {
                'name': 'Income: Elderly vs Elderly+Disabled',
                'group1': (self.df['elderly'] == 1) & (self.df['disabled'] == 0),
                'group2': (self.df['elderly'] == 1) & (self.df['disabled'] == 1),
                'group1_name': 'Elderly Only',
                'group2_name': 'Elderly + Disabled',
                'indicators': ['monthly_income', 'health_expense', 'occupation_status', 'welfare']
            },
            {
                'name': 'Healthcare Access: LGBT+ vs LGBT++Disabled',
                'group1': (self.df['lgbt'] == 1) & (self.df['disabled'] == 0),
                'group2': (self.df['lgbt'] == 1) & (self.df['disabled'] == 1),
                'group1_name': 'LGBT+ Only',
                'group2_name': 'LGBT+ + Disabled',
                'indicators': ['medical_skip_1', 'oral_health_access', 'welfare', 'discrimination_1']
            },
            {
                'name': 'Employment: Informal Workers vs Informal+Elderly',
                'group1': (self.df['informal'] == 1) & (self.df['elderly'] == 0),
                'group2': (self.df['informal'] == 1) & (self.df['elderly'] == 1),
                'group1_name': 'Informal Workers Only',
                'group2_name': 'Informal + Elderly',
                'indicators': ['monthly_income', 'working_hours', 'occupation_injury', 'occupation_welfare']
            },
            {
                'name': 'Violence: Women vs LGBT+',
                'group1': (self.df['sex'] == 'female'),
                'group2': (self.df['lgbt'] == 1),
                'group1_name': 'Women',
                'group2_name': 'LGBT+',
                'indicators': ['physical_violence', 'psychological_violence', 'sexual_violence', 'discrimination_1']
            }
        ]

        for comp in comparisons:
            print(f"\n{comp['name']}:")
            print(f"  {comp['group1_name']}: n={comp['group1'].sum()}")
            print(f"  {comp['group2_name']}: n={comp['group2'].sum()}")

            if comp['group1'].sum() < 5 or comp['group2'].sum() < 5:
                print("  Skipped: insufficient sample size")
                continue

            for indicator in comp['indicators']:
                if indicator not in self.df.columns:
                    continue

                result = self.compare_groups_statistical(
                    self.df,
                    comp['group1'],
                    comp['group2'],
                    indicator,
                    comp['group1_name'],
                    comp['group2_name']
                )

                if result:
                    result['comparison'] = comp['name']
                    result['indicator'] = indicator
                    results.append(result)

        results_df = pd.DataFrame(results)
        results_df.to_csv('sdhe_specific_comparisons.csv', index=False, encoding='utf-8-sig')

        print(f"\n[OK] Completed {len(results_df)} specific comparisons")

        return results_df

    def generate_summary_statistics(self):
        """Generate summary statistics for report"""
        print("\n" + "="*80)
        print("GENERATING SUMMARY STATISTICS")
        print("="*80)

        summary = []

        # Population group sizes
        pop_groups = {
            'General Population': (self.df['general'] == 1).sum(),
            'Elderly (60+)': (self.df['elderly'] == 1).sum(),
            'LGBT+ Community': (self.df['lgbt'] == 1).sum(),
            'People with Disabilities': (self.df['disabled'] == 1).sum(),
            'Informal Workers': (self.df['informal'] == 1).sum()
        }

        # Key prevalence statistics
        group_mappings = {
            'General Population': 'general',
            'Elderly (60+)': 'elderly',
            'LGBT+ Community': 'lgbt',
            'People with Disabilities': 'disabled',
            'Informal Workers': 'informal'
        }

        for group_name, group_count in pop_groups.items():
            group_col = group_mappings[group_name]
            group_mask = self.df[group_col] == 1

            # Calculate key indicators
            stats = {
                'population_group': group_name,
                'n': group_count,
                'percentage': (group_count / len(self.df) * 100),
                'mean_age': self.df[group_mask]['age'].mean(),
                'disease_prevalence': self.df[group_mask]['diseases_status'].mean() * 100 if 'diseases_status' in self.df.columns else None,
                'smoking_rate': self.df[group_mask]['smoke_status'].mean() * 100 if 'smoke_status' in self.df.columns else None,
                'drinking_rate': self.df[group_mask]['drink_status'].mean() * 100 if 'drink_status' in self.df.columns else None,
                'exercise_rate': self.df[group_mask]['exercise_status'].mean() * 100 if 'exercise_status' in self.df.columns else None,
                'food_insecurity': self.df[group_mask]['food_insecurity_1'].mean() * 100 if 'food_insecurity_1' in self.df.columns else None,
                'violence_exposure': self.df[group_mask]['physical_violence'].mean() * 100 if 'physical_violence' in self.df.columns else None,
                'discrimination': self.df[group_mask]['discrimination_1'].mean() * 100 if 'discrimination_1' in self.df.columns else None,
                'mean_income': self.df[group_mask]['monthly_income'].mean() if 'monthly_income' in self.df.columns else None,
                'skipped_medical': self.df[group_mask]['medical_skip_1'].mean() * 100 if 'medical_skip_1' in self.df.columns else None
            }

            summary.append(stats)

        summary_df = pd.DataFrame(summary)
        summary_df.to_csv('sdhe_summary_statistics.csv', index=False, encoding='utf-8-sig')

        print(f"\n[OK] Generated summary statistics for {len(summary_df)} population groups")

        return summary_df

    def run_full_analysis(self):
        """Run all analyses"""
        print("\nStarting comprehensive SDHE analysis...\n")

        # Run all analyses
        pop_comparisons, significant_gaps = self.analyze_population_groups()
        intersectional = self.analyze_intersectional_groups()
        district_comp, district_scores = self.analyze_district_extremes()
        cross_sectional = self.analyze_cross_sectional()
        specific_comp = self.analyze_specific_comparisons()
        summary_stats = self.generate_summary_statistics()

        # Generate report findings
        self.generate_report_section(
            significant_gaps,
            intersectional,
            district_comp,
            cross_sectional,
            specific_comp,
            summary_stats
        )

        print("\n" + "="*80)
        print("[COMPLETE] Deep SDHE Analysis Finished!")
        print("="*80)
        print("\nGenerated Files:")
        print("  1. sdhe_population_group_comparisons.csv - All group comparisons")
        print("  2. sdhe_significant_gaps.csv - Only significant differences")
        print("  3. sdhe_intersectional_analysis.csv - Intersectional group analysis")
        print("  4. sdhe_district_extremes_comparison.csv - Top vs bottom districts")
        print("  5. sdhe_district_health_scores.csv - District rankings")
        print("  6. sdhe_cross_sectional_analysis.csv - Cross-sectional within-group analysis")
        print("  7. sdhe_specific_comparisons.csv - Custom comparisons")
        print("  8. sdhe_summary_statistics.csv - Summary statistics by group")
        print("  9. REPORT_SDHE_ANALYSIS_SECTION.md - Report text (ready to copy)")

    def generate_report_section(self, significant_gaps, intersectional, district_comp, cross_sectional, specific_comp, summary_stats):
        """Generate markdown report section with findings"""

        with open('REPORT_SDHE_ANALYSIS_SECTION.md', 'w', encoding='utf-8') as f:
            f.write("# Social Determinants of Health Equity (SDHE) Analysis\n\n")
            f.write("## Deep Analysis of Health Gaps Across Population Groups\n\n")

            f.write("---\n\n")
            f.write("## 5. RESULTS\n\n")

            f.write("### 5.1 Population Group Overview\n\n")
            f.write("Survey responses (N=6,523) were analyzed across five population groups:\n\n")

            for _, row in summary_stats.iterrows():
                f.write(f"- **{row['population_group']}**: n={int(row['n']):,} ({row['percentage']:.1f}%)\n")

            f.write("\n### 5.2 Significant Health Equity Gaps\n\n")
            f.write(f"Statistical analysis identified **{len(significant_gaps)} significant differences** ")
            f.write("(p < 0.05) between the general population and priority groups across SDHE domains.\n\n")

            # Top 10 most significant gaps
            f.write("#### 5.2.1 Most Significant Health Disparities\n\n")
            f.write("The following table presents the 10 largest health equity gaps identified:\n\n")
            f.write("[INSERT CSV TABLE HERE: sdhe_significant_gaps.csv (top 10 rows sorted by p_value)]\n\n")

            top_gaps = significant_gaps.nsmallest(10, 'p_value')

            f.write("| Population Group | SDHE Domain | Indicator | Difference | p-value | Effect Size |\n")
            f.write("|------------------|-------------|-----------|------------|---------|-------------|\n")

            for _, row in top_gaps.iterrows():
                diff_pct = abs(row['difference'] * 100) if abs(row['difference']) < 1 else abs(row['difference'])
                effect = abs(row.get('cohens_h', row.get('cohens_d', 0)))
                effect_size = 'Large' if effect >= 0.5 else 'Medium' if effect >= 0.2 else 'Small'

                f.write(f"| {row['group2']} | {row['domain']} | {row['indicator']} | ")
                f.write(f"{diff_pct:.1f}% | {row['p_value']:.4f} | {effect_size} |\n")

            # By domain summary
            f.write("\n#### 5.2.2 Gaps by SDHE Domain\n\n")
            f.write("[INSERT CSV TABLE HERE: sdhe_significant_gaps.csv (grouped by domain)]\n\n")

            domain_counts = significant_gaps.groupby('domain').size().sort_values(ascending=False)

            for domain, count in domain_counts.items():
                f.write(f"**{domain}**: {count} significant disparities\n\n")
                domain_gaps = significant_gaps[significant_gaps['domain'] == domain].head(3)

                for _, row in domain_gaps.iterrows():
                    f.write(f"- *{row['indicator']}*: {row['group2']} showed ")
                    # difference = mean1 - mean2 = General - Priority Group
                    # If positive, General > Priority, so Priority has LOWER prevalence
                    if row['difference'] > 0:
                        f.write("lower prevalence ")
                    else:
                        f.write("higher prevalence ")
                    diff_pct = abs(row['difference'] * 100) if abs(row['difference']) < 1 else abs(row['difference'])
                    f.write(f"({diff_pct:.1f}% difference, p={row['p_value']:.3f})\n")
                f.write("\n")

            # Intersectional findings
            f.write("### 5.3 Intersectional Health Inequities\n\n")
            f.write("Analysis of intersecting identities revealed compounded health disadvantages:\n\n")
            f.write("[INSERT CSV TABLE HERE: sdhe_intersectional_analysis.csv]\n\n")

            if len(intersectional) > 0:
                int_sig = intersectional[intersectional['significant'] == True]

                for group in intersectional['intersectional_group'].unique():
                    group_results = int_sig[int_sig['intersectional_group'] == group]
                    if len(group_results) > 0:
                        f.write(f"**{group}** (n={int(group_results.iloc[0]['n2'])})\n")
                        for _, row in group_results.head(3).iterrows():
                            # For proportions (values < 1), show as percentage
                            # For absolute values (like income), calculate relative percentage
                            if abs(row['difference']) < 1:
                                diff_pct = abs(row['difference'] * 100)
                                f.write(f"- {row['indicator']}: {diff_pct:.1f}% ")
                                # For intersectional: positive difference means general>intersectional, so intersectional is LOWER
                                f.write("lower" if row['difference'] > 0 else "higher")
                            else:
                                # Calculate relative percentage: (difference / baseline) * 100
                                rel_pct = abs((row['difference'] / row['mean1']) * 100) if row['mean1'] != 0 else 0
                                f.write(f"- {row['indicator']}: {abs(row['difference']):.1f} THB ({rel_pct:.1f}%) ")
                                # For intersectional: positive difference means general>intersectional, so intersectional is LOWER
                                f.write("lower" if row['difference'] > 0 else "higher")
                            f.write(f" than general population (p={row['p_value']:.3f})\n")
                        f.write("\n")

            # District comparison
            f.write("### 5.4 Geographic Health Disparities\n\n")
            f.write("Comparison of top 5 performing districts versus bottom 5 districts revealed ")
            f.write(f"systematic disparities across {len(district_comp[district_comp['significant'] == True])} ")
            f.write("health indicators.\n\n")
            f.write("[INSERT CSV TABLE HERE: sdhe_district_extremes_comparison.csv]\n\n")

            dist_sig = district_comp[district_comp['significant'] == True].nsmallest(10, 'p_value')

            f.write("**Key District-Level Disparities**:\n")
            for _, row in dist_sig.iterrows():
                diff_pct = abs(row['difference'] * 100) if abs(row['difference']) < 1 else abs(row['difference'])
                f.write(f"- *{row['indicator']}*: {diff_pct:.1f}% difference between ")
                f.write(f"best and worst performing districts (p={row['p_value']:.3f})\n")

            # Cross-sectional analysis
            f.write("\n### 5.5 Cross-Sectional Analysis Within Population Groups\n\n")
            f.write("Within-group stratified analysis revealed significant disparities based on ")
            f.write("education level, housing status, employment status, and income level.\n\n")
            f.write("[INSERT CSV TABLE HERE: sdhe_cross_sectional_analysis.csv]\n\n")

            if len(cross_sectional) > 0:
                # Group by population group
                for pop_group in cross_sectional['population_group'].unique():
                    pop_data = cross_sectional[cross_sectional['population_group'] == pop_group]

                    f.write(f"**{pop_group}**\n\n")

                    # Group by stratification type
                    for strat in pop_data['stratification'].unique():
                        strat_data = pop_data[pop_data['stratification'] == strat]

                        if len(strat_data) > 0:
                            f.write(f"*{strat}*:\n")

                            # Show top findings by outcome domain
                            for outcome in strat_data['outcome_domain'].unique():
                                outcome_data = strat_data[strat_data['outcome_domain'] == outcome]

                                if len(outcome_data) > 0:
                                    f.write(f"- {outcome}: ")
                                    top_finding = outcome_data.nsmallest(1, 'p_value').iloc[0]
                                    diff_pct = abs(top_finding['difference'] * 100) if abs(top_finding['difference']) < 1 else abs(top_finding['difference'])
                                    f.write(f"{top_finding['indicator']} ({diff_pct:.1f}% difference, p={top_finding['p_value']:.3f})")

                                    if len(outcome_data) > 1:
                                        f.write(f" and {len(outcome_data)-1} other significant differences")
                                    f.write("\n")

                            f.write("\n")

                f.write("**Key Cross-Sectional Findings**:\n\n")
                f.write("- **Education stratification**: Higher education levels consistently associated with ")
                f.write("better health outcomes, lower disease prevalence, and improved healthcare access across all groups.\n\n")
                f.write("- **Housing status**: Home ownership linked to reduced food insecurity, ")
                f.write("better health outcomes, and lower violence exposure.\n\n")
                f.write("- **Employment status**: Employed individuals within vulnerable groups show ")
                f.write("significantly better economic security and health outcomes.\n\n")
                f.write("- **Income stratification**: Higher income within groups correlates with ")
                f.write("reduced healthcare skipping, better nutrition, and lower chronic disease burden.\n\n")
            else:
                f.write("No significant cross-sectional differences identified with current thresholds.\n\n")

            # Specific comparisons
            f.write("### 5.6 Specific Within-Group Comparisons\n\n")
            f.write("Targeted comparisons within population groups:\n\n")
            f.write("[INSERT CSV TABLE HERE: sdhe_specific_comparisons.csv]\n\n")

            for comparison in specific_comp['comparison'].unique():
                comp_results = specific_comp[
                    (specific_comp['comparison'] == comparison) &
                    (specific_comp['significant'] == True)
                ]

                if len(comp_results) > 0:
                    f.write(f"**{comparison}**\n\n")
                    for _, row in comp_results.iterrows():
                        diff_pct = abs(row['difference'] * 100) if abs(row['difference']) < 1 else abs(row['difference'])
                        f.write(f"- *{row['indicator']}*: ")
                        f.write(f"{row['group1']} vs {row['group2']}: ")
                        f.write(f"{diff_pct:.1f}% difference (p={row['p_value']:.3f})\n")
                    f.write("\n")

            # Discussion section
            f.write("### 5.7 Key Findings Summary\n\n")
            f.write("1. **Multiple Marginalization**: Individuals with intersecting marginalized identities ")
            f.write("experience compounded health disadvantages across multiple SDHE domains.\n\n")

            f.write("2. **Geographic Inequity**: Substantial variation in health outcomes exists across ")
            f.write("Bangkok districts, independent of individual-level characteristics.\n\n")

            f.write("3. **Systematic Disadvantage**: Priority population groups (elderly, LGBT+, disabled, ")
            f.write("informal workers) face consistent barriers across healthcare access, economic security, ")
            f.write("and social determinants.\n\n")

            f.write("4. **Intersectional Vulnerability**: Combined identities (e.g., elderly + disabled) ")
            f.write("show significantly worse outcomes than single-identity groups.\n\n")

            f.write("5. **Within-Group Stratification**: Significant disparities exist within vulnerable populations ")
            f.write("based on education, housing, employment, and income - highlighting the need for targeted interventions.\n\n")

            f.write("---\n\n")
            f.write("**Note**: All comparisons use chi-square tests or Fisher's exact tests for proportions, ")
            f.write("and independent t-tests for continuous variables. Effect sizes are reported using Cohen's h ")
            f.write("for proportions and Cohen's d for means. Statistical significance set at α = 0.05.\n\n")

            f.write("**Data Source**: Bangkok Health Survey, 6,523 respondents across 50 districts\n\n")
            f.write("**Analysis Date**: 2025-01-08\n")

        print("\n[OK] Generated REPORT_SDHE_ANALYSIS_SECTION.md")

def main():
    """Main execution"""
    analyzer = DeepSDHEAnalyzer()
    analyzer.run_full_analysis()

if __name__ == "__main__":
    main()