"""
Analyze Dental Access Reasons by Community Type
Matching the classification logic from the dashboard
"""

import pandas as pd
import numpy as np

# Load community data
df = pd.read_csv('public/data/community_data.csv', encoding='utf-8-sig')

print("="*80)
print("DENTAL ACCESS REASONS ANALYSIS BY COMMUNITY TYPE")
print("="*80)
print(f"\nTotal respondents: {len(df)}")

# Filter to those who had oral health problems but didn't get treatment
no_access = df[(df['oral_health'] == 1) & (df['oral_health_access'] == 0)]
print(f"Had oral problems but no treatment: {len(no_access)}")

# Classification function matching dashboard logic
def classify_oral_health_reason(reason_text):
    """Classify oral health access reasons using same logic as dashboard"""
    if pd.isna(reason_text) or reason_text == '':
        return 'No reason specified'

    text_lower = str(reason_text).lower()

    # Check for "too expensive" keywords (แพง, สูง, ค่า, เงิน)
    if 'แพง' in text_lower or 'สูง' in text_lower or 'ค่า' in text_lower or 'เงิน' in text_lower:
        return 'Too expensive/No money'

    # Check for "fear of dentist" keywords (กลัว)
    if 'กลัว' in text_lower:
        return 'Fear of dentist'

    # Check for "distance/far" keywords (เดิน, ไกล)
    if 'เดิน' in text_lower or 'ไกล' in text_lower:
        return 'Too far/Distance'

    # Check for "no time" keywords (ไม่มีเวลา)
    if 'ไม่มีเวลา' in text_lower or 'เวลา' in text_lower:
        return 'No time'

    # Check for "long wait time" keywords (รอ, นาน, คิว)
    if 'รอ' in text_lower or 'นาน' in text_lower or 'คิว' in text_lower:
        return 'Long wait time'

    # Check for "not severe" keywords (ไม่รุนแรง, ไม่เจ็บ)
    if 'ไม่รุนแรง' in text_lower or 'ไม่เจ็บ' in text_lower or 'เล็กน้อย' in text_lower:
        return 'Not severe enough'

    return 'Other'

# Apply classification (use .copy() to avoid SettingWithCopyWarning)
no_access = no_access.copy()
no_access['reason_category'] = no_access['oral_health_access_reason'].apply(classify_oral_health_reason)

# Overall statistics
print("\n" + "="*80)
print("OVERALL DENTAL ACCESS BARRIERS (All Community Types)")
print("="*80)
overall_reasons = no_access['reason_category'].value_counts()
overall_pct = (overall_reasons / len(no_access) * 100).round(1)

results = pd.DataFrame({
    'Count': overall_reasons,
    'Percentage': overall_pct.apply(lambda x: f"{x}%")
})
print(results.to_string())

# By community type
print("\n" + "="*80)
print("DENTAL ACCESS BARRIERS BY COMMUNITY TYPE")
print("="*80)

community_types = {
    'ชุมชนชานเมือง': 'Suburban Community',
    'ชุมชนหมู่บ้านจัดสรร': 'Housing Estate',
    'ชุมชนอาคารสูง': 'High-rise/Condo',
    'ชุมชนเมือง': 'Urban Community',
    'ชุมชนแออัด': 'Crowded Community'
}

comparison_data = []

for thai_name, eng_name in community_types.items():
    comm_no_access = no_access[no_access['community_type'] == thai_name]

    if len(comm_no_access) == 0:
        continue

    print(f"\n{eng_name}")
    print(f"People with oral problems: {len(df[(df['community_type'] == thai_name) & (df['oral_health'] == 1)])}")
    print(f"Couldn't access treatment: {len(comm_no_access)}")

    reason_counts = comm_no_access['reason_category'].value_counts()

    for reason, count in reason_counts.items():
        pct = (count / len(comm_no_access) * 100)
        print(f"  {reason}: {count} ({pct:.1f}%)")

        comparison_data.append({
            'Community Type': eng_name,
            'Reason': reason,
            'Count': count,
            'Percentage': round(pct, 1)
        })

# Create comparison CSV
comparison_df = pd.DataFrame(comparison_data)
comparison_pivot = comparison_df.pivot_table(
    index='Reason',
    columns='Community Type',
    values='Percentage',
    fill_value=0
).round(1)

print("\n" + "="*80)
print("COMPARISON TABLE: Percentage of Each Reason by Community Type")
print("(Among those who couldn't access dental care)")
print("="*80)
print(comparison_pivot.to_string())

# Save results
comparison_pivot.to_csv('dental_access_reasons_by_community.csv')
print("\n✓ Saved: dental_access_reasons_by_community.csv")

# Calculate access rate by community type for reference
print("\n" + "="*80)
print("DENTAL ACCESS RATES BY COMMUNITY TYPE (for reference)")
print("="*80)

access_summary = []
for thai_name, eng_name in community_types.items():
    comm_df = df[df['community_type'] == thai_name]
    had_problem = comm_df[comm_df['oral_health'] == 1]

    if len(had_problem) > 0:
        got_treatment = len(had_problem[had_problem['oral_health_access'] == 1])
        access_rate = (got_treatment / len(had_problem) * 100)

        access_summary.append({
            'Community Type': eng_name,
            'Had Oral Problems': len(had_problem),
            'Got Treatment': got_treatment,
            'Access Rate (%)': round(access_rate, 1),
            'Couldn\'t Access': len(had_problem) - got_treatment
        })

access_df = pd.DataFrame(access_summary)
print(access_df.to_string(index=False))

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
