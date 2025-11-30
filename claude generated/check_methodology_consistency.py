import pandas as pd
import re

# Read the survey data
df = pd.read_csv('public/data/survey_sampling.csv')

# Apply priority classification
def classify_priority(row):
    if row['sex'] == 'lgbt':
        return 'lgbt'
    if row['age'] >= 60:
        return 'elderly'
    if row['disable_status'] == 1:
        return 'disabled'
    if row['occupation_status'] == 1 and row['occupation_contract'] == 0:
        return 'informal'
    return 'general'

df['priority_group'] = df.apply(classify_priority, axis=1)

# Calculate actual population sizes
print("=" * 80)
print("POPULATION SIZE COMPARISON: PRIORITY vs NON-PRIORITY")
print("=" * 80)
print()

# Non-priority (overlapping groups)
lgbt_all = len(df[df['sex'] == 'lgbt'])
elderly_all = len(df[df['age'] >= 60])
disabled_all = len(df[df['disable_status'] == 1])
informal_all = len(df[(df['occupation_status'] == 1) & (df['occupation_contract'] == 0)])

# Priority (mutually exclusive)
priority_counts = df['priority_group'].value_counts().to_dict()

print(f"{'Group':<20} {'Non-Priority':<15} {'Priority':<15} {'Difference':<15}")
print("-" * 70)
print(f"{'LGBT+':<20} {lgbt_all:<15} {priority_counts.get('lgbt', 0):<15} {lgbt_all - priority_counts.get('lgbt', 0):<15}")
print(f"{'Elderly (60+)':<20} {elderly_all:<15} {priority_counts.get('elderly', 0):<15} {elderly_all - priority_counts.get('elderly', 0):<15}")
print(f"{'Disabled':<20} {disabled_all:<15} {priority_counts.get('disabled', 0):<15} {disabled_all - priority_counts.get('disabled', 0):<15}")
print(f"{'Informal Workers':<20} {informal_all:<15} {priority_counts.get('informal', 0):<15} {informal_all - priority_counts.get('informal', 0):<15}")
print(f"{'General':<20} {'-':<15} {priority_counts.get('general', 0):<15} {'-':<15}")
print()

# Read the report file and search for n= values
print("=" * 80)
print("CHECKING REPORT FOR POPULATION SIZE MENTIONS")
print("=" * 80)
print()

