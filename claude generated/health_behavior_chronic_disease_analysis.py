"""
Health Behavior and Chronic Disease Cross-Variable Analysis by Population Group

This script analyzes the relationship between health behaviors (exercise, smoking, drinking)
and chronic disease rates within each population group (general, elderly, disabled, LGBT+, informal).

Mirrors the income/education analysis structure for consistency.
"""

import pandas as pd
import numpy as np
from scipy import stats

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("HEALTH BEHAVIOR AND CHRONIC DISEASE ANALYSIS BY POPULATION GROUP")
print("=" * 80)

# Define population groups (MATCHES dashboard logic exactly - IndicatorAnalysis.jsx)
def classify_population_group(row):
    """Classify respondent into population groups - PRIORITY ORDER MATTERS"""
    # Priority 1: LGBT (regardless of age/disability/occupation)
    if row['sex'] == 'lgbt':
        return 'lgbt'
    # Priority 2: Elderly (60+)
    elif row['age'] >= 60:
        return 'elderly'
    # Priority 3: Disabled
    elif row['disable_status'] == 1:
        return 'disabled'
    # Priority 4: Informal workers (has job but no contract)
    # CORRECT: occupation_status=1 AND occupation_contract=0 (n=2,645)
    # WRONG: occupation_type=2 (n=70)
    elif row['occupation_status'] == 1 and row['occupation_contract'] == 0:
        return 'informal'
    else:
        return 'general'

df['pop_group'] = df.apply(classify_population_group, axis=1)

# Verify population group counts
print("\nPopulation Group Counts:")
print(df['pop_group'].value_counts())
print()

# Create chronic disease indicator (has any chronic disease)
chronic_cols = ['diseases_type_1', 'diseases_type_2', 'diseases_type_3',
                'diseases_type_4', 'diseases_type_5', 'diseases_type_6']
df['has_chronic_disease'] = df[chronic_cols].max(axis=1)

# Process Exercise Status
# 0=ไม่ได้ออกกำลังกาย 1=ไม่เกิน 3 ครั้งต่อสัปดาห์ 2=3-4 ครั้งต่อสัปดาห์ 3=ตั้งแต่ 5 ครั้งขึ้นไปต่อสัปดาห์
# Create binary: regular exercise (2-3) vs low/no exercise (0-1)
df['exercises_regularly'] = df['exercise_status'].apply(
    lambda x: 1 if x in [2, 3] else (0 if x in [0, 1] else np.nan)
)

# Process Smoking Status
# 0=ไม่เคยสูบ 1=เคยสูบ แต่เลิกแล้ว 2=นาน ๆ สูบ 3=สูบประจำ
# Create binary: current smoker (2-3) vs non-smoker/quit (0-1)
df['current_smoker'] = df['smoke_status'].apply(
    lambda x: 1 if x in [2, 3] else (0 if x in [0, 1] else np.nan)
)

# Process Drinking Status
# drink_status: 1=ดื่ม 2=เคยดื่ม แต่เลิกแล้ว 0=ไม่ดื่ม
# drink_rate (if drink_status=1): 1=ดื่มประจำ 2=นาน ๆ ดื่มที
# Create binary: current drinker (drink_status=1) vs non-drinker/quit (0,2)
df['current_drinker'] = df['drink_status'].apply(
    lambda x: 1 if x == 1 else (0 if x in [0, 2] else np.nan)
)

# Also create regular drinker category for those who drink
df['regular_drinker'] = df.apply(
    lambda row: 1 if (row['drink_status'] == 1 and row['drink_rate'] == 1) else
                (0 if pd.notna(row['drink_status']) else np.nan),
    axis=1
)

print("\n" + "=" * 80)
print("1. EXERCISE AND CHRONIC DISEASE BY POPULATION GROUP")
print("=" * 80)

