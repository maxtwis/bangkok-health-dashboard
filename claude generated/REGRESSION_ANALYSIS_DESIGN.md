# Multiple Regression Analysis Design for Elderly Population

## Why Regression Instead of Correlation?

### Correlation Limitations:
- **Pearson correlation** only shows if X and Y move together
- Cannot tell which variable affects which
- Cannot control for confounding variables
- Example: "Income and health are correlated" - but is it income → health, health → income, or both caused by education?

### Regression Advantages:
- **Predicts** dependent variable from multiple independent variables
- **Controls** for confounding factors
- Shows **relative importance** of each predictor
- Identifies **which variables actually matter** when others are held constant
- Can test **causation theories** (though still correlational data)

---

## Regression Models to Build

Based on MULTIPLE_CORRELATION.md variables, we'll build regression models for key **OUTCOMES** (dependent variables):

### Model 1: HEALTH OUTCOMES

#### 1A. Physical Health (Dependent: BMI = weight/height²)
**Independent variables:**
- Age
- Sex (male/female/LGBT)
- Income
- Education
- Occupation status
- Exercise status
- Smoking status
- Drinking status
- Diseases status
- Disability status
- Food insecurity
- Living arrangement (hh_elder_count)

**Question:** What PREDICTS elderly health status?

---

#### 1B. Healthcare Access (Dependent: medical_skip_1)
**Independent variables:**
- Income
- Education
- Welfare type
- Diseases status
- Disability status
- Food insecurity_1
- Food insecurity_2
- House status (owner vs renter)
- Rent price
- Family status

**Question:** What PREDICTS skipping medical care due to cost?

---

#### 1C. Health Expenses (Dependent: health_expense)
**Independent variables:**
- Income
- Age
- Diseases status
- Disability status
- Disability work status
- Welfare type
- Occupation status
- Family status
- hh_health_expense (to see individual vs household burden)

**Question:** What PREDICTS high individual health spending?

---

### Model 2: ECONOMIC SECURITY OUTCOMES

#### 2A. Food Insecurity (Dependent: food_insecurity_2 - going hungry)
**Independent variables:**
- Income
- Education
- Occupation status
- Working hours
- Occupation contract
- Occupation welfare
- House status
- Rent price
- Family status
- hh_child_count
- hh_worker_count
- hh_elder_count
- Medical_skip_1 (healthcare-food trade-off)

**Question:** What PREDICTS severe food insecurity?

---

#### 2B. Income Level (Dependent: income_monthly)
**Independent variables:**
- Age
- Sex
- Education
- Occupation type
- Occupation status
- Working hours
- Occupation contract
- Occupation welfare
- Disability status
- Disability work status
- Training

**Question:** What PREDICTS elderly income?

---

### Model 3: VIOLENCE & SAFETY OUTCOMES

#### 3A. Physical Violence (Dependent: physical_violence)
**Independent variables:**
- Sex
- Age
- Income
- Education
- Occupation status
- House status
- Rent price
- Living arrangement (family_status)
- Disability status
- Community safety perception
- Discrimination
- Psychological violence (to see clustering)
- Sexual violence (to see clustering)
- Helper availability

**Question:** What PREDICTS physical violence victimization?

---

#### 3B. Psychological Violence (Dependent: psychological_violence)
**Independent variables:**
- Sex
- Age
- Income
- Education
- Disability status
- Living arrangement
- Occupation status
- Discrimination
- Community safety
- Helper availability

**Question:** What PREDICTS psychological abuse?

---

### Model 4: LITERACY & CAPABILITY OUTCOMES

#### 4A. Math Ability (Dependent: math)
**Independent variables:**
- Age
- Sex
- Education
- Speak ability
- Read ability
- Write ability
- Training
- Occupation status
- Income

**Question:** What PREDICTS mathematical literacy?

---

### Model 5: SOCIAL SUPPORT OUTCOMES

#### 5A. Living Arrangement (Dependent: family_status - living with family)
**Independent variables:**
- Age
- Sex
- Income
- Education
- Disability status
- hh_elder_count
- hh_child_count
- hh_worker_count
- House status

**Question:** What PREDICTS living with family vs alone?

---

## Model Specifications

### Type of Regression:

**For Binary Outcomes (0/1):** Use **Logistic Regression**
- medical_skip_1
- food_insecurity_1
- food_insecurity_2
- physical_violence
- psychological_violence
- sexual_violence
- family_status
- occupation_status
- disability_status
- All ability variables (speak, read, write, math)

**For Continuous Outcomes:** Use **OLS Linear Regression**
- income_monthly
- health_expense
- hh_health_expense
- BMI
- rent_price
- working_hours

