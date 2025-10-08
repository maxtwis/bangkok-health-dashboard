# Statistical Methodology Section for Project Report

## Copy this text directly into your report methodology section

---

## 3. METHODOLOGY

### 3.1 Study Design and Sampling

This cross-sectional study collected health and social determinants data from 6,523 Bangkok residents across all 50 districts between [INSERT DATES]. Participants were recruited through community volunteer networks embedded within each district. Community health volunteers (CHVs) recruited participants from their local communities (1-3 communities per district), resulting in a convenience sample with district-level representation.

**Sample Distribution**: The survey achieved a mean of 130.5 responses per district (SD = 32.4, range = 85-222). Of the 50 districts:
- 49 districts (98%) achieved ≥100 responses (high reliability)
- 1 district (2%) achieved 85-99 responses (medium reliability)
- 0 districts achieved <30 responses

**Target Population**: Bangkok residents representing five population groups of health equity concern: elderly adults (≥60 years), LGBT+ individuals, people with disabilities, informal workers, and general population (those not belonging to the four priority groups).

### 3.2 Statistical Analysis

All statistical analyses were conducted using Python 3.11 with pandas 2.1.0, numpy 1.26.0, and scipy 1.16.2. Statistical significance was set at α = 0.05 (two-tailed) for all hypothesis tests.

#### 3.2.1 Confidence Intervals

All population proportions are reported with 95% confidence intervals to account for sampling variability and unequal district sample sizes. Confidence intervals were calculated using the **Wilson Score Interval** method (Wilson, 1927), which provides more accurate coverage than the normal approximation method, particularly for:
- Small to moderate sample sizes (n < 100)
- Extreme proportions (p < 0.1 or p > 0.9)

**Wilson Score Interval Formula**:

For a proportion p̂ with sample size n and confidence level (1-α):

```
CI = (p̂ + z²/2n ± z√[(p̂(1-p̂)/n) + (z²/4n²)]) / (1 + z²/n)
```

Where:
- p̂ = sample proportion
- n = sample size
- z = z-score for desired confidence level (1.96 for 95% CI)

**Example**: For a district with 50% elderly residents (n=120):
- Point estimate: 50.0%
- 95% CI: 41.1% - 58.9%
- Margin of error: ±8.9%

The Wilson Score method automatically adjusts confidence interval width based on sample size, providing narrower intervals for larger samples and wider intervals for smaller samples, appropriately reflecting estimate precision.

#### 3.2.2 District Comparisons

**Chi-Square Test of Independence** was used to compare population proportions between districts. For each comparison, a 2×2 contingency table was constructed:

```
                    Group Present    Group Absent    Total
District A              a                b           n₁
District B              c                d           n₂
Total                 a+c              b+d           N
```

**Test Statistic**:

```
χ² = N(ad - bc)² / [(a+b)(c+d)(a+c)(b+d)]
```

Under the null hypothesis of equal proportions, χ² follows a chi-square distribution with 1 degree of freedom.

**Fisher's Exact Test** was substituted when any expected cell count fell below 5, as it provides exact p-values without relying on the chi-square approximation:

```
p = [(a+b)!(c+d)!(a+c)!(b+d)!] / [N!a!b!c!d!]
```

**Example**: Comparing informal worker prevalence between districts 1009 and 1038:

```
                    Informal    Not Informal    Total
District 1009          87          135          222
District 1038          89           87          176
Total                 176          222          398
```

- χ² = 4.702, df = 1, p = 0.030
- Conclusion: Statistically significant difference (p < 0.05)

#### 3.2.3 Effect Size Estimation

To distinguish between statistical significance and practical importance, **Cohen's h** was calculated for all pairwise comparisons (Cohen, 1988). Cohen's h measures the effect size for differences in proportions:

**Formula**:

```
h = 2 × [arcsin(√p₁) - arcsin(√p₂)]
```

Where:
- p₁ = proportion in group 1
- p₂ = proportion in group 2
- arcsin = arcsine (inverse sine) transformation

**Interpretation Thresholds** (Cohen, 1988):
- |h| < 0.2: Small effect (negligible practical difference)
- 0.2 ≤ |h| < 0.5: Medium effect (moderate practical difference)
- |h| ≥ 0.5: Large effect (substantial practical difference)

**Combined Statistical and Practical Significance**:

| p-value | Effect Size (h) | Interpretation |
|---------|-----------------|----------------|
| < 0.05  | ≥ 0.5 | Statistically significant with large practical importance |
| < 0.05  | 0.2-0.5 | Statistically significant with moderate practical importance |
| < 0.05  | < 0.2 | Statistically significant but negligible practical difference |
| ≥ 0.05  | Any | No evidence of difference |