groups = ['general', 'elderly', 'disabled', 'lgbt', 'informal']
group_names = {
    'general': 'General Population',
    'elderly': 'Elderly (60+)',
    'disabled': 'Disabled',
    'lgbt': 'LGBT+',
    'informal': 'Informal Workers'
}

exercise_results = []

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    # Filter valid data
    valid_df = group_df[
        (pd.notna(group_df['has_chronic_disease'])) &
        (pd.notna(group_df['exercises_regularly']))
    ].copy()

    if len(valid_df) < 30:
        continue

    # Calculate rates by exercise status
    with_exercise = valid_df[valid_df['exercises_regularly'] == 1]
    without_exercise = valid_df[valid_df['exercises_regularly'] == 0]

    disease_rate_with_ex = (with_exercise['has_chronic_disease'].sum() / len(with_exercise) * 100) if len(with_exercise) > 0 else np.nan
    disease_rate_without_ex = (without_exercise['has_chronic_disease'].sum() / len(without_exercise) * 100) if len(without_exercise) > 0 else np.nan

    # Point-biserial correlation (exercise vs disease)
    if len(valid_df) > 0:
        corr, p_value = stats.pointbiserialr(
            valid_df['exercises_regularly'],
            valid_df['has_chronic_disease']
        )
    else:
        corr, p_value = np.nan, np.nan

    # T-test
    if len(with_exercise) > 0 and len(without_exercise) > 0:
        t_stat, t_pval = stats.ttest_ind(
            with_exercise['has_chronic_disease'],
            without_exercise['has_chronic_disease']
        )
    else:
        t_stat, t_pval = np.nan, np.nan

    exercise_results.append({
        'group': group_names[group],
        'with_exercise_rate': disease_rate_with_ex,
        'without_exercise_rate': disease_rate_without_ex,
        'gap': disease_rate_without_ex - disease_rate_with_ex,
        'correlation': corr,
        't_stat': t_stat,
        'p_value': p_value,
        'n_total': len(valid_df),
        'n_with_exercise': len(with_exercise),
        'n_without_exercise': len(without_exercise)
    })

exercise_df = pd.DataFrame(exercise_results)
print("\nTable: Chronic Disease Rates by Exercise Status (Regular Exercise = 3+ times/week)")
print(exercise_df.to_string(index=False))

print("\n" + "=" * 80)
print("2. SMOKING AND CHRONIC DISEASE BY POPULATION GROUP")
print("=" * 80)

smoking_results = []

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    # Filter valid data
    valid_df = group_df[
        (pd.notna(group_df['has_chronic_disease'])) &
        (pd.notna(group_df['current_smoker']))
    ].copy()

    if len(valid_df) < 30:
        continue

    # Calculate rates by smoking status
    smokers = valid_df[valid_df['current_smoker'] == 1]
    non_smokers = valid_df[valid_df['current_smoker'] == 0]

    disease_rate_smokers = (smokers['has_chronic_disease'].sum() / len(smokers) * 100) if len(smokers) > 0 else np.nan
    disease_rate_non_smokers = (non_smokers['has_chronic_disease'].sum() / len(non_smokers) * 100) if len(non_smokers) > 0 else np.nan

    # Point-biserial correlation
    if len(valid_df) > 0:
        corr, p_value = stats.pointbiserialr(
            valid_df['current_smoker'],
            valid_df['has_chronic_disease']
        )
    else:
        corr, p_value = np.nan, np.nan

    # T-test
    if len(smokers) > 0 and len(non_smokers) > 0:
        t_stat, t_pval = stats.ttest_ind(
            smokers['has_chronic_disease'],
            non_smokers['has_chronic_disease']
        )
    else:
        t_stat, t_pval = np.nan, np.nan

    smoking_results.append({
        'group': group_names[group],
        'smoker_rate': disease_rate_smokers,
        'non_smoker_rate': disease_rate_non_smokers,
        'gap': disease_rate_smokers - disease_rate_non_smokers,
        'correlation': corr,
        't_stat': t_stat,
        'p_value': p_value,
        'n_total': len(valid_df),
        'n_smokers': len(smokers),
        'n_non_smokers': len(non_smokers)
    })

