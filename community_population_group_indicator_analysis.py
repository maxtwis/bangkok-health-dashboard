"""
Community-Level by Population Group Indicator Analysis
Statistical analysis to identify determinants of vulnerability WITHIN each population group
ACROSS different community types

Combines:
- Community-level stratification (5 community types)
- Population group stratification (Elderly, Disabled, Informal Workers, LGBTQ+)
- All 7 domain indicators from MULTIPLE_CORRELATION.md

This provides deeper insights into how different vulnerable populations fare
in different community environments.
"""

import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import f_oneway
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("COMMUNITY-LEVEL BY POPULATION GROUP INDICATOR ANALYSIS")
print("Statistical Analysis Within Each Population Group Across Community Types")
print("="*80)

# ============================================================================
# STEP 1: Load Data and Calculate Indicators
# ============================================================================

print("\nStep 1: Loading data and calculating indicators...")

# Load community data
community_df = pd.read_csv('public/data/community_data.csv', encoding='utf-8-sig')
print(f"Community data loaded: {len(community_df)} respondents")

# Helper functions
def calculate_monthly_income(row):
    if pd.isna(row.get('income', None)) or row.get('income', 0) == 0:
        return np.nan
    if row.get('income_type', 2) == 1:
        monthly = row['income'] * 30
    else:
        monthly = row['income']

    # Cap unrealistic values (max 300,000 baht/month = ~3.6M/year)
    # Values above this are likely data entry errors
    if monthly > 300000:
        return np.nan
    return monthly

def weighted_percentage(df, column):
    """Calculate simple percentage"""
    valid_data = df[column].dropna()
    if len(valid_data) == 0:
        return np.nan
    return (valid_data.sum() / len(valid_data)) * 100

def simple_mean(df, column):
    """Calculate simple mean"""
    return df[column].mean()

# Calculate derived indicators
print("  - Calculating derived indicators...")

community_df['monthly_income'] = community_df.apply(calculate_monthly_income, axis=1)

# Economic Security
community_df['unemployed'] = community_df['occupation_status'].apply(lambda x: 1 if x == 0 else 0)
community_df['vulnerable_employment'] = community_df.apply(
    lambda row: 1 if row.get('occupation_status', 0) == 1 and
                     row.get('occupation_contract', 0) == 0 and
                     row.get('occupation_welfare', 0) == 0 else
                (0 if row.get('occupation_status', 0) == 1 else np.nan),
    axis=1
)
community_df['food_insecurity_moderate'] = community_df['food_insecurity_1'].apply(lambda x: 1 if x == 1 else 0)
community_df['food_insecurity_severe'] = community_df['food_insecurity_2'].apply(lambda x: 1 if x == 1 else 0)
community_df['work_injury'] = community_df['occupation_injury'].apply(lambda x: 1 if x == 1 else 0)
community_df['catastrophic_spending'] = community_df.apply(
    lambda row: 1 if row.get('monthly_income', 0) > 0 and pd.notna(row.get('hh_health_expense', 0)) and
                     row.get('hh_health_expense', 0) / row.get('monthly_income', 1) > 0.10 else
                (0 if row.get('monthly_income', 0) > 0 and pd.notna(row.get('hh_health_expense', 0)) else np.nan),
    axis=1
)

# Healthcare Access
community_df['has_health_coverage'] = community_df['welfare'].apply(
    lambda x: 1 if (x in [1, 2, 3, '1', '2', '3'] or (isinstance(x, (int, float)) and x in [1, 2, 3])) else 0
)
community_df['medical_skip_cost'] = community_df['medical_skip_1'].apply(lambda x: 1 if x == 1 else 0)
community_df['dental_access'] = community_df.apply(
    lambda row: (1 if row.get('oral_health_access', 0) == 1 else 0) if row.get('oral_health', 0) == 1 else np.nan,
    axis=1
)

