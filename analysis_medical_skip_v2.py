import pandas as pd
import numpy as np
from scipy import stats

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

# Define population groups
def get_population_group(row):
    groups = []
    if pd.notna(row['age']) and row['age'] >= 60:
        groups.append('elderly')
    if row['sex'] == 'lgbt':
        groups.append('lgbt')
    if pd.notna(row['disable_status']) and row['disable_status'] == 1:
        groups.append('disabled')

    # Check if informal worker
    if pd.notna(row['occupation_status']) and row['occupation_status'] == 1:
        if pd.notna(row['occupation_contract']) and row['occupation_contract'] == 0:
            groups.append('informal')

    if len(groups) == 0:
        return 'general'
    return ','.join(groups)

df['pop_group'] = df.apply(get_population_group, axis=1)

# Classify oral health access reasons - MATCHING IndicatorDetail.jsx EXACTLY
def classify_oral_health_reason(reason_text):
    if pd.isna(reason_text) or reason_text == '':
        return 'no_reason'

    text = str(reason_text).lower()

    # Check in the SAME ORDER as IndicatorDetail.jsx

    # 1. Cost keywords (แพง, สูง, ค่า, เงิน)
    if any(keyword in text for keyword in ['แพง', 'สูง', 'ค่า', 'เงิน']):
        return 'cost'

    # 2. Fear keywords (กลัว)
    if 'กลัว' in text:
        return 'fear'

    # 3. Distance keywords (เดิน, ไกล)
    if 'เดิน' in text or 'ไกล' in text:
        return 'distance'

    # 4. No time keywords (ไม่มีเวลา, เวลา)
    if 'ไม่มีเวลา' in text or 'เวลา' in text:
        return 'no_time'

    # 5. Wait time keywords (รอ, นาน, คิว)
    if any(keyword in text for keyword in ['รอ', 'นาน', 'คิว']):
        return 'wait_time'

    # 6. Self-treatment keywords (หาย, ยา, เอง) - THIS WAS MISSING IN MY ORIGINAL SCRIPT!
    if 'หาย' in text or 'ยา' in text or 'เอง' in text:
        return 'self_treatment'

    return 'other'

df['oral_reason_category'] = df['oral_health_access_reason'].apply(classify_oral_health_reason)

# Medical skip indicators (cost-related)
df['medical_skip_any'] = ((df['medical_skip_1'] == 1) |
                           (df['medical_skip_2'] == 1) |
                           (df['medical_skip_3'] == 1)).astype(int)

# Oral health access (0 = didn't access, 1 = accessed)
df['oral_no_access'] = (df['oral_health_access'] == 0).astype(int)

# Income categorization
df['income_category'] = pd.cut(df['income'],
                               bins=[0, 10000, 20000, 50000, np.inf],
                               labels=['<10K', '10K-20K', '20K-50K', '>50K'])

# Employment formality
def get_employment_type(row):
    if pd.notna(row['occupation_status']) and row['occupation_status'] == 1:
        if pd.notna(row['occupation_contract']) and row['occupation_contract'] == 1:
            return 'formal'
        elif pd.notna(row['occupation_contract']) and row['occupation_contract'] == 0:
            return 'informal'
        else:
            return 'unknown_employment'
    return 'not_employed'

df['employment_type'] = df.apply(get_employment_type, axis=1)

print("=" * 80)
print("CORRECTED ANALYSIS - MATCHING IndicatorDetail.jsx LOGIC")
print("=" * 80)

# Oral health access reasons by population group with CORRECT categorization
print("\nORAL HEALTH ACCESS BARRIERS BY POPULATION GROUP (CORRECTED)")
print("-" * 80)

for group in ['general', 'elderly', 'lgbt', 'disabled', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)]
    general_data = df[df['pop_group'] == 'general']

    if len(group_data) == 0:
        continue

    # Filter those who didn't access oral health
    no_access = group_data[group_data['oral_no_access'] == 1]

    if len(no_access) == 0:
        continue

    print(f"\n{group.upper()} - Reasons for not accessing oral health care")
    print(f"  Total who didn't access: {len(no_access)} (out of {len(group_data)} total)")
    print(f"  % who didn't access: {len(no_access)/len(group_data)*100:.1f}%\n")

    reason_counts = no_access['oral_reason_category'].value_counts()
    reason_pct = (reason_counts / len(no_access) * 100)

    for reason in ['cost', 'fear', 'distance', 'no_time', 'wait_time', 'self_treatment', 'other', 'no_reason']:
        if reason in reason_counts.index:
            count = reason_counts[reason]
            pct = reason_pct[reason]
            print(f"  {reason}: {count} ({pct:.1f}%)")

