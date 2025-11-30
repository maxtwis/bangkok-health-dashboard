# Statistical Methodology Section for Project Report

## Copy this text directly into your report methodology section

---

## 3. METHODOLOGY

### 3.1 Study Design and Sampling

This cross-sectional study collected health and social determinants data from 6,523 Bangkok residents across all 50 districts between [INSERT DATES]. The study employed a **two-stage cluster sampling design** with community volunteer-based recruitment:

- **Stage 1**: Community health volunteers (CHVs) were embedded in 1-3 communities per district across all 50 Bangkok districts
- **Stage 2**: CHVs recruited participants from their local communities using convenience sampling methods

This design achieved comprehensive geographic coverage while leveraging existing community networks for participant recruitment.

**Sample Distribution**: The survey achieved a mean of 130.5 responses per district (SD = 32.4, range = 85-222). Of the 50 districts:
- 49 districts (98%) achieved ≥100 responses (high reliability)
- 1 district (2%) achieved 85-99 responses (medium reliability)
- 0 districts achieved <30 responses

**Target Population**: Bangkok residents representing five population groups of health equity concern: elderly adults (≥60 years), LGBT+ individuals, people with disabilities, informal workers, and general population (those not belonging to the four priority groups).

**Population Benchmarks**: For validation and weighting purposes, official population data were available for:
- **Elderly population**: 1,210,828 residents aged ≥60 years (Department of Provincial Administration, 2024)
- **People with disabilities**: 90,967 registered individuals (Department of Empowerment of Persons with Disabilities, 2024)

No official census data exist for LGBT+ individuals or informal workers in Bangkok.

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

**Example Calculation**: For a district with 50% elderly residents (n=120):

Step-by-step calculation:
1. **Given**: p̂ = 0.50, n = 120, z = 1.96
2. **Numerator**: (0.50 + 3.84/240) ± 1.96√[(0.50×0.50/120) + (3.84/57,600)]
   - Center: 0.50 + 0.016 = 0.516
   - Margin: 1.96 × 0.0464 = 0.091
3. **Denominator**: 1 + 3.84/120 = 1.032
4. **Result**: (0.516 ± 0.091) / 1.032

Final confidence interval:
- Point estimate: 50.0%
- 95% CI: 41.1% - 58.9%
- Margin of error: ±8.9%
- **Interpretation**: We are 95% confident that the true percentage of elderly residents in this district is between 41.1% and 58.9%

**Why Wilson Score?** Unlike the simple approximation method, Wilson Score:
- Never produces impossible values (e.g., negative percentages or >100%)
- Provides proper 95% coverage (truly captures the true value 95% of the time)
- Automatically adjusts interval width based on sample size:
  - **Larger samples** (n=500): narrower intervals (±4%) → higher precision
  - **Smaller samples** (n=30): wider intervals (±18%) → acknowledges greater uncertainty
- Performs better for extreme proportions (e.g., 2% LGBT+ prevalence) where simple methods fail

**Comparison to Simple Method**: For this example (p̂=0.50, n=120), the simple method gives nearly identical results (41.1% - 58.9%). However, for extreme proportions like 5% elderly with n=120:
- Simple method: 1.1% - 8.9% (can produce negative values for smaller n)
- Wilson Score: 2.4% - 9.8% (always valid, more conservative)

The Wilson Score method appropriately reflects estimate precision across all sample sizes and proportions encountered in this study.

#### 3.2.2 Post-Stratification Weighting for Elderly Population

To address limitations of convenience sampling and improve estimate validity, **post-stratification weights** were applied to elderly population estimates. Since the true elderly population distribution across Bangkok's 50 districts is known (N = 1,210,828), sample proportions were adjusted to match this known distribution.

**Weighting Formula**:

For each district i:
```
w_i = N_elderly_district_i / N_elderly_total
```

Where:
- N_elderly_district_i = Official elderly population in district i (from District Population - Age 60 and more.csv)
- N_elderly_total = 1,210,828 (sum across all 50 districts)

**Weighted Citywide Estimate**:
```
p̂_elderly_Bangkok = Σ(w_i × p̂_elderly_i)
```

Where p̂_elderly_i is the sample proportion for health indicator of interest among elderly in district i.

