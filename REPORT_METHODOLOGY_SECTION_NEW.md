# Methodology

## Methods

This study employed cross-sectional survey design to examine social determinants of health equity (SDHE) across vulnerable populations in Bangkok. The analysis focused on identifying disparities between population groups and understanding how socioeconomic factors (income, education) relate to health outcomes within each group.

## Study Population and Data Collection

### Sampling Design

This study collected health and social determinants data from 6,523 Bangkok residents across all 50 districts. The study employed a **two-stage cluster sampling design** with community volunteer-based recruitment:

- **Stage 1**: Community health volunteers (CHVs) were embedded in 1-3 communities per district across all 50 Bangkok districts
- **Stage 2**: CHVs recruited participants from their local communities using convenience sampling methods

This design achieved comprehensive geographic coverage while leveraging existing community networks for participant recruitment.

### Sample Distribution

The survey achieved a mean of 130.5 responses per district (SD = 32.4, range = 85-222). Of the 50 districts:
- 49 districts (98%) achieved ≥100 responses (high reliability)
- 1 district (2%) achieved 85-99 responses (medium reliability)
- 0 districts achieved <30 responses

### Target Population

Bangkok residents representing five population groups of health equity concern:

1. **Elderly adults**: Age ≥60 years (n=2,964)
2. **People with disabilities**: Self-reported disability status (n=638)
3. **LGBT+ individuals**: Self-identified sexual orientation (n=685)
4. **Informal workers**: Employed without formal contract (occupation_status=1 AND occupation_contract=0) (n=1,330)
5. **General population**: Those not belonging to the four priority groups (n=1,315)

**Population groups are overlapping**, not mutually exclusive. For example, a respondent can be both elderly AND disabled, allowing analysis of intersectional health needs.

#### Why Overlapping Groups Are Appropriate

**Rationale**: Health needs and vulnerabilities are inherently intersectional. A person who is both elderly (age 65) and disabled requires both geriatric healthcare services AND disability accommodations. Using mutually exclusive categories would force us to classify this person as either "elderly" OR "disabled," losing critical information about their dual health service needs.

**Example of Overlap**:
- Total sample: n = 6,523
- Elderly (age ≥60): n = 2,964
- Disabled: n = 638
- **Overlap**: 380 respondents are BOTH elderly AND disabled (12.8% of elderly, 59.6% of disabled)

If we used mutually exclusive groups:
- ❌ Option 1: "Elderly only" (n=2,584) + "Disabled only" (n=258) → Loses 380 people with dual needs
- ❌ Option 2: Priority classification (disabled takes precedence) → 380 elderly-disabled counted only as "disabled," hiding their geriatric health needs

With overlapping groups:
- ✅ All 2,964 elderly are analyzed for elderly-specific health indicators
- ✅ All 638 disabled are analyzed for disability-specific health indicators
- ✅ The 380 elderly-disabled are correctly included in BOTH analyses

**Statistical Implications**:

1. **Between-Group Comparisons Are Still Valid**:
   - Each vulnerable group is compared to the general population (n=1,315)
   - General population = respondents who are NOT elderly, NOT disabled, NOT LGBT+, AND NOT informal workers
   - Chi-square tests compare each vulnerable group independently to general population
   - Overlap between vulnerable groups (e.g., elderly-disabled) does NOT affect these comparisons

2. **Sample Sizes Don't Sum to Total**:
   - Elderly (n=2,964) + Disabled (n=638) + LGBT+ (n=685) + Informal (n=1,330) + General (n=1,315) = 6,932
   - This exceeds total sample (n=6,523) because some individuals are counted in multiple groups
   - This is correct and expected with overlapping categories

3. **Within-Group Analyses Are Independent**:
   - Income-disease correlation for elderly analyzes all 2,964 elderly
   - Income-disease correlation for disabled analyzes all 638 disabled
   - The 380 elderly-disabled contribute to BOTH correlations
   - Each correlation is estimated separately within its population group
   - No statistical issue arises from the overlap

