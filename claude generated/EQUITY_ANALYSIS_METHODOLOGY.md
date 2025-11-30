# Equity Analysis Methodology

**Purpose:** Document the complete logic and workflow for creating equity reports using descriptive stratified analysis with statistical testing.

**Created:** 2025-11-17

**Use case:** Replicate this analysis for other population groups (informal workers, children, migrants, etc.)

---

## Overview: The Approach

### Problem We're Solving

**Goal:** Show equity gaps WITHIN a population group (not comparing to general population)

**Why not regression?**
- Regression shows "independent effects" after controlling for confounders (hard to explain)
- We want to show "real-world patterns" that policymakers can understand
- Percentages (24% vs 4%) are clearer than odds ratios (OR=6.6)

**Why not correlation?**
- Correlation only shows association strength (-1 to +1)
- Doesn't show actual percentages or equity gaps
- No statistical testing for group differences

**Our approach: Descriptive Stratified Analysis with Statistical Testing**
- Split population into subgroups (low/middle/high income, etc.)
- Compare actual outcomes (percentages, means) across subgroups
- Use statistical tests to prove differences are real (not random)
- Calculate equity gaps (highest - lowest group)
- Use internal benchmarks (best-performing group = achievable target)

---

## Step-by-Step Workflow

### Step 1: Define Your Population

**Example for elderly:**
```python
# Filter to your population of interest
df_elderly = df[df['age'] >= 60].copy()
```

**For other groups:**
- Informal workers: `df[df['occupation_type'] == 6]` (informal occupation)
- Children: `df[df['age'] < 18]`
- Migrants: `df[df['migrate_status'] == 1]` (if you have this variable)

---

### Step 2: Create Stratification Variables

**Goal:** Divide population into meaningful subgroups for comparison

**Example stratifications:**

```python
# Income groups (tertiles: Low/Middle/High)
df['income_group'] = pd.cut(df['monthly_income'],
                             bins=[0, 12000, 15000, 1000000],
                             labels=['Low', 'Middle', 'High'])

# Education groups (Low/Middle/High)
df['education_group'] = pd.cut(df['education'],
                                bins=[-1, 2, 3, 8],
                                labels=['Low', 'Middle', 'High'])

# Age groups
df['age_group'] = pd.cut(df['age'],
                          bins=[59, 69, 79, 150],
                          labels=['60-69', '70-79', '80+'])

# Gender (map numeric to labels)
df['gender'] = df['sex'].map({1: 'Male', 2: 'Female', 3: 'LGBT'})

# Working status (binary)
df['working'] = df['occupation_status']  # Already 0/1

# Home ownership (categorical)
df['homeowner'] = df['house_status'].apply(
    lambda x: 'Owner' if x == 1 else 'Renter' if x == 2 else 'Other'
)

# Disability (binary)
df['disabled'] = df['disable_status']  # Already 0/1
```

**Key principles:**
1. **Binary stratifications** (yes/no): Working status, disability, gender (if only M/F)
2. **Ordinal stratifications** (low/mid/high): Income, education, age groups
3. **Categorical stratifications** (3+ groups): Home ownership, occupation type

**How to choose cutoffs:**
- **Tertiles/Quartiles:** Split into equal-sized groups (33%/33%/33% or 25%/25%/25%/25%)
- **Domain knowledge:** Use meaningful thresholds (minimum wage, school grade levels)
- **Sample size:** Each group needs ≥30 cases for reliable statistics

---

### Step 3: Define Outcome Variables

**Categorize outcomes by type:**

**A. Binary outcomes (0/1):**
```python
categorical_outcomes = {
    'medical_skip_1': 'Skip medical care due to cost',
    'food_insecurity_1': 'Food insecurity',
    'violence': 'Experienced violence',
    'training': 'Participated in training',
    # ... add all binary variables
}
```