# Physical Environment
community_df['owns_home'] = community_df['house_status'].apply(lambda x: 1 if x == 1 else 0)
community_df['has_water'] = community_df['community_environment_3'].apply(lambda x: 0 if x == 1 else 1)
community_df['has_electricity'] = community_df['community_environment_4'].apply(lambda x: 0 if x == 1 else 1)
community_df['has_waste_mgmt'] = community_df['community_environment_5'].apply(lambda x: 0 if x == 1 else 1)
community_df['has_sanitation'] = community_df['community_environment_6'].apply(lambda x: 0 if x == 1 else 1)
community_df['overcrowded'] = community_df.apply(
    lambda row: 1 if row.get('community_environment_1', 0) == 1 or row.get('community_environment_2', 0) == 1 else 0,
    axis=1
)
community_df['disaster_exp'] = community_df['community_disaster_1'].apply(lambda x: 1 if x == 1 else 0)
community_df['pollution_exp'] = community_df['health_pollution'].apply(lambda x: 1 if x == 1 else 0)
community_df['has_ramp'] = community_df['community_amenity_type_1'].apply(lambda x: 1 if x == 1 else 0)
community_df['has_handrail'] = community_df['community_amenity_type_2'].apply(lambda x: 1 if x == 1 else 0)
community_df['has_public_space'] = community_df['community_amenity_type_3'].apply(lambda x: 1 if x == 1 else 0)
community_df['has_health_facility'] = community_df['community_amenity_type_4'].apply(lambda x: 1 if x == 1 else 0)

# Social Context
community_df['feels_unsafe'] = community_df['community_safety'].apply(lambda x: 1 if x in [1, 2] else 0)
community_df['violence_exp'] = community_df.apply(
    lambda row: 1 if row.get('physical_violence', 0) == 1 or
                     row.get('psychological_violence', 0) == 1 or
                     row.get('sexual_violence', 0) == 1 else 0,
    axis=1
)
community_df['discrimination_exp'] = community_df['discrimination_1'].apply(lambda x: 1 if x == 1 else 0)
community_df['no_social_support'] = community_df['helper'].apply(lambda x: 1 if x == 0 else 0)

# Health Behaviors
community_df['drinks_alcohol'] = community_df['drink_status'].apply(lambda x: 1 if x == 1 else 0)
community_df['smokes'] = community_df['smoke_status'].apply(lambda x: 1 if x in [2, 3] else 0)
community_df['no_exercise'] = community_df['exercise_status'].apply(lambda x: 1 if x == 0 else 0)

# Calculate BMI
def calc_bmi(row):
    h, w = row.get('height', 0), row.get('weight', 0)
    if h > 0 and w > 0:
        return w / ((h / 100) ** 2)
    return np.nan

community_df['bmi'] = community_df.apply(calc_bmi, axis=1)
community_df['abnormal_bmi'] = community_df['bmi'].apply(lambda x: 1 if pd.notna(x) and (x < 18.5 or x >= 25) else (0 if pd.notna(x) else np.nan))

# Health Outcomes
community_df['has_chronic_disease'] = community_df['diseases_status'].apply(lambda x: 1 if x == 1 else 0)

disease_columns = [f'diseases_type_{i}' for i in range(1, 22)]
community_df['disease_count'] = community_df[disease_columns].sum(axis=1)
community_df['multiple_diseases'] = community_df['disease_count'].apply(lambda x: 1 if x >= 2 else 0)

# Education
community_df['can_speak'] = community_df['speak'].apply(lambda x: 1 if x == 1 else 0)
community_df['can_read'] = community_df['read'].apply(lambda x: 1 if x == 1 else 0)
community_df['can_write'] = community_df['write'].apply(lambda x: 1 if x == 1 else 0)
community_df['can_math'] = community_df['math'].apply(lambda x: 1 if x == 1 else 0)
community_df['has_training'] = community_df['training'].apply(lambda x: 1 if x == 1 else 0)
community_df['no_school'] = community_df['education'].apply(lambda x: 1 if x == 0 else 0)
community_df['primary_ed'] = community_df['education'].apply(lambda x: 1 if x in [1, 2] else 0)
community_df['secondary_ed'] = community_df['education'].apply(lambda x: 1 if x in [3, 4] else 0)
community_df['vocational_ed'] = community_df['education'].apply(lambda x: 1 if x in [5, 6] else 0)
community_df['higher_ed'] = community_df['education'].apply(lambda x: 1 if x in [7, 8] else 0)

# ============================================================================
# STEP 2: Define Population Groups (INCLUSIVE FILTERING)
# ============================================================================

print("\nStep 2: Creating inclusive population group filters...")

# INCLUSIVE FILTERS - respondents can belong to multiple groups
community_df['is_elderly'] = community_df['age'] >= 60
community_df['is_disabled'] = community_df['disable_status'] == 1
community_df['is_informal'] = (community_df['occupation_status'] == 1) & (community_df['occupation_contract'] == 0)
community_df['is_lgbt'] = community_df['sex'] == 'lgbt'