4. **Intersectional Analysis Is Possible**:
   - We can analyze the 380 elderly-disabled as a distinct intersectional subgroup
   - Example: Do elderly-disabled face worse outcomes than elderly-only or disabled-only?
   - This would be impossible with mutually exclusive categories

**Comparison to Alternative Approaches**:

| Approach | Pros | Cons |
|----------|------|------|
| **Overlapping groups (our approach)** | ✅ Preserves complete health information<br>✅ Allows intersectional analysis<br>✅ Reflects real-world complexity | ⚠️ Group sizes don't sum to total<br>⚠️ Requires careful explanation |
| **Mutually exclusive with priority** | ✅ Groups sum to total<br>✅ Simpler to explain | ❌ Arbitrary priority rules<br>❌ Hides intersectional needs<br>❌ Misrepresents health service requirements |
| **Mutually exclusive with hierarchy** | ✅ Groups sum to total | ❌ Forces single-identity classification<br>❌ Loses dual/triple vulnerability information |

**Precedent in Public Health Research**:
- WHO health equity monitoring uses overlapping categories
- CDC health disparities reporting allows multiple group membership
- Social determinants of health research recognizes intersectionality (Crenshaw, 1989)
- Epidemiological studies routinely analyze age groups, sex, and race/ethnicity as separate overlapping dimensions

**Interpretation Guidance**:
When we report "Elderly have 76.5% hypertension vs 10.2% general population," this means:
- Among all 2,964 respondents aged ≥60 (regardless of disability, LGBT+, or employment status), 76.5% report hypertension
- This is compared to 1,315 respondents who are under 60, not disabled, not LGBT+, and not informal workers
- The elderly group includes some disabled, some LGBT+, and some informal workers - and this is appropriate because all elderly share age-related health needs

### Monthly Income Calculation

Income was standardized to monthly equivalents for all analyses:

- **Daily wage earners** (income_type=1): Daily wage × 30 = monthly income
- **Monthly salary earners** (income_type=2): Monthly salary used as-is

This standardization allows consistent income comparisons across employment types.

## Measures

Survey instruments collected data across six Social Determinants of Health Equity (SDHE) domains, following WHO frameworks for health equity monitoring.

### Employment & Income

- **Employment status**: Employed (occupation_status=1) vs Not employed (occupation_status=0)
- **Employment contract**: Formal contract (occupation_contract=1) vs No contract (occupation_contract=0)
  - Informal worker definition: Employed AND no formal contract
- **Occupation welfare**: Access to employer-provided welfare benefits (occupation_welfare=1)
- **Monthly income**: Continuous variable in Thai Baht (THB)
  - Daily wage earners (income_type=1): Daily wage × 30 = monthly equivalent
  - Monthly salary earners (income_type=2): Monthly salary as-is
  - Dichotomized as: Low income (<10,000 THB/month) vs High income (≥10,000 THB/month)
  - Income quartiles: Q1 (lowest 25%) through Q4 (highest 25%) for dose-response analysis

### Education & Skills

