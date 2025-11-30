import pandas as pd
import numpy as np

# Read the survey data
df = pd.read_csv('public/data/survey_sampling.csv')

# Define freelance types
freelance_types = {
    1: 'General Labor (รับจ้างทั่วไป)',
    2: 'Online Seller (ขายของออนไลน์)',
    3: 'Rider (ไรเดอร์)',
    4: 'Motorcycle Taxi (วินมอเตอร์ไซต์)',
    5: 'Trading (ค้าขาย)',
    6: 'Street Vendor (ผู้ค้าหาบเร่แผงลอย)'
}

# Define smoking status
smoke_status_mapping = {
    0: 'Never smoked',
    1: 'Former smoker',
    2: 'Occasional smoker',
    3: 'Smoke almost everyday'
}

# Filter for informal workers (occupation_type = 'other' or occupation_freelance_type is not null)
informal_workers = df[df['occupation_freelance_type'].notna()].copy()

print("=" * 80)
print("SMOKING BEHAVIOR BY FREELANCE TYPE (INFORMAL WORKERS)")
print("=" * 80)
print(f"\nTotal informal workers in dataset: {len(informal_workers)}")
print(f"Total respondents: {len(df)}")
print()

# Overall smoking statistics for informal workers
print("-" * 80)
print("OVERALL SMOKING STATISTICS - INFORMAL WORKERS")
print("-" * 80)
overall_smoking = informal_workers['smoke_status'].value_counts().sort_index()
for status, count in overall_smoking.items():
    if pd.notna(status):
        status_label = smoke_status_mapping.get(int(status), 'Unknown')
        percentage = (count / len(informal_workers)) * 100
        print(f"{status_label}: {count} ({percentage:.1f}%)")
print()

# Detailed analysis by freelance type
print("-" * 80)
print("SMOKING BEHAVIOR BY FREELANCE TYPE")
print("-" * 80)

for freelance_code, freelance_name in sorted(freelance_types.items()):
    workers = informal_workers[informal_workers['occupation_freelance_type'] == freelance_code]

    if len(workers) == 0:
        continue

    print(f"\n{freelance_name}")
    print(f"Total workers: {len(workers)}")
    print("-" * 40)

    smoking_stats = workers['smoke_status'].value_counts().sort_index()

    for status, count in smoking_stats.items():
        if pd.notna(status):
            status_label = smoke_status_mapping.get(int(status), 'Unknown')
            percentage = (count / len(workers)) * 100
            print(f"  {status_label}: {count} ({percentage:.1f}%)")

    # Highlight "Smoke almost everyday" if exists
    everyday_smokers = workers[workers['smoke_status'] == 3]
    if len(everyday_smokers) > 0:
        print(f"\n  >>> {len(everyday_smokers)} workers smoke almost everyday ({(len(everyday_smokers)/len(workers)*100):.1f}%)")

# Focus on "Smoke almost everyday" group
print("\n" + "=" * 80)
print("INFORMAL WORKERS WHO SMOKE ALMOST EVERYDAY - BY TYPE")
print("=" * 80)

everyday_smokers_all = informal_workers[informal_workers['smoke_status'] == 3]
print(f"\nTotal informal workers who smoke almost everyday: {len(everyday_smokers_all)}")
print()

for freelance_code, freelance_name in sorted(freelance_types.items()):
    workers = everyday_smokers_all[everyday_smokers_all['occupation_freelance_type'] == freelance_code]

    if len(workers) > 0:
        total_in_type = len(informal_workers[informal_workers['occupation_freelance_type'] == freelance_code])
        percentage_of_type = (len(workers) / total_in_type * 100) if total_in_type > 0 else 0
        percentage_of_all_smokers = (len(workers) / len(everyday_smokers_all) * 100)

        print(f"{freelance_name}:")
        print(f"  Count: {len(workers)}")
        print(f"  % of all {freelance_name}: {percentage_of_type:.1f}%")
        print(f"  % of all everyday smokers: {percentage_of_all_smokers:.1f}%")
        print()

# Additional demographics of everyday smokers by type
print("=" * 80)
print("DEMOGRAPHICS OF EVERYDAY SMOKERS BY FREELANCE TYPE")
print("=" * 80)

for freelance_code, freelance_name in sorted(freelance_types.items()):
    workers = everyday_smokers_all[everyday_smokers_all['occupation_freelance_type'] == freelance_code]

    if len(workers) > 0:
        print(f"\n{freelance_name} (n={len(workers)})")
        print("-" * 40)

        # Age statistics
        print(f"  Age: mean={workers['age'].mean():.1f}, median={workers['age'].median():.0f}, range={workers['age'].min():.0f}-{workers['age'].max():.0f}")

        # Gender distribution
        gender_dist = workers['sex'].value_counts()
        print(f"  Gender:", end="")
        for gender, count in gender_dist.items():
            print(f" {gender}={count}", end="")
        print()

        # Average cigarettes per day (if available)
        if 'smoke_amount' in workers.columns:
            avg_smoke = workers['smoke_amount'].dropna()
            if len(avg_smoke) > 0:
                print(f"  Avg cigarettes/packs per day: {avg_smoke.mean():.1f}")

        # Income statistics
        avg_income = workers['income'].dropna()
        if len(avg_income) > 0:
            print(f"  Income: mean={avg_income.mean():.0f}, median={avg_income.median():.0f}")

print("\n" + "=" * 80)
