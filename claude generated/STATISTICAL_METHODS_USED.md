# Statistical Methods Used in Equity Reports

**Purpose:** This document explains the statistical methods used in all equity reports (Elderly, LGBTQ+, Disabled, Informal Workers) to ensure transparency, reproducibility, and proper interpretation.

**Date:** 2025-11-17

---

## Overview: Our Analytical Approach

### What We're Testing

All equity reports use **descriptive stratified analysis with statistical testing** to:

1. **Split populations into subgroups** (low/middle/high income, age groups, education levels, etc.)
2. **Compare outcomes across subgroups** (healthcare access, income, chronic disease, etc.)
3. **Test if differences are statistically significant** (not due to random chance)
4. **Calculate equity gaps** (highest - lowest performing group)
5. **Measure effect sizes** (how strong is the relationship?)

### Why This Approach?

**We chose descriptive analysis over regression because:**
- **Easier to interpret:** Percentages (24% vs 4%) are clearer than odds ratios (OR=6.6)
- **Shows real-world patterns:** What actually happens, not "independent effects after controlling"
- **Policy-relevant:** Policymakers understand "1 in 4 low-income elderly skip care" better than "income β=-0.45, p<0.001"
- **Internal benchmarks:** Best-performing group shows what's achievable (no external data needed)

**We avoid correlation analysis because:**
- Correlation only shows association strength (-1 to +1)
- Doesn't show actual percentages or equity gaps
- No statistical testing for group differences
- Harder to translate into policy actions

---

## Statistical Tests Used

We use two main statistical tests depending on the type of outcome variable:

### 1. Chi-Square Test (χ²) - For Categorical Outcomes

#### When to Use
- **Binary outcomes:** Yes/No questions (e.g., skip medical care, has chronic disease, experienced violence)
- **Ordinal categories:** Ordered categories (e.g., smoking status: never/quit/occasional/regular; exercise frequency: 0/1-3/3-4/5+ days/week)
- **Nominal categories:** Unordered categories (e.g., occupation type, home ownership status)

#### What It Tests
Chi-square tests whether the **distribution of outcomes differs significantly** across groups.

**Null hypothesis (H₀):** The outcome distribution is the same across all groups
**Alternative hypothesis (H₁):** The outcome distribution differs across groups

#### How to Interpret
- **p-value < 0.05:** Groups are significantly different (reject null hypothesis)
- **p-value ≥ 0.05:** No significant difference (fail to reject null hypothesis)

#### Example from Reports

**Question:** Do low-income elderly skip medical care more than high-income elderly?

**Data:**
| Income Group | Skip Care | Don't Skip | Total |
|--------------|-----------|------------|-------|
| Low          | 117       | 369        | 486   |
| Middle       | 14        | 174        | 188   |
| High         | 8         | 181        | 189   |

**Test Results:**
- Chi-square = 53.0
- p < 0.001 (highly significant)
- Cramer's V = 0.25 (small-to-medium effect)

**Interpretation:** Yes, income level significantly affects whether elderly skip medical care. Low-income elderly skip care at 24.1% vs high-income 4.2% - a 5.7x difference.

#### Assumptions & Limitations
- **Minimum cell count:** Each cell should have ≥5 observations (we skip test if violated)
- **Independence:** Each observation should be independent (one person per row)
- **Sample size:** Need ≥30 total observations for reliable results

---

### 2. ANOVA (Analysis of Variance) - For Continuous Outcomes

#### When to Use
- **Continuous outcomes:** Numeric variables (e.g., monthly income, rent, health expenses, BMI, working hours)
- **Comparing 3+ groups:** ANOVA compares means across multiple groups simultaneously

#### What It Tests
ANOVA tests whether the **mean values differ significantly** across groups.

**Null hypothesis (H₀):** All groups have the same mean
**Alternative hypothesis (H₁):** At least one group has a different mean

#### How to Interpret
- **p-value < 0.05:** Group means are significantly different (reject null hypothesis)
- **p-value ≥ 0.05:** No significant difference in means (fail to reject null hypothesis)
- **F-statistic:** Ratio of between-group variance to within-group variance (larger F = more evidence of difference)