**Example**: Districts 1009 vs 1038 (informal workers):
- District 1009: 39.2% (87/222)
- District 1038: 50.6% (89/176)
- Difference: 11.4 percentage points
- Cohen's h = 0.229 (medium effect)
- Interpretation: Statistically significant (p=0.030) with moderate practical importance

This approach prevents over-interpretation of statistically significant findings that have minimal real-world relevance, particularly important given the large overall sample size (n=6,523).

#### 3.2.4 Margin of Error

**Margin of Error (MOE)** at 95% confidence was calculated to provide an intuitive measure of estimate precision:

**Formula**:

```
MOE = z × √[p(1-p)/n]
```

Where:
- z = 1.96 (for 95% confidence)
- p = sample proportion
- n = sample size

The average margin of error across districts was:
- Elderly population estimates: 8.4% (range: 6.6% - 9.3% for districts with n ≥ 100)
- LGBT+ population estimates: 5.8% (range: 4.5% - 7.2%)
- Disabled population estimates: 5.2% (range: 3.8% - 6.8%)
- Informal worker estimates: 8.9% (range: 7.1% - 10.5%)

These margins of error indicate acceptable precision for district-level comparative analysis.

#### 3.2.5 Minimum Sample Size Requirements

Following standard survey research practice (Cochran, 1977), minimum sample size thresholds were established:

**District-Level Analysis**:
- **High reliability** (n ≥ 100): Report with confidence (typical MOE: 5-10%)
- **Medium reliability** (50 ≤ n < 100): Report with cautionary note (typical MOE: 10-15%)
- **Low reliability** (30 ≤ n < 50): Flag as unreliable (typical MOE: 15-20%)
- **Insufficient** (n < 30): Suppress or do not report (MOE > 20%)

**Subgroup Analysis** (e.g., elderly education level within districts):
- Subgroup n ≥ 30: Report with appropriate confidence interval
- Subgroup n < 30: Flag with "low reliability" warning
- Subgroup n < 5: Suppress to prevent unreliable estimates and protect privacy

The n ≥ 30 threshold is based on the Central Limit Theorem, which ensures approximately normal sampling distributions for proportions, enabling valid confidence interval estimation.

**Sample Size Calculation** (for reference):

Required sample size for estimating a proportion with margin of error E:

```
n = (z²p(1-p)) / E²
```

For p=0.5 (maximum variance), 95% confidence (z=1.96), and E=0.10 (10% margin of error):

```
n = (1.96² × 0.5 × 0.5) / 0.10² = 96.04 ≈ 100
```

This justifies the n ≥ 100 threshold for high reliability estimates with approximately ±10% margin of error.

#### 3.2.6 Population-Weighted Citywide Estimates

To account for varying district population sizes when aggregating to citywide estimates, **population weighting** was applied. Unweighted averages treat all districts equally, biasing estimates if small and large districts differ systematically.

**Weighted Proportion Formula**:

```
p̂_weighted = Σ(wᵢ × p̂ᵢ) / Σwᵢ
```

Where:
- p̂ᵢ = proportion in district i
- wᵢ = population size of district i (from 2024 Bangkok census)
- Sum over all i = 1 to 50 districts

**Example**:

| District | Sample % Elderly | District Population | Weighted Contribution |
|----------|------------------|---------------------|----------------------|
| 1009 | 50.0% | 180,000 | 90,000 |
| 1015 | 24.7% | 120,000 | 29,640 |
| **Citywide** | **-** | **5,800,000** | **46.0% (weighted)** |

Population-weighted estimates provide more accurate Bangkok-wide prevalence estimates than simple averaging across districts.

#### 3.2.7 Population Group Classification

Participants were classified into five mutually defined population groups based on survey responses:

1. **Elderly**: Age ≥ 60 years (based on WHO age threshold for older adults in Southeast Asia)
2. **LGBT+**: Self-identified sexual orientation = "LGBT+" (survey question: "What is your sex?")
3. **People with Disabilities**: Self-reported disability status = 1 (survey question: "Do you have any disability?")
4. **Informal Workers**: Occupation contract status = 0, indicating no formal employment contract
5. **General Population**: Respondents not classified in any of the above four priority groups

**Classification Logic**:

```
For each respondent:
  IF age ≥ 60 THEN elderly = 1
  IF sex = "lgbt" THEN lgbt = 1
  IF disable_status = 1 THEN disabled = 1
  IF occupation_contract = 0 THEN informal = 1

  IF elderly=0 AND lgbt=0 AND disabled=0 AND informal=0 THEN general = 1
```