**B. Continuous outcomes (numeric):**
```python
continuous_outcomes = {
    'monthly_income': 'Monthly income (baht)',
    'bmi': 'Body Mass Index',
    'health_expense': 'Health expenses (baht/month)',
    # ... add all numeric variables
}
```

**How to identify outcome type:**
- Binary: 0/1, yes/no questions
- Continuous: Money, height, weight, age, counts
- Ordinal: Scales (1-4), education levels, exercise frequency (treat as categorical for chi-square)

---

### Step 4: Statistical Testing Functions

**A. Chi-Square Test (for categorical outcomes)**

```python
from scipy.stats import chi2_contingency

def chi_square_test(df, outcome_var, stratify_var):
    """Compare binary/categorical outcome across groups"""

    # Remove missing values
    df_test = df[[outcome_var, stratify_var]].dropna()

    # Need minimum sample size
    if len(df_test) < 30:
        return None

    # Create contingency table (crosstab)
    contingency = pd.crosstab(df_test[stratify_var], df_test[outcome_var])

    # Skip if any cell has < 5 observations (chi-square assumption)
    if (contingency < 5).any().any():
        return None

    # Perform chi-square test
    chi2, p_value, dof, expected = chi2_contingency(contingency)

    # Calculate Cramer's V (effect size)
    n = contingency.sum().sum()
    k = contingency.shape[0]  # rows
    r = contingency.shape[1]  # columns
    cramers_v = np.sqrt(chi2 / (n * min(k-1, r-1)))

    # Calculate percentages
    percentages = contingency.div(contingency.sum(axis=1), axis=0) * 100

    return {
        'chi2': chi2,
        'p_value': p_value,
        'cramers_v': cramers_v,
        'contingency': contingency,
        'percentages': percentages,
        'n': n
    }
```

**Interpretation:**
- **p_value < 0.05:** Groups are significantly different
- **Cramer's V:** Effect size magnitude
  - < 0.10: negligible
  - 0.10-0.30: small
  - 0.30-0.50: medium
  - > 0.50: large

**Example usage:**
```python
result = chi_square_test(df_elderly, 'medical_skip_1', 'income_group')
if result and result['p_value'] < 0.05:
    print(f"Significant difference: chi2={result['chi2']:.1f}, p={result['p_value']:.4f}")
    print(result['percentages'])
```

---

**B. ANOVA Test (for continuous outcomes)**

```python
from scipy.stats import f_oneway

def anova_test(df, outcome_var, stratify_var):
    """Compare continuous outcome across groups"""

    # Remove missing values
    df_test = df[[outcome_var, stratify_var]].dropna()

    if len(df_test) < 30:
        return None

    # Get groups (list of arrays)
    groups = [group[outcome_var].values for name, group in df_test.groupby(stratify_var)]

    # Need at least 2 groups with ≥5 observations each
    if len(groups) < 2 or any(len(g) < 5 for g in groups):
        return None

    # Perform ANOVA
    f_stat, p_value = f_oneway(*groups)

    # Calculate descriptive stats by group
    group_stats = df_test.groupby(stratify_var)[outcome_var].agg([
        'count', 'mean', 'std', 'median', 'min', 'max'
    ])

    # Calculate eta-squared (effect size)
    grand_mean = df_test[outcome_var].mean()
    ss_between = sum(len(g) * (np.mean(g) - grand_mean)**2 for g in groups)
    ss_total = sum((df_test[outcome_var] - grand_mean)**2)
    eta_squared = ss_between / ss_total if ss_total > 0 else 0

    return {
        'f_stat': f_stat,
        'p_value': p_value,
        'eta_squared': eta_squared,
        'group_stats': group_stats,
        'n': len(df_test)
    }
```

**Interpretation:**
- **p_value < 0.05:** Group means are significantly different
- **Eta-squared:** Effect size (proportion of variance explained)
  - < 0.01: negligible
  - 0.01-0.06: small
  - 0.06-0.14: medium
  - > 0.14: large

