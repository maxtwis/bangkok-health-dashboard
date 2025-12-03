"""
Calculate Bangkok Average from FULL survey_sampling.csv (6,523 respondents)
This will be used as reference in community-level analysis
"""

import pandas as pd
import numpy as np

print("Calculating Bangkok Average from full survey...")

# Load full survey
df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
print(f"Loaded {len(df)} respondents")

# Helper functions
def calculate_income(row):
    if pd.isna(row.get('income', None)) or row.get('income', 0) == 0:
        return np.nan
    if row.get('income_type', 2) == 1:
        return row['income'] * 30
    else:
        return row['income']

def calculate_bmi(row):
    height = row.get('height', 0)
    weight = row.get('weight', 0)
    if height > 0 and weight > 0:
        return weight / ((height / 100) ** 2)
    return np.nan

def normalize_score(value, min_val, max_val, reverse=False):
    if pd.isna(value):
        return np.nan
    if max_val == min_val:
        return 50.0
    normalized = ((value - min_val) / (max_val - min_val)) * 100
    if reverse:
        normalized = 100 - normalized
    return np.clip(normalized, 0, 100)

df['monthly_income'] = df.apply(calculate_income, axis=1)
df['bmi'] = df.apply(calculate_bmi, axis=1)

# Economic Security
df['employment_score'] = df['occupation_status'].apply(lambda x: 100 if x == 1 else 0)

def vulnerable_employment_score(row):
    if row.get('occupation_status', 0) == 1:
        has_contract = row.get('occupation_contract', 0) == 1
        has_welfare = row.get('occupation_welfare', 0) == 1
        if has_contract and has_welfare:
            return 100
        elif has_contract or has_welfare:
            return 50
        else:
            return 0
    return np.nan

df['vulnerable_employment_score'] = df.apply(vulnerable_employment_score, axis=1)
df['food_security_score'] = df.apply(
    lambda row: 100 if row.get('food_insecurity_1', 0) == 0 and row.get('food_insecurity_2', 0) == 0
    else 50 if row.get('food_insecurity_1', 0) == 1 and row.get('food_insecurity_2', 0) == 0
    else 0, axis=1
)
df['work_injury_score'] = df.apply(lambda row: 100 if row.get('occupation_injury', 0) == 0 else 0, axis=1)

income_values = df['monthly_income'].dropna()
if len(income_values) > 0:
    df['income_score'] = df['monthly_income'].apply(
        lambda x: normalize_score(x, income_values.min(), income_values.max())
    )
else:
    df['income_score'] = np.nan

def health_spending_burden(row):
    income = row.get('monthly_income', 0)
    health_exp = row.get('hh_health_expense', 0)
    if income > 0 and pd.notna(health_exp):
        ratio = health_exp / income
        if ratio > 0.25:
            return 0
        elif ratio > 0.10:
            return 50
        else:
            return 100
    return np.nan

df['health_spending_score'] = df.apply(health_spending_burden, axis=1)
df['economic_security_score'] = df[[
    'employment_score', 'vulnerable_employment_score', 'food_security_score',
    'work_injury_score', 'income_score', 'health_spending_score'
]].mean(axis=1)

# Healthcare Access
df['health_coverage_score'] = df['welfare'].apply(
    lambda x: 100 if (x in [1, 2, 3, '1', '2', '3']) else 0
)
df['medical_access_score'] = df['medical_skip_1'].apply(lambda x: 0 if x == 1 else 100)

def dental_access_score(row):
    if row.get('oral_health', 0) == 1:
        return 100 if row.get('oral_health_access', 0) == 1 else 0
    return 100

df['dental_access_score'] = df.apply(dental_access_score, axis=1)
df['healthcare_access_score'] = df[[
    'health_coverage_score', 'medical_access_score', 'dental_access_score'
]].mean(axis=1)

# Physical Environment
df['home_ownership_score'] = df['house_status'].apply(
    lambda x: 100 if x == 1 else 50 if x in [2, 3, 5] else 0
)

def environment_quality_score(row):
    has_water = 1 if row.get('community_environment_3', 0) == 0 else 0
    has_electricity = 1 if row.get('community_environment_4', 0) == 0 else 0
    has_waste = 1 if row.get('community_environment_5', 0) == 0 else 0
    has_sanitation = 1 if row.get('community_environment_6', 0) == 0 else 0
    total = has_water + has_electricity + has_waste + has_sanitation
    return (total / 4) * 100

df['utilities_score'] = df.apply(environment_quality_score, axis=1)

def overcrowding_score(row):
    overcrowded_1 = row.get('community_environment_1', 0)
    overcrowded_2 = row.get('community_environment_2', 0)
    if overcrowded_1 == 1 or overcrowded_2 == 1:
        return 0
    return 100

df['overcrowding_score'] = df.apply(overcrowding_score, axis=1)
df['disaster_score'] = df['community_disaster_1'].apply(lambda x: 0 if x == 1 else 100)
df['pollution_score'] = df['health_pollution'].apply(lambda x: 0 if x == 1 else 100)

def community_amenity_score(row):
    has_ramp = 1 if row.get('community_amenity_type_1', 0) == 1 else 0
    has_handrail = 1 if row.get('community_amenity_type_2', 0) == 1 else 0
    has_public_space = 1 if row.get('community_amenity_type_3', 0) == 1 else 0
    has_health_facility = 1 if row.get('community_amenity_type_4', 0) == 1 else 0
    total = has_ramp + has_handrail + has_public_space + has_health_facility
    return (total / 4) * 100

df['amenity_score'] = df.apply(community_amenity_score, axis=1)
df['physical_environment_score'] = df[[
    'home_ownership_score', 'utilities_score', 'overcrowding_score',
    'disaster_score', 'pollution_score', 'amenity_score'
]].mean(axis=1)