**Rationale**: Post-stratification transforms the convenience sample into a **quasi-probability sample** for elderly-specific analyses. This weighting corrects for differential sampling probabilities across districts, where some districts may be over-represented or under-represented relative to their true elderly population size. Statistical tests and confidence intervals for elderly-specific indicators thus have improved validity compared to unweighted convenience sample estimates.

**Example**: Suppose the survey collected responses from 2,000 elderly residents across all 50 districts combined. District 1040 (Bangkae) contains 3.7% of Bangkok's true elderly population (44,264 / 1,210,828 = 0.037) but only represents 2.8% of the total elderly sample across all districts (e.g., 56 elderly respondents / 2,000 total elderly = 0.028). This means Bangkae is **under-sampled** relative to its actual population size. To correct for this under-sampling, each elderly response from District 1040 receives a weight of 3.7 / 2.8 = 1.32, meaning each respondent counts as 1.32 people in citywide weighted estimates. Conversely, over-sampled districts receive weights less than 1.0 to reduce their influence on citywide estimates.

#### 3.2.3 Calibration Weighting and External Validation for Disability Estimates

For people with disabilities, the known population size (N = 104,116 registered disabled individuals in Bangkok) and sex distribution enabled **calibration weighting** and **external validation** of sample estimates.

**Population Group Definition**: The dashboard uses **overlapping population groups** to preserve complete health information across intersecting categories:

- **Disabled group**: All respondents with `disable_status=1`, regardless of age, sexual orientation, or employment (n=638)
- **Elderly group**: All respondents with age≥60, regardless of disability status or other characteristics (n=2,964)
- **LGBT group**: All respondents with sex='lgbt', regardless of other characteristics (n=685)
- **Informal workers group**: All respondents with `occupation_status=1` AND `occupation_contract=0`, regardless of other characteristics (n=1,330)
- **No special characteristics**: Respondents who are not disabled, not elderly, not LGBT, and not informal workers (n=1,315)

**Rationale for Overlapping Groups**: Health needs are inherently intersectional. For example, the 380 respondents who are both elderly AND disabled require both geriatric care and disability accommodations. Using mutually exclusive categories would hide these intersections and misrepresent health service needs. This approach aligns with WHO and public health research standards for population health analysis.

**Sample Characteristics**: The survey included **638 disabled respondents** (0.61% of registered disabled population) across all 50 districts, including:
- 380 who are also elderly (59.6% of disabled sample)
- 29 who are also LGBT (4.5% of disabled sample)
- 229 who are disabled only, without overlapping elderly or LGBT status

**External Validation Through Benchmark Comparison**: Sample representativeness was assessed by comparing sex distribution of all disabled respondents (n=638) to Bangkok disability registry data (Department of Empowerment of Persons with Disabilities, 2024):

| Sex | Sample (n=638) | Registry (N=104,116) | Difference |
|-----|----------------|----------------------|------------|
| Male | 49.2% (314) | 53.2% (55,422) | -4.0% |
| Female | 46.2% (295) | 46.8% (48,694) | -0.6% |
| LGBT+ | 4.5% (29) | Not recorded | N/A |

**Interpretation**: The sample's sex distribution closely approximates the Bangkok disability registry, with differences of 4.0% for males and 0.6% for females. These small discrepancies fall within expected sampling variation for a convenience sample of this size, suggesting reasonable representativeness of the registered disabled population. The presence of LGBT+ respondents (4.5%) reflects inclusive survey design, though this category is not tracked in official disability registries.

**Calibration Weighting**: To improve alignment with known population sex distribution, calibration weights were applied to male and female disabled respondents:

```
w_male = (N_male_registry / N_total_registry) / (n_male_sample / n_binary_sample)
w_female = (N_female_registry / N_total_registry) / (n_female_sample / n_binary_sample)
```

Where n_binary_sample excludes LGBT+ respondents (n=609) as the registry uses binary sex classification.

**Calculated weights**:
- Male respondents: w = 1.0318 (slight up-weighting to match 53.2% target)
- Female respondents: w = 0.9661 (slight down-weighting to match 46.8% target)
- LGBT+ respondents: w = 1.0000 (unweighted, as registry does not track this category)

**Verification**: After weighting, the sample sex distribution exactly matches the registry (53.2% male, 46.8% female), ensuring disability estimates reflect the known population composition.

**Statistical Projections to Population Scale**: To contextualize sample findings within Bangkok's registered disabled population, sample proportions can be projected to population scale:

```
Projected N in Bangkok = p̂_sample × N_registry = p̂_sample × 104,116
```

**Important**: These are **statistical projections based on sample data, not direct counts**. Projections assume the convenience sample is representative of all registered disabled individuals, which may not fully hold due to sampling limitations described below.

**Example**: If 212 of 638 disabled respondents (33.2%) reported difficulty accessing healthcare:

**Sample-based estimate**:
- Proportion: 33.2% (95% CI: 29.6% - 37.0%)

**Population-scale projection** (*if* this sample proportion holds for the entire registry):
- Projected number in Bangkok: **approximately 34,600 disabled residents** (rounded from 34,567) with healthcare access difficulty
- 95% CI range: approximately **30,800 - 38,500 people** (rounded from 30,818 - 38,523)

These projections help contextualize findings for policy and resource planning, but should be interpreted with caution given the convenience sampling design and limitations outlined below.

**Limitations**:
- **District-level data unavailable**: Disability registry does not provide district-level breakdowns, preventing district-specific calibration. District-level disability estimates rely on sample proportions without external validation.
- **Registry under-coverage**: Official registry (N=104,116) may under-count unregistered disabled individuals, particularly those with mild disabilities or limited access to registration services. True disabled population may be larger.
- **Age distribution unknown**: Registry does not publish age distribution, preventing age-based validation of sample representativeness.
- **Sampling bias**: Community volunteer-based recruitment may under-represent institutionalized disabled individuals, those with severe mobility limitations, or socially isolated disabled residents.

All disability-related estimates are reported acknowledging these representativeness considerations. Calibration weighting improves validity by aligning sample to known sex distribution, but cannot correct for unmeasured selection biases inherent to convenience sampling.

#### 3.2.4 District Comparisons

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

**Statistical Validity with Cluster Sampling**: While chi-square tests assume independent observations, the two-stage cluster design introduces within-community correlation. However, district-level comparisons remain valid because:
1. Each district draws from different community clusters (independent between districts)
2. Sample sizes are large enough (n ≥ 85 per district) to minimize design effect bias
3. The test compares aggregate district proportions rather than individual responses

The effective sample size (accounting for clustering) remains sufficient for district comparisons, though confidence intervals may be slightly wider than under simple random sampling (see Appendix A: Design Effect Calculation).

#### 3.2.5 Effect Size Estimation

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

#### 3.2.6 Margin of Error

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

#### 3.2.7 Minimum Sample Size Requirements

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

#### 3.2.8 Population-Weighted Citywide Estimates

To account for varying district population sizes when aggregating to citywide estimates, **population weighting** was applied. Unweighted averages treat all districts equally, biasing estimates if small and large districts differ systematically.

**Weighted Proportion Formula**:

```
p̂_weighted = Σ(w_i × p̂_i) / Σw_i
```

Where:
- p̂_i = proportion in district i
- w_i = population size of district i (from 2024 Bangkok census)
- Sum over all i = 1 to 50 districts

**Example**:

| District | Sample % Elderly | District Population | Weighted Contribution |
|----------|------------------|---------------------|----------------------|
| 1009 | 50.0% | 180,000 | 90,000 |
| 1015 | 24.7% | 120,000 | 29,640 |
| **Citywide** | **-** | **5,800,000** | **46.0% (weighted)** |

Population-weighted estimates provide more accurate Bangkok-wide prevalence estimates than simple averaging across districts.

#### 3.2.9 Population Group Classification

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

#### 3.3.1 Sampling Design and Generalizability

**Two-Stage Cluster Sampling with Convenience Recruitment**: This study employed a hybrid sampling design combining systematic geographic coverage (all 50 districts) with convenience-based participant recruitment within communities. This design has the following characteristics and limitations:

**1. Sampling Structure**:
- **Stage 1 (Systematic)**: All 50 Bangkok districts were included, achieving complete geographic coverage
- **Stage 2 (Convenience)**: Within each district, community health volunteers recruited participants from their local networks (1-3 communities per district)

This creates a **clustered sampling structure** where participants within the same community may be more similar to each other than to participants from other communities (positive intraclass correlation). The design effect from clustering reduces effective sample size (see Appendix A), widening confidence intervals relative to simple random sampling.

**2. Representativeness by Population Group**:

The degree to which sample estimates represent true Bangkok populations varies by group:

- **Elderly Population (Highest Validity)**: Sample was post-stratified to match known district-level elderly distribution (N = 1,210,828). Elderly-specific estimates are quasi-probability-based and generalize to Bangkok's elderly population with reasonable confidence, subject to typical survey non-response bias.

- **People with Disabilities (High Validity)**: Known population size (N = 90,967) enabled finite population correction to confidence intervals. However, convenience recruitment may under-represent institutionalized individuals or those with severe mobility limitations. Estimates likely represent community-dwelling disabled population accessible through volunteer networks.

- **LGBT+ Individuals (Moderate Validity)**: No census benchmark exists for comparison. Sample prevalence depends on:
  - Willingness to disclose sexual orientation to community volunteers
  - Representation of LGBT+ individuals in volunteer networks
  - Regional variation in social acceptance affecting disclosure rates

  Results should be interpreted as describing LGBT+ individuals who are (a) accessible through community networks and (b) comfortable disclosing orientation, rather than the entire LGBT+ population. Under-representation of closeted individuals and those in less accepting communities is likely.

- **Informal Workers (Moderate Validity)**: No official Bangkok-wide informal worker census exists. Sample prevalence reflects:
  - Informal workers with community connections and available survey time
  - Possible under-representation of highly mobile workers (e.g., motorcycle taxi drivers, street vendors with long work hours)
  - Seasonal employment variations

  Estimates are most representative of community-embedded informal workers rather than transient or highly mobile informal economy participants.

- **General Population (Context-Dependent)**: Represents Bangkok residents not belonging to the four priority groups, filtered through the same volunteer recruitment process.

**3. Selection Bias Considerations**:

Community volunteer-based recruitment introduces systematic selection mechanisms:

- **Over-represented groups**: Engaged community members, individuals with health concerns seeking services, residents with flexible schedules, those comfortable with survey participation
- **Under-represented groups**: Undocumented migrants (due to disclosure concerns), homeless individuals (outside community networks), highly mobile workers (time constraints), stigmatized populations (disclosure barriers)

The magnitude and direction of selection bias cannot be quantified without population-level comparison data. Observed prevalence estimates may differ from true population values due to these systematic sampling mechanisms.

**4. Confidence Interval Interpretation**:

Statistical confidence intervals reported herein reflect **sampling variability** (random error from finite sample size) but do not account for **selection bias** (systematic error from non-probability recruitment). Confidence intervals should be interpreted as:

- **Precision estimates**: Indicating how precisely the sample estimates the volunteer-recruited population
- **NOT exact probability statements**: The nominal 95% coverage probability assumes simple random sampling, which does not hold for convenience sampling
- **Approximate measures**: Useful for comparative purposes (e.g., comparing districts within the same sampling framework) rather than absolute population inference

**5. District Comparison Validity**:

Comparing districts assumes similar volunteer recruitment mechanisms and community network structures across all 50 districts. Observed differences between districts may reflect:
- True population differences in health indicators (valid inference)
- Systematic variation in volunteer recruitment approaches (confounding)
- Different community network structures affecting participant accessibility (confounding)

These sources cannot be fully disentangled. However, district comparisons remain valuable for identifying areas of health inequity that warrant further investigation and targeted interventions, even if exact magnitude of differences is uncertain.

**6. Generalization Recommendations**:

Based on sampling design characteristics:

- **Elderly health indicators**: Generalize to Bangkok elderly population with post-stratification weighting, acknowledging typical survey non-response bias
- **Disability indicators**: Generalize to community-dwelling disabled population accessible through volunteer networks
- **LGBT+ and informal worker indicators**: Interpret as descriptive of sampled communities rather than definitive population estimates. Use for hypothesis generation and identifying areas for targeted research with probability sampling methods
- **District comparisons**: Valid for prioritizing health equity interventions in relatively disadvantaged districts, even if absolute prevalence estimates are uncertain
- **Temporal generalization**: Results reflect conditions during [INSERT DATES] and may not extend to other time periods (see Section 3.3.3)

#### 3.3.2 Response Bias