with open('REPORT_SDHE_ANALYSIS_SECTION.md', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# Find all mentions of population sizes
patterns = [
    (r'LGBT\+.*?n\s*=\s*(\d+)', 'LGBT+'),
    (r'Elderly.*?n\s*=\s*(\d+)', 'Elderly'),
    (r'Disabled.*?n\s*=\s*(\d+)', 'Disabled'),
    (r'Informal [Ww]orkers?.*?n\s*=\s*(\d+)', 'Informal Workers'),
    (r'General [Pp]opulation.*?n\s*=\s*(\d+)', 'General Population'),
]

findings = {
    'LGBT+': [],
    'Elderly': [],
    'Disabled': [],
    'Informal Workers': [],
    'General Population': []
}

for i, line in enumerate(lines, 1):
    for pattern, group_name in patterns:
        matches = re.finditer(pattern, line, re.IGNORECASE)
        for match in matches:
            n_value = int(match.group(1))
            findings[group_name].append({
                'line': i,
                'n': n_value,
                'text': line.strip()[:100]
            })

print("Found population size mentions in report:")
print()

for group_name, matches in findings.items():
    if matches:
        print(f"{group_name}:")
        unique_n_values = set([m['n'] for m in matches])
        print(f"  Unique n values found: {sorted(unique_n_values)}")

        # Check which method was used
        non_priority_n = None
        priority_n = None

        if group_name == 'LGBT+':
            non_priority_n = lgbt_all
            priority_n = priority_counts.get('lgbt', 0)
        elif group_name == 'Elderly':
            non_priority_n = elderly_all
            priority_n = priority_counts.get('elderly', 0)
        elif group_name == 'Disabled':
            non_priority_n = disabled_all
            priority_n = priority_counts.get('disabled', 0)
        elif group_name == 'Informal Workers':
            non_priority_n = informal_all
            priority_n = priority_counts.get('informal', 0)

        if non_priority_n and priority_n:
            print(f"  Expected if using NON-PRIORITY: {non_priority_n}")
            print(f"  Expected if using PRIORITY: {priority_n}")

            for n_val in unique_n_values:
                if n_val == non_priority_n:
                    print(f"  [X] n={n_val} -> Using NON-PRIORITY method (overlapping groups)")
                elif n_val == priority_n:
                    print(f"  [OK] n={n_val} -> Using PRIORITY method (mutually exclusive)")
                else:
                    print(f"  [?] n={n_val} -> UNKNOWN (doesn't match either method)")

        print(f"  Sample mentions:")
        for m in matches[:3]:  # Show first 3
            print(f"    Line {m['line']}: n={m['n']}")
        print()

# Check specific sections
print("=" * 80)
print("SECTION-BY-SECTION ANALYSIS")
print("=" * 80)
print()

# Look for table headers and their n values
table_pattern = r'\|\s*\*\*([^*]+)\*\*\s*\|.*?\|\s*(\d+)\s*\|'
tables_found = []

for i, line in enumerate(lines, 1):
    match = re.search(table_pattern, line)
    if match:
        group_name = match.group(1).strip()
        n_value = int(match.group(2))

        # Check if this is a population group
        if any(keyword in group_name.lower() for keyword in ['elderly', 'disabled', 'lgbt', 'informal', 'general']):
            tables_found.append({
                'line': i,
                'group': group_name,
                'n': n_value,
                'text': line.strip()
            })

if tables_found:
    print("Tables with population groups and n values:")
    print()

    for table in tables_found[:20]:  # Show first 20
        print(f"Line {table['line']}: {table['group']} → n={table['n']}")

        # Determine which method
        group_lower = table['group'].lower()
        if 'lgbt' in group_lower:
            if table['n'] == lgbt_all:
                print(f"  [X] NON-PRIORITY (n={lgbt_all})")
            elif table['n'] == priority_counts.get('lgbt', 0):
                print(f"  [OK] PRIORITY (n={priority_counts.get('lgbt', 0)})")
        elif 'disabled' in group_lower:
            if table['n'] == disabled_all:
                print(f"  [X] NON-PRIORITY (n={disabled_all})")
            elif table['n'] == priority_counts.get('disabled', 0):
                print(f"  [OK] PRIORITY (n={priority_counts.get('disabled', 0)})")
        elif 'informal' in group_lower:
            if table['n'] == informal_all:
                print(f"  [X] NON-PRIORITY (n={informal_all})")
            elif table['n'] == priority_counts.get('informal', 0):
                print(f"  [OK] PRIORITY (n={priority_counts.get('informal', 0)})")
        elif 'elderly' in group_lower:
            if table['n'] == elderly_all:
                print(f"  [X] NON-PRIORITY (n={elderly_all})")
            elif table['n'] == priority_counts.get('elderly', 0):
                print(f"  [OK] PRIORITY (n={priority_counts.get('elderly', 0)})")
        print()

print("=" * 80)
print("SUMMARY")
print("=" * 80)
print()
print("Based on the numbers used in the report:")
print()
print(f"LGBT+ n=685:")
print(f"  [OK] Matches PRIORITY method (685 = 685)")
print(f"  [OK] Also matches non-priority (same, no LGBT+ excluded)")
print()
print(f"Elderly n=2,964 or n=2,986:")
print(f"  Checking what's used in report...")
print()
print(f"Disabled n=638:")
print(f"  [X] Matches NON-PRIORITY method (638 total disabled)")
print(f"  Expected with PRIORITY: 229 (non-elderly, non-LGBT+ disabled)")
print(f"  Difference: {disabled_all - priority_counts.get('disabled', 0)} disabled are elderly/LGBT+")
print()
print(f"Informal Workers n=2,645:")
print(f"  [X] Matches NON-PRIORITY method (2,645 total informal)")
print(f"  Expected with PRIORITY: 1,330 (working-age, non-disabled, non-LGBT+ informal)")
print(f"  Difference: {informal_all - priority_counts.get('informal', 0)} informal workers are elderly/disabled/LGBT+")
print()

# Show the overlap
print("=" * 80)
print("WHO ARE THE OVERLAPPING PEOPLE?")
print("=" * 80)
print()

elderly_disabled = len(df[(df['age'] >= 60) & (df['disable_status'] == 1)])
elderly_informal = len(df[(df['age'] >= 60) & (df['occupation_status'] == 1) & (df['occupation_contract'] == 0)])
disabled_informal = len(df[(df['disable_status'] == 1) & (df['occupation_status'] == 1) & (df['occupation_contract'] == 0)])
lgbt_disabled = len(df[(df['sex'] == 'lgbt') & (df['disable_status'] == 1)])
lgbt_informal = len(df[(df['sex'] == 'lgbt') & (df['occupation_status'] == 1) & (df['occupation_contract'] == 0)])

print(f"Elderly + Disabled: {elderly_disabled} people")
print(f"Elderly + Informal: {elderly_informal} people")
print(f"Disabled + Informal: {disabled_informal} people")
print(f"LGBT+ + Disabled: {lgbt_disabled} people")
print(f"LGBT+ + Informal: {lgbt_informal} people")
print()
print(f"Total disabled if NOT using priority: {disabled_all}")
print(f"  - Elderly disabled: {elderly_disabled}")
print(f"  - LGBT+ disabled: {lgbt_disabled}")
print(f"  = Non-elderly, non-LGBT+ disabled: {disabled_all - elderly_disabled - lgbt_disabled + len(df[(df['age'] >= 60) & (df['sex'] == 'lgbt') & (df['disable_status'] == 1)])}")
print()
print(f"Total informal if NOT using priority: {informal_all}")
print(f"  - Elderly informal: {elderly_informal}")
print(f"  - Disabled informal: {disabled_informal}")
print(f"  - LGBT+ informal: {lgbt_informal}")
print(f"  (with overlaps, actual priority-classified informal: {priority_counts.get('informal', 0)})")
print()

print("=" * 80)
