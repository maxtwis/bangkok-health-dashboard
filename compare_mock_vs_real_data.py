"""
Compare Gemini's Mocked Data vs Real Data
Analyze differences and provide recommendations
"""

import pandas as pd
import numpy as np

print("="*80)
print("GEMINI MOCKED DATA vs REAL DATA COMPARISON")
print("="*80)

# Gemini's Mocked Data
mock_data = {
    'Community Type': ['Bangkok Average', 'Crowded Community', 'Urban Community',
                       'Suburban Community', 'Housing Estate', 'High-rise/Condo'],
    'Economic Security': [66.1, 55.0, 68.0, 65.0, 75.0, 78.0],
    'Healthcare Access': [60.8, 58.0, 62.0, 50.0, 65.0, 63.0],
    'Physical Environment': [73.4, 55.0, 70.0, 72.0, 85.0, 82.0],
    'Social Context': [92.8, 93.5, 90.0, 91.0, 88.0, 85.0],
    'Health Behaviors': [65.4, 60.0, 64.0, 66.0, 58.0, 55.0],
    'Health Outcomes': [39.5, 35.0, 40.0, 38.0, 42.0, 45.0],
    'Education': [57.5, 50.0, 60.0, 55.0, 70.0, 75.0]
}

# Real Data from community_type_means.csv
real_data = {
    'Community Type': ['Bangkok Average', 'Suburban Community', 'Housing Estate',
                       'High-rise/Condo', 'Urban Community', 'Crowded Community'],
    'Economic Security': [66.12, 66.32, 68.79, 68.89, 66.50, 65.39],
    'Healthcare Access': [91.92, 89.15, 93.14, 95.71, 92.13, 92.26],
    'Physical Environment': [62.32, 63.52, 68.63, 63.65, 68.49, 54.76],
    'Social Context': [92.92, 94.02, 94.94, 96.83, 93.84, 91.27],
    'Health Behaviors': [63.07, 63.60, 60.21, 57.62, 64.89, 61.29],
    'Health Outcomes': [51.55, 53.83, 53.92, 64.88, 53.34, 48.03],
    'Education': [57.65, 54.18, 57.55, 61.48, 59.76, 56.10]
}

mock_df = pd.DataFrame(mock_data)
real_df = pd.DataFrame(real_data)

# Reorder real data to match mock order
order = ['Bangkok Average', 'Crowded Community', 'Urban Community',
         'Suburban Community', 'Housing Estate', 'High-rise/Condo']
real_df = real_df.set_index('Community Type').loc[order].reset_index()

print("\n" + "="*80)
print("GEMINI'S NARRATIVE ASSUMPTIONS (Lines 12-13 in geminichart.py)")
print("="*80)
print("Assumption 1: 'Housing/Condo: High Physical/Economic, Low Behavior/Outcomes'")
print("Assumption 2: 'Crowded: Low Physical/Economic, High Social'")

print("\n" + "="*80)
print("SIDE-BY-SIDE COMPARISON")
print("="*80)

domains = ['Economic Security', 'Healthcare Access', 'Physical Environment',
           'Social Context', 'Health Behaviors', 'Health Outcomes', 'Education']

for domain in domains:
    print(f"\n{domain}:")
    print("-" * 80)
    print(f"{'Community Type':<25} {'MOCK':>12} {'REAL':>12} {'DIFF':>12} {'% Diff':>12}")
    print("-" * 80)

    for i in range(len(order)):
        comm_type = order[i]
        mock_val = mock_df.loc[i, domain]
        real_val = real_df.loc[i, domain]
        diff = real_val - mock_val
        pct_diff = (diff / mock_val) * 100 if mock_val != 0 else 0

        print(f"{comm_type:<25} {mock_val:>12.1f} {real_val:>12.2f} {diff:>12.2f} {pct_diff:>11.1f}%")

# Calculate RMSE per domain
print("\n" + "="*80)
print("ROOT MEAN SQUARED ERROR (RMSE) BY DOMAIN")
print("="*80)
print("(How far off is the mock data from reality?)")
print()

rmse_results = []
for domain in domains:
    mock_vals = mock_df[domain].values
    real_vals = real_df[domain].values
    rmse = np.sqrt(np.mean((mock_vals - real_vals) ** 2))
    rmse_results.append({'Domain': domain, 'RMSE': rmse})

    print(f"{domain:<30} RMSE: {rmse:>7.2f}")

print("\nInterpretation:")
print("  - RMSE < 5: Very close")
print("  - RMSE 5-10: Moderate difference")
print("  - RMSE > 10: Large difference")

# Analyze patterns
print("\n" + "="*80)
print("PATTERN ANALYSIS: DOES MOCK DATA PRESERVE REAL PATTERNS?")
print("="*80)

def get_rankings(df, domain):
    """Get community rankings for a domain (1=best)"""
    temp_df = df[df['Community Type'] != 'Bangkok Average'].copy()
    temp_df['rank'] = temp_df[domain].rank(ascending=False)
    return temp_df[['Community Type', 'rank']].set_index('Community Type')['rank'].to_dict()

print("\nRankings Comparison (1=Best, 5=Worst):")
print()