**Example usage:**
```python
result = anova_test(df_elderly, 'monthly_income', 'education_group')
if result and result['p_value'] < 0.05:
    print(f"Significant difference: F={result['f_stat']:.1f}, p={result['p_value']:.4f}")
    print(result['group_stats'])
```

---

### Step 5: Run All Tests Systematically

**Loop through all combinations:**

```python
all_results = []

# Test categorical outcomes
for outcome_var, outcome_label in categorical_outcomes.items():
    if outcome_var not in df.columns:
        continue

    for stratify_var, stratify_label in stratify_vars.items():
        if stratify_var not in df.columns:
            continue

        result = chi_square_test(df, outcome_var, stratify_var)

        if result is not None and result['p_value'] < 0.05:
            # Calculate equity gap
            percentages = result['percentages']
            if 1 in percentages.columns:  # For binary outcomes (0/1)
                group_pcts = percentages[1]
                equity_gap = group_pcts.max() - group_pcts.min()
                highest_group = group_pcts.idxmax()
                lowest_group = group_pcts.idxmin()

            all_results.append({
                'outcome_variable': outcome_var,
                'outcome_label': outcome_label,
                'stratify_variable': stratify_var,
                'stratify_label': stratify_label,
                'test_type': 'chi_square',
                'p_value': result['p_value'],
                'effect_size': result['cramers_v'],
                'equity_gap': equity_gap,
                'highest_group': highest_group,
                'lowest_group': lowest_group,
                'n': result['n']
            })

# Test continuous outcomes
for outcome_var, outcome_label in continuous_outcomes.items():
    if outcome_var not in df.columns:
        continue

    for stratify_var, stratify_label in stratify_vars.items():
        if stratify_var not in df.columns:
            continue

        result = anova_test(df, outcome_var, stratify_var)

        if result is not None and result['p_value'] < 0.05:
            # Calculate equity gap
            group_means = result['group_stats']['mean']
            equity_gap = group_means.max() - group_means.min()
            highest_group = group_means.idxmax()
            lowest_group = group_means.idxmin()

            all_results.append({
                'outcome_variable': outcome_var,
                'outcome_label': outcome_label,
                'stratify_variable': stratify_var,
                'stratify_label': stratify_label,
                'test_type': 'anova',
                'p_value': result['p_value'],
                'effect_size': result['eta_squared'],
                'equity_gap': equity_gap,
                'highest_group': highest_group,
                'lowest_group': lowest_group,
                'n': result['n']
            })
```

---

### Step 6: Save Results to CSV

```python
# Create DataFrame
results_df = pd.DataFrame(all_results)

# Sort by significance and effect size
results_df = results_df.sort_values(['p_value', 'effect_size'], ascending=[True, False])

# Save all results
results_df.to_csv('equity_statistical_tests_all.csv', index=False, encoding='utf-8-sig')

# Save only significant results (p < 0.05)
significant_df = results_df[results_df['p_value'] < 0.05]
significant_df.to_csv('equity_statistical_tests_significant.csv', index=False, encoding='utf-8-sig')

print(f"Found {len(significant_df)} significant equity gaps out of {len(results_df)} tests")
```

---

### Step 7: Generate Detailed Crosstabs

**For top findings, create detailed tables:**

```python
# Get top 20 findings by equity gap
top_findings = significant_df.nlargest(20, 'equity_gap')

for idx, row in top_findings.iterrows():
    outcome_var = row['outcome_variable']
    stratify_var = row['stratify_variable']

    df_temp = df[[outcome_var, stratify_var]].dropna()

    if row['test_type'] == 'chi_square':
        # Create crosstab with counts and percentages
        contingency = pd.crosstab(df_temp[stratify_var], df_temp[outcome_var], margins=True)
        percentages = pd.crosstab(df_temp[stratify_var], df_temp[outcome_var],
                                   normalize='index') * 100

        print(f"\n{row['outcome_label']} by {row['stratify_label']}")
        print("Counts:")
        print(contingency)
        print("\nPercentages:")
        print(percentages.round(1))

    elif row['test_type'] == 'anova':
        # Calculate descriptive stats
        group_stats = df_temp.groupby(stratify_var)[outcome_var].agg([
            'count', 'mean', 'std', 'median', 'min', 'max'
        ])

        print(f"\n{row['outcome_label']} by {row['stratify_label']}")
        print(group_stats.round(1))
```