smoking_df = pd.DataFrame(smoking_results)
print("\nTable: Chronic Disease Rates by Smoking Status (Current Smoker = occasional/regular)")
print(smoking_df.to_string(index=False))

print("\n" + "=" * 80)
print("3. DRINKING AND CHRONIC DISEASE BY POPULATION GROUP")
print("=" * 80)

drinking_results = []

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    # Filter valid data
    valid_df = group_df[
        (pd.notna(group_df['has_chronic_disease'])) &
        (pd.notna(group_df['current_drinker']))
    ].copy()

    if len(valid_df) < 30:
        continue

    # Calculate rates by drinking status
    drinkers = valid_df[valid_df['current_drinker'] == 1]
    non_drinkers = valid_df[valid_df['current_drinker'] == 0]

    disease_rate_drinkers = (drinkers['has_chronic_disease'].sum() / len(drinkers) * 100) if len(drinkers) > 0 else np.nan
    disease_rate_non_drinkers = (non_drinkers['has_chronic_disease'].sum() / len(non_drinkers) * 100) if len(non_drinkers) > 0 else np.nan

    # Point-biserial correlation
    if len(valid_df) > 0:
        corr, p_value = stats.pointbiserialr(
            valid_df['current_drinker'],
            valid_df['has_chronic_disease']
        )
    else:
        corr, p_value = np.nan, np.nan

    # T-test
    if len(drinkers) > 0 and len(non_drinkers) > 0:
        t_stat, t_pval = stats.ttest_ind(
            drinkers['has_chronic_disease'],
            non_drinkers['has_chronic_disease']
        )
    else:
        t_stat, t_pval = np.nan, np.nan

    drinking_results.append({
        'group': group_names[group],
        'drinker_rate': disease_rate_drinkers,
        'non_drinker_rate': disease_rate_non_drinkers,
        'gap': disease_rate_drinkers - disease_rate_non_drinkers,
        'correlation': corr,
        't_stat': t_stat,
        'p_value': p_value,
        'n_total': len(valid_df),
        'n_drinkers': len(drinkers),
        'n_non_drinkers': len(non_drinkers)
    })

drinking_df = pd.DataFrame(drinking_results)
print("\nTable: Chronic Disease Rates by Drinking Status (Current Drinker)")
print(drinking_df.to_string(index=False))

print("\n" + "=" * 80)
print("4. REGULAR DRINKERS (Subset Analysis)")
print("=" * 80)

regular_drinking_results = []

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    # Filter valid data
    valid_df = group_df[
        (pd.notna(group_df['has_chronic_disease'])) &
        (pd.notna(group_df['regular_drinker']))
    ].copy()

    if len(valid_df) < 30:
        continue

    # Calculate rates by regular drinking status
    regular_drinkers = valid_df[valid_df['regular_drinker'] == 1]
    others = valid_df[valid_df['regular_drinker'] == 0]

    disease_rate_regular = (regular_drinkers['has_chronic_disease'].sum() / len(regular_drinkers) * 100) if len(regular_drinkers) > 0 else np.nan
    disease_rate_others = (others['has_chronic_disease'].sum() / len(others) * 100) if len(others) > 0 else np.nan

    # Point-biserial correlation
    if len(valid_df) > 0:
        corr, p_value = stats.pointbiserialr(
            valid_df['regular_drinker'],
            valid_df['has_chronic_disease']
        )
    else:
        corr, p_value = np.nan, np.nan

    regular_drinking_results.append({
        'group': group_names[group],
        'regular_drinker_rate': disease_rate_regular,
        'non_regular_rate': disease_rate_others,
        'gap': disease_rate_regular - disease_rate_others,
        'correlation': corr,
        'p_value': p_value,
        'n_total': len(valid_df),
        'n_regular': len(regular_drinkers),
        'n_others': len(others)
    })