**For Count Outcomes:** Use **Poisson or Negative Binomial Regression**
- hh_elder_count
- hh_child_count
- hh_worker_count

---

## What We'll Report for Each Model:

### 1. Model Statistics:
- R² or Pseudo-R² (how much variance explained)
- Sample size
- Number of predictors
- Model significance (F-test or Chi-square)

### 2. For Each Predictor:
- **Coefficient (β)**: Size and direction of effect
- **Odds Ratio** (for logistic models): How much odds change per unit increase
- **P-value**: Statistical significance
- **95% Confidence Interval**: Uncertainty range
- **Standardized coefficient**: Relative importance (which variables matter most)

### 3. Interpretation:
- Which variables are significant predictors?
- What's the strongest predictor?
- Do results match correlation findings or reveal different story?
- Any surprising non-significant relationships?

---

## Key Analytical Questions to Answer:

### 1. Income vs Education: Which Matters More?
- In food insecurity model: Does income or education predict hunger when controlling for the other?
- In health access model: Can education compensate for low income?

### 2. Gender Effects: Direct or Through Other Variables?
- In violence models: Is being female a direct predictor, or does it work through income/housing?
- In health models: Does gender predict health directly, or through behaviors (smoking/drinking)?

### 3. Living Arrangement: Protective or Selection?
- In nutrition (BMI) model: Does living with family predict better health controlling for income?
- Or do healthier elderly choose to live with family?

### 4. Disability: Multiplicative or Additive?
- In all models: Does disability interact with income? (disability × income term)
- Are disabled low-income elderly worse off than sum of parts?

### 5. Housing Tenure: Beyond Income?
- In violence model: Does renting predict violence after controlling for income?
- In food security: Does homeownership protect beyond wealth effect?

### 6. Work: Income or Social Network?
- In violence model: Does occupation_status predict violence controlling for income?
- If yes → Social protection mechanism, not just money

---

## Output Format

### For Each Model:

```markdown
## Model: [Outcome Variable Name]

**Dependent Variable:** [variable] ([description])
**Model Type:** [Logistic/OLS/Poisson]
**Sample Size:** n = [number]
**R²/Pseudo-R²:** [value]
**Model Significance:** p < [value]

### Significant Predictors (p < 0.05):

| Variable | Coefficient (β) | Std. Error | OR/Effect | p-value | 95% CI | Interpretation |
|----------|----------------|------------|-----------|---------|---------|----------------|
| income_monthly | 0.523 | 0.045 | 1.69 | <0.001 | [0.44, 0.61] | Higher income → Lower odds |
| education | 0.234 | 0.067 | 1.26 | <0.001 | [0.10, 0.37] | More education → Protection |
| ... | ... | ... | ... | ... | ... | ... |

### Non-Significant Variables (p ≥ 0.05):
- [list variables that don't predict outcome]

### Key Findings:
- [Strongest predictor and why]
- [Surprising findings]
- [Policy implications]
```

---

## CSV Outputs:

### 1. regression_models_summary.csv
- All models with their statistics
- Columns: model_name, dependent_var, r_squared, sample_size, num_predictors, p_value

### 2. regression_coefficients_all.csv
- All coefficients from all models
- Columns: model_name, predictor, coefficient, std_error, p_value, ci_lower, ci_upper, significant

### 3. regression_coefficients_significant.csv
- Only significant predictors (p < 0.05)
- Sorted by effect size within each model

### 4. regression_model_[outcome].csv
- Detailed results for each specific model
- Includes predicted values, residuals, diagnostics

---

## Comparison with Correlation Results

After regression, we'll create a comparison showing:

**Example:**
```
food_insecurity_2 (Going Hungry):

Correlation Analysis:
- Correlated with income (r = -0.35)
- Correlated with medical_skip_1 (r = 0.33)
- Correlated with education (r = -0.28)

Regression Analysis:
- Income: β = -0.45, p < 0.001 (STRONGEST predictor)
- Medical_skip_1: β = 0.21, p < 0.01 (Significant but weaker)
- Education: β = -0.05, p = 0.23 (NOT significant when controlling for income)

Insight: Education correlation was confounded by income.
Real predictor is INCOME, not education.
```

---

## Next Steps:

1. ✓ Design complete (this document)
2. Build Python script for automated regression analysis
3. Run all models on elderly data
4. Generate summary report with key findings
5. Create visualization comparing correlation vs regression results
6. Policy recommendations based on true predictors

---

## Expected Timeline:

- Script development: 30-60 minutes
- Model execution: 10-15 minutes
- Report generation: Automatic
- Review and interpretation: Your analysis

This will give much better insights than correlation alone!
