import pandas as pd

# Read the newly generated data
df = pd.read_csv('bangkok_survey_simulated_exact_format.csv')

# Filter employed people
employed = df[df['occupation_status'] == 1]

print("Income Patterns Analysis")
print("="*50)

# Daily income analysis
print("\nDAILY INCOME (income_type=1):")
daily = employed[employed['income_type'] == 1]
print(f"Total with daily income: {len(daily)}")

for ot in [1, 2, 3, 5, 6]:
    sub = daily[daily['occupation_type'] == ot]
    if len(sub) > 0:
        print(f"  Type {ot}: n={len(sub):3d}, Mean={sub['income'].mean():8.0f}, Min={sub['income'].min():6.0f}, Max={sub['income'].max():6.0f}")

# Monthly income analysis
print("\nMONTHLY INCOME (income_type=2):")
monthly = employed[employed['income_type'] == 2]
print(f"Total with monthly income: {len(monthly)}")

for ot in [1, 2, 3, 5, 6]:
    sub = monthly[monthly['occupation_type'] == ot]
    if len(sub) > 0:
        print(f"  Type {ot}: n={len(sub):3d}, Mean={sub['income'].mean():8.0f}, Min={sub['income'].min():6.0f}, Max={sub['income'].max():6.0f}")

# Working hours analysis
print("\nWORKING HOURS:")
for ot in [1, 2, 3, 5, 6]:
    sub = employed[employed['occupation_type'] == ot]
    if len(sub) > 0:
        print(f"  Type {ot}: Mean={sub['working_hours'].mean():4.1f}, Min={sub['working_hours'].min():2.0f}, Max={sub['working_hours'].max():2.0f}")

# Check if all incomes are rounded to nearest thousand
print("\nROUNDING CHECK:")
not_rounded = employed[(employed['income'] > 0) & (employed['income'] % 1000 != 0)]
print(f"Records not rounded to nearest 1000: {len(not_rounded)}")