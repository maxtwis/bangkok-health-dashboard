"""
Community-Level Indicator Analysis
Comprehensive analysis of ALL indicators by community type

Following the same logic as elderly_all_7_domains_analysis.py
Using indicator definitions from MULTIPLE_CORRELATION.md
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("COMPREHENSIVE COMMUNITY-LEVEL INDICATOR ANALYSIS")
print("All Indicators for 5 Community Types vs Bangkok Average")
print("="*80)

# Load data
community_df = pd.read_csv('public/data/community_data.csv', encoding='utf-8-sig')
full_survey_df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')

print(f"\nCommunity data loaded: {len(community_df)} respondents")
print(f"Full survey data loaded: {len(full_survey_df)} respondents")

print("\nCommunity types:")
print(community_df['community_type'].value_counts())

# Helper functions
def calculate_monthly_income(row):
    if pd.isna(row.get('income', None)) or row.get('income', 0) == 0:
        return np.nan
    if row.get('income_type', 2) == 1:
        return row['income'] * 30
    else:
        return row['income']

def weighted_percentage(df, column):
    """Calculate simple percentage (no weights for community level)"""
    valid_data = df[column].dropna()
    if len(valid_data) == 0:
        return np.nan
    return (valid_data.sum() / len(valid_data)) * 100

def simple_mean(df, column):
    """Calculate simple mean"""
    return df[column].mean()

# Calculate indicators for both datasets
print("\nCalculating all indicators...")

for df in [community_df, full_survey_df]:
    df['monthly_income'] = df.apply(calculate_monthly_income, axis=1)

    # Economic Security
    df['unemployed'] = df['occupation_status'].apply(lambda x: 1 if x == 0 else 0)
    df['vulnerable_employment'] = df.apply(
        lambda row: 1 if row.get('occupation_status', 0) == 1 and
                         row.get('occupation_contract', 0) == 0 and
                         row.get('occupation_welfare', 0) == 0 else
                    (0 if row.get('occupation_status', 0) == 1 else np.nan),
        axis=1
    )
    df['food_insecurity_moderate'] = df['food_insecurity_1'].apply(lambda x: 1 if x == 1 else 0)
    df['food_insecurity_severe'] = df['food_insecurity_2'].apply(lambda x: 1 if x == 1 else 0)
    df['work_injury'] = df['occupation_injury'].apply(lambda x: 1 if x == 1 else 0)
    df['catastrophic_spending'] = df.apply(
        lambda row: 1 if row.get('monthly_income', 0) > 0 and pd.notna(row.get('hh_health_expense', 0)) and
                         row.get('hh_health_expense', 0) / row.get('monthly_income', 1) > 0.10 else
                    (0 if row.get('monthly_income', 0) > 0 and pd.notna(row.get('hh_health_expense', 0)) else np.nan),
        axis=1
    )

    # Healthcare Access
    df['has_health_coverage'] = df['welfare'].apply(
        lambda x: 1 if (x in [1, 2, 3, '1', '2', '3'] or (isinstance(x, (int, float)) and x in [1, 2, 3])) else 0
    )
    df['medical_skip_cost'] = df['medical_skip_1'].apply(lambda x: 1 if x == 1 else 0)
    df['dental_access'] = df.apply(
        lambda row: (1 if row.get('oral_health_access', 0) == 1 else 0) if row.get('oral_health', 0) == 1 else 1,
        axis=1
    )

    # Physical Environment
    df['owns_home'] = df['house_status'].apply(lambda x: 1 if x == 1 else 0)
    df['has_water'] = df['community_environment_3'].apply(lambda x: 0 if x == 1 else 1)
    df['has_electricity'] = df['community_environment_4'].apply(lambda x: 0 if x == 1 else 1)
    df['has_waste_mgmt'] = df['community_environment_5'].apply(lambda x: 0 if x == 1 else 1)
    df['has_sanitation'] = df['community_environment_6'].apply(lambda x: 0 if x == 1 else 1)
    df['overcrowded'] = df.apply(
        lambda row: 1 if row.get('community_environment_1', 0) == 1 or row.get('community_environment_2', 0) == 1 else 0,
        axis=1
    )
    df['disaster_exp'] = df['community_disaster_1'].apply(lambda x: 1 if x == 1 else 0)
    df['pollution_exp'] = df['health_pollution'].apply(lambda x: 1 if x == 1 else 0)
    df['has_ramp'] = df['community_amenity_type_1'].apply(lambda x: 1 if x == 1 else 0)
    df['has_handrail'] = df['community_amenity_type_2'].apply(lambda x: 1 if x == 1 else 0)
    df['has_public_space'] = df['community_amenity_type_3'].apply(lambda x: 1 if x == 1 else 0)
    df['has_health_facility'] = df['community_amenity_type_4'].apply(lambda x: 1 if x == 1 else 0)

    # Social Context
    df['feels_unsafe'] = df['community_safety'].apply(lambda x: 1 if x in [1, 2] else 0)
    df['violence_exp'] = df.apply(
        lambda row: 1 if row.get('physical_violence', 0) == 1 or
                         row.get('psychological_violence', 0) == 1 or
                         row.get('sexual_violence', 0) == 1 else 0,
        axis=1
    )
    df['discrimination_exp'] = df['discrimination_1'].apply(lambda x: 1 if x == 1 else 0)
    df['no_social_support'] = df['helper'].apply(lambda x: 1 if x == 0 else 0)

    # Health Behaviors
    df['drinks_alcohol'] = df['drink_status'].apply(lambda x: 1 if x == 1 else 0)
    df['smokes'] = df['smoke_status'].apply(lambda x: 1 if x in [2, 3] else 0)
    df['no_exercise'] = df['exercise_status'].apply(lambda x: 1 if x == 0 else 0)

    # Calculate BMI
    def calc_bmi(row):
        h, w = row.get('height', 0), row.get('weight', 0)
        if h > 0 and w > 0:
            return w / ((h / 100) ** 2)
        return np.nan

    df['bmi'] = df.apply(calc_bmi, axis=1)
    df['abnormal_bmi'] = df['bmi'].apply(lambda x: 1 if pd.notna(x) and (x < 18.5 or x >= 25) else (0 if pd.notna(x) else np.nan))

    # Health Outcomes
    df['has_chronic_disease'] = df['diseases_status'].apply(lambda x: 1 if x == 1 else 0)

    disease_columns = [f'diseases_type_{i}' for i in range(1, 22)]
    df['disease_count'] = df[disease_columns].sum(axis=1)
    df['multiple_diseases'] = df['disease_count'].apply(lambda x: 1 if x >= 2 else 0)

    # Education
    df['can_speak'] = df['speak'].apply(lambda x: 1 if x == 1 else 0)
    df['can_read'] = df['read'].apply(lambda x: 1 if x == 1 else 0)
    df['can_write'] = df['write'].apply(lambda x: 1 if x == 1 else 0)
    df['can_math'] = df['math'].apply(lambda x: 1 if x == 1 else 0)
    df['has_training'] = df['training'].apply(lambda x: 1 if x == 1 else 0)
    df['no_school'] = df['education'].apply(lambda x: 1 if x == 0 else 0)
    df['primary_ed'] = df['education'].apply(lambda x: 1 if x in [1, 2] else 0)
    df['secondary_ed'] = df['education'].apply(lambda x: 1 if x in [3, 4] else 0)
    df['vocational_ed'] = df['education'].apply(lambda x: 1 if x in [5, 6] else 0)
    df['higher_ed'] = df['education'].apply(lambda x: 1 if x in [7, 8] else 0)

# Disease names
disease_names = {
    'diseases_type_1': 'Diabetes',
    'diseases_type_2': 'Hypertension',
    'diseases_type_3': 'Gout',
    'diseases_type_4': 'Chronic Kidney Disease',
    'diseases_type_5': 'Cancer',
    'diseases_type_6': 'Hyperlipidemia',
    'diseases_type_7': 'Ischemic Heart Disease',
    'diseases_type_8': 'Liver Disease',
    'diseases_type_9': 'Stroke',
    'diseases_type_10': 'HIV',
    'diseases_type_11': 'Mental Disorders',
    'diseases_type_12': 'Allergies',
    'diseases_type_13': 'Bone and Joint Disease',
    'diseases_type_14': 'Respiratory Disease',
    'diseases_type_15': 'Emphysema',
    'diseases_type_16': 'Anemia',
    'diseases_type_17': 'Peptic Ulcer',
    'diseases_type_18': 'Epilepsy',
    'diseases_type_19': 'Intestinal Disease',
    'diseases_type_20': 'Paralysis',
    'diseases_type_21': 'Stroke Sequelae'
}

# Function to calculate indicators for a community type
def calc_community_indicators(df):
    if len(df) == 0:
        return None

    results = {'N': len(df)}

    # Economic Security
    results['Unemployment Rate (%)'] = weighted_percentage(df, 'unemployed')
    results['Vulnerable Employment (%)'] = weighted_percentage(df[df['occupation_status'] == 1], 'vulnerable_employment')
    results['Food Insecurity - Moderate (%)'] = weighted_percentage(df, 'food_insecurity_moderate')
    results['Food Insecurity - Severe (%)'] = weighted_percentage(df, 'food_insecurity_severe')
    results['Work Injury Rate (%)'] = weighted_percentage(df, 'work_injury')
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
    results['Waste Management (%)'] = weighted_percentage(df, 'has_waste_mgmt')
    results['Sanitation Access (%)'] = weighted_percentage(df, 'has_sanitation')
    results['Housing Overcrowding (%)'] = weighted_percentage(df, 'overcrowded')
    results['Disaster Experience (%)'] = weighted_percentage(df, 'disaster_exp')
    results['Pollution Exposure (%)'] = weighted_percentage(df, 'pollution_exp')
    results['Has Ramp/Accessibility (%)'] = weighted_percentage(df, 'has_ramp')
    results['Has Handrails (%)'] = weighted_percentage(df, 'has_handrail')
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
    for col, name in disease_names.items():
        results[f'{name} (%)'] = weighted_percentage(df, col)

    # Education
    results['Can Speak Thai (%)'] = weighted_percentage(df, 'can_speak')
    results['Can Read Thai (%)'] = weighted_percentage(df, 'can_read')
    results['Can Write Thai (%)'] = weighted_percentage(df, 'can_write')
    results['Can Do Basic Math (%)'] = weighted_percentage(df, 'can_math')
    results['Had Training (%)'] = weighted_percentage(df, 'has_training')
    results['No Schooling (%)'] = weighted_percentage(df, 'no_school')
    results['Primary Education (%)'] = weighted_percentage(df, 'primary_ed')
    results['Secondary Education (%)'] = weighted_percentage(df, 'secondary_ed')
    results['Vocational Education (%)'] = weighted_percentage(df, 'vocational_ed')
    results['Higher Education (%)'] = weighted_percentage(df, 'higher_ed')
    results['Average Education Level'] = simple_mean(df, 'education')

    return results

# Calculate Bangkok average (full survey)
print("\nCalculating Bangkok average (full survey)...")
bangkok_avg = calc_community_indicators(full_survey_df)

# Define domain-indicator mapping
domain_indicator_map = {
    'Economic Security': [
        'Unemployment Rate (%)', 'Vulnerable Employment (%)', 'Food Insecurity - Moderate (%)',
        'Food Insecurity - Severe (%)', 'Work Injury Rate (%)', 'Average Monthly Income (Baht)',
        'Catastrophic Health Spending (%)'
    ],
    'Healthcare Access': [
        'Health Coverage Rate (%)', 'Medical Skip due to Cost (%)', 'Dental Access Rate (%)'
    ],
    'Physical Environment': [
        'Home Ownership Rate (%)', 'Water Access (%)', 'Electricity Access (%)',
        'Waste Management (%)', 'Sanitation Access (%)', 'Housing Overcrowding (%)',
        'Disaster Experience (%)', 'Pollution Exposure (%)', 'Has Ramp/Accessibility (%)',
        'Has Handrails (%)', 'Has Public Recreation Space (%)', 'Has Health Facility (%)'
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
    ] + [f'{name} (%)' for name in disease_names.values()],
    'Education': [
        'Can Speak Thai (%)', 'Can Read Thai (%)', 'Can Write Thai (%)', 'Can Do Basic Math (%)',
        'Had Training (%)', 'No Schooling (%)', 'Primary Education (%)', 'Secondary Education (%)',
        'Vocational Education (%)', 'Higher Education (%)', 'Average Education Level'
    ]
}

# Community type mapping
community_types = {
    'ชุมชนชานเมือง': 'Suburban Community',
    'ชุมชนหมู่บ้านจัดสรร': 'Housing Estate',
    'ชุมชนอาคารสูง': 'High-rise/Condo',
    'ชุมชนเมือง': 'Urban Community',
    'ชุมชนแออัด': 'Crowded Community'
}

# Reverse indicators (lower is better)
reverse_indicators = [
    'Unemployment Rate (%)', 'Vulnerable Employment (%)', 'Food Insecurity - Moderate (%)',
    'Food Insecurity - Severe (%)', 'Work Injury Rate (%)', 'Catastrophic Health Spending (%)',
    'Medical Skip due to Cost (%)', 'Housing Overcrowding (%)', 'Disaster Experience (%)',
    'Pollution Exposure (%)', 'Feels Unsafe (%)', 'Violence Experience (%)',
    'Discrimination Experience (%)', 'No Social Support (%)', 'Alcohol Consumption (%)',
    'Tobacco Use (%)', 'No Exercise (%)', 'Abnormal BMI (%)', 'Chronic Disease Prevalence (%)',
    'Multiple Chronic Diseases (%)', 'No Schooling (%)'
] + [f'{name} (%)' for name in disease_names.values()]

# Generate comparison tables
print("\n" + "="*80)
print("GENERATING COMPARISON TABLES FOR ALL 7 DOMAINS")
print("="*80)

all_results = {}

for domain, indicators in domain_indicator_map.items():
    print(f"\n{'='*80}")
    print(f"{domain.upper()} - COMPARISON TABLE")
    print(f"{'='*80}\n")

    comparison = []

    for indicator in indicators:
        row = {'Indicator': indicator, 'Bangkok Avg': bangkok_avg[indicator]}

        # Calculate for each community type
        for thai_name, eng_name in community_types.items():
            comm_data = community_df[community_df['community_type'] == thai_name]
            comm_results = calc_community_indicators(comm_data)
            if comm_results:
                row[eng_name] = comm_results[indicator]

        # Calculate gap (average community value vs Bangkok)
        comm_values = [row.get(eng_name, np.nan) for eng_name in community_types.values()]
        valid_values = [v for v in comm_values if pd.notna(v)]

        if valid_values and pd.notna(bangkok_avg[indicator]):
            if indicator in reverse_indicators:
                # For reverse indicators, higher community average is worse
                avg_comm = np.mean(valid_values)
                row['Gap'] = avg_comm - bangkok_avg[indicator]
            else:
                # For normal indicators, lower community average is worse
                avg_comm = np.mean(valid_values)
                row['Gap'] = avg_comm - bangkok_avg[indicator]

        comparison.append(row)

    df_result = pd.DataFrame(comparison)
    print(df_result.to_string(index=False))

    all_results[domain] = df_result

# Save results
print("\n" + "="*80)
print("SAVING RESULTS")
print("="*80)

with open('community_all_7_domains_indicator_analysis.txt', 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write("COMPREHENSIVE COMMUNITY-LEVEL INDICATOR ANALYSIS\n")
    f.write("All Indicators for 5 Community Types vs Bangkok Average\n")
    f.write("="*80 + "\n\n")

    for domain, df_result in all_results.items():
        f.write(f"\n{domain.upper()} - COMPARISON TABLE\n")
        f.write(f"Community Types: {', '.join(community_types.values())}\n")
        f.write("="*80 + "\n")
        f.write(df_result.to_string(index=False))
        f.write("\n\n")

for domain, df_result in all_results.items():
    filename = f"community_{domain.lower().replace(' ', '_')}_comparison.csv"
    df_result.to_csv(filename, index=False, encoding='utf-8-sig')

print("\nResults saved:")
print("  - community_all_7_domains_indicator_analysis.txt")
for domain in domain_indicator_map.keys():
    print(f"  - community_{domain.lower().replace(' ', '_')}_comparison.csv")

print("\n" + "="*80)
print("COMPREHENSIVE COMMUNITY INDICATOR ANALYSIS COMPLETE")
print("="*80)