# Social Context
df['safety_score'] = df['community_safety'].apply(
    lambda x: ((x - 1) / 3) * 100 if pd.notna(x) else np.nan
)
df['violence_score'] = df.apply(
    lambda row: 100 if row.get('physical_violence', 0) == 0 and
                      row.get('psychological_violence', 0) == 0 and
                      row.get('sexual_violence', 0) == 0
    else 67 if (row.get('physical_violence', 0) + row.get('psychological_violence', 0) +
                row.get('sexual_violence', 0)) == 1
    else 33 if (row.get('physical_violence', 0) + row.get('psychological_violence', 0) +
                row.get('sexual_violence', 0)) == 2
    else 0, axis=1
)
df['discrimination_score'] = df['discrimination_1'].apply(lambda x: 0 if x == 1 else 100)
df['social_support_score'] = df['helper'].apply(lambda x: 100 if x == 1 else 0)
df['social_context_score'] = df[[
    'safety_score', 'violence_score', 'discrimination_score', 'social_support_score'
]].mean(axis=1)

# Health Behaviors
df['alcohol_score'] = df['drink_status'].apply(lambda x: 100 if x == 0 else 50 if x == 2 else 0)
df['tobacco_score'] = df['smoke_status'].apply(
    lambda x: 100 if x == 0 else 67 if x == 1 else 33 if x == 2 else 0
)
df['exercise_score'] = df['exercise_status'].apply(lambda x: (x / 3) * 100 if pd.notna(x) else np.nan)

def obesity_score(bmi):
    if pd.isna(bmi):
        return np.nan
    if 18.5 <= bmi <= 24.9:
        return 100
    elif bmi < 18.5:
        return 50
    elif 25 <= bmi < 30:
        return 50
    else:
        return 0

df['obesity_score'] = df['bmi'].apply(obesity_score)
df['health_behaviors_score'] = df[[
    'alcohol_score', 'tobacco_score', 'exercise_score', 'obesity_score'
]].mean(axis=1)

# Health Outcomes
df['chronic_disease_score'] = df['diseases_status'].apply(lambda x: 0 if x == 1 else 100)

disease_columns = [f'diseases_type_{i}' for i in range(1, 22)]
def count_diseases(row):
    count = 0
    for col in disease_columns:
        if row.get(col, 0) == 1:
            count += 1
    return count

df['disease_count'] = df.apply(count_diseases, axis=1)
df['disease_burden_score'] = df['disease_count'].apply(
    lambda x: 100 if x == 0 else 75 if x == 1 else 50 if x == 2 else 25 if x == 3 else 0
)
df['health_outcomes_score'] = df[[
    'chronic_disease_score', 'disease_burden_score'
]].mean(axis=1)

# Education
df['literacy_speak_score'] = df['speak'].apply(lambda x: 100 if x == 1 else 0)
df['literacy_read_score'] = df['read'].apply(lambda x: 100 if x == 1 else 0)
df['literacy_write_score'] = df['write'].apply(lambda x: 100 if x == 1 else 0)
df['literacy_math_score'] = df['math'].apply(lambda x: 100 if x == 1 else 0)

df['literacy_score'] = df[[
    'literacy_speak_score',
    'literacy_read_score',
    'literacy_write_score',
    'literacy_math_score'
]].mean(axis=1)

def education_level_score(edu):
    if pd.isna(edu):
        return np.nan
    return (edu / 8) * 100

df['education_level_score'] = df['education'].apply(education_level_score)
df['training_score'] = df['training'].apply(lambda x: 100 if x == 1 else 0)

df['education_score'] = (
    df['literacy_score'] * 0.4 +
    df['education_level_score'] * 0.4 +
    df['training_score'] * 0.2
)

# Calculate Bangkok averages
bangkok_avg = {
    'Community Type': 'Bangkok Average (Full Survey)',
    'N': len(df),
    'Economic Security Mean': df['economic_security_score'].mean(),
    'Economic Security SD': df['economic_security_score'].std(),
    'Healthcare Access Mean': df['healthcare_access_score'].mean(),
    'Healthcare Access SD': df['healthcare_access_score'].std(),
    'Physical Environment Mean': df['physical_environment_score'].mean(),
    'Physical Environment SD': df['physical_environment_score'].std(),
    'Social Context Mean': df['social_context_score'].mean(),
    'Social Context SD': df['social_context_score'].std(),
    'Health Behaviors Mean': df['health_behaviors_score'].mean(),
    'Health Behaviors SD': df['health_behaviors_score'].std(),
    'Health Outcomes Mean': df['health_outcomes_score'].mean(),
    'Health Outcomes SD': df['health_outcomes_score'].std(),
    'Education Mean': df['education_score'].mean(),
    'Education SD': df['education_score'].std()
}

# Save to file
bangkok_df = pd.DataFrame([bangkok_avg])
bangkok_df.to_csv('bangkok_average_full_survey.csv', index=False, encoding='utf-8-sig')

print("\nBangkok Average (N=6,523):")
print(f"Economic Security: {bangkok_avg['Economic Security Mean']:.2f}")
print(f"Healthcare Access: {bangkok_avg['Healthcare Access Mean']:.2f}")
print(f"Physical Environment: {bangkok_avg['Physical Environment Mean']:.2f}")
print(f"Social Context: {bangkok_avg['Social Context Mean']:.2f}")
print(f"Health Behaviors: {bangkok_avg['Health Behaviors Mean']:.2f}")
print(f"Health Outcomes: {bangkok_avg['Health Outcomes Mean']:.2f}")
print(f"Education: {bangkok_avg['Education Mean']:.2f}")

print("\nSaved to: bangkok_average_full_survey.csv")
