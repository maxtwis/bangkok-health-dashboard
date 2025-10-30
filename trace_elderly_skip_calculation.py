import pandas as pd
import numpy as np
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load data
df = pd.read_csv('public/data/survey_sampling.csv')

print("=" * 80)
print("TRACING ELDERLY MEDICAL SKIP CALCULATION")
print("=" * 80)

# Step 1: Show the medical skip columns
print("\nSTEP 1: Understanding medical_skip columns")
print("-" * 80)
print("\nColumn names and what they mean:")
print("  medical_skip_1: ในช่วง 12 เดือนที่ผ่านมา มีครั้งใดที่ต้องการหาหมอแต่ไม่ไป เนื่องจากปัญหาค่าใช้จ่ายหรือไม่")
print("  medical_skip_2: ในช่วง 12 เดือนที่ผ่านมา เคยงดการไปหาหมอ การรักษา หรือการติดตามผลการรักษา เนื่องจากค่าใช้จ่ายหรือไม่")
print("  medical_skip_3: ในช่วง 12 เดือนที่ผ่านมา เคยไม่ซื้อยารักษา เนื่องจากปัญหาค่าใช้จ่ายหรือไม่")
print("\nValues: 1 = Yes (skipped), 0 = No (didn't skip), NaN = missing")

# Step 2: Show raw data distribution
print("\n\nSTEP 2: Raw data distribution")
print("-" * 80)
print("\nmedical_skip_1 distribution:")
print(df['medical_skip_1'].value_counts(dropna=False))
print("\nmedical_skip_2 distribution:")
print(df['medical_skip_2'].value_counts(dropna=False))
print("\nmedical_skip_3 distribution:")
print(df['medical_skip_3'].value_counts(dropna=False))

# Step 3: Define elderly
elderly_data = df[df['age'] >= 60].copy()
print(f"\n\nSTEP 3: Filter to elderly (age >= 60)")
print("-" * 80)
print(f"Total elderly: n={len(elderly_data)}")

# Step 4: Create medical_skip_any indicator
elderly_data['medical_skip_any'] = (
    (elderly_data['medical_skip_1'] == 1) |
    (elderly_data['medical_skip_2'] == 1) |
    (elderly_data['medical_skip_3'] == 1)
).astype(int)

print("\n\nSTEP 4: Create 'medical_skip_any' indicator")
print("-" * 80)
print("Logic: medical_skip_any = 1 if ANY of (medical_skip_1, 2, or 3) == 1")
print("       medical_skip_any = 0 if ALL of (medical_skip_1, 2, and 3) == 0")

# Show breakdown
print("\n\nBreakdown by individual skip types (elderly only):")
skip1_count = (elderly_data['medical_skip_1'] == 1).sum()
skip2_count = (elderly_data['medical_skip_2'] == 1).sum()
skip3_count = (elderly_data['medical_skip_3'] == 1).sum()

print(f"  medical_skip_1 = 1: {skip1_count} ({skip1_count/len(elderly_data)*100:.1f}%)")
print(f"  medical_skip_2 = 1: {skip2_count} ({skip2_count/len(elderly_data)*100:.1f}%)")
print(f"  medical_skip_3 = 1: {skip3_count} ({skip3_count/len(elderly_data)*100:.1f}%)")

# Show combined
skip_any_count = (elderly_data['medical_skip_any'] == 1).sum()
print(f"\n  medical_skip_any = 1: {skip_any_count} ({skip_any_count/len(elderly_data)*100:.1f}%)")

# Step 5: Low income filter
def get_monthly_income(row):
    if pd.isna(row['income']) or pd.isna(row['income_type']):
        return np.nan
    if row['income_type'] == 1:
        return row['income'] * 30
    elif row['income_type'] == 2:
        return row['income']
    else:
        return np.nan

elderly_data['monthly_income'] = elderly_data.apply(get_monthly_income, axis=1)
elderly_data['low_income'] = (elderly_data['monthly_income'] < 10000).astype(int)

print("\n\nSTEP 5: Filter to LOW INCOME elderly (<10,000 THB/month)")
print("-" * 80)

# Count low income elderly
low_income_elderly = elderly_data[elderly_data['low_income'] == 1]
print(f"Low income elderly: n={len(low_income_elderly)}")

# Check for missing income data
elderly_with_income = elderly_data[elderly_data['monthly_income'].notna()]
print(f"Elderly with income data: n={len(elderly_with_income)}")
print(f"Elderly missing income data: n={len(elderly_data) - len(elderly_with_income)}")

# Step 6: Calculate skip rate for low income elderly
low_income_skip = low_income_elderly['medical_skip_any'].sum()
low_income_rate = (low_income_skip / len(low_income_elderly)) * 100

print("\n\nSTEP 6: Calculate skip rate for LOW INCOME elderly")
print("-" * 80)
print(f"Low income elderly who skip care: {low_income_skip}")
print(f"Total low income elderly: {len(low_income_elderly)}")
print(f"Skip rate: {low_income_skip}/{len(low_income_elderly)} = {low_income_rate:.1f}%")

# Step 7: Detailed breakdown
print("\n\nSTEP 7: Detailed breakdown of low income elderly")
print("-" * 80)
print(f"\nIncome distribution of low income elderly:")
print(low_income_elderly['monthly_income'].describe())

print(f"\n\nMedical skip breakdown:")
print(f"  Skip type 1: {(low_income_elderly['medical_skip_1'] == 1).sum()} ({(low_income_elderly['medical_skip_1'] == 1).sum()/len(low_income_elderly)*100:.1f}%)")
print(f"  Skip type 2: {(low_income_elderly['medical_skip_2'] == 1).sum()} ({(low_income_elderly['medical_skip_2'] == 1).sum()/len(low_income_elderly)*100:.1f}%)")
print(f"  Skip type 3: {(low_income_elderly['medical_skip_3'] == 1).sum()} ({(low_income_elderly['medical_skip_3'] == 1).sum()/len(low_income_elderly)*100:.1f}%)")
print(f"  Skip ANY: {low_income_skip} ({low_income_rate:.1f}%)")

# Step 8: Verify exact number in report
print("\n\n" + "=" * 80)
print("VERIFICATION AGAINST REPORT")
print("=" * 80)
print(f"\nReport claims: 'Elderly | 43.6% skip care | Low Income (<10K/month)'")
print(f"Our calculation: {low_income_rate:.1f}%")
print(f"\nMatch: {'✓ YES' if abs(low_income_rate - 43.6) < 0.1 else '✗ NO'}")

# Additional context
print("\n\nADDITIONAL CONTEXT:")
print("-" * 80)
print(f"All elderly (regardless of income): {(elderly_data['medical_skip_any'] == 1).sum()/len(elderly_data)*100:.1f}% skip")

higher_income_elderly = elderly_data[elderly_data['low_income'] == 0]
if len(higher_income_elderly) > 0:
    higher_income_rate = (higher_income_elderly['medical_skip_any'] == 1).sum() / len(higher_income_elderly) * 100
    print(f"Higher income elderly (≥10K): {higher_income_rate:.1f}% skip")
    print(f"Gap: {low_income_rate - higher_income_rate:.1f} percentage points")

print("\n" + "=" * 80)
print("CALCULATION COMPLETE")
print("=" * 80)
