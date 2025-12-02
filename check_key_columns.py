"""
Quick check of key columns for data type issues
"""
import pandas as pd

df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
elderly = df[(df['age'] >= 60) & (df['disable_status'] != 1)].head(100)  # Sample for speed

print("="*80)
print("QUICK DATA TYPE CHECK - Key Columns")
print("="*80)

# Focus on columns likely to have issues
key_columns = {
    'welfare': 'Healthcare - should check for strings',
    'occupation_status': 'Economic - binary 0/1',
    'house_status': 'Physical Environment',
    'community_safety': 'Social Context - 1-4 scale',
    'drink_status': 'Health Behaviors',
    'smoke_status': 'Health Behaviors',
    'exercise_status': 'Health Behaviors',
    'diseases_status': 'Health Outcomes - binary 0/1'
}

for col, desc in key_columns.items():
    if col in elderly.columns:
        dtype = elderly[col].dtype
        unique_vals = elderly[col].dropna().unique()
        print(f"\n{col} ({desc}):")
        print(f"  Type: {dtype}")
        print(f"  Values: {sorted(unique_vals)}")

        # Check if object type contains numbers
        if dtype == 'object':
            print(f"  WARNING: STRING TYPE - May need conversion in code!")

print("\n" + "="*80)
print("CHECKING: Are numeric comparisons safe?")
print("="*80)

# Test the actual comparisons used in code
test_df = elderly.copy()

print("\n1. welfare in [1, 2, 3] vs welfare in ['1', '2', '3']:")
if 'welfare' in test_df.columns:
    count_int = (test_df['welfare'].isin([1, 2, 3])).sum()
    count_str = (test_df['welfare'].isin(['1', '2', '3'])).sum()
    print(f"   Integer comparison: {count_int} matches")
    print(f"   String comparison: {count_str} matches")
    if count_int != count_str:
        print("   WARNING: MISMATCH - Use BOTH int and string in comparison!")

print("\n2. occupation_status == 1 vs occupation_status == '1':")
if 'occupation_status' in test_df.columns:
    count_int = (test_df['occupation_status'] == 1).sum()
    count_str = (test_df['occupation_status'] == '1').sum()
    print(f"   Integer comparison: {count_int} matches")
    print(f"   String comparison: {count_str} matches")
    if count_int != count_str:
        print("   WARNING: MISMATCH - Use BOTH int and string in comparison!")

print("\n3. house_status == 1 vs house_status == '1':")
if 'house_status' in test_df.columns:
    count_int = (test_df['house_status'] == 1).sum()
    count_str = (test_df['house_status'] == '1').sum()
    print(f"   Integer comparison: {count_int} matches")
    print(f"   String comparison: {count_str} matches")
    if count_int != count_str:
        print("   WARNING: MISMATCH - Use BOTH int and string in comparison!")

print("\n4. community_safety in [1, 2] vs community_safety in ['1', '2']:")
if 'community_safety' in test_df.columns:
    count_int = (test_df['community_safety'].isin([1, 2])).sum()
    count_str = (test_df['community_safety'].isin(['1', '2'])).sum()
    print(f"   Integer comparison: {count_int} matches")
    print(f"   String comparison: {count_str} matches")
    if count_int != count_str:
        print("   WARNING: MISMATCH - Use BOTH int and string in comparison!")

print("\n" + "="*80)
print("CHECK COMPLETE")
print("="*80)