print(f"\nPopulation group sizes (inclusive):")
print(f"  - Elderly (age >= 60): {community_df['is_elderly'].sum():,}")
print(f"  - Disabled: {community_df['is_disabled'].sum():,}")
print(f"  - Informal Workers: {community_df['is_informal'].sum():,}")
print(f"  - LGBTQ+: {community_df['is_lgbt'].sum():,}")

# Community types
community_types = {
    'ชุมชนชานเมือง': 'Suburban',
    'ชุมชนหมู่บ้านจัดสรร': 'Housing Estate',
    'ชุมชนอาคารสูง': 'High-rise',
    'ชุมชนเมือง': 'Urban',
    'ชุมชนแออัด': 'Crowded'
}

# ============================================================================
# STEP 3: Define Key Indicators by Domain
# ============================================================================

# Key indicators to analyze (focused on most important ones)
key_indicators = {
    'Economic Security': [
        'Unemployment Rate (%)', 'Vulnerable Employment (%)', 'Food Insecurity - Moderate (%)',
        'Food Insecurity - Severe (%)', 'Average Monthly Income (Baht)', 'Catastrophic Health Spending (%)'
    ],
    'Healthcare Access': [
        'Health Coverage Rate (%)', 'Medical Skip due to Cost (%)', 'Dental Access Rate (%)'
    ],
    'Physical Environment': [
        'Home Ownership Rate (%)', 'Water Access (%)', 'Electricity Access (%)',
        'Housing Overcrowding (%)', 'Disaster Experience (%)', 'Pollution Exposure (%)',
        'Has Ramp/Accessibility (%)', 'Has Public Recreation Space (%)', 'Has Health Facility (%)'
    ],
    'Social Context': [
        'Feels Unsafe (%)', 'Violence Experience (%)', 'Discrimination Experience (%)',
        'No Social Support (%)'
    ],
    'Health Behaviors': [
        'Alcohol Consumption (%)', 'Tobacco Use (%)', 'No Exercise (%)', 'Abnormal BMI (%)'
    ],
    'Health Outcomes': [
        'Chronic Disease Prevalence (%)', 'Multiple Chronic Diseases (%)'
    ],
    'Education': [
        'Can Speak Thai (%)', 'Can Read Thai (%)', 'Can Write Thai (%)', 'Can Do Basic Math (%)',
        'No Schooling (%)', 'Higher Education (%)', 'Average Education Level'
    ]
}

# ============================================================================
# STEP 4: Calculate Indicators for Population Groups by Community Type
# ============================================================================

