# Statistical Methodology for Handling Unequal Sample Sizes

## Problem Statement

When comparing population characteristics (e.g., elderly percentage, education level) across Bangkok districts with **unequal sample sizes**, we face several statistical challenges:

1. **Precision varies**: Smaller samples have less precision (wider confidence intervals)
2. **Comparison validity**: Is a 10% difference between districts meaningful or just sampling error?
3. **Population inference**: How to generalize from volunteer-based samples to district populations?
4. **Unknown population parameters**: We don't have the actual population size of each demographic group by district

---

## Recommended Statistical Methodology for Project Report

### **Primary Recommendation: Confidence Intervals + Significance Testing**

Since you lack known population parameters for each group, use **inference-based methods** rather than weighting.

---

### **1. Report All Estimates with Confidence Intervals (REQUIRED)**

**Why**: Shows precision and accounts for different sample sizes

**How to Report**:
```
District A: Elderly population 50.0% (95% CI: 43.5%-56.5%, n=222)
District B: Elderly population 59.3% (95% CI: 49.8%-68.1%, n=108)
```

**Interpretation**:
- District A has narrower CI (more precise) due to larger sample
- CIs overlap, suggesting no significant difference despite 9.3% difference in point estimates

**Technical Note**: Use **Wilson Score Interval** (not normal approximation) as it's more accurate for:
- Small sample sizes (n<100)
- Extreme proportions (near 0% or 100%)

**Formula**:
```
Wilson Score CI = (p̂ + z²/2n ± z√(p̂(1-p̂)/n + z²/4n²)) / (1 + z²/n)

Where:
- p̂ = sample proportion
- n = sample size
- z = 1.96 (for 95% confidence)
```

**Example from Your Data**:
```
Sample Size Impact on Precision (Elderly Population):

District 1001:
  Sample size: 108
  Reliability: High
  Elderly: 59.3% (CI: 49.8-68.1%, MOE: 9.3%)

District 1009:
  Sample size: 222
  Reliability: High
  Elderly: 50.0% (CI: 43.5-56.5%, MOE: 6.6%)

District 1015:
  Sample size: 85
  Reliability: Medium
  Elderly: 24.7% (CI: 16.8-34.8%, MOE: 9.2%)
```

Notice: Larger samples (1009) have narrower CIs = more precise estimates

---

### **2. Use Chi-Square Tests for District Comparisons (REQUIRED)**

**When Comparing Two Districts**:

**Null Hypothesis (H₀)**: The proportion of elderly residents is equal in both districts