# Statistical comparison: Fear barrier for LGBT+ vs General
print("\n" + "=" * 80)
print("STATISTICAL TESTS: ORAL HEALTH BARRIERS")
print("=" * 80)

# LGBT+ fear barrier
lgbt_data = df[df['pop_group'].str.contains('lgbt')]
lgbt_no_access = lgbt_data[lgbt_data['oral_no_access'] == 1]
lgbt_fear_count = len(lgbt_no_access[lgbt_no_access['oral_reason_category'] == 'fear'])
lgbt_fear_pct = (lgbt_fear_count / len(lgbt_no_access)) * 100 if len(lgbt_no_access) > 0 else 0

general_data = df[df['pop_group'] == 'general']
general_no_access = general_data[general_data['oral_no_access'] == 1]
general_fear_count = len(general_no_access[general_no_access['oral_reason_category'] == 'fear'])
general_fear_pct = (general_fear_count / len(general_no_access)) * 100 if len(general_no_access) > 0 else 0

print(f"\nLGBT+ Fear of dentist (among those who didn't access):")
print(f"  LGBT+: {lgbt_fear_count}/{len(lgbt_no_access)} = {lgbt_fear_pct:.1f}%")
print(f"  General: {general_fear_count}/{len(general_no_access)} = {general_fear_pct:.1f}%")
print(f"  Gap: {lgbt_fear_pct - general_fear_pct:.1f} pp")

# Chi-square test
if len(lgbt_no_access) > 0 and len(general_no_access) > 0:
    lgbt_fear_binary = (lgbt_no_access['oral_reason_category'] == 'fear').astype(int)
    general_fear_binary = (general_no_access['oral_reason_category'] == 'fear').astype(int)

    contingency = pd.DataFrame({
        'fear': [lgbt_fear_count, general_fear_count],
        'no_fear': [len(lgbt_no_access) - lgbt_fear_count, len(general_no_access) - general_fear_count]
    }, index=['lgbt', 'general'])

    chi2, p_value, _, _ = stats.chi2_contingency(contingency)
    print(f"  p-value: {p_value:.4f}")

# Elderly self-treatment
elderly_data = df[df['pop_group'].str.contains('elderly')]
elderly_no_access = elderly_data[elderly_data['oral_no_access'] == 1]
elderly_self_count = len(elderly_no_access[elderly_no_access['oral_reason_category'] == 'self_treatment'])
elderly_self_pct = (elderly_self_count / len(elderly_no_access)) * 100 if len(elderly_no_access) > 0 else 0

general_self_count = len(general_no_access[general_no_access['oral_reason_category'] == 'self_treatment'])
general_self_pct = (general_self_count / len(general_no_access)) * 100 if len(general_no_access) > 0 else 0

print(f"\nElderly Self-treatment (among those who didn't access):")
print(f"  Elderly: {elderly_self_count}/{len(elderly_no_access)} = {elderly_self_pct:.1f}%")
print(f"  General: {general_self_count}/{len(general_no_access)} = {general_self_pct:.1f}%")
print(f"  Gap: {elderly_self_pct - general_self_pct:.1f} pp")

# Medical skipping summary
print("\n" + "=" * 80)
print("MEDICAL CARE SKIPPING (COST-RELATED)")
print("=" * 80)

for group in ['general', 'elderly', 'lgbt', 'disabled', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)]
    general_data = df[df['pop_group'] == 'general']

    if len(group_data) == 0:
        continue

    group_skip = group_data['medical_skip_any'].mean() * 100
    general_skip = general_data['medical_skip_any'].mean() * 100

    contingency = pd.crosstab(
        df['pop_group'].str.contains(group),
        df['medical_skip_any']
    )
    chi2, p_value, _, _ = stats.chi2_contingency(contingency)

    sig = "***" if p_value < 0.001 else ("**" if p_value < 0.01 else ("*" if p_value < 0.05 else "n.s."))

    print(f"\n{group.upper()} (n={len(group_data)})")
    print(f"  Skip rate: {group_skip:.1f}% vs General {general_skip:.1f}%")
    print(f"  Gap: {group_skip - general_skip:+.1f} pp (p={p_value:.4f}) {sig}")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