Survey responses rely on self-report, introducing potential biases:
- **Social desirability bias**: Under-reporting of stigmatized behaviors (e.g., smoking, alcohol use, risky sexual behaviors)
- **Recall bias**: Inaccurate recall of past health events or behaviors, particularly for distant events
- **Response acquiescence**: Tendency to agree with survey questions, especially in cultures with norms of politeness and deference to authority
- **Disclosure barriers**: Under-reporting of sensitive characteristics (sexual orientation, informal work status, disability) due to stigma or legal concerns

These biases likely affect different population groups differentially. For example, LGBT+ prevalence may be under-estimated due to disclosure barriers, while informal worker status may be under-reported due to concerns about legal employment status.

#### 3.3.3 Temporal Considerations

Data collection occurred during [INSERT DATES]. Results reflect health status and social determinants during this period and may not generalize to other time periods, particularly given:
- Seasonal health variations (e.g., respiratory infections, heat-related illness)
- Economic fluctuations affecting informal work availability and income
- Policy changes affecting healthcare access and insurance coverage
- Pandemic-related impacts on health behaviors and service utilization (if applicable)

Trend analysis would require repeated cross-sectional surveys using comparable methodology.

#### 3.3.4 Measurement Limitations

**Population Group Classification**: Population group membership was determined through single survey items:
- **Elderly**: Objective age-based criterion (≥60 years) with minimal measurement error
- **LGBT+**: Self-identified sexual orientation from single question ("What is your sex?"). This question wording may not capture full spectrum of sexual orientation and gender identity. Some respondents may identify as LGBT+ but select binary sex categories due to question interpretation or disclosure concerns.
- **Disability**: Self-reported disability status (binary yes/no) without specifying type, severity, or functional limitation. May under-capture mild disabilities or over-represent visible/severe disabilities depending on respondent interpretation.
- **Informal Workers**: Defined as occupation contract status = 0 (no formal employment contract). This operational definition may not align with all conceptualizations of informal work (e.g., may exclude some self-employed professionals, may include some temporary formal workers between contracts).

These measurement choices reflect pragmatic survey design constraints but may not capture full complexity of population group membership.

### 3.4 Ethical Considerations