**Test Statistic**: Chi-square test of independence (or Fisher's exact test if any cell count < 5)

**Decision Rule**:
- p-value < 0.05 → Reject H₀ (significant difference)
- p-value ≥ 0.05 → Fail to reject H₀ (no significant difference)

**Example from Your Data**:
```
Comparing informal workers between districts 1009 and 1038:
- District 1009: 39.2% (87/222)
- District 1038: 50.6% (89/176)
- χ² = 4.702, p = 0.030 < 0.05
- Conclusion: Statistically significant difference detected
```

**Contingency Table**:
```
                Informal    Not Informal    Total
District 1009      87           135         222
District 1038      89            87         176
Total             176           222         398
```

**When to Use Fisher's Exact Test**:
If any expected cell count < 5, use Fisher's exact test instead of chi-square (more accurate for small samples)

---

### **3. Report Effect Sizes (Cohen's h) (RECOMMENDED)**

**Why**: Statistical significance ≠ practical importance

With large samples, tiny differences (e.g., 50.0% vs 50.5%) can be "statistically significant" but meaningless. Effect size shows if the difference is **practically important**.

**Cohen's h for Proportions**:
```
h = 2 × (arcsin√p₁ - arcsin√p₂)

Interpretation:
- |h| < 0.2      → Small effect (negligible)
- 0.2 ≤ |h| < 0.5 → Medium effect (moderate)
- |h| ≥ 0.5      → Large effect (substantial)
```

**Example from Your Data**:
```
District 1009 vs 1038 (informal workers):
- Difference: 11.4 percentage points
- Cohen's h = 0.229 (medium effect)
- Interpretation: Statistically significant with moderate practical difference
```

**Combined Interpretation Framework**:
| p-value | Effect Size | Interpretation |
|---------|-------------|----------------|
| < 0.05  | Large (h≥0.5) | **Meaningful difference** |
| < 0.05  | Medium (0.2≤h<0.5) | **Moderate difference** |
| < 0.05  | Small (h<0.2) | Statistically significant but **not practically important** |
| ≥ 0.05  | Any | **No evidence of difference** |

---

### **4. Establish Minimum Sample Size Threshold (REQUIRED)**

**Recommendation**: Use **n ≥ 30** as minimum for subgroup analysis

**Rationale**:
- Central Limit Theorem: n≥30 allows normal approximation
- Below n=30: Wide confidence intervals, unreliable estimates
- Survey research standard for stable estimates

**In Your Report**:
```
"District-level estimates are only reported for districts with
n ≥ 30 responses. Districts with smaller samples are flagged
as 'insufficient sample size' to prevent misleading conclusions."
```

**For Subgroup Analysis** (e.g., elderly education level in District A):
- Subgroup n ≥ 30: Report with confidence
- Subgroup n < 30: Report with "Low reliability" flag
- Subgroup n < 5: **Suppress** (too unreliable + privacy concerns)

**Reliability Classification**:
| Sample Size | Reliability | Typical MOE | Recommendation |
|-------------|-------------|-------------|----------------|
| n ≥ 100 | High | 5-10% | Report with confidence |
| 50 ≤ n < 100 | Medium | 10-15% | Report with caution note |
| 30 ≤ n < 50 | Low | 15-20% | Flag as "low reliability" |
| n < 30 | Very Low | >20% | Do not report or suppress |

---

### **5. Calculate and Report Margins of Error (RECOMMENDED)**

**Margin of Error (MOE)** at 95% confidence:
```
MOE = 1.96 × √(p(1-p)/n)
```

**Example**:
```
District with n=100, p=0.50:
MOE = 1.96 × √(0.50 × 0.50 / 100) = 9.8%

Report as: "50% ± 9.8%"
```

**MOE Interpretation**:
- MOE < 5%: High precision (excellent)
- MOE 5-10%: Moderate precision (acceptable for most purposes)
- MOE > 10%: Low precision (interpret with caution)

**Your Survey Status**:
```
Bangkok Health Dashboard Survey (6,523 responses across 50 districts):
- Districts with n ≥ 100 (High reliability): 49 districts
- Districts with 50 ≤ n < 100 (Medium reliability): 1 district
- Districts with n < 30 (Very low reliability): 0 districts

Average MOE for elderly percentage: 8.4%
Range: 6.6%-9.3% for high-reliability districts
```

**Conclusion**: Current sample sizes provide **acceptable precision** for district-level comparisons.

---

### **6. Design-Based vs Model-Based Inference (Choose One)**

Since you have a **convenience sample** (community volunteers, not random sampling), you have two options:

#### **Option A: Design-Based Inference (Conservative - RECOMMENDED)**

**Assumption**: Treat sample as representative of district population

**Limitation**: Cannot definitively generalize to all Bangkok residents

**When to Use**: If you believe volunteers are reasonably representative of district communities

**Report As**:
```
"Estimates represent the surveyed population in each district.
Generalizing to the entire district population assumes volunteers
are representative of district residents, which may not hold for
all demographic groups."
```

**Pros**:
- Simple, transparent
- No additional data required
- Standard approach for convenience samples

**Cons**:
- Cannot claim population-level inference without assumptions
- Must acknowledge sampling limitations

---

#### **Option B: Model-Based Inference with Post-Stratification (Advanced)**

**Approach**: Adjust sample weights to match known district demographics

**Requires**: District-level population data (age, sex distribution from census)

**How It Works**:
```
If your sample has 60% female but district census shows 52% female:
- Weight females by 52/60 = 0.867
- Weight males by 48/40 = 1.20

This adjusts sample to match known population distribution
```

**Example**:
```
District A Sample:
- Elderly: 60% (n=100)
- But sample overrepresents 70+ age group

Post-Stratification:
- Weight by actual age distribution from census
- Adjusted estimate: 55% elderly (more accurate)
```

**When to Use**:
- You have district age/sex data from census
- Sample demographics differ notably from known population

**Pros**:
- Corrects for sampling bias
- More defensible population inference
- Used in political polling, epidemiology

**Cons**:
- Requires external data
- More complex methodology
- Assumptions about missing data

**Recommendation**: Use post-stratification if you have district age/sex data from Bangkok census

---

### **7. Address Sampling Bias (REQUIRED for Rigor)**

**Your Sample**: Community volunteer-based (not probability random sample)

**Potential Biases**:
- Volunteers may over-represent:
  - Engaged community members
  - People with health concerns
  - Those with time to participate

- Under-represent:
  - Hard-to-reach populations (homeless, migrant workers)
  - Young working professionals
  - Privacy-conscious individuals

**How to Address in Report**:
```
"Limitations:

1. Convenience Sampling: This study used community volunteer networks
   rather than probability sampling. Results may not fully represent
   all district populations, particularly hard-to-reach groups.

2. Selection Bias: Volunteers may over-represent engaged community
   members and under-represent transient populations.

3. Confidence Intervals: Statistical confidence intervals assume
   random sampling within districts. Actual coverage may differ
   due to convenience sampling.

4. Generalizability: Results should be interpreted as indicative of
   surveyed communities, not definitive district-wide estimates.

5. Comparison Validity: District comparisons assume similar sampling
   mechanisms across districts. Differences may reflect sampling
   variation as well as true population differences."
```

**Best Practice**:
If you have district age/sex data from census, **compare your sample distribution** to assess representativeness:

```python
# Example comparison
District 1009:
  Sample:     22% age 60+
  Census:     18% age 60+
  Conclusion: Sample slightly overrepresents elderly
```

---

## **Final Recommendation for Your Report**

### **Use This Statistical Framework**:

1. ✅ **Report all percentages with 95% Confidence Intervals**
   - Shows precision
   - Accounts for unequal sample sizes
   - Transparent about uncertainty

2. ✅ **Use Chi-Square Tests for all district comparisons**
   - Standard method in public health
   - Handles unequal sample sizes correctly
   - Widely accepted in peer-reviewed research

3. ✅ **Report Cohen's h effect sizes alongside p-values**
   - Distinguishes statistical vs practical significance
   - Shows magnitude of differences
   - Prevents over-interpretation of trivial differences

4. ✅ **Flag districts with n < 30 as "insufficient sample"**
   - Prevents misleading conclusions
   - Follows survey research standards
   - Transparent about data quality

5. ✅ **Acknowledge sampling limitations**
   - Volunteer-based sampling
   - Cannot assume perfect representativeness
   - Results are indicative, not definitive

6. ⭐ **Optional: Use post-stratification if you have census data**
   - Adjusts for age/sex imbalances
   - Improves population inference
   - More rigorous and defensible

---

## **Sample Text for Your Project Report**

### Statistical Methodology

#### Sampling Design
This study collected 6,523 health survey responses across 50 Bangkok districts using community volunteer networks (mean = 130 responses per district, range = 85-222). Due to the convenience sampling approach, results represent surveyed communities rather than probability-based district-wide estimates.

#### Statistical Analysis

**Confidence Intervals**: All population proportions are reported with 95% confidence intervals using the Wilson Score method (Wilson, 1927), which provides accurate coverage for small to moderate sample sizes and extreme proportions.

**District Comparisons**: Chi-square tests of independence were used to compare proportions between districts, with Fisher's exact test applied when expected cell counts fell below 5. Statistical significance was set at α = 0.05 (two-tailed).

**Effect Sizes**: Cohen's h was calculated to assess the practical magnitude of differences (Cohen, 1988), with |h| ≥ 0.2 considered a moderate effect and |h| ≥ 0.5 a large effect. This prevents over-interpretation of statistically significant but trivial differences.

**Minimum Sample Size**: District-level estimates are only reported for districts with n ≥ 30 responses to ensure adequate precision. Subgroup analyses (e.g., elderly education level within districts) required subgroup n ≥ 30; estimates based on fewer than 5 observations were suppressed to protect privacy and prevent unreliable conclusions.

**Margin of Error**: The average margin of error for district-level elderly population estimates was 8.4% (range: 6.6%-9.3% for districts with n ≥ 100), indicating acceptable precision for comparative analysis.

#### Reliability Classification
Districts were classified by sample size:
- High reliability (n ≥ 100): 49 districts
- Medium reliability (50 ≤ n < 100): 1 district
- Low reliability (n < 30): 0 districts

#### Limitations
1. **Convenience Sampling**: Community volunteer recruitment may introduce selection bias. Participants may not fully represent all district populations, particularly hard-to-reach groups (e.g., homeless, migrant workers, young professionals).

2. **Selection Bias**: Volunteers may over-represent engaged community members with health concerns or free time, potentially affecting prevalence estimates.

3. **Inference Validity**: Confidence intervals assume random sampling within districts. Actual coverage may differ due to non-probability sampling.

4. **Generalizability**: Results should be interpreted as indicative trends within surveyed communities rather than definitive district-wide population parameters.

5. **Comparison Validity**: District comparisons assume similar volunteer recruitment mechanisms across districts. Observed differences may reflect both true population differences and sampling variation.

---

## **Why This Methodology is Statistically Sound**

✅ **Handles unequal sample sizes correctly**
   - Confidence intervals and chi-square tests inherently account for different n
   - Wilson Score method is robust for small samples

✅ **Transparent about uncertainty**
   - CIs show precision varies by sample size
   - Margin of error quantifies estimate reliability

✅ **Statistically rigorous**
   - Uses standard survey research methods (Wilson CI, chi-square tests, effect sizes)
   - Follows best practices from epidemiology and social science

✅ **Practically interpretable**
   - Effect sizes show if differences matter in real-world terms
   - Not just "statistically significant" but "how significant?"

✅ **Defensible in peer review**
   - Acknowledges limitations of convenience sampling
   - Appropriate caveats on generalizability
   - Standard methods widely accepted in public health research

✅ **Widely accepted**
   - Used in epidemiology, public health, survey research
   - Follows AAPOR (American Association for Public Opinion Research) guidelines
   - Comparable to methods in published health surveys

---

## **Generated Analysis Files**

Your Python scripts (`generate_population_analysis.py` and `generate_statistical_analysis.py`) produce:

### 1. **district_statistics_with_ci.csv**
Contains for each district:
- Sample size and reliability classification
- For each population group (general, LGBT+, elderly, disabled, informal):
  - Percentage
  - 95% CI lower bound
  - 95% CI upper bound
  - Margin of error

**Use for**: Reporting district estimates with uncertainty quantification

### 2. **example_district_comparisons.csv**
Shows statistical comparison between two districts across all population groups:
- Test used (Chi-Square or Fisher's Exact)
- Chi-square statistic
- p-value
- Statistical significance (Yes/No)
- Cohen's h effect size
- Human-readable interpretation

**Use for**: Understanding how to interpret statistical tests

### 3. **elderly_pairwise_comparisons.csv**
All 1,225 pairwise comparisons between districts for elderly population:
- Identifies which district pairs differ significantly
- Includes p-values, effect sizes, and interpretations

**Use for**: Finding districts with significantly different elderly populations

### 4. **citywide_weighted_estimates.csv**
Population-weighted citywide estimates accounting for district size:
- Uses district population data as weights
- Provides more accurate Bangkok-wide estimates

**Use for**: Reporting overall Bangkok population percentages

### 5. **population_summary_by_district.csv**
Complete district-level breakdown with counts, percentages, and response categories:
- Total responses per district
- Counts and percentages for all population groups
- Response category classification (High/Medium/Low)

**Use for**: Descriptive statistics and overview tables

---

## **Practical Workflow for District Comparisons**

### Step-by-Step Guide:

**Step 1: Check Sample Sizes**
- Both districts have n ≥ 30? → Proceed
- Either n < 30? → Flag as unreliable, interpret with extreme caution

**Step 2: Examine Confidence Intervals**
- Do CIs overlap substantially? → No significant difference (stop here)
- No overlap or minimal overlap? → Likely significant (proceed to Step 3)

**Step 3: Check Statistical Test**
- Look at p-value from chi-square/Fisher's exact test
- p < 0.05? → Statistically significant
- p ≥ 0.05? → Not significant (difference could be due to sampling variation)

**Step 4: Assess Practical Importance**
- Look at Cohen's h effect size
- |h| < 0.2? → Small effect (may not matter practically)
- |h| ≥ 0.2? → Moderate-to-large effect (meaningful difference)

**Step 5: Report Findings**
```
✓ GOOD EXAMPLE:
"District A has 50.0% ± 9.1% elderly residents compared to
District B's 60.0% ± 4.2% (χ² = 4.51, p = 0.034, Cohen's h = 0.21).
This represents a statistically significant difference with moderate
practical importance."

✗ BAD EXAMPLE:
"District A has 50% elderly vs District B 60% elderly."
(No uncertainty, no significance test, no context)
```

---

## **References and Further Reading**

### Statistical Methods
- Wilson, E.B. (1927). "Probable inference, the law of succession, and statistical inference". *Journal of the American Statistical Association*, 22(158), 209-212.
- Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences* (2nd ed.). Lawrence Erlbaum Associates.
- Agresti, A., & Coull, B.A. (1998). "Approximate is better than 'exact' for interval estimation of binomial proportions". *The American Statistician*, 52(2), 119-126.

### Sample Size Calculation
- Cochran, W.G. (1977). *Sampling Techniques* (3rd ed.). John Wiley & Sons.
- For proportions: n = (Z²×p×(1-p)) / E²
  - Z = 1.96 (95% confidence)
  - p = expected proportion
  - E = desired margin of error

### Survey Methodology
- Groves, R.M., Fowler, F.J., Couper, M.P., Lepkowski, J.M., Singer, E., & Tourangeau, R. (2009). *Survey Methodology* (2nd ed.). John Wiley & Sons.
- American Association for Public Opinion Research (AAPOR). (2016). *Standard Definitions: Final Dispositions of Case Codes and Outcome Rates for Surveys* (9th ed.).

### Post-Stratification
- Gelman, A., & Little, T.C. (1997). "Poststratification into many categories using hierarchical logistic regression". *Survey Methodology*, 23(2), 127-135.

---

## **Summary**

**Key Principles for Your Report**:

1. ✅ **Always report confidence intervals** or margins of error
2. ✅ **Test for statistical significance** before claiming differences
3. ✅ **Assess practical significance** using effect sizes
4. ✅ **Flag small samples** (n<30) as unreliable
5. ✅ **Acknowledge sampling limitations** (convenience sampling)
6. ✅ **Report both estimate AND uncertainty**: "50% ± 9%" not just "50%"
7. ✅ **Use population weights** for citywide estimates (if available)

**This ensures your analysis is**:
- Statistically rigorous and defensible
- Transparent about limitations
- Appropriate for academic, policy, or public health contexts
- Comparable to published health survey research

---

**Last Updated**: 2025-01-08
**Analysis Scripts**: `generate_population_analysis.py`, `generate_statistical_analysis.py`
**Survey Data**: 6,523 responses across 50 Bangkok districts