---

### Step 8: Write the Equity Report

**Structure for each finding:**

```markdown
### Finding X.Y: [Clear Title with Gap Size]

**Outcome:** [Outcome variable description]

**Statistical Test:** Chi-square = XX.X, p < 0.001, Cramer's V = 0.XX (small/medium/large)

**Results by [Stratification]:**

| Group | Outcome Rate | Sample Size |
|-------|--------------|-------------|
| Low   | 24.1% (117/486) | 486 |
| High  | 4.2% (8/189)    | 189 |

**Equity Gap:** XX.X percentage points (Low vs High)

**Interpretation:**
- [Group A] is X times more likely than [Group B] (XX% vs XX%)
- [Why this pattern exists - explain mechanisms]
- [What this means for policy]

**Internal Benchmark:** High-income rate (4.2%) shows "achievable minimum" -
if all elderly had this level, we could reduce by XX percentage points.

**Policy Implication:** [Specific, actionable recommendation]
```

---

## Key Report Sections

### 1. Executive Summary
- Sample size and characteristics
- Top 5-10 findings with equity gaps
- Statistical evidence summary (X significant findings)
- Internal benchmarks explanation

### 2. Population Profile
- Sample characteristics table
- Stratification group definitions (with income ranges, education levels, etc.)
- Context (e.g., minimum wage comparison)

### 3. Domain-by-Domain Findings
Organize by outcome domains:
- Healthcare Access
- Chronic Diseases & Disability
- Health Behaviors
- Food Insecurity
- Literacy & Cognitive Skills
- Training & Employment
- Work Injuries
- Environmental Health
- Violence & Safety
- Economic Security

### 4. Summary Table: Top Equity Gaps Ranked
- Rank by equity gap magnitude
- Include effect size and policy priority

### 5. What Characteristics Matter Most?
- For each stratification (age, income, education, etc.)
- List all outcomes it significantly affects
- Interpretation of why this characteristic matters

### 6. Statistical Methods Used
- Explain chi-square and ANOVA
- Effect size interpretation guide
- Limitations section

### 7. Policy Recommendations
- Immediate priorities (high impact, feasible)
- Medium-term programs (1-3 years)
- Long-term systemic changes (3-10 years)

---

## Checklist for Replicating This Analysis

### Before Starting:
- [ ] Define your population of interest (filter criteria)
- [ ] Identify all outcome variables (binary vs continuous)
- [ ] Choose stratification variables (what inequalities to examine?)
- [ ] Determine cutoff points for stratifications (tertiles? domain knowledge?)

### During Analysis:
- [ ] Create stratification variables with clear labels
- [ ] Test all outcome × stratification combinations
- [ ] Filter results to significant findings (p < 0.05)
- [ ] Calculate equity gaps (highest - lowest group)
- [ ] Generate detailed crosstabs for top 20 findings
- [ ] Save 3 CSV files (all tests, significant only, detailed crosstabs)

### Writing Report:
- [ ] Start with population profile and stratification definitions
- [ ] Group findings by domain (healthcare, economic, etc.)
- [ ] For each finding: test stats → results table → equity gap → interpretation → policy
- [ ] Create summary table ranking all gaps
- [ ] Write "What Matters Most" section for each stratification
- [ ] Add statistical methods section
- [ ] Write policy recommendations (immediate/medium/long-term)