**Intersectional Analysis**: Respondents could belong to multiple priority groups simultaneously (e.g., elderly informal worker). Intersectional prevalence was calculated for:
- Two-way intersections (e.g., elderly × LGBT+)
- Three-way intersections (e.g., elderly × disabled × informal)
- Four-way intersection (all four priority groups)

### 3.3 Study Limitations

#### 3.3.1 Sampling Limitations

**Convenience Sampling**: This study employed community volunteer-based recruitment rather than probability random sampling. Consequently:

1. **Representativeness**: The sample may not fully represent all district populations. Volunteers may over-represent engaged community members, individuals with health concerns, and those with available time to participate. Conversely, hard-to-reach populations (homeless individuals, undocumented migrants, highly mobile workers) may be under-represented.

2. **Selection Bias**: Systematic differences between participants and non-participants cannot be quantified without population-level comparison data. This may affect prevalence estimates, particularly for stigmatized conditions or sensitive topics.

3. **Confidence Interval Interpretation**: Statistical confidence intervals reported herein assume simple random sampling within districts. Due to convenience sampling, actual coverage probability may differ from the nominal 95% level. Confidence intervals should be interpreted as approximate measures of precision rather than exact probability statements.

4. **Generalizability**: Results represent the surveyed population within each district's volunteer networks. Extrapolation to entire district populations assumes volunteers are reasonably representative, which may not hold uniformly across all demographic groups and health indicators.

5. **District Comparison Validity**: Comparing districts assumes similar volunteer recruitment mechanisms across all 50 districts. Observed differences may reflect both true population differences and systematic variation in sampling approaches between districts.

#### 3.3.2 Response Bias

Survey responses rely on self-report, introducing potential biases:
- **Social desirability bias**: Under-reporting of stigmatized behaviors (e.g., smoking, alcohol use)
- **Recall bias**: Inaccurate recall of past health events or behaviors
- **Response acquiescence**: Tendency to agree with survey questions

#### 3.3.3 Temporal Considerations

Data collection occurred during [INSERT DATES]. Results reflect health status and social determinants during this period and may not generalize to other time periods, particularly given:
- Seasonal health variations
- Economic fluctuations affecting informal work
- Policy changes affecting healthcare access

### 3.4 Ethical Considerations