def calc_indicators(df):
    """Calculate all key indicators for a given DataFrame"""
    if len(df) < 5:  # Minimum sample size
        return None

    results = {'N': len(df)}

    # Economic Security
    results['Unemployment Rate (%)'] = weighted_percentage(df, 'unemployed')
    results['Vulnerable Employment (%)'] = weighted_percentage(df[df['occupation_status'] == 1], 'vulnerable_employment')
    results['Food Insecurity - Moderate (%)'] = weighted_percentage(df, 'food_insecurity_moderate')
    results['Food Insecurity - Severe (%)'] = weighted_percentage(df, 'food_insecurity_severe')
    results['Average Monthly Income (Baht)'] = simple_mean(df, 'monthly_income')
    results['Catastrophic Health Spending (%)'] = weighted_percentage(df, 'catastrophic_spending')

    # Healthcare Access
    results['Health Coverage Rate (%)'] = weighted_percentage(df, 'has_health_coverage')
    results['Medical Skip due to Cost (%)'] = weighted_percentage(df, 'medical_skip_cost')
    results['Dental Access Rate (%)'] = weighted_percentage(df, 'dental_access')

    # Physical Environment
    results['Home Ownership Rate (%)'] = weighted_percentage(df, 'owns_home')
    results['Water Access (%)'] = weighted_percentage(df, 'has_water')
    results['Electricity Access (%)'] = weighted_percentage(df, 'has_electricity')
    results['Housing Overcrowding (%)'] = weighted_percentage(df, 'overcrowded')
    results['Disaster Experience (%)'] = weighted_percentage(df, 'disaster_exp')
    results['Pollution Exposure (%)'] = weighted_percentage(df, 'pollution_exp')
    results['Has Ramp/Accessibility (%)'] = weighted_percentage(df, 'has_ramp')
    results['Has Public Recreation Space (%)'] = weighted_percentage(df, 'has_public_space')
    results['Has Health Facility (%)'] = weighted_percentage(df, 'has_health_facility')

    # Social Context
    results['Feels Unsafe (%)'] = weighted_percentage(df, 'feels_unsafe')
    results['Violence Experience (%)'] = weighted_percentage(df, 'violence_exp')
    results['Discrimination Experience (%)'] = weighted_percentage(df, 'discrimination_exp')
    results['No Social Support (%)'] = weighted_percentage(df, 'no_social_support')

    # Health Behaviors
    results['Alcohol Consumption (%)'] = weighted_percentage(df, 'drinks_alcohol')
    results['Tobacco Use (%)'] = weighted_percentage(df, 'smokes')
    results['No Exercise (%)'] = weighted_percentage(df, 'no_exercise')
    results['Abnormal BMI (%)'] = weighted_percentage(df, 'abnormal_bmi')

    # Health Outcomes
    results['Chronic Disease Prevalence (%)'] = weighted_percentage(df, 'has_chronic_disease')
    results['Multiple Chronic Diseases (%)'] = weighted_percentage(df, 'multiple_diseases')

    # Education
    results['Can Speak Thai (%)'] = weighted_percentage(df, 'can_speak')
    results['Can Read Thai (%)'] = weighted_percentage(df, 'can_read')
    results['Can Write Thai (%)'] = weighted_percentage(df, 'can_write')
    results['Can Do Basic Math (%)'] = weighted_percentage(df, 'can_math')
    results['No Schooling (%)'] = weighted_percentage(df, 'no_school')
    results['Higher Education (%)'] = weighted_percentage(df, 'higher_ed')
    results['Average Education Level'] = simple_mean(df, 'education')

    return results

# Population group definitions
population_groups = {
    'Elderly (60+)': 'is_elderly',
    'Disabled': 'is_disabled',
    'Informal Workers': 'is_informal',
    'LGBTQ+': 'is_lgbt'
}

# ============================================================================
# STEP 5: Generate Analysis for Each Population Group
# ============================================================================

all_results = {}