regular_drinking_df = pd.DataFrame(regular_drinking_results)
print("\nTable: Chronic Disease Rates - Regular Drinkers vs Others")
print(regular_drinking_df.to_string(index=False))

print("\n" + "=" * 80)
print("5. COMBINED HEALTH BEHAVIOR SCORE")
print("=" * 80)
print("Calculating cumulative health behavior score: 1 point for each risk factor")
print("Risk factors: No regular exercise, Current smoker, Current drinker")

combined_results = []

for group in groups:
    group_df = df[df['pop_group'] == group].copy()

    # Filter valid data (must have all three behaviors measured)
    valid_df = group_df[
        (pd.notna(group_df['has_chronic_disease'])) &
        (pd.notna(group_df['exercises_regularly'])) &
        (pd.notna(group_df['current_smoker'])) &
        (pd.notna(group_df['current_drinker']))
    ].copy()

    if len(valid_df) < 30:
        continue

    # Calculate risk score (0-3)
    valid_df['risk_score'] = (
        (1 - valid_df['exercises_regularly']) +  # No exercise = 1 point
        valid_df['current_smoker'] +              # Smoker = 1 point
        valid_df['current_drinker']               # Drinker = 1 point
    )

    # Disease rates by risk score
    for score in [0, 1, 2, 3]:
        score_df = valid_df[valid_df['risk_score'] == score]
        if len(score_df) > 0:
            disease_rate = score_df['has_chronic_disease'].sum() / len(score_df) * 100
            combined_results.append({
                'group': group_names[group],
                'risk_score': score,
                'disease_rate': disease_rate,
                'n': len(score_df)
            })

    # Overall correlation
    corr, p_value = stats.pearsonr(valid_df['risk_score'], valid_df['has_chronic_disease'])
    print(f"\n{group_names[group]}:")
    print(f"  Risk Score Correlation: r={corr:.3f}, p={p_value:.4f}, n={len(valid_df)}")

combined_df = pd.DataFrame(combined_results)
print("\nTable: Chronic Disease Rates by Combined Risk Score")
print(combined_df.to_string(index=False))

print("\n" + "=" * 80)
print("6. EFFECT STRENGTH SUMMARY")
print("=" * 80)

print("\nExercise Protection Effect (negative correlation = protective):")
for _, row in exercise_df.iterrows():
    effect = "X No effect" if row['p_value'] > 0.05 else (
        ">>> Very Strong" if abs(row['correlation']) > 0.3 else
        ">> Strong" if abs(row['correlation']) > 0.15 else
        "> Moderate" if abs(row['correlation']) > 0.1 else
        "> Weak"
    )
    print(f"{row['group']:25s} r={row['correlation']:+.3f}, p={row['p_value']:.4f}  {effect}")

print("\nSmoking Risk Effect (positive correlation = harmful):")
for _, row in smoking_df.iterrows():
    effect = "X No effect" if row['p_value'] > 0.05 else (
        ">>> Very Strong" if abs(row['correlation']) > 0.3 else
        ">> Strong" if abs(row['correlation']) > 0.15 else
        "> Moderate" if abs(row['correlation']) > 0.1 else
        "> Weak"
    )
    print(f"{row['group']:25s} r={row['correlation']:+.3f}, p={row['p_value']:.4f}  {effect}")

print("\nDrinking Risk Effect (positive correlation = harmful):")
for _, row in drinking_df.iterrows():
    effect = "X No effect" if row['p_value'] > 0.05 else (
        ">>> Very Strong" if abs(row['correlation']) > 0.3 else
        ">> Strong" if abs(row['correlation']) > 0.15 else
        "> Moderate" if abs(row['correlation']) > 0.1 else
        "> Weak"
    )
    print(f"{row['group']:25s} r={row['correlation']:+.3f}, p={row['p_value']:.4f}  {effect}")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
