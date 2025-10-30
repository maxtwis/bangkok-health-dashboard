import pandas as pd
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("CORRECTED ORAL HEALTH INTERPRETATION")
print("=" * 80)

print("\nCORRECT INTERPRETATION:")
print("-" * 80)
print("oral_health column:")
print("  1 = เคยมีอาการ (HAD symptoms - POOR oral health)")
print("  0 = ไม่มีอาการ (NO symptoms - GOOD oral health)")
print()
print("oral_health_access column (only for those with oral_health=1):")
print("  1 = ได้ไปรักษา (accessed care)")
print("  0 = ไม่ได้ไปรักษา (did NOT access care)")

# Verify the logic
print("\n\nVERIFYING THE LOGIC:")
print("-" * 80)

total = len(df)
had_symptoms = (df['oral_health'] == 1).sum()
no_symptoms = (df['oral_health'] == 0).sum()

print(f"\nTotal respondents: {total}")
print(f"oral_health = 1 (HAD symptoms): {had_symptoms} ({had_symptoms/total*100:.1f}%)")
print(f"oral_health = 0 (NO symptoms): {no_symptoms} ({no_symptoms/total*100:.1f}%)")

# Among those with symptoms, who accessed care?
symptoms_data = df[df['oral_health'] == 1]
accessed = (symptoms_data['oral_health_access'] == 1).sum()
not_accessed = (symptoms_data['oral_health_access'] == 0).sum()
missing = symptoms_data['oral_health_access'].isna().sum()

print(f"\nAmong {had_symptoms} with symptoms:")
print(f"  oral_health_access = 1 (accessed care): {accessed} ({accessed/had_symptoms*100:.1f}%)")
print(f"  oral_health_access = 0 (NO access): {not_accessed} ({not_accessed/had_symptoms*100:.1f}%)")
print(f"  Missing data: {missing} ({missing/had_symptoms*100:.1f}%)")

# Define population groups
def get_population_group(row):
    groups = []
    if pd.notna(row['age']) and row['age'] >= 60:
        groups.append('elderly')
    if row['sex'] == 'lgbt':
        groups.append('lgbt')
    if pd.notna(row['disable_status']) and row['disable_status'] == 1:
        groups.append('disabled')
    if pd.notna(row['occupation_status']) and row['occupation_status'] == 1:
        if pd.notna(row['occupation_contract']) and row['occupation_contract'] == 0:
            groups.append('informal')
    if len(groups) == 0:
        return 'general'
    return ','.join(groups)

df['pop_group'] = df.apply(get_population_group, axis=1)

# Calculate CORRECT poor oral health rates
print("\n\n" + "=" * 80)
print("CORRECTED POOR ORAL HEALTH RATES (oral_health = 1)")
print("=" * 80)

report_claims = {
    'general': 68.6,
    'elderly': 78.3,
    'lgbt': 68.5,
    'disabled': 78.4,
    'informal': 75.1
}

print("\n| Group | Had Symptoms (oral_health=1) | Total | Poor Oral Health % | Report Claims | Match? |")
print("|---|---|---|---|---|---|")

for group in ['general', 'elderly', 'lgbt', 'disabled', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)]

    if len(group_data) == 0:
        continue

    total_count = group_data['oral_health'].notna().sum()
    poor_count = (group_data['oral_health'] == 1).sum()

    if total_count > 0:
        poor_pct = (poor_count / total_count) * 100

        reported = report_claims.get(group, 0)
        match = "✓ YES" if abs(poor_pct - reported) < 0.5 else "✗ NO"

        print(f"| {group.capitalize()} | {poor_count} | {total_count} | {poor_pct:.1f}% | {reported}% | {match} |")

# Show access rates among those with symptoms
print("\n\n" + "=" * 80)
print("ORAL HEALTH ACCESS AMONG THOSE WITH SYMPTOMS")
print("=" * 80)

print("\n| Group | Had Symptoms | Accessed Care | Did NOT Access | Non-Access Rate |")
print("|---|---|---|---|---|")

for group in ['general', 'elderly', 'lgbt', 'disabled', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)]

    if len(group_data) == 0:
        continue

    # Those with symptoms
    symptoms = group_data[group_data['oral_health'] == 1]

    if len(symptoms) > 0:
        accessed = (symptoms['oral_health_access'] == 1).sum()
        not_accessed = (symptoms['oral_health_access'] == 0).sum()
        non_access_rate = (not_accessed / len(symptoms)) * 100

        print(f"| {group.capitalize()} | {len(symptoms)} | {accessed} | {not_accessed} | {non_access_rate:.1f}% |")

print("\n" + "=" * 80)
print("VERIFICATION COMPLETE")
print("=" * 80)