### Quality Checks:
- [ ] All percentages have denominators (117 out of 486)
- [ ] Effect sizes interpreted correctly (small/medium/large)
- [ ] P-values reported (p < 0.001 or exact)
- [ ] Sample sizes shown for all groups
- [ ] Internal benchmarks explained
- [ ] No emojis in report
- [ ] Clear, policy-relevant language

---

## Common Issues and Solutions

### Issue 1: "Chi-square test fails - cell count < 5"
**Solution:**
- Combine small categories (e.g., merge "LGBT" into "Other" if n<5)
- Use Fisher's exact test for 2×2 tables with small samples
- Skip the test and note "sample too small for reliable testing"

### Issue 2: "Many tests return p > 0.05 (not significant)"
**Solution:**
- This is OK! Not all characteristics create equity gaps for all outcomes
- Focus report on significant findings only
- Mention total tests performed (transparency)

### Issue 3: "Effect sizes are all 'negligible' or 'small'"
**Solution:**
- Small effects can still matter for policy (5% gap × 1 million people = 50,000 affected)
- Rank by absolute equity gap size, not just effect size
- Report both statistical significance (p-value) and practical significance (gap magnitude)

### Issue 4: "Income group created from income variable - circular analysis?"
**Solution:**
- This is OK for descriptive analysis (we WANT to show income predicts income-related outcomes)
- For regression, avoid this (use education to predict income, not income to predict income)
- Focus on OTHER outcomes predicted by income (healthcare, food security, etc.)

### Issue 5: "Selection effects everywhere (working elderly are healthier)"
**Solution:**
- Acknowledge in interpretation: "This reflects selection effect - healthy people can work"
- Do NOT interpret as causal: "Work causes health" is wrong
- Correct interpretation: "Disease prevents work, creating disability gap"

---

## Adapting for Other Population Groups

### For Informal Workers:
```python
# Define population
df_informal = df[df['occupation_type'] == 6].copy()

# Stratifications
stratify_vars = {
    'income_group': 'Income Level',
    'education_group': 'Education Level',
    'age_group': 'Age Group',
    'work_hours_group': 'Work Hours',  # <8, 8-10, >10 hours/day
    'contract_status': 'Has Contract',
    'benefit_status': 'Has Benefits',
}
```

### For Children (<18):
```python
# Define population
df_children = df[df['age'] < 18].copy()

# Stratifications
stratify_vars = {
    'age_group': 'Age Group',  # 0-5, 6-12, 13-17
    'household_income': 'Household Income',
    'parent_education': 'Parent Education Level',
    'household_size': 'Household Size',
}

# Different outcomes
outcomes = {
    'school_attendance': 'School attendance',
    'nutrition_status': 'Nutrition status',
    'vaccination_status': 'Vaccination status',
    # ...
}
```

### For Migrants:
```python
# Define population
df_migrants = df[df['migrate_status'] == 1].copy()

# Stratifications
stratify_vars = {
    'years_in_city': 'Years in Bangkok',  # <1, 1-5, >5
    'legal_status': 'Legal Status',
    'language': 'Thai Language Ability',
    'province_of_origin': 'Province of Origin',
}
```

---

## Python Script Template

**Save this as `equity_analysis_template.py`:**