for pop_group_name, pop_group_filter in population_groups.items():
    print(f"\n{'='*80}")
    print(f"ANALYSIS: {pop_group_name.upper()}")
    print(f"{'='*80}")

    # Filter to this population group
    pop_df = community_df[community_df[pop_group_filter]].copy()
    print(f"\nTotal {pop_group_name}: {len(pop_df):,} respondents")

    # Check distribution across community types
    print(f"\nDistribution across community types:")
    for thai_name, eng_name in community_types.items():
        count = len(pop_df[pop_df['community_type'] == thai_name])
        print(f"  {eng_name}: {count}")

    # Analyze each domain
    for domain, indicators in key_indicators.items():
        print(f"\n{'-'*80}")
        print(f"{domain.upper()}")
        print(f"{'-'*80}")

        comparison = []

        for indicator in indicators:
            row = {'Indicator': indicator}

            # Calculate for each community type
            comm_values = []
            for thai_name, eng_name in community_types.items():
                comm_pop_df = pop_df[pop_df['community_type'] == thai_name]
                comm_results = calc_indicators(comm_pop_df)
                if comm_results:
                    value = comm_results.get(indicator, np.nan)
                    row[eng_name] = value
                    if pd.notna(value):
                        comm_values.append(value)
                else:
                    row[eng_name] = np.nan

            # Calculate statistics
            if len(comm_values) >= 2:
                row['Mean'] = np.mean(comm_values)
                row['Std Dev'] = np.std(comm_values)
                row['Min'] = np.min(comm_values)
                row['Max'] = np.max(comm_values)
                row['Range'] = np.max(comm_values) - np.min(comm_values)

            comparison.append(row)

        df_result = pd.DataFrame(comparison)
        print(df_result.to_string(index=False))

        # Store results
        key = f"{pop_group_name}_{domain}"
        all_results[key] = df_result

        # Statistical testing (ANOVA) if we have enough groups with data
        print(f"\nStatistical Testing (ANOVA) for {domain}:")
        for indicator in indicators:
            groups = []
            group_names = []
            for thai_name, eng_name in community_types.items():
                comm_pop_df = pop_df[pop_df['community_type'] == thai_name]
                if len(comm_pop_df) >= 5:  # Minimum sample size
                    # Get the actual data for the indicator
                    indicator_col_map = {
                        'Unemployment Rate (%)': 'unemployed',
                        'Vulnerable Employment (%)': 'vulnerable_employment',
                        'Food Insecurity - Moderate (%)': 'food_insecurity_moderate',
                        'Food Insecurity - Severe (%)': 'food_insecurity_severe',
                        'Average Monthly Income (Baht)': 'monthly_income',
                        'Catastrophic Health Spending (%)': 'catastrophic_spending',
                        'Health Coverage Rate (%)': 'has_health_coverage',
                        'Medical Skip due to Cost (%)': 'medical_skip_cost',
                        'Dental Access Rate (%)': 'dental_access',
                        'Home Ownership Rate (%)': 'owns_home',
                        'Water Access (%)': 'has_water',
                        'Electricity Access (%)': 'has_electricity',
                        'Housing Overcrowding (%)': 'overcrowded',
                        'Disaster Experience (%)': 'disaster_exp',
                        'Pollution Exposure (%)': 'pollution_exp',
                        'Has Ramp/Accessibility (%)': 'has_ramp',
                        'Has Public Recreation Space (%)': 'has_public_space',
                        'Has Health Facility (%)': 'has_health_facility',
                        'Feels Unsafe (%)': 'feels_unsafe',
                        'Violence Experience (%)': 'violence_exp',
                        'Discrimination Experience (%)': 'discrimination_exp',
                        'No Social Support (%)': 'no_social_support',
                        'Alcohol Consumption (%)': 'drinks_alcohol',
                        'Tobacco Use (%)': 'smokes',
                        'No Exercise (%)': 'no_exercise',
                        'Abnormal BMI (%)': 'abnormal_bmi',
                        'Chronic Disease Prevalence (%)': 'has_chronic_disease',
                        'Multiple Chronic Diseases (%)': 'multiple_diseases',
                        'Can Speak Thai (%)': 'can_speak',
                        'Can Read Thai (%)': 'can_read',
                        'Can Write Thai (%)': 'can_write',
                        'Can Do Basic Math (%)': 'can_math',
                        'No Schooling (%)': 'no_school',
                        'Higher Education (%)': 'higher_ed',
                        'Average Education Level': 'education'
                    }

                    col_name = indicator_col_map.get(indicator, None)
                    if col_name and col_name in comm_pop_df.columns:
                        data = comm_pop_df[col_name].dropna()
                        if len(data) >= 5:
                            groups.append(data)
                            group_names.append(eng_name)

            if len(groups) >= 2:
                try:
                    f_stat, p_value = f_oneway(*groups)
                    if p_value < 0.05:
                        print(f"  {indicator}: F={f_stat:.3f}, p={p_value:.4f} ***SIGNIFICANT***")
                        print(f"    Community types with data: {', '.join(group_names)}")
                except Exception as e:
                    pass  # Skip if ANOVA fails

# ============================================================================
# STEP 6: Save Results
# ============================================================================

print("\n" + "="*80)
print("SAVING RESULTS")
print("="*80)

# Save comprehensive text report
with open('community_population_group_indicator_analysis.txt', 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write("COMMUNITY-LEVEL BY POPULATION GROUP INDICATOR ANALYSIS\n")
    f.write("Statistical Analysis Within Each Population Group Across Community Types\n")
    f.write("="*80 + "\n\n")

    for key, df_result in all_results.items():
        f.write(f"\n{key}\n")
        f.write("-"*80 + "\n")
        f.write(df_result.to_string(index=False))
        f.write("\n\n")

# Save individual CSV files
for key, df_result in all_results.items():
    filename = f"community_{key.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('+', 'plus')}.csv"
    df_result.to_csv(filename, index=False, encoding='utf-8-sig')

print("\nResults saved:")
print("  - community_population_group_indicator_analysis.txt")
for key in all_results.keys():
    filename = f"community_{key.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('+', 'plus')}.csv"
    print(f"  - {filename}")

print("\n" + "="*80)
print("COMMUNITY POPULATION GROUP INDICATOR ANALYSIS COMPLETE")
print("="*80)
print("\nThis analysis reveals how different vulnerable populations")
print("experience different health determinants across community types,")
print("enabling targeted interventions for specific groups in specific settings.")