#### Example from Reports

**Question:** Does mean income differ by education level among elderly?

**Data:**
| Education | Mean Income | Median | SD | Sample Size |
|-----------|-------------|--------|----|-------------|
| Low       | 13,361 baht | 12,000 | 8,245 | 530 |
| Middle    | 15,071 baht | 12,000 | 9,182 | 130 |
| High      | 18,257 baht | 14,500 | 11,063 | 203 |

**Test Results:**
- ANOVA F = 21.2
- p < 0.001 (highly significant)
- Eta² = 0.05 (small effect)

**Interpretation:** Yes, education level significantly affects income. High-education elderly earn 4,896 baht more per month than low-education elderly.

#### Assumptions & Limitations
- **Normality:** Data should be approximately normally distributed (ANOVA is robust to violations with large samples)
- **Homogeneity of variance:** Groups should have similar variances (we report this if violated)
- **Independence:** Observations should be independent
- **Sample size:** Need ≥5 observations per group minimum

---

## Effect Size Measures

**Why we report effect sizes:**
- **P-value alone is misleading:** With large samples, tiny differences can be "significant" but meaningless
- **Effect size shows magnitude:** How strong is the relationship? How much does it matter in practice?
- **Policy relevance:** Large effect sizes indicate high-priority areas for intervention

### Cramer's V (for Chi-Square Tests)

**Formula:** V = √(χ² / (n × min(r-1, c-1)))

Where:
- χ² = chi-square statistic
- n = total sample size
- r = number of rows in crosstab
- c = number of columns in crosstab

**Interpretation Guidelines:**

| Cramer's V | Interpretation | Practical Meaning |
|------------|----------------|-------------------|
| **< 0.10** | Negligible | Very weak association, minimal practical importance |
| **0.10-0.30** | Small | Noticeable association, moderate practical importance |
| **0.30-0.50** | Medium | Strong association, high practical importance |
| **> 0.50** | Large | Very strong association, critical practical importance |

**Examples from Reports:**

| Finding | Cramer's V | Interpretation |
|---------|------------|----------------|
| Income → Skip medical care | 0.25 | Small-to-medium (important for policy) |
| Age → Work participation | 0.33 | Medium-to-large (strongest in elderly report) |
| Can work → Employment (disabled) | 0.63 | Large (fundamental divide) |
| Violence → LGBTQ+ status | 0.28 | Small-to-medium (serious crisis) |

**Note:** Small effects can still be policy-critical if they affect large populations or vulnerable groups.

---

### Eta-Squared (η²) - For ANOVA

**Formula:** η² = SS_between / SS_total

Where:
- SS_between = sum of squares between groups
- SS_total = total sum of squares

**Interpretation:** Proportion of variance in the outcome explained by the grouping variable.

**Interpretation Guidelines:**

| Eta² | Interpretation | Variance Explained | Practical Meaning |
|------|----------------|-------------------|-------------------|
| **< 0.01** | Negligible | <1% | Minimal practical importance |
| **0.01-0.06** | Small | 1-6% | Noticeable, moderate importance |
| **0.06-0.14** | Medium | 6-14% | Strong, high importance |
| **> 0.14** | Large | >14% | Very strong, critical importance |

**Examples from Reports:**

| Finding | Eta² | Variance Explained | Interpretation |
|---------|------|-------------------|----------------|
| Income group → Income | 0.64 | 64% | Large (by design - income groups created from income) |
| Education → Income (informal) | 0.05 | 5% | Small (education matters but other factors dominate) |
| Age → Income (disabled) | 0.17 | 17% | Large (age strongly determines disabled income) |
| Income level → Monthly income | 0.53 | 53% | Large (fundamental economic divide) |

**Note:** Low eta² doesn't mean unimportant - many factors influence outcomes, so even 5% explained variance can be policy-critical.

---

## P-Value Interpretation

### What P-Value Means