```python
import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency, f_oneway

# ============================================================
# CONFIGURATION - MODIFY THIS SECTION
# ============================================================

# Population filter
POPULATION_NAME = "Elderly"
POPULATION_FILTER = lambda df: df['age'] >= 60

# Stratification variables (modify for your population)
STRATIFICATIONS = {
    'income_group': 'Income Level',
    'education_group': 'Education Level',
    'age_group': 'Age Group',
    'working': 'Working Status',
}

# Outcome variables
CATEGORICAL_OUTCOMES = {
    'medical_skip_1': 'Skip medical care',
    'food_insecurity_1': 'Food insecurity',
    # ... add more
}

CONTINUOUS_OUTCOMES = {
    'monthly_income': 'Monthly income (baht)',
    'bmi': 'Body Mass Index',
    # ... add more
}

OUTPUT_PREFIX = "elderly_equity"

# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv('public/data/survey_sampling.csv')
df_pop = POPULATION_FILTER(df).copy()

print(f"{POPULATION_NAME} sample: {len(df_pop)} respondents")

# ============================================================
# CREATE STRATIFICATION VARIABLES
# ============================================================

# Add your stratification creation code here
# Example:
# df_pop['income_group'] = pd.cut(df_pop['monthly_income'], ...)

# ============================================================
# STATISTICAL TESTING FUNCTIONS
# ============================================================

def chi_square_test(df, outcome_var, stratify_var):
    # [Copy function from above]
    pass

def anova_test(df, outcome_var, stratify_var):
    # [Copy function from above]
    pass

# ============================================================
# RUN TESTS
# ============================================================

all_results = []

# Test categorical outcomes
for outcome_var, outcome_label in CATEGORICAL_OUTCOMES.items():
    # [Copy loop from above]
    pass

# Test continuous outcomes
for outcome_var, outcome_label in CONTINUOUS_OUTCOMES.items():
    # [Copy loop from above]
    pass

# ============================================================
# SAVE RESULTS
# ============================================================

results_df = pd.DataFrame(all_results)
results_df.to_csv(f'{OUTPUT_PREFIX}_tests_all.csv', index=False)

significant_df = results_df[results_df['p_value'] < 0.05]
significant_df.to_csv(f'{OUTPUT_PREFIX}_tests_significant.csv', index=False)

print(f"Found {len(significant_df)} significant findings")
```

---

## Tips for Success

1. **Start small:** Test with 5-10 outcomes first, then expand
2. **Validate results:** Manually check a few crosstabs to verify percentages
3. **Context matters:** Always provide income ranges, sample sizes, benchmarks
4. **Tell the story:** Numbers alone don't persuade - explain WHY gaps exist
5. **Be policy-focused:** Every finding should suggest an action
6. **Acknowledge limitations:** Selection effects, cross-sectional data, survivor bias
7. **Use internal benchmarks:** "Best-performing group shows what's achievable"
8. **No jargon:** Write for policymakers, not statisticians
9. **No emojis:** Professional reports only
10. **Show your work:** Include sample sizes, p-values, effect sizes

---

## Files You'll Generate

For each population group analysis:

1. **`[population]_equity_descriptive.py`** - Analysis script
2. **`[population]_equity_tests_all.csv`** - All statistical tests
3. **`[population]_equity_tests_significant.csv`** - Significant findings only
4. **`[population]_equity_crosstabs.csv`** - Detailed percentages
5. **`[POPULATION]_EQUITY_REPORT.md`** - Final report (50-100 pages)

---

## Summary: The Logic

1. **Define population** (elderly, informal workers, etc.)
2. **Create stratifications** (split by income, education, age, etc.)
3. **Define outcomes** (healthcare, income, violence, etc.)
4. **Run statistical tests** (chi-square for binary, ANOVA for continuous)
5. **Filter to significant** (p < 0.05)
6. **Calculate equity gaps** (highest - lowest group)
7. **Generate crosstabs** (show actual percentages/means)
8. **Write report** (findings → interpretation → policy)

**Key insight:** Use the BEST-performing subgroup as your benchmark. If high-income elderly skip medical care at 4%, that's your achievable target. The 20-percentage-point gap (24% - 4%) is the equity problem to solve.

**This approach works because:**
- Clear storytelling (percentages, not odds ratios)
- Statistical proof (p-values, effect sizes)
- Internal benchmarks (no external data needed)
- Policy-focused (shows specific gaps to address)
- Replicable (same logic for any population)

---

**Questions for next population group:**
1. Who is the population? (filter criteria)
2. What inequalities do you want to examine? (stratifications)
3. What outcomes matter for this group? (health, economic, social)
4. What policies could address the gaps? (recommendations)

Good luck with your next analysis!