- **Educational attainment**: Categorical variable from 0 (no education) to 8 (master's/doctoral)
  - Primary or less: Levels 0-2 (≤ป.6 / ≤Grade 6)
  - Secondary: Levels 3-4 (ม.1-ม.6 / Grades 7-12)
  - Vocational: Levels 5-6 (ปวช./ปวส. / Vocational certificate/diploma)
  - Bachelor+: Levels 7-8 (≥ปริญญาตรี / Bachelor's degree or higher)
- **Literacy skills**: Self-reported ability to read, write, and do mathematics
- **Training access**: Access to skill development or vocational training programs

### Healthcare Access

- **Health coverage**: Type of health insurance
  - Universal coverage (30-baht scheme/บัตรทอง): UC scheme
  - Social security: SSS
  - Civil servant welfare: CSMBS
  - Other coverage
- **Medical care skipping**: Foregone medical care in past 12 months due to cost (binary: yes/no)
- **Oral health access barriers**: Reasons for not accessing oral health care
  - Self-treatment (bought medicine, used herbal remedies)
  - Fear of pain/procedures
  - Cost barriers
  - Time constraints
  - Perception of no need
- **Oral health symptoms**: Self-reported oral health problems in past 12 months

### Chronic Diseases

- **Overall chronic disease status**: Self-reported doctor diagnosis (diseases_status=1)
- **Specific conditions**: Measured as binary (yes/no) for each
  - Diabetes (diseases_type/1 or diseases_type_1)
  - Hypertension (diseases_type/2 or diseases_type_2)
  - Gout (diseases_type/3 or diseases_type_3)
  - Kidney disease (diseases_type/4 or diseases_type_4)
  - Cancer (diseases_type/5 or diseases_type_5)
- **Any chronic disease**: Presence of one or more conditions above

### Health Behaviors

- **Exercise frequency** (exercise_status): Categorical variable
  - 0 = None / no exercise
  - 1 = Less than 3 times per week
  - 2 = 3-4 times per week
  - 3 = 5+ times per week
  - **Regular exercise** defined as ≥3 times/week (levels 2-3)

- **Smoking status** (smoke_status): Categorical variable
  - 0 = Never smoked
  - 1 = Quit smoking
  - 2 = Occasional smoker
  - 3 = Regular smoker
  - **Current smoker** defined as occasional OR regular (levels 2-3)

- **Drinking status** (drink_status): Categorical variable
  - 0 = Never drank alcohol
  - 1 = Current drinker
  - 2 = Quit drinking
  - If current drinker, frequency measured as:
    - Occasional drinker (drink_rate=2)
    - Regular drinker (drink_rate=1)
  - **Current drinker** defined as drink_status=1

- **Combined unhealthy behaviors**: Cumulative risk score
  - No regular exercise (1 point) + Current smoker (1 point) + Current drinker (1 point)
  - **Triple risk** defined as all three behaviors (score = 3)

### Housing & Environment

- **Housing tenure** (house_status): Categorical variable
  - 1 = Own house
  - 2 = Rent house
  - 3 = Employee housing
  - 4 = Other arrangements

- **Overcrowding**: Composite indicator (binary: yes/no)
  - Dense residential buildings (community_environment_1=1) OR
  - Small/narrow housing space (community_environment_2=1)
  - **Any overcrowding** = presence of either condition

- **Environmental health problems**:
  - Pollution health problems (health_pollution=1): Self-reported health problems attributed to pollution
  - Disaster exposure: Experience of any disaster type (self_disaster_1 through self_disaster_8)

### Violence & Safety

- **Interpersonal violence**: Self-reported experiences (binary: yes/no)
  - Psychological violence (psychological_violence=1)
  - Physical violence (physical_violence=1)
  - Sexual violence (sexual_violence=1)
- **Discrimination**: Self-reported experience of discrimination

## Statistical Analysis

All statistical analyses were conducted using Python 3.11 with pandas, numpy, and scipy libraries. Statistical significance was set at α = 0.05 (two-tailed) for all hypothesis tests.

### 1. Between-Group Comparisons (Population Group vs General Population)

**Purpose**: Identify which health indicators differ significantly between each vulnerable population group and the general population.

**Statistical Test**: Chi-square test of independence

**Why chi-square**: Tests whether two categorical variables are independent. In our case, tests whether health outcome (yes/no) is independent of population group membership (vulnerable group vs general population).

**Test Statistic**:
```
χ² = Σ[(Observed - Expected)² / Expected]
```

**Interpretation**:
- **p-value < 0.05**: Statistically significant difference exists
- **p-value ≥ 0.05**: No evidence of difference (could be due to true equality or insufficient sample size)

**Percentage Point Gap (pp gap)**:
```
Gap = Proportion_VulnerableGroup - Proportion_GeneralPopulation
```

**Why percentage points, not percentages**: If general population has 10% disease rate and vulnerable group has 20%, we say:
- ✅ CORRECT: "10 percentage point increase" or "10 pp gap"
- ❌ INCORRECT: "100% increase" (confusing, suggests doubling)

Percentage points provide intuitive, additive differences between proportions.

**Example**:
- General population hypertension: 10.2%
- Elderly hypertension: 76.5%
- **Gap**: 76.5% - 10.2% = **66.3 percentage points** (pp)
- Chi-square test: p < 0.001 (statistically significant)

### 2. Within-Group Correlations (Continuous Variables)

**Purpose**: Understand how continuous socioeconomic variables relate to health outcomes within each population group using the FULL RANGE of income/education values.

**When used**: Only for analyzing relationships with chronic disease outcomes in the "Income Effects Within Population Groups" and "Education Effects Within Population Groups" tables.

**Statistical Test**: Point-biserial correlation (special case of Pearson correlation)

**Variables analyzed**:
- **Income**: Monthly income as continuous variable in Thai Baht (e.g., 5,000 THB, 15,000 THB, 25,000 THB)
- **Education**: Education level as ordinal variable 0-8 (0=no education, 8=doctoral degree)
- **Outcome**: Chronic disease status as binary (0=no disease, 1=has disease)

**Why correlation**: Measures strength and direction of linear relationship between:
- Continuous/ordinal variable (e.g., monthly income in THB, education level 0-8)
- Binary outcome (e.g., has chronic disease yes/no coded as 1/0)

**Correlation Coefficient (r)**:
```
r ranges from -1 to +1
```

**Interpretation**:
- **r = -1**: Perfect negative correlation (higher income → always lower disease)
- **r = 0**: No linear relationship
- **r = +1**: Perfect positive correlation (higher income → always higher disease)
- **|r| < 0.1**: Weak correlation
- **0.1 ≤ |r| < 0.3**: Moderate correlation
- **|r| ≥ 0.3**: Strong correlation

**Significance Test**: t-test for correlation

**t-statistic**:
```
t = r × √[(n-2)/(1-r²)]
```

**Why we report both r and p-value**:
- **r**: Tells HOW STRONG the relationship is (effect size)
- **p-value**: Tells IF the relationship is statistically significant (not due to chance)
- Both needed for complete interpretation

**Example from "Income Effects Within Population Groups" table**:
- Disabled income-disease correlation: r = -0.299, p < 0.001
  - Uses CONTINUOUS income: 5,000 THB, 10,000 THB, 15,000 THB, 20,000 THB, etc.
  - **Interpretation**: Strong negative correlation (higher income associated with lower disease), statistically significant
- General population income-disease: r = +0.020, p = 0.473
  - **Interpretation**: Near-zero correlation (no relationship), not significant

**Important distinction**: This correlation analysis is DIFFERENT from the cross-variable analysis (Section 3) which divides income into categories (Low vs High).

**Summary: When r-value is used vs when only p-value is used**

| Analysis Type | Income Variable | Education Variable | Outcome | Statistical Test | Reports r-value? | Reports p-value? | Example Tables |
|---------------|----------------|-------------------|---------|------------------|------------------|------------------|----------------|
| **Within-Group Correlations** (Section 2) | Continuous (THB) | Ordinal (0-8) | Chronic disease | Point-biserial correlation | ✅ YES | ✅ YES | "Income Effects Within Population Groups"<br>"Education Effects Within Population Groups" |
| **Cross-Variable Analysis** (Section 3) | Categorical (Low/High) | Categorical (Primary/Bachelor+) | Health behaviors, housing, violence | Chi-square test | ❌ NO | ✅ YES | "Exercise by Income"<br>"Smoking by Education"<br>"Homeownership by Income"<br>"Overcrowding by Income" |

**Why the difference?**
- **Correlation (r)** requires at least one continuous/ordinal variable → Used when analyzing income in THB or education level 0-8
- **Chi-square** is for categorical variables only → Used when comparing Low vs High income or Primary vs Bachelor+ education

### 3. Cross-Variable Analysis by Income/Education (Categorical)

**Purpose**: Understand how income and education shape health behaviors and housing/environment outcomes within each population group. This answers: "Does income protect against unhealthy behaviors/overcrowding?" and "Does education enable healthy behaviors/homeownership?"

**When used**: For analyzing all health behaviors (exercise, smoking, drinking), overcrowding, homeownership, violence, and disaster exposure.

**KEY DIFFERENCE from Section 2**:
- **Section 2 (Correlations)**: Uses income as CONTINUOUS (5,000 THB, 10,000 THB, 15,000 THB...) and produces r-value
- **Section 3 (Cross-variable)**: Uses income as CATEGORICAL (Low <10K vs High ≥10K) and produces only p-value

**Why cross-variable analysis is needed**: Simple between-group comparisons show that elderly have higher disease rates than general population. But this doesn't tell us:
- Do wealthy elderly have lower disease rates than poor elderly?
- Does education help elderly avoid disease?
- Are these patterns the same for all vulnerable groups?

Cross-variable analysis reveals these within-group mechanisms.

**Statistical Test**: Chi-square test for categorical cross-tabulations

**Variables analyzed**:
- **Income**: CATEGORICAL - Low income (<10,000 THB/month) vs High income (≥10,000 THB/month)
- **Education**: CATEGORICAL - Primary or less (levels 0-2) vs Bachelor+ (levels 7-8)
- **Outcomes**: Various binary outcomes (exercises regularly yes/no, smokes yes/no, owns house yes/no, etc.)

**Design**: 2×2 contingency table
```
                    Outcome Present    Outcome Absent    Total
Low Income/Education        a                b           n₁
High Income/Education       c                d           n₂
Total                     a+c              b+d           N
```

**Chi-square Calculation**:
```
χ² = N(ad - bc)² / [(a+b)(c+d)(a+c)(b+d)]
```

**Why we report gaps AND p-values**:
- **Gap (percentage points)**: Shows magnitude of difference (practical importance)
- **p-value**: Shows whether difference is statistically significant (not due to chance)

**Example - LGBT+ Drinking by Income**:
```
                      Current Drinker    Not Drinker    Total
Low Income (<10K)            8               24          32
High Income (≥10K)         203              178         381
```

- Low income drinking rate: 8/32 = 25.0%
- High income drinking rate: 203/381 = 53.3%
- **Gap**: 53.3% - 25.0% = **+28.3 percentage points**
- Chi-square test: χ² = 8.45, p = 0.004
- **Interpretation**: Higher-income LGBT+ drink at significantly higher rates (+28.3 pp, p=0.004)

### 4. Income Quartile and Education Level Analysis

**Purpose**: Test for dose-response gradients - do health outcomes improve progressively with each step up in income/education?

**Why quartiles**: Income quartiles divide population into four equal groups (Q1=lowest 25%, Q4=highest 25%), revealing whether health improves linearly with socioeconomic status or shows threshold effects.

**Statistical Test**: Chi-square test for trend across multiple groups

**Chi-square for Multiple Groups**:
```
χ² = Σ[(Observed - Expected)² / Expected] across all cells
df = (rows - 1) × (columns - 1)
```

**Example - Informal Workers Income Quartiles**:
- Q1 (lowest income): 47.6% chronic disease
- Q2: 35.2%
- Q3: 34.6%
- Q4 (highest income): 36.1%
- Chi-square = 14.31, df = 3, **p = 0.003**
- **Interpretation**: Significant income gradient exists - lowest income group has significantly higher disease burden

### 5. Overcrowding Analysis

**Purpose**: Test relationships between housing quality and health/socioeconomic factors.

**Overcrowding Definition**: Dense residential buildings (community_environment_1=1) OR small/narrow housing space (community_environment_2=1)

**Analysis Types**:

**A. Overcrowding by Income** (does income protect from overcrowding?)
- Chi-square test comparing low vs high income overcrowding rates

**B. Overcrowding by Housing Tenure** (do renters vs homeowners face different overcrowding?)
- Chi-square test comparing own house vs rent house overcrowding rates

### 6. Effect Size Indicators

**Why effect size matters**: With large sample sizes (n=6,523), even tiny meaningless differences can be "statistically significant" (p < 0.05). Effect size indicates practical importance.

**Effect Size Classifications Used**:

**For correlations (r)**:
- ✓ Weak: |r| < 0.1 (explains <1% of variance)
- ✓✓ Moderate: 0.1 ≤ |r| < 0.3 (explains 1-9% of variance)
- ✓✓✓ Strong: |r| ≥ 0.3 (explains ≥9% of variance)

**For chi-square (percentage point gaps)**:
- Small: < 5 pp difference
- Medium: 5-15 pp difference
- Large: > 15 pp difference

**Combined Interpretation**:
- p < 0.05 AND large gap → **Significant and important**
- p < 0.05 AND small gap → **Significant but trivial** (may not warrant intervention)
- p ≥ 0.05 → **Not significant** (could be chance variation)

### 7. Sample Size Requirements

**Minimum Sample Sizes for Reliable Estimation**:
- **n ≥ 30**: Minimum for subgroup analysis (Central Limit Theorem applies)
- **n ≥ 100**: High reliability for district-level estimates
- **n < 30**: Results flagged as unreliable or suppressed

**Why n=30 threshold**: Central Limit Theorem states that with n≥30, the sampling distribution of proportions approximates normal distribution, enabling valid confidence interval estimation and hypothesis testing.

### 8. Statistical Reporting Standards

**All tables report**:
1. **Sample proportions** (percentages)
2. **Sample sizes** (n)
3. **Gaps** (percentage point differences for between-group comparisons)
4. **p-values** (statistical significance)
5. **Effect indicators** (✓/✗ symbols + strength descriptors)

**For correlation tables, additionally report**:
6. **Correlation coefficient (r)** (effect size for continuous relationships)
7. **t-statistic** (test statistic, optional)

**Significance Thresholds**:
- p < 0.001: ✓✓✓ Very strong evidence / Very strong effect
- p < 0.01: ✓✓ Strong evidence / Strong effect
- p < 0.05: ✓ Significant / Moderate effect
- p ≥ 0.05: ✗ No effect / No significant difference

### 9. Statistical Assumptions and Limitations

**Chi-square Test Requirements**:
- Expected cell counts ≥ 5 in all cells
- Independent observations (addressed through cluster sampling design)

**Correlation Requirements**:
- Linear relationship assumption (point-biserial assumes linearity)
- No extreme outliers (income capped at reasonable maximum)

**Cross-Sectional Limitations**:
- **No causation**: Correlations show associations, not cause-effect
  - Example: Disabled have lower income AND higher disease. Does disability cause lower income, or does disease lead to disability? Our data cannot answer this.
- **Reverse causation**: Possible that outcome influences predictor
  - Example: Chronic disease diagnosis may prompt behavior change (quit smoking), creating apparent "unexpected pattern" where diseased have healthier behaviors
- **Unmeasured confounding**: Other variables may explain observed associations
  - Example: Income-health correlation may partly reflect age, occupation, or other factors not fully controlled

**Interpretation Guidance**: All findings are reported as **associations** or **patterns**, not causal relationships. Language like "income protects against disease" means "higher income is associated with lower disease rates" but does not imply income causes better health.

## Study Limitations

### 1. Sampling Limitations and Selection Bias

**Convenience Sampling Design**: This study used community volunteer-based recruitment rather than probability sampling. This introduces systematic selection bias:

**Likely Over-Represented Groups**:
- Community-engaged residents with established social networks
- Individuals with health concerns seeking services
- Residents with flexible schedules and time availability
- Those comfortable with survey participation and disclosure

**Likely Under-Represented Groups**:
- Undocumented migrants (due to disclosure concerns)
- Homeless individuals (outside community networks)
- Highly mobile informal workers (time constraints)
- Institutionalized individuals (nursing homes, hospitals)
- Socially isolated vulnerable populations

**Impact on Findings**: Prevalence estimates may differ from true population values. The direction and magnitude of selection bias cannot be quantified without population-level comparison data. Observed patterns likely reflect the volunteer-recruited population rather than all Bangkok residents.

**Generalizability by Population Group**:
- **Elderly**: Post-stratification weighting improves representativeness
- **Disabled**: Sample sex distribution closely matches registry (4% difference), suggesting reasonable representativeness of registered disabled population, but may under-represent unregistered or institutionalized disabled
- **LGBT+**: No census benchmark exists; sample likely under-represents closeted individuals or those in less accepting communities
- **Informal workers**: May under-represent highly mobile workers with limited community ties

### 2. Survey Bias and Measurement Error

**Self-Report Bias**: All survey responses rely on self-report, introducing multiple bias sources:

**Social Desirability Bias**:
- Under-reporting of stigmatized behaviors (smoking, alcohol use, informal work)
- Over-reporting of socially desirable behaviors (exercise, healthcare seeking)
- Under-reporting of sensitive characteristics (LGBT+ identity, disability status)

**Recall Bias**:
- Inaccurate recall of past health events (chronic disease diagnosis dates)
- Telescoping effects (recent events reported as older, or vice versa)
- Difficulty estimating frequencies (exercise times/week, drinking occasions)

**Response Acquiescence**:
- Tendency to agree with survey questions (particularly in Thai cultural context of politeness)
- Yea-saying bias may inflate prevalence of positive outcomes

**Disclosure Barriers**:
- LGBT+ prevalence likely under-estimated due to fear of disclosure to community volunteers
- Informal worker status may be under-reported due to legal employment concerns
- Disability status may be under-disclosed if associated with stigma
- Income may be under-reported or over-reported depending on social context

**Differential Bias by Group**: These biases likely affect vulnerable populations differently:
- Elderly may under-report health problems due to normalization of aging
- LGBT+ may under-report identity in less accepting communities
- Informal workers may under-report income to avoid taxation concerns
- Disabled may over-report health problems due to heightened health awareness

### 3. Data Quality and Measurement Limitations

**Population Group Classification**:

**Elderly (Age ≥60)**:
- ✅ Objective criterion with minimal measurement error
- Age self-reported but easily verified

**LGBT+ (Sexual Orientation)**:
- ⚠️ Single question: "What is your sex?" with LGBT+ as one option
- May not capture full spectrum of sexual orientation and gender identity
- Question wording may confuse sex, gender identity, and sexual orientation
- Under-captures transgender, non-binary, or questioning individuals
- Disclosure depends on comfort level with community volunteers

**Disabled (Disability Status)**:
- ⚠️ Binary yes/no question without specifying type, severity, or functional limitation
- May under-capture mild disabilities or over-represent visible/severe disabilities
- Self-perception of disability varies by individual and cultural context
- No alignment with standardized disability assessment tools (e.g., Washington Group Short Set)

**Informal Workers (No Formal Contract)**:
- ⚠️ Defined as employed (occupation_status=1) AND no contract (occupation_contract=0)
- May not align with ILO informal employment definition
- May exclude some self-employed professionals
- May include temporary formal workers between contracts
- Employment status may change frequently (measurement reflects single point in time)

**Income Measurement**:
- Self-reported income subject to under-reporting or over-reporting
- Daily wage conversion (×30) assumes 30 working days/month, may overestimate for workers with irregular schedules
- Does not capture household income, only individual income
- Missing data for unemployed or those unwilling to disclose (income_type or income missing)

**Chronic Disease Measurement**:
- Self-reported doctor diagnosis (not medical record verification)
- May under-count undiagnosed disease
- May over-count if respondent misunderstands diagnosis
- Relies on healthcare access (those who never see doctors cannot report diagnosis)

**Health Behavior Measurement**:
- **Exercise**: Frequency only, no intensity or duration data
- **Smoking/Drinking**: No quantity measures (cigarettes/day, drinks/week)
- No data on diet quality, sleep, stress, or other important behavioral determinants
- Self-report subject to social desirability bias

### 4. Missing Data

**Overall Missingness**: Variable-specific missingness rates:
- Income: ~20-30% missing (refusal to disclose or unemployed)
- Education: <5% missing
- Chronic disease: <2% missing
- Health behaviors: 5-10% missing

**Missing Data Mechanism**:
- Income likely Missing Not At Random (MNAR) - those with very low/high income may selectively refuse
- Health behaviors likely Missing Completely At Random (MCAR) - random skip patterns

**Analysis Approach**: Complete case analysis used (listwise deletion)
- Analyses only include respondents with valid data for all variables in that analysis
- May introduce bias if missingness is related to outcome

### 5. Temporal Limitations

**Cross-Sectional Design**:
- Single time point measurement
- Cannot establish temporal sequence (which came first: disease or poverty?)
- Cannot assess causation, only associations
- Behavior-disease relationships confounded by diagnosis-prompted behavior change

**Seasonal Effects**: Data collection timing may affect:
- Seasonal employment patterns (informal workers)
- Seasonal health variations (respiratory infections, heat-related illness)
- Holiday-related income fluctuations

**Temporal Generalization**: Results reflect conditions during data collection period only, may not extend to other time periods.

### 6. Construct Validity Limitations

**Income as Proxy for Socioeconomic Status**:
- Income captures current cash flow but not wealth, assets, or debt
- Missing: Home ownership value, savings, family financial support
- May not reflect true economic resources or financial security

**Education as Proxy for Knowledge/Skills**:
- Education level (years) may not reflect quality of education received
- Does not capture informal learning, work experience, or practical skills
- Same education level may have different meanings across generations (elderly primary education ≠ current primary education)

**Healthcare Access Measured Only by Cost Barriers**:
- "Skipping care due to cost" captures economic barriers but not:
  - Transportation barriers
  - Time/schedule barriers
  - Cultural/linguistic barriers
  - Geographic access
  - Provider availability

### 7. Statistical Power Limitations

**Subgroup Analysis**:
- Some subgroups have small sample sizes (e.g., disabled n=93 with income data)
- Limited power to detect effects in small subgroups
- Wide confidence intervals indicate high uncertainty
- Non-significant results may reflect insufficient power rather than true null effect

**Multiple Testing**:
- Hundreds of statistical tests conducted across all analyses
- Risk of Type I error (false positives) increases with multiple testing
- No formal correction for multiple comparisons applied
- Some "significant" findings (p<0.05) may be due to chance

### 8. External Validity Considerations

**Generalization Beyond Bangkok**: Findings may not apply to:
- Rural Thailand (different economic structure, health access)
- Other Southeast Asian cities
- Populations outside Thailand

**Generalization Within Bangkok**: Even within Bangkok, findings may vary by:
- Time period (economic conditions change)
- Policy environment (healthcare coverage expansions)
- Community characteristics (different from volunteer-recruited communities)

## Data Quality Assurance Measures

Despite limitations, several measures ensured data quality:

1. **Real-time validation**: Electronic data entry with range checks and logical consistency
2. **Duplicate detection**: Checked for duplicate respondents based on demographic combinations
3. **Geographic coverage**: All 50 Bangkok districts included (comprehensive coverage)
4. **Sample size adequacy**: 98% of districts achieved n≥100 (high reliability threshold)
5. **External validation**: Disabled sex distribution matched registry within 4% (reasonable representativeness)
6. **Post-stratification**: Elderly population weighted to known district distribution

## Interpretation Recommendations

Given these limitations:

1. **Prevalence estimates**: Treat as indicative rather than definitive population parameters
2. **Between-group comparisons**: Valid for identifying health inequities warranting investigation
3. **Within-group patterns**: Useful for hypothesis generation about mechanisms
4. **Causal inference**: Not supported by cross-sectional design; report as associations only
5. **Generalization**: Most appropriate for volunteer-accessible community populations in Bangkok
6. **Policy use**: Appropriate for identifying priority areas for targeted interventions; specific estimates should be verified through probability sampling when possible

## Analysis Code Availability

All statistical analyses were conducted using Python scripts:
- `health_behaviors_comprehensive_analysis.py` - Behavior patterns and cross-variable analysis
- `add_missing_statistical_tests.py` - Statistical significance tests for behavior distributions
- `housing_environment_cross_analysis.py` - Housing and environment cross-variable analysis
- `overcrowding_analysis.py` - Overcrowding patterns and determinants

Analysis code is available in the project repository.