**P-value** = Probability of observing this difference (or more extreme) if there were truly NO difference between groups

**NOT:** Probability that the null hypothesis is true

### Significance Thresholds

| P-Value | Interpretation | Reporting Convention |
|---------|----------------|---------------------|
| **p < 0.001** | Highly significant | Report as "p < 0.001" (very strong evidence) |
| **p < 0.01** | Very significant | Report exact value (e.g., p = 0.003) |
| **p < 0.05** | Significant | Report exact value (e.g., p = 0.027) |
| **p ≥ 0.05** | Not significant | Report as "p = 0.XX (not significant)" |

### Why We Use p < 0.05

- **Convention:** Standard in social science, epidemiology, public health
- **Balance:** 5% false positive rate is acceptable for policy research
- **Conservative:** Reduces risk of claiming differences that don't exist

### Important Cautions

1. **P-value ≠ importance:** Small p-value doesn't mean large effect or policy importance
2. **Non-significance ≠ no difference:** May have insufficient sample size to detect real differences
3. **Multiple testing:** Running 100 tests, expect 5 false positives by chance (we report this limitation)

---

## Sample Size Considerations

### Minimum Sample Requirements

**For Chi-Square Tests:**
- Total sample: ≥30 observations
- Each cell in crosstab: ≥5 observations
- If violated: Skip test or combine categories

**For ANOVA:**
- Total sample: ≥30 observations
- Each group: ≥5 observations
- If violated: Skip test or note limitation

### How Sample Size Affects Results

| Sample Size | Effect on Analysis |
|-------------|-------------------|
| **Small (<50)** | Large differences needed for significance; wide confidence intervals |
| **Medium (50-500)** | Moderate differences detectable; reasonable precision |
| **Large (>500)** | Small differences become significant; narrow confidence intervals |

**Example:** In elderly report, some subgroups are small:
- Middle-income (n=188) - adequate but limited precision
- Old-old (n=416) - good sample size
- Government workers (n=7) - too small for reliable inference

---

## How We Report Results

### Standard Reporting Format

For each finding, we report:

1. **Descriptive statistics:**
   - Percentages with denominators (e.g., 24.1% = 117 out of 486)
   - Means with standard deviations (e.g., 13,361 ± 8,245 baht)
   - Sample sizes for each group