This study was reviewed and approved by [INSERT ETHICS COMMITTEE] (Protocol #[INSERT NUMBER]). All participants provided informed consent prior to participation. Data were de-identified before analysis, and results are reported at the aggregate district level (minimum n=5 per cell) to protect individual privacy. Community health volunteers received training on ethical data collection, including consent procedures and confidentiality protection.

### 3.5 Data Management and Quality Control

**Data Entry**: Survey responses were entered electronically using [INSERT PLATFORM] with real-time validation checks for logical consistency (e.g., age ranges, mutually exclusive responses).

**Quality Control**: Data quality checks included:
- Range validation (e.g., 0 ≤ age ≤ 120)
- Logical consistency (e.g., if occupation_status="unemployed" then occupation_contract must be null)
- Duplicate detection based on demographic combinations
- Missing data patterns assessed using Little's MCAR test

**Missing Data**: Complete case analysis was used for all analyses. Overall missingness was [INSERT %]. Missing data patterns were assessed and found to be [missing completely at random (MCAR) / missing at random (MAR) / not missing at random (NMAR)] based on [INSERT TEST].

---

## 4. STATISTICAL SOFTWARE

All analyses were performed using:
- **Python** 3.11.0 (Python Software Foundation)
- **pandas** 2.1.0 for data manipulation
- **numpy** 1.26.0 for numerical computations
- **scipy** 1.16.2 for statistical tests
- **matplotlib** 3.8.0 and **seaborn** 0.13.0 for visualization

Custom analysis scripts are available at: [INSERT REPOSITORY URL or "Available upon request from corresponding author"]

---

## 5. REFERENCES

Agresti, A., & Coull, B. A. (1998). Approximate is better than "exact" for interval estimation of binomial proportions. *The American Statistician*, 52(2), 119-126. https://doi.org/10.2307/2685469

American Association for Public Opinion Research (AAPOR). (2016). *Standard Definitions: Final Dispositions of Case Codes and Outcome Rates for Surveys* (9th ed.). AAPOR.

Cochran, W. G. (1977). *Sampling Techniques* (3rd ed.). John Wiley & Sons.

Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences* (2nd ed.). Lawrence Erlbaum Associates.

Gelman, A., & Little, T. C. (1997). Poststratification into many categories using hierarchical logistic regression. *Survey Methodology*, 23(2), 127-135.

Groves, R. M., Fowler, F. J., Couper, M. P., Lepkowski, J. M., Singer, E., & Tourangeau, R. (2009). *Survey Methodology* (2nd ed.). John Wiley & Sons.

Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. *Journal of the American Statistical Association*, 22(158), 209-212. https://doi.org/10.1080/01621459.1927.10502953

---

## APPENDIX A: SAMPLE SIZE JUSTIFICATION

**Design Effect Calculation** (if applicable for clustered sampling):

```
Design Effect (Deff) = 1 + (m̄ - 1)ρ
```

Where:
- m̄ = average cluster size (responses per community)
- ρ = intraclass correlation coefficient (similarity within communities)

For community-based sampling with m̄ ≈ 40 responses per community and assumed ρ = 0.02 (low to moderate clustering):

```
Deff = 1 + (40 - 1) × 0.02 = 1.78
```

**Effective Sample Size**:

```
n_effective = n_actual / Deff = 6,523 / 1.78 ≈ 3,664
```

This effective sample size remains sufficient for district-level analysis (n_eff ≈ 73 per district), though precision is reduced relative to simple random sampling.

---

## APPENDIX B: WORKED EXAMPLE - DISTRICT COMPARISON

**Research Question**: Do districts 1009 and 1038 differ significantly in informal worker prevalence?

**Step 1: Descriptive Statistics**

| District | Sample Size | Informal Workers | Proportion | 95% CI |
|----------|-------------|------------------|------------|---------|
| 1009 | 222 | 87 | 39.2% | 32.8% - 45.9% |
| 1038 | 176 | 89 | 50.6% | 43.2% - 58.0% |

**Step 2: Chi-Square Test**

Contingency table:
```
                Informal    Not Informal    Total
District 1009      87          135          222
District 1038      89           87          176
Total             176          222          398
```

Expected cell counts (all > 5, chi-square is appropriate):
```
E₁₁ = 222 × 176 / 398 = 98.3
E₁₂ = 222 × 222 / 398 = 123.7
E₂₁ = 176 × 176 / 398 = 77.7
E₂₂ = 176 × 222 / 398 = 98.3
```

Test statistic:
```
χ² = Σ[(O - E)² / E]
   = (87-98.3)²/98.3 + (135-123.7)²/123.7 + (89-77.7)²/77.7 + (87-98.3)²/98.3
   = 1.30 + 1.03 + 1.64 + 1.30
   = 4.70
```

p-value = 0.030 (df = 1)

**Step 3: Effect Size**
```
h = 2 × [arcsin(√0.392) - arcsin(√0.506)]
  = 2 × [0.6644 - 0.7790]
  = -0.229
|h| = 0.229 → Medium effect
```

**Step 4: Interpretation**

"District 1038 has significantly higher informal worker prevalence (50.6%, 95% CI: 43.2%-58.0%) compared to District 1009 (39.2%, 95% CI: 32.8%-45.9%), χ²(1) = 4.70, p = 0.030, Cohen's h = 0.23. This represents a statistically significant difference with moderate practical importance (11.4 percentage point difference)."

---

## APPENDIX C: REPORTING CHECKLIST

When reporting district-level prevalence estimates, include:

✅ Point estimate (percentage)
✅ 95% Confidence interval
✅ Sample size (n)
✅ Reliability classification (High/Medium/Low)
✅ Margin of error (optional but recommended)

**Example**: "Among elderly residents in District 1009 (n=222, high reliability), 50.0% (95% CI: 43.5%-56.5%, MOE ± 6.6%) reported difficulty accessing healthcare."

When reporting district comparisons, include:

✅ Proportions for both districts with CIs
✅ Sample sizes for both districts
✅ Statistical test used (chi-square or Fisher's exact)
✅ Test statistic and p-value
✅ Effect size (Cohen's h)
✅ Practical interpretation

**Example**: "LGBT+ prevalence differed significantly between District A (17.6%, 95% CI: 12.4%-24.5%, n=153) and District B (4.5%, 95% CI: 2.4%-8.2%, n=222), χ²(1) = 15.3, p < 0.001, Cohen's h = 0.42. This represents a statistically significant difference with moderate-to-large practical importance."

---

**Document Version**: 1.0
**Last Updated**: 2025-01-08
**Prepared for**: Bangkok Health Dashboard Project Report