import pandas as pd
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("TRACING 'POOR ORAL HEALTH' CALCULATION")
print("=" * 80)

# Step 1: Understand oral_health column
print("\nSTEP 1: Understanding the oral_health column")
print("-" * 80)
print("\nUnique values in oral_health column:")
print(df['oral_health'].value_counts(dropna=False).sort_index())

print("\n\nValue distribution:")
for value in sorted(df['oral_health'].dropna().unique()):
    count = (df['oral_health'] == value).sum()
    pct = count / len(df) * 100
    print(f"  oral_health = {value}: {count} ({pct:.1f}%)")

# Check if there's a pattern (0=good, 1=poor OR vice versa)
print("\n\nChecking relationship with oral_health_access:")
print("(If oral_health=1 means 'poor', we'd expect lower access rates)")

for oral_val in sorted(df['oral_health'].dropna().unique()):
    subset = df[df['oral_health'] == oral_val]
    access_rate = (subset['oral_health_access'] == 1).sum() / len(subset) * 100
    print(f"  oral_health={oral_val}: {access_rate:.1f}% accessed care")

# Step 2: Define population groups
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

# Step 3: Calculate poor oral health rates by group
print("\n\nSTEP 2: Calculate poor oral health rates by group")
print("-" * 80)

# Assuming oral_health = 0 means "poor" (based on REVERSE_INDICATORS pattern)
print("\nAssuming oral_health = 0 means 'poor oral health' (common pattern)")
print("Testing this assumption:")

for group in ['general', 'elderly', 'lgbt', 'disabled', 'informal']:
    group_data = df[df['pop_group'].str.contains(group)]

    if len(group_data) == 0:
        continue

    # Count oral_health = 0 (poor)
    poor_count = (group_data['oral_health'] == 0).sum()
    total_count = group_data['oral_health'].notna().sum()

    if total_count > 0:
        poor_pct = (poor_count / total_count) * 100
        print(f"\n{group.upper()} (n={total_count} with data):")
        print(f"  oral_health = 0 (poor): {poor_count} ({poor_pct:.1f}%)")
        print(f"  oral_health = 1 (good): {total_count - poor_count} ({100 - poor_pct:.1f}%)")

# Step 4: Verify against report
print("\n\n" + "=" * 80)
print("VERIFICATION AGAINST REPORT")
print("=" * 80)

report_claims = {
    'disabled': 78.4,
    'elderly': 78.3,
    'informal': 75.1,
    'general': 68.6
}

print("\nComparing our calculations with report claims:")
print("\n| Group | Report Claims | Our Calc (oral_health=0) | Match? |")
print("|---|---|---|---|")

for group, reported in report_claims.items():
    group_data = df[df['pop_group'].str.contains(group)]
    total_count = group_data['oral_health'].notna().sum()

    if total_count > 0:
        poor_count = (group_data['oral_health'] == 0).sum()
        calculated = (poor_count / total_count) * 100
        match = "✓" if abs(calculated - reported) < 0.5 else "✗"
        print(f"| {group.capitalize()} | {reported}% | {calculated:.1f}% | {match} |")

# Step 5: Show sample data
print("\n\nSTEP 3: Sample raw data")
print("-" * 80)
print("\nFirst 20 rows with oral health data:")
print(df[['oral_health', 'oral_health_access', 'age', 'sex', 'disable_status', 'pop_group']].head(20))

print("\n" + "=" * 80)
print("CALCULATION COMPLETE")
print("=" * 80)