2. **Statistical test:**
   - Test type (Chi-square or ANOVA)
   - Test statistic value (χ² or F)
   - P-value (exact or < 0.001)
   - Effect size (Cramer's V or Eta²)

3. **Equity gap:**
   - Absolute difference (percentage points or baht)
   - Relative difference (X times more likely, X% higher)

4. **Interpretation:**
   - What the numbers mean in plain language
   - Why this pattern exists
   - What it means for policy

### Example: Complete Reporting

**Finding:** Income Creates 5.7x Gap in Medical Care Access

**Descriptive Statistics:**
| Income Group | Skip Medical Rate | Sample Size |
|--------------|-------------------|-------------|
| Low          | 24.1% (117/486)   | 486         |
| Middle       | 7.4% (14/188)     | 188         |
| High         | 4.2% (8/189)      | 189         |

**Statistical Test:**
- Chi-square = 53.0, p < 0.001, Cramer's V = 0.25 (small-to-medium effect)

**Equity Gap:**
- 19.8 percentage points (Low vs High)
- 5.7x relative risk (24.1% ÷ 4.2% = 5.7)

**Interpretation:**
Low-income elderly are 5.7 times more likely to skip medical care than high-income. This 20-percentage-point gap represents 600+ elderly who go without needed care. If all elderly had high-income access (4.2% benchmark), we could reduce skipped care by 20 percentage points.

---

## Internal Benchmarks Approach

### Why We Use Internal Benchmarks

**Problem:** No external "gold standard" for many indicators (e.g., what's the "correct" rate of skipping medical care for elderly?)

**Solution:** Use the **best-performing subgroup** as the "achievable target"

### How It Works

1. **Identify best-performing group:** Which subgroup has the best outcome?
2. **Use as benchmark:** This rate shows what's achievable within the population
3. **Calculate equity gap:** Difference between worst and best subgroups
4. **Interpret:** If all had the best rate, how much would outcomes improve?

### Example: Healthcare Access

**Best-performing group:** High-income elderly (4.2% skip care)

**Interpretation:** We know 4.2% is achievable because this group already achieves it. If we gave all elderly high-income-level healthcare access (through policy), we could reduce skipped care from 24.1% to 4.2% among low-income elderly.

### Advantages

- **Realistic:** Benchmark is proven achievable (someone already does it)
- **No external data needed:** Use what's in your dataset
- **Policy-focused:** Shows gap to close, not unrealistic ideal

### Limitations

- **Best ≠ optimal:** High-income group may still have problems (4.2% still skip care)
- **Contextual:** Best group may have advantages beyond the stratification variable
- **No causation:** Cannot prove that giving low-income money will achieve high-income outcomes

---

## Limitations & Cautions

### 1. Cross-Sectional Data (Cannot Prove Causation)

**What we have:** Snapshot at one point in time

**What we CAN say:** "Low-income elderly skip care more than high-income" (association)

**What we CANNOT say:** "Low income CAUSES skipped care" (causation)

**Why?** Could be:
- Low income → can't afford care (our interpretation)
- Poor health → job loss → low income → can't afford care (reverse causation)
- Third factor (e.g., education) → both low income AND poor health (confounding)

**How we address:** We acknowledge this limitation and use careful language ("associated with," "more likely to," not "caused by")

### 2. Survivor Bias

**Problem:** Sample only includes people alive and able to participate

**Effect:** True inequities may be larger than we measure

**Example:** Elderly who died before age 60 due to poverty are not in our sample - so poverty-health gap is underestimated

**How we address:** Note this limitation in reports; recognize findings are conservative estimates

### 3. Selection Effects

**Problem:** Groups may differ in unmeasured ways

**Example:** Working elderly are healthier (healthy worker effect) - not because work prevents disease, but because sick people cannot work

**How we address:** Explicitly interpret selection effects when present (e.g., "Cannot work due to illness" analysis shows 88% of disabled cite illness as barrier)

### 4. Multiple Testing

**Problem:** Running many tests increases false positive risk

**Calculation:** With 100 tests at p<0.05, expect 5 false positives by chance

**Our reports:**
- Elderly: 97 significant findings out of ~200 tests (49% significant - far above 5% random)
- LGBTQ+: 35 significant findings out of ~80 tests (44% significant)
- Disabled: 90 significant findings out of ~200 tests (45% significant)
- Informal: 81 significant findings out of ~180 tests (45% significant)

**How we address:** Report number of tests performed; high hit rate (45-49%) suggests findings are real, not random

### 5. Self-Reported Data

**Problem:** Responses may be biased

**Examples:**
- Income may be under-reported (tax evasion, stigma)
- Violence may be under-reported (shame, fear)
- Health status may be over/under-reported (varies by awareness)

**How we address:** Acknowledge limitation; assume bias is similar across groups (so comparisons still valid)

### 6. Small Sample Subgroups

**Problem:** Some subgroups have small sample sizes

**Effect:** Wide confidence intervals, low statistical power, unreliable estimates

**Examples:**
- Government workers in elderly report (n=7)
- LGBT in elderly report (n=5)
- Some middle-income groups (n<50)

**How we address:** Report sample sizes; note when subgroup is too small for reliable interpretation; skip test if n<30

---

## Quality Checks & Validation

### How We Ensure Accuracy

1. **Cross-validation:** Manually verify percentages match raw counts
2. **Logical consistency:** Check that gaps make sense (high-income should skip care less)
3. **Sample size checks:** Verify all groups meet minimum n requirements
4. **Effect size sanity checks:** Large p-value + large effect = insufficient power; small p-value + negligible effect = not important
5. **Multiple analysts:** Different people run same analyses to catch errors

### Red Flags We Watch For

- **Too many significant findings:** May indicate p-hacking or data errors
- **Contradictory results:** Different tests showing opposite patterns
- **Implausibly large effects:** Cramer's V > 0.80 (double-check data)
- **Percentage > 100%:** Data error or calculation mistake
- **Negative counts:** Impossible values indicate coding error

---

## Comparison to Other Methods

### Why Not Regression?

**Regression advantages:**
- Controls for confounders (isolates "independent" effects)
- Can test multiple predictors simultaneously
- Provides adjusted effect estimates

**Why we chose descriptive instead:**
- **Simpler interpretation:** Stakeholders understand "24% vs 4%" better than "β=-0.45, OR=6.6"
- **Shows real-world patterns:** What actually happens, not theoretical "controlling for X"
- **Policy focus:** Policymakers need actionable gaps, not academic coefficients
- **Internal benchmarks:** Can show achievable targets without complex modeling

**When regression is better:**
- Testing specific causal hypotheses
- Controlling for known confounders
- Academic publication requirements

### Why Not Correlation?

**Correlation (r) shows:**
- Strength of linear relationship (-1 to +1)
- Direction (positive or negative)

**Why we chose chi-square/ANOVA instead:**
- **Shows actual values:** Percentages and means, not just correlation coefficient
- **Statistical testing:** P-values for group differences
- **Equity gaps:** Absolute differences (20 percentage points) more policy-relevant than r=0.35
- **Non-linear relationships:** Can detect U-shaped or threshold effects

**When correlation is better:**
- Exploring relationships in continuous variables
- Quick screening of many variables
- Graphical presentation (scatterplots)

---

## Reproducibility

### Data & Code Availability

**Raw data:** `public/data/survey_sampling.csv`

**Analysis scripts:**
- `elderly_equity_statistical_tests.py` (if available)
- Analysis can be reproduced in Python, R, Stata, or Excel

**Key packages:**
- Python: `pandas`, `scipy.stats`, `numpy`
- R: `stats`, `dplyr`, `ggplot2`
- Stata: `tabulate`, `anova`, `esttab`

### Replication Steps

1. Load data from CSV
2. Filter to population of interest (e.g., age ≥ 60)
3. Create stratification variables (income groups, age groups, etc.)
4. Run chi-square tests for categorical outcomes
5. Run ANOVA for continuous outcomes
6. Calculate effect sizes (Cramer's V, Eta²)
7. Filter to p < 0.05
8. Calculate equity gaps
9. Generate crosstabs with percentages

---

## Summary: Key Principles

1. **Transparency:** Report all statistics (test, p-value, effect size, sample sizes)
2. **Interpretation:** Explain what numbers mean in plain language
3. **Caution:** Acknowledge limitations (cross-sectional, selection, bias)
4. **Policy focus:** Every finding linked to actionable recommendation
5. **Internal benchmarks:** Use best-performing group as achievable target
6. **Effect sizes matter:** P-value alone is not enough
7. **Show your work:** Percentages with denominators (117/486), not just percentages
8. **Context:** Provide comparisons, background, and explanations

---

## Further Reading

### Statistical Methods
- Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences*. (Effect size interpretation)
- Agresti, A. (2018). *An Introduction to Categorical Data Analysis*. (Chi-square tests)
- Field, A. (2013). *Discovering Statistics Using SPSS*. (Accessible statistics guide)

### Equity Analysis
- Braveman, P. (2006). "Health disparities and health equity." *Annual Review of Public Health*.
- Harper, S., & Lynch, J. (2007). "Methods for measuring cancer disparities." *Cancer Causes & Control*.

### Policy Research Methods
- Patton, M. Q. (2015). *Qualitative Research & Evaluation Methods*. (Interpretation and application)

---

## Contact & Questions

For questions about statistical methods used in these reports:
- Review this document first
- Check the methodology section in EQUITY_ANALYSIS_METHODOLOGY.md
- Refer to full reports for specific examples
- Verify calculations using raw data in `public/data/survey_sampling.csv`

**Remember:** Statistics are tools to answer policy questions. Always prioritize clear interpretation and actionable insights over statistical sophistication.
