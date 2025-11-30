import pandas as pd
import numpy as np
from scipy import stats
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

# Population classification with priority order
def classify_population_group(row):
    # Priority 1: LGBT+
    if row['sex'] == 'lgbt':
        return 'lgbt'
    # Priority 2: Elderly (60+)
    elif row['age'] >= 60:
        return 'elderly'
    # Priority 3: Disabled
    elif row['disable_status'] == 1:
        return 'disabled'
    # Priority 4: Informal workers (has job but no contract)
    elif row['occupation_status'] == 1 and row['occupation_contract'] == 0:
        return 'informal'
    # Priority 5: General population
    else:
        return 'general'

df['pop_group'] = df.apply(classify_population_group, axis=1)

# Education categorization
df['low_education'] = (df['education'] <= 1).astype(int)  # Primary or less
df['high_education'] = (df['education'] >= 5).astype(int)  # Bachelor+

print("=" * 100)
print("LITERACY AND NUMERACY BY EDUCATION LEVEL - DISABLED VS GENERAL POPULATION")
print("=" * 100)

skills = ['math', 'write', 'read']
skill_labels = {'math': 'Math', 'write': 'Writing', 'read': 'Reading'}

for skill in skills:
    print(f"\n\n{'='*100}")
    print(f"{skill_labels[skill].upper()}")
    print('='*100)

    # Overall comparison (all education levels)
    disabled_all = df[df['pop_group'] == 'disabled']
    general_all = df[df['pop_group'] == 'general']

    disabled_pct = (disabled_all[skill].sum() / len(disabled_all)) * 100
    general_pct = (general_all[skill].sum() / len(general_all)) * 100
    overall_gap = disabled_pct - general_pct

    print(f"\nOVERALL (all education levels):")
    print(f"  Disabled: {disabled_pct:.1f}% (n={len(disabled_all)})")
    print(f"  General: {general_pct:.1f}% (n={len(general_all)})")
    print(f"  Gap: {overall_gap:.1f} pp")

    # Chi-square test for overall
    contingency = pd.crosstab(df['pop_group'].isin(['disabled']), df[skill])
    chi2, p_value, dof, expected = stats.chi2_contingency(contingency)
    sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))
    print(f"  p-value: {p_value:.4f} {sig}")

    # By education level - LOW EDUCATION
    print(f"\n--- PRIMARY EDUCATION (≤ ป.6) ---")
    disabled_low = df[(df['pop_group'] == 'disabled') & (df['low_education'] == 1)]
    general_low = df[(df['pop_group'] == 'general') & (df['low_education'] == 1)]

    if len(disabled_low) > 0 and len(general_low) > 0:
        disabled_low_pct = (disabled_low[skill].sum() / len(disabled_low)) * 100
        general_low_pct = (general_low[skill].sum() / len(general_low)) * 100
        low_gap = disabled_low_pct - general_low_pct

        print(f"  Disabled: {disabled_low_pct:.1f}% (n={len(disabled_low)})")
        print(f"  General: {general_low_pct:.1f}% (n={len(general_low)})")
        print(f"  Gap: {low_gap:.1f} pp")

        # Chi-square for low education
        low_edu_data = pd.concat([disabled_low, general_low])
        low_edu_data['is_disabled'] = low_edu_data['pop_group'] == 'disabled'
        contingency_low = pd.crosstab(low_edu_data['is_disabled'], low_edu_data[skill])
        if contingency_low.shape == (2, 2):
            chi2, p_value, dof, expected = stats.chi2_contingency(contingency_low)
            sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))
            print(f"  p-value: {p_value:.4f} {sig}")

    # By education level - HIGH EDUCATION
    print(f"\n--- BACHELOR+ EDUCATION ---")
    disabled_high = df[(df['pop_group'] == 'disabled') & (df['high_education'] == 1)]
    general_high = df[(df['pop_group'] == 'general') & (df['high_education'] == 1)]

    if len(disabled_high) > 0 and len(general_high) > 0:
        disabled_high_pct = (disabled_high[skill].sum() / len(disabled_high)) * 100
        general_high_pct = (general_high[skill].sum() / len(general_high)) * 100
        high_gap = disabled_high_pct - general_high_pct

        print(f"  Disabled: {disabled_high_pct:.1f}% (n={len(disabled_high)})")
        print(f"  General: {general_high_pct:.1f}% (n={len(general_high)})")
        print(f"  Gap: {high_gap:.1f} pp")

        # Chi-square for high education
        high_edu_data = pd.concat([disabled_high, general_high])
        high_edu_data['is_disabled'] = high_edu_data['pop_group'] == 'disabled'
        contingency_high = pd.crosstab(high_edu_data['is_disabled'], high_edu_data[skill])
        if contingency_high.shape == (2, 2):
            chi2, p_value, dof, expected = stats.chi2_contingency(contingency_high)
            sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))
            print(f"  p-value: {p_value:.4f} {sig}")

    # Education effect within disabled
    print(f"\n--- EDUCATION EFFECT (within Disabled) ---")
    if len(disabled_low) > 0 and len(disabled_high) > 0:
        edu_effect = disabled_high_pct - disabled_low_pct
        print(f"  Primary: {disabled_low_pct:.1f}%")
        print(f"  Bachelor+: {disabled_high_pct:.1f}%")
        print(f"  Education effect: +{edu_effect:.1f} pp")

        # Chi-square for education effect within disabled
        disabled_edu = pd.concat([disabled_low, disabled_high])
        disabled_edu['is_high_edu'] = disabled_edu['high_education'] == 1
        contingency_edu = pd.crosstab(disabled_edu['is_high_edu'], disabled_edu[skill])
        if contingency_edu.shape == (2, 2):
            chi2, p_value, dof, expected = stats.chi2_contingency(contingency_edu)
            sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))
            print(f"  p-value: {p_value:.4f} {sig}")
            print(f"  Total disabled: {len(disabled_edu)}")