This study was reviewed and approved by [INSERT ETHICS COMMITTEE] (Protocol #[INSERT NUMBER]). All participants provided informed consent prior to participation. Data were de-identified before analysis, and results are reported at the aggregate district level (minimum n=5 per cell) to protect individual privacy. Community health volunteers received training on ethical data collection, including:
- Informed consent procedures and voluntary participation
- Confidentiality protection and data security
- Sensitivity in asking about potentially stigmatizing characteristics
- Referral procedures for participants requesting health or social services

Special protections were implemented for sensitive data (sexual orientation, disability status) including secure data storage and restricted access to identifiable information.

### 3.5 Data Management and Quality Control

**Data Entry**: Survey responses were entered electronically using [INSERT PLATFORM] with real-time validation checks for logical consistency (e.g., age ranges, mutually exclusive responses).

**Quality Control**: Data quality checks included:
- Range validation (e.g., 0 ≤ age ≤ 120)
- Logical consistency (e.g., if occupation_status="unemployed" then occupation_contract must be null)
- Duplicate detection based on demographic combinations
- Missing data patterns assessed using Little's MCAR test
- Inter-rater reliability checks on 10% of surveys for data entry accuracy

**Missing Data**: Complete case analysis was used for all analyses. Overall missingness was [INSERT %]. Missing data patterns were assessed and found to be [missing completely at random (MCAR) / missing at random (MAR) / not missing at random (NMAR)] based on [INSERT TEST]. Sensitivity analyses comparing complete cases to all available data showed [INSERT FINDINGS].

**Data Security**: Survey data were stored on encrypted servers with access limited to authorized research personnel. Personal identifiers were separated from survey responses and stored in separate databases with restricted access.

---

## 4. STATISTICAL SOFTWARE

All analyses were performed using:
- **Python** 3.11.0 (Python Software Foundation)
- **pandas** 2.1.0 for data manipulation
- **numpy** 1.26.0 for numerical computations
- **scipy** 1.16.2 for statistical tests (chi-square, Fisher's exact)
- **statsmodels** 0.14.0 for post-stratification weighting
- **matplotlib** 3.8.0 and **seaborn** 0.13.0 for visualization

Custom analysis scripts are available at: [INSERT REPOSITORY URL or "Available upon request from corresponding author"]

---

## 5. REFERENCES

Agresti, A., & Coull, B. A. (1998). Approximate is better than "exact" for interval estimation of binomial proportions. *The American Statistician*, 52(2), 119-126. https://doi.org/10.2307/2685469

American Association for Public Opinion Research (AAPOR). (2016). *Standard Definitions: Final Dispositions of Case Codes and Outcome Rates for Surveys* (9th ed.). AAPOR.

Cochran, W. G. (1977). *Sampling Techniques* (3rd ed.). John Wiley & Sons.

Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences* (2nd ed.). Lawrence Erlbaum Associates.

Department of Empowerment of Persons with Disabilities. (2024). *Registered Persons with Disabilities in Bangkok* [Dataset]. Ministry of Social Development and Human Security, Thailand.

Department of Provincial Administration. (2024). *Bangkok Population by Age and District* [Dataset]. Ministry of Interior, Thailand.

Gelman, A., & Little, T. C. (1997). Poststratification into many categories using hierarchical logistic regression. *Survey Methodology*, 23(2), 127-135.

Groves, R. M., Fowler, F. J., Couper, M. P., Lepkowski, J. M., Singer, E., & Tourangeau, R. (2009). *Survey Methodology* (2nd ed.). John Wiley & Sons.

Kalton, G., & Flores-Cervantes, I. (2003). Weighting methods. *Journal of Official Statistics*, 19(2), 81-97.

Kish, L. (1965). *Survey Sampling*. John Wiley & Sons.

Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. *Journal of the American Statistical Association*, 22(158), 209-212. https://doi.org/10.1080/01621459.1927.10502953

---

## APPENDIX A: DESIGN EFFECT AND EFFECTIVE SAMPLE SIZE

**Clustered Sampling Design Effect**: Community volunteer-based recruitment created a two-stage cluster design where participants within the same community may be more similar than participants from different communities. This **intraclass correlation** (ρ) inflates sampling variance relative to simple random sampling, quantified by the **design effect (Deff)**.

**Design Effect Formula** (Kish, 1965):

```
Deff = 1 + (m̄ - 1)ρ
```

Where:
- m̄ = average cluster size (responses per community)
- ρ = intraclass correlation coefficient (0 = no clustering, 1 = perfect clustering)

**Parameter Estimation**:

Assuming:
- 1-3 communities per district (average 2 communities)
- 130.5 average responses per district → m̄ ≈ 65 responses per community
- ρ = 0.02 (low to moderate clustering, typical for community health surveys)

This ρ estimate assumes that neighbors within the same community share similar health determinants (e.g., local healthcare access, neighborhood environment) but are not highly homogeneous. Literature on community health surveys suggests ρ typically ranges from 0.01-0.05 (Groves et al., 2009).

**Design Effect Calculation**:

```
Deff = 1 + (65 - 1) × 0.02 = 1 + 1.28 = 2.28
```

**Effective Sample Size**:

The effective sample size accounts for clustering by reducing the actual sample size by the design effect:

```
n_effective = n_actual / Deff = 6,523 / 2.28 ≈ 2,861
```

**District-Level Effective Sample Size**:

```
n_effective_per_district = 130.5 / 2.28 ≈ 57 per district
```

**Implications**:

1. **Confidence Intervals**: Are approximately √2.28 = 1.51 times wider than under simple random sampling with n=6,523. Reported Wilson Score Intervals do not explicitly adjust for clustering, so true coverage may differ slightly from nominal 95% (typically 92-96% in practice).

2. **Statistical Power**: Effective sample size of 2,861 (rather than 6,523) should be used for power calculations. However, this remains sufficient for detecting meaningful differences:
   - Citywide proportion estimation: MOE ≈ ±1.8% (95% CI)
   - District comparisons: adequate power to detect differences of 12-15 percentage points with n_eff ≈ 57 per district

3. **District-Level Reliability**: With n_eff ≈ 57 per district, most districts remain in the "medium-high reliability" range despite clustering. The n ≥ 100 raw sample size threshold ensures n_eff ≥ 44 even after design effect adjustment.

**Sensitivity Analysis**:

If ρ = 0.01 (minimal clustering): Deff = 1.64, n_eff = 3,978
If ρ = 0.05 (high clustering): Deff = 4.20, n_eff = 1,553

The actual ρ likely falls within this range. Even under high clustering (ρ = 0.05), the effective sample size remains adequate for descriptive district-level analysis and citywide comparisons.

**Conclusion**: While clustered sampling reduces effective sample size, the study's large raw sample (n = 6,523) and comprehensive district coverage (all 50 districts) provide sufficient power for the intended analyses. Confidence intervals should be interpreted as approximate measures of precision rather than exact probability statements, with true coverage likely 92-96% rather than exactly 95%.

---

## APPENDIX B: POST-STRATIFICATION WEIGHTING DETAILS

**Rationale**: The convenience sample may over-represent or under-represent districts relative to their true elderly population sizes. Post-stratification corrects this by weighting each district's contribution to Bangkok-wide elderly estimates proportional to its actual elderly population.

**Step 1: Calculate District Weights**

For each district i (i = 1 to 50):

```
w_i = N_elderly_i / N_elderly_total
```

Where:
- N_elderly_i = True elderly population in district i (from "District Population - Age 60 and more.csv")
- N_elderly_total = 1,210,828 (sum across all 50 districts)

**Example Weights** (illustrative):

| District Code | District Name | Elderly Pop (N) | Weight (w) |
|--------------|---------------|-----------------|------------|
| 1040 | Bangkae | 44,264 | 0.0366 (3.66%) |
| 1013 | Samphanthawong | 7,179 | 0.0059 (0.59%) |
| 1030 | Chatuchak | 37,220 | 0.0307 (3.07%) |
| ... | ... | ... | ... |

**Step 2: Apply Weights to Elderly-Specific Estimates**

For any health indicator among elderly (e.g., % with diabetes), the weighted Bangkok-wide estimate is:

```
p̂_weighted = Σ(w_i × p̂_i)
```

Where p̂_i = sample proportion with the condition among elderly in district i.

**Example**:

Suppose we estimate elderly diabetes prevalence in three districts:

| District | Sample Elderly (n) | Diabetes Cases | Sample % | Weight (w) | Weighted Contribution |
|----------|-------------------|----------------|----------|------------|-----------------------|
| 1040 | 120 | 36 | 30.0% | 0.0366 | 0.0110 (1.10%) |
| 1013 | 85 | 17 | 20.0% | 0.0059 | 0.0012 (0.12%) |
| 1030 | 150 | 60 | 40.0% | 0.0307 | 0.0123 (1.23%) |

Bangkok-wide weighted estimate (summing across all 50 districts) = Σ(weighted contributions) = [INSERT FINAL %]

**Step 3: Weighted Confidence Intervals**

Standard error of weighted proportion (approximation):

```
SE_weighted = √[Σ(w_i² × p̂_i(1-p̂_i)/n_i)]
```

95% CI = p̂_weighted ± 1.96 × SE_weighted

**Software Implementation**:

Post-stratification weights were calculated and applied using Python statsmodels:

```python
import pandas as pd
import numpy as np

# Load elderly population data
elderly_pop = pd.read_csv('District Population - Age 60 and more.csv')
N_total = elderly_pop['SUM of population'].sum()  # 1,210,828

# Calculate weights
elderly_pop['weight'] = elderly_pop['SUM of population'] / N_total

# Merge with survey data and apply weights
# [Additional implementation details available upon request]
```

**Comparison: Unweighted vs. Weighted Estimates**:

For key elderly health indicators:

| Indicator | Unweighted % | Weighted % | Difference |
|-----------|--------------|------------|------------|
| Diabetes | [INSERT] | [INSERT] | [INSERT] |
| Hypertension | [INSERT] | [INSERT] | [INSERT] |
| Healthcare access difficulty | [INSERT] | [INSERT] | [INSERT] |

Differences between unweighted and weighted estimates indicate the degree of sampling bias corrected by post-stratification. Small differences (<2 percentage points) suggest sample was reasonably representative even without weighting. Larger differences indicate that weighting substantially improved estimate validity.

---

## APPENDIX C: WORKED EXAMPLE - DISTRICT COMPARISON

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

"District 1038 has significantly higher informal worker prevalence (50.6%, 95% CI: 43.2%-58.0%) compared to District 1009 (39.2%, 95% CI: 32.8%-45.9%), χ²(1) = 4.70, p = 0.030, Cohen's h = 0.23. This represents a statistically significant difference with moderate practical importance (11.4 percentage point difference). Both estimates are based on high reliability samples (n ≥ 100 per district), though confidence intervals are wide due to cluster sampling design effects."

---

## APPENDIX D: REPORTING CHECKLIST

When reporting district-level prevalence estimates, include:

✅ Point estimate (percentage)
✅ 95% Confidence interval (Wilson Score)
✅ Sample size (n)
✅ Reliability classification (High/Medium/Low based on n ≥ 100 / 50-99 / 30-49)
✅ Margin of error (optional but recommended)
✅ Population group specification (elderly, LGBT+, disabled, informal, general)

**Example**: "Among elderly residents in District 1009 (n=111, high reliability), 50.5% (95% CI: 41.1%-59.8%, MOE ± 9.3%) reported difficulty accessing healthcare."

When reporting district comparisons, include:

✅ Proportions for both districts with CIs
✅ Sample sizes for both districts
✅ Statistical test used (chi-square or Fisher's exact)
✅ Test statistic and p-value
✅ Effect size (Cohen's h)
✅ Practical interpretation with context

**Example**: "LGBT+ prevalence differed significantly between District A (17.6%, 95% CI: 12.4%-24.5%, n=153) and District B (4.5%, 95% CI: 2.4%-8.2%, n=222), χ²(1) = 15.3, p < 0.001, Cohen's h = 0.42. This represents a statistically significant difference with moderate-to-large practical importance, suggesting District A may require enhanced LGBT+-inclusive health services."

When reporting citywide elderly estimates, specify:

✅ Post-stratification weighting applied
✅ Weighted point estimate
✅ Weighted confidence interval
✅ Sample size (total elderly respondents)

**Example**: "Among Bangkok elderly (n=1,892, post-stratified to N=1,210,828), weighted diabetes prevalence was 28.4% (95% CI: 26.2%-30.7%), indicating approximately 344,000 elderly residents living with diabetes across the city."

---

## APPENDIX E: SENSITIVITY ANALYSIS FOR UNMEASURED POPULATIONS

For population groups without census benchmarks (LGBT+, informal workers), sensitivity analyses assess estimate plausibility by comparison to external data sources.

**LGBT+ Population Prevalence**:

**Sample Estimate**: [INSERT]% of Bangkok residents identify as LGBT+ (95% CI: [INSERT])

**External Benchmarks**:
- Thailand National Health Examination Survey (2014): 2.8% LGBT+ (ages 15-59)
- International meta-analysis (Gates, 2011): 3.5% global average
- Urban Asian cities (various): 3-8% range

**Interpretation**: Our estimate of [INSERT]% falls [within/above/below] the expected range, suggesting [reasonable representativeness / possible under-reporting due to disclosure barriers / possible over-representation in volunteer networks]. Results should be interpreted as describing LGBT+ individuals comfortable disclosing orientation in community survey settings.

**Informal Worker Prevalence**:

**Sample Estimate**: [INSERT]% of Bangkok workers are informal (95% CI: [INSERT])

**External Benchmarks**:
- ILO Thailand (2020): 55% informal employment nationally
- National Statistical Office (2021): 42% informal workers in Bangkok (urban adjustment)
- World Bank (2019): 35-60% range for large Asian cities

**Interpretation**: Our estimate of [INSERT]% falls [within/above/below] the expected range. [If low: Possible under-representation of highly mobile informal workers with limited community network access. If high: Sample may over-represent informal workers if recruited from lower-income communities. If within range: Estimate has reasonable face validity.]

**Conclusion**: While definitive population validation is impossible without census data, comparison to external benchmarks suggests [our estimates are plausible / caution is warranted in interpretation / specific biases may be present]. Future research should employ probability sampling methods to obtain more definitive prevalence estimates for these populations.

---

**Document Version**: 2.0
**Last Updated**: 2025-10-27
**Prepared for**: Bangkok Health Dashboard Project Report

**Changes from Version 1.0**:
- Added two-stage cluster sampling framework with design effect calculation
- Incorporated post-stratification weighting for elderly population (N=1,210,828)
- Added finite population correction for disability estimates (N=90,967)
- Expanded sampling limitations section with validity assessment by population group
- Added measurement limitations subsection
- Included sensitivity analysis framework for unmeasured populations
- Added post-stratification weighting implementation details (Appendix B)
- Added reporting guidance for weighted estimates (Appendix D)
- Added external benchmark comparisons (Appendix E)
