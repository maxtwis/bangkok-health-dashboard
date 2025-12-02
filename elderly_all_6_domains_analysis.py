"""
Comprehensive Targeted Indicator Analysis for Elderly Group
ALL 6 SDHE DOMAINS with Top 5 Critical Districts per Domain

This script analyzes:
1. Economic Security - Districts: 1010, 1024, 1046, 1033, 1037
2. Healthcare Access - Districts: 1010, 1003, 1046, 1005, 1024
3. Physical Environment - Districts: 1014, 1037, 1033, 1031, 1039
4. Social Context - Districts: 1033, 1014, 1031, 1017, 1009
5. Health Behaviors - Districts: 1033, 1039, 1021, 1010, 1006
6. Health Outcomes - Districts: 1014, 1031, 1029, 1012, 1008
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("COMPREHENSIVE ELDERLY ANALYSIS - ALL 6 SDHE DOMAINS")
print("Top 5 Critical Districts per Domain with ALL Indicators")
print("="*80)

# Load data
survey_df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
weight_df = pd.read_csv('public/data/statistical checking/weight_by_district.csv', encoding='utf-8-sig')
district_scores = pd.read_csv('district_scores_elderly.csv', encoding='utf-8-sig')

# Create Elderly dataset
elderly_df = survey_df[
    (survey_df['age'] >= 60) &
    (survey_df['disable_status'] != 1)
].copy()

elderly_df['dname'] = elderly_df['dname'].astype(str)
weight_df['dname'] = weight_df['dname'].astype(str)

elderly_df = elderly_df.merge(
    weight_df[['dname', 'Weight_Elderly']],
    on='dname',
    how='left'
)
elderly_df['Weight_Elderly'] = elderly_df['Weight_Elderly'].fillna(1.0)

print(f"\nElderly respondents: {len(elderly_df)}")

# Identify Top 5 Critical Districts for each domain
print("\nIdentifying Top 5 Critical Districts per domain...")

domains_map = {
    'Economic Security': [str(d) for d in district_scores.nsmallest(5, 'Economic Security')['District'].tolist()],
    'Healthcare Access': [str(d) for d in district_scores.nsmallest(5, 'Healthcare Access')['District'].tolist()],
    'Physical Environment': [str(d) for d in district_scores.nsmallest(5, 'Physical Environment')['District'].tolist()],
    'Social Context': [str(d) for d in district_scores.nsmallest(5, 'Social Context')['District'].tolist()],
    'Health Behaviors': [str(d) for d in district_scores.nsmallest(5, 'Health Behaviors')['District'].tolist()],
    'Health Outcomes': [str(d) for d in district_scores.nsmallest(5, 'Health Outcomes')['District'].tolist()]
}

for domain, districts in domains_map.items():
    print(f"{domain}: {districts}")

# Helper functions
def calculate_monthly_income(row):
    if pd.isna(row.get('income', None)) or row.get('income', 0) == 0:
        return np.nan
    if row.get('income_type', 2) == 1:
        return row['income'] * 30
    else:
        return row['income']

def weighted_percentage(df, condition_col, weight_col='Weight_Elderly'):
    if isinstance(condition_col, str):
        valid_data = df[[condition_col, weight_col]].dropna()
        if len(valid_data) == 0:
            return np.nan
        weighted_sum = (valid_data[condition_col] * valid_data[weight_col]).sum()
        total_weight = valid_data[weight_col].sum()
    else:
        valid_df = df[condition_col.notna()].copy()
        if len(valid_df) == 0:
            return np.nan
        valid_condition = condition_col[condition_col.notna()]
        weighted_sum = (valid_condition * valid_df[weight_col]).sum()
        total_weight = valid_df[weight_col].sum()
    if total_weight == 0:
        return np.nan
    return (weighted_sum / total_weight) * 100

def weighted_mean(df, value_col, weight_col='Weight_Elderly'):
    valid_data = df[[value_col, weight_col]].dropna()
    if len(valid_data) == 0:
        return np.nan
    return np.average(valid_data[value_col], weights=valid_data[weight_col])

# Calculate all indicators
print("\nCalculating all indicators...")

elderly_df['monthly_income'] = elderly_df.apply(calculate_monthly_income, axis=1)

# Economic Security
elderly_df['unemployed'] = elderly_df['occupation_status'].apply(lambda x: 1 if x == 0 else 0)
elderly_df['vulnerable_employment'] = elderly_df.apply(
    lambda row: 1 if row.get('occupation_status', 0) == 1 and
                     row.get('occupation_contract', 0) == 0 and
                     row.get('occupation_welfare', 0) == 0 else
                (0 if row.get('occupation_status', 0) == 1 else np.nan),
    axis=1
)
elderly_df['food_insecurity_moderate'] = elderly_df['food_insecurity_1'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['food_insecurity_severe'] = elderly_df['food_insecurity_2'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['work_injury'] = elderly_df['occupation_injury'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['catastrophic_spending'] = elderly_df.apply(
    lambda row: 1 if row.get('monthly_income', 0) > 0 and pd.notna(row.get('hh_health_expense', 0)) and
                     row.get('hh_health_expense', 0) / row.get('monthly_income', 1) > 0.10 else
                (0 if row.get('monthly_income', 0) > 0 and pd.notna(row.get('hh_health_expense', 0)) else np.nan),
    axis=1
)

# Healthcare Access
# Note: welfare is stored as string, check for '1', '2', '3' or numeric 1, 2, 3
elderly_df['has_health_coverage'] = elderly_df['welfare'].apply(
    lambda x: 1 if (x in [1, 2, 3, '1', '2', '3'] or (isinstance(x, (int, float)) and x in [1, 2, 3])) else 0
)
elderly_df['medical_skip_cost'] = elderly_df['medical_skip_1'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['dental_access'] = elderly_df.apply(
    lambda row: (1 if row.get('oral_health_access', 0) == 1 else 0) if row.get('oral_health', 0) == 1 else 1,
    axis=1
)

# Physical Environment
elderly_df['owns_home'] = elderly_df['house_status'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['has_water'] = elderly_df['community_environment_3'].apply(lambda x: 0 if x == 1 else 1)
elderly_df['has_electricity'] = elderly_df['community_environment_4'].apply(lambda x: 0 if x == 1 else 1)
elderly_df['has_waste_mgmt'] = elderly_df['community_environment_5'].apply(lambda x: 0 if x == 1 else 1)
elderly_df['has_sanitation'] = elderly_df['community_environment_6'].apply(lambda x: 0 if x == 1 else 1)
elderly_df['overcrowded'] = elderly_df.apply(
    lambda row: 1 if row.get('community_environment_1', 0) == 1 or row.get('community_environment_2', 0) == 1 else 0,
    axis=1
)
elderly_df['disaster_exp'] = elderly_df['community_disaster_1'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['pollution_exp'] = elderly_df['health_pollution'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['has_ramp'] = elderly_df['community_amenity_type_1'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['has_handrail'] = elderly_df['community_amenity_type_2'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['has_public_space'] = elderly_df['community_amenity_type_3'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['has_health_facility'] = elderly_df['community_amenity_type_4'].apply(lambda x: 1 if x == 1 else 0)

# Social Context
elderly_df['feels_unsafe'] = elderly_df['community_safety'].apply(lambda x: 1 if x in [1, 2] else 0)
elderly_df['violence_exp'] = elderly_df.apply(
    lambda row: 1 if row.get('physical_violence', 0) == 1 or
                     row.get('psychological_violence', 0) == 1 or
                     row.get('sexual_violence', 0) == 1 else 0,
    axis=1
)
elderly_df['discrimination_exp'] = elderly_df['discrimination_1'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['no_social_support'] = elderly_df['helper'].apply(lambda x: 1 if x == 0 else 0)

# Health Behaviors
elderly_df['drinks_alcohol'] = elderly_df['drink_status'].apply(lambda x: 1 if x == 1 else 0)
elderly_df['smokes'] = elderly_df['smoke_status'].apply(lambda x: 1 if x in [2, 3] else 0)
elderly_df['no_exercise'] = elderly_df['exercise_status'].apply(lambda x: 1 if x == 0 else 0)

# Calculate BMI
def calc_bmi(row):
    h, w = row.get('height', 0), row.get('weight', 0)
    if h > 0 and w > 0:
        return w / ((h / 100) ** 2)
    return np.nan

elderly_df['bmi'] = elderly_df.apply(calc_bmi, axis=1)
elderly_df['abnormal_bmi'] = elderly_df['bmi'].apply(lambda x: 1 if pd.notna(x) and (x < 18.5 or x >= 25) else (0 if pd.notna(x) else np.nan))

# Health Outcomes
elderly_df['has_chronic_disease'] = elderly_df['diseases_status'].apply(lambda x: 1 if x == 1 else 0)

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

disease_columns = list(disease_names.keys())
elderly_df['disease_count'] = elderly_df[disease_columns].sum(axis=1)
elderly_df['multiple_diseases'] = elderly_df['disease_count'].apply(lambda x: 1 if x >= 2 else 0)

# Function to calculate indicators for a district
def calc_district_indicators(district_code):
    df = elderly_df[elderly_df['dname'] == district_code]
    if len(df) == 0:
        return None

    results = {'N': len(df)}

    # Economic Security
    results['Unemployment Rate (%)'] = weighted_percentage(df, 'unemployed')
    results['Vulnerable Employment (%)'] = weighted_percentage(df[df['occupation_status'] == 1], 'vulnerable_employment')
    results['Food Insecurity - Moderate (%)'] = weighted_percentage(df, 'food_insecurity_moderate')
    results['Food Insecurity - Severe (%)'] = weighted_percentage(df, 'food_insecurity_severe')
    results['Work Injury Rate (%)'] = weighted_percentage(df, 'work_injury')
    results['Average Monthly Income (Baht)'] = weighted_mean(df, 'monthly_income')
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

    return results

# Calculate Bangkok average
print("\nCalculating Bangkok average...")
bangkok_avg = calc_district_indicators(elderly_df['dname'].unique()[0])  # Initialize
for indicator in bangkok_avg.keys():
    if indicator != 'N':
        if 'Income' in indicator:
            bangkok_avg[indicator] = weighted_mean(elderly_df, 'monthly_income')
        elif indicator in ['Unemployment Rate (%)', 'Food Insecurity - Moderate (%)',
                          'Food Insecurity - Severe (%)', 'Work Injury Rate (%)',
                          'Catastrophic Health Spending (%)', 'Health Coverage Rate (%)',
                          'Medical Skip due to Cost (%)', 'Dental Access Rate (%)',
                          'Home Ownership Rate (%)', 'Water Access (%)', 'Electricity Access (%)',
                          'Waste Management (%)', 'Sanitation Access (%)', 'Housing Overcrowding (%)',
                          'Disaster Experience (%)', 'Pollution Exposure (%)', 'Has Ramp/Accessibility (%)',
                          'Has Handrails (%)', 'Has Public Recreation Space (%)', 'Has Health Facility (%)',
                          'Feels Unsafe (%)', 'Violence Experience (%)', 'Discrimination Experience (%)',
                          'No Social Support (%)', 'Alcohol Consumption (%)', 'Tobacco Use (%)',
                          'No Exercise (%)', 'Abnormal BMI (%)', 'Chronic Disease Prevalence (%)',
                          'Multiple Chronic Diseases (%)']:
            col_map = {
                'Unemployment Rate (%)': 'unemployed',
                'Food Insecurity - Moderate (%)': 'food_insecurity_moderate',
                'Food Insecurity - Severe (%)': 'food_insecurity_severe',
                'Work Injury Rate (%)': 'work_injury',
                'Catastrophic Health Spending (%)': 'catastrophic_spending',
                'Health Coverage Rate (%)': 'has_health_coverage',
                'Medical Skip due to Cost (%)': 'medical_skip_cost',
                'Dental Access Rate (%)': 'dental_access',
                'Home Ownership Rate (%)': 'owns_home',
                'Water Access (%)': 'has_water',
                'Electricity Access (%)': 'has_electricity',
                'Waste Management (%)': 'has_waste_mgmt',
                'Sanitation Access (%)': 'has_sanitation',
                'Housing Overcrowding (%)': 'overcrowded',
                'Disaster Experience (%)': 'disaster_exp',
                'Pollution Exposure (%)': 'pollution_exp',
                'Has Ramp/Accessibility (%)': 'has_ramp',
                'Has Handrails (%)': 'has_handrail',
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
                'Multiple Chronic Diseases (%)': 'multiple_diseases'
            }
            if indicator == 'Vulnerable Employment (%)':
                bangkok_avg[indicator] = weighted_percentage(elderly_df[elderly_df['occupation_status'] == 1], 'vulnerable_employment')
            elif indicator in col_map:
                bangkok_avg[indicator] = weighted_percentage(elderly_df, col_map[indicator])
        else:
            # Disease indicators
            for col, name in disease_names.items():
                if indicator == f'{name} (%)':
                    bangkok_avg[indicator] = weighted_percentage(elderly_df, col)

# Generate comparison tables for each domain
print("\n" + "="*80)
print("GENERATING COMPARISON TABLES FOR ALL 6 DOMAINS")
print("="*80)

all_results = {}

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
    ] + [f'{name} (%)' for name in disease_names.values()]
}

for domain, critical_districts in domains_map.items():
    print(f"\n{'='*80}")
    print(f"{domain.upper()} - COMPARISON TABLE")
    print(f"Critical Districts: {', '.join(critical_districts)}")
    print(f"{'='*80}\n")

    indicators = domain_indicator_map[domain]
    comparison = []

    for indicator in indicators:
        row = {'Indicator': indicator, 'Bangkok Avg': bangkok_avg[indicator]}

        for district in critical_districts:
            district_results = calc_district_indicators(district)
            if district_results:
                row[f'District {district}'] = district_results[indicator]

        # Calculate gap
        if indicator == 'Average Monthly Income (Baht)' or 'Access' in indicator or 'Coverage' in indicator:
            # Higher is better
            district_values = [row.get(f'District {d}', np.nan) for d in critical_districts]
            valid_values = [v for v in district_values if pd.notna(v)]
            if valid_values:
                avg_district = np.mean(valid_values)
                row['Gap'] = bangkok_avg[indicator] - avg_district
        else:
            # Higher is worse
            district_values = [row.get(f'District {d}', np.nan) for d in critical_districts]
            valid_values = [v for v in district_values if pd.notna(v)]
            if valid_values:
                avg_district = np.mean(valid_values)
                row['Gap'] = avg_district - bangkok_avg[indicator]

        comparison.append(row)

    df_result = pd.DataFrame(comparison)
    print(df_result.to_string(index=False))

    all_results[domain] = df_result

# Save results
print("\n" + "="*80)
print("SAVING RESULTS")
print("="*80)

with open('elderly_all_6_domains_comprehensive_analysis.txt', 'w', encoding='utf-8') as f:
    f.write("="*80 + "\n")
    f.write("COMPREHENSIVE ELDERLY ANALYSIS - ALL 6 SDHE DOMAINS\n")
    f.write("Top 5 Critical Districts per Domain with ALL Indicators\n")
    f.write("="*80 + "\n\n")

    for domain, df_result in all_results.items():
        f.write(f"\n{domain.upper()} - COMPARISON TABLE\n")
        f.write(f"Critical Districts: {', '.join(domains_map[domain])}\n")
        f.write("="*80 + "\n")
        f.write(df_result.to_string(index=False))
        f.write("\n\n")

for domain, df_result in all_results.items():
    filename = f"elderly_{domain.lower().replace(' ', '_')}_comparison.csv"
    df_result.to_csv(filename, index=False, encoding='utf-8-sig')

print("\nResults saved:")
print("  - elderly_all_6_domains_comprehensive_analysis.txt")
for domain in domains_map.keys():
    print(f"  - elderly_{domain.lower().replace(' ', '_')}_comparison.csv")

print("\n" + "="*80)
print("COMPREHENSIVE ANALYSIS COMPLETE")
print("="*80)