for domain in domains:
    mock_ranks = get_rankings(mock_df, domain)
    real_ranks = get_rankings(real_df, domain)

    print(f"\n{domain}:")
    print(f"{'Community':<25} {'Mock Rank':>12} {'Real Rank':>12} {'Match?':>12}")
    print("-" * 65)

    matches = 0
    for comm in ['Crowded Community', 'Urban Community', 'Suburban Community',
                 'Housing Estate', 'High-rise/Condo']:
        mock_r = mock_ranks[comm]
        real_r = real_ranks[comm]
        match = "✓" if mock_r == real_r else "✗"
        matches += (1 if mock_r == real_r else 0)
        print(f"{comm:<25} {mock_r:>12.0f} {real_r:>12.0f} {match:>12}")

    print(f"\nRanking Match Rate: {matches}/5 ({matches/5*100:.0f}%)")

# Key differences
print("\n" + "="*80)
print("KEY DIFFERENCES: MOCK vs REAL")
print("="*80)

print("\n1. HEALTHCARE ACCESS (Biggest Discrepancy):")
print("   MOCK: Ranges 50-65 (15 point spread)")
print("   REAL: Ranges 89-96 (7 point spread)")
print("   → Real data shows MUCH HIGHER and more uniform healthcare access")
print("   → Gemini assumed worse access than reality")

print("\n2. PHYSICAL ENVIRONMENT:")
print("   MOCK: Housing Estate & High-rise have very high scores (82-85)")
print("   REAL: Housing Estate is high (68.6) but High-rise is average (63.7)")
print("   → Gemini's assumption about wealth/infrastructure was partially wrong")

print("\n3. HEALTH OUTCOMES:")
print("   MOCK: Range 35-45 (10 point spread)")
print("   REAL: Range 48-65 (17 point spread)")
print("   → Real data shows MORE VARIATION than mock")
print("   → High-rise actually has BEST outcomes (64.9) vs mock's modest score")

print("\n4. EDUCATION:")
print("   MOCK: Range 50-75 (25 point spread)")
print("   REAL: Range 54-61 (7 point spread)")
print("   → Real data shows LESS INEQUALITY than Gemini assumed")

print("\n" + "="*80)
print("RECOMMENDATIONS")
print("="*80)

print("\nOPTION 1: REPLACE WITH REAL DATA (RECOMMENDED)")
print("-" * 80)
print("Pros:")
print("  ✓ Scientific integrity")
print("  ✓ Defensible in peer review")
print("  ✓ Reflects actual situation")
print("  ✓ Can explain why patterns differ from expectations")
print("\nCons:")
print("  ✗ Patterns may seem 'less interesting'")
print("  ✗ Need to rewrite narrative sections")
print("\nHow:")
print("  1. Load real data from community_type_means_with_bangkok_7domains.csv")
print("  2. Keep the same visualization code (radar + bar charts)")
print("  3. Update narrative to reflect REAL patterns:")
print("     - Healthcare access is uniformly HIGH (89-96%)")
print("     - Physical environment varies but no extreme differences")
print("     - Health outcomes show clear socioeconomic gradient")

print("\nOPTION 2: USE MOCK AS 'STYLIZED EXAMPLE' (NOT RECOMMENDED)")
print("-" * 80)
print("Pros:")
print("  ✓ Keep existing report text")
print("  ✓ Matches intuitive expectations")
print("\nCons:")
print("  ✗ Academic dishonesty / data fabrication")
print("  ✗ Cannot publish or defend")
print("  ✗ Undermines entire study credibility")
print("  ✗ Ethical violation")

print("\nOPTION 3: HYBRID APPROACH")
print("-" * 80)
print("Use mock in METHODOLOGY section as 'illustrative example':")
print("  - Show mock charts as 'Figure X: Example visualization approach'")
print("  - Then show REAL charts as 'Figure Y: Actual community comparisons'")
print("  - Explain: 'Initial expectations differed from findings'")
print("\nThis:")
print("  ✓ Salvages the visualization work")
print("  ✓ Maintains scientific integrity")
print("  ✓ Shows transparent research process")

print("\n" + "="*80)
print("FINAL RECOMMENDATION")
print("="*80)
print("\n** USE REAL DATA (Option 1) **")
print("\nYour real data tells an important story:")
print("  1. Bangkok has achieved near-universal healthcare access (89-96%)")
print("  2. Community type matters less for access than expected")
print("  3. Health OUTCOMES still vary by socioeconomic status")
print("  4. The gap is in outcomes, not access - this is valuable insight!")
print("\nThis is actually MORE INTERESTING than mock data because it shows:")
print("  → Thailand's universal healthcare system is working")
print("  → The challenge is not access but QUALITY and OUTCOMES")
print("  → Need to focus interventions on outcomes, not just access")
print("\n** Use the real data. Your findings are valuable. **")

print("\n" + "="*80)
print("NEXT STEPS")
print("="*80)
print("\n1. I can create corrected visualization code with real data")
print("2. I can help rewrite narrative sections to match real patterns")
print("3. I can create a 'limitations' section explaining deviations from expectations")
print("\nWould you like me to create the corrected visualization code now?")