print("\n\n" + "=" * 100)
print("SUMMARY TABLE FOR REPORT")
print("=" * 100)
print("\n| Skill | Education Level | Disabled | General Population | Gap | p-value | n (Disabled) |")
print("|---|---|---|---|---|---|---|")

for skill in skills:
    disabled_all = df[df['pop_group'] == 'disabled']

    # Low education
    disabled_low = df[(df['pop_group'] == 'disabled') & (df['low_education'] == 1)]
    general_low = df[(df['pop_group'] == 'general') & (df['low_education'] == 1)]

    if len(disabled_low) > 0 and len(general_low) > 0:
        disabled_low_pct = (disabled_low[skill].sum() / len(disabled_low)) * 100
        general_low_pct = (general_low[skill].sum() / len(general_low)) * 100
        low_gap = disabled_low_pct - general_low_pct

        # p-value
        low_edu_data = pd.concat([disabled_low, general_low])
        low_edu_data['is_disabled'] = low_edu_data['pop_group'] == 'disabled'
        contingency_low = pd.crosstab(low_edu_data['is_disabled'], low_edu_data[skill])
        if contingency_low.shape == (2, 2):
            chi2, p_value, dof, expected = stats.chi2_contingency(contingency_low)
            p_str = "< 0.0001" if p_value < 0.0001 else f"{p_value:.4f}"
        else:
            p_str = "N/A"

        print(f"| **{skill_labels[skill]}** | Primary (≤ ป.6) | {disabled_low_pct:.1f}% | {general_low_pct:.1f}% | **{low_gap:.1f} pp** | {p_str} | {len(disabled_low)} |")

    # High education
    disabled_high = df[(df['pop_group'] == 'disabled') & (df['high_education'] == 1)]
    general_high = df[(df['pop_group'] == 'general') & (df['high_education'] == 1)]

    if len(disabled_high) > 0 and len(general_high) > 0:
        disabled_high_pct = (disabled_high[skill].sum() / len(disabled_high)) * 100
        general_high_pct = (general_high[skill].sum() / len(general_high)) * 100
        high_gap = disabled_high_pct - general_high_pct

        # p-value
        high_edu_data = pd.concat([disabled_high, general_high])
        high_edu_data['is_disabled'] = high_edu_data['pop_group'] == 'disabled'
        contingency_high = pd.crosstab(high_edu_data['is_disabled'], high_edu_data[skill])
        if contingency_high.shape == (2, 2):
            chi2, p_value, dof, expected = stats.chi2_contingency(contingency_high)
            p_str = "< 0.0001" if p_value < 0.0001 else f"{p_value:.4f}"
        else:
            p_str = "N/A"

        print(f"| | Bachelor+ | {disabled_high_pct:.1f}% | {general_high_pct:.1f}% | **{high_gap:.1f} pp** | {p_str} | {len(disabled_high)} |")

    # Education effect
    if len(disabled_low) > 0 and len(disabled_high) > 0:
        edu_effect = disabled_high_pct - disabled_low_pct

        # p-value for education effect
        disabled_edu = pd.concat([disabled_low, disabled_high])
        disabled_edu['is_high_edu'] = disabled_edu['high_education'] == 1
        contingency_edu = pd.crosstab(disabled_edu['is_high_edu'], disabled_edu[skill])
        if contingency_edu.shape == (2, 2):
            chi2, p_value, dof, expected = stats.chi2_contingency(contingency_edu)
            p_str = "< 0.0001" if p_value < 0.0001 else f"{p_value:.4f}"
        else:
            p_str = "N/A"

        print(f"| | **Education effect (Disabled)** | **+{edu_effect:.1f} pp** | - | - | {p_str} | {len(disabled_edu)} |")

print("\n\n" + "=" * 100)
print("ANALYSIS COMPLETE")
print("=" * 100)
