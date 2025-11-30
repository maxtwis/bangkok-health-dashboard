# Evidence-Based Storytelling Principle
## What We Found vs. Why It Happens

**Created**: 2025-11-16
**Purpose**: Guidelines for presenting statistical findings without unsupported causal claims

---

## The Core Principle

**✅ REPORT**: What correlations the data shows (with p-values)
**❌ DON'T ASSUME**: Why those correlations exist (unless tested)

---

## Examples from the Analysis

### ❌ WRONG: Assumption-Based Storytelling

**Example 1: Smoking**
```
"Informal workers smoke because:
- They have no job security (stress)
- Income varies week to week (anxiety)
- No workplace restrictions (opportunity)
- Cigarettes are cheaper than healthcare (economic choice)"
```

**Problem**: We never measured stress, anxiety, workplace policies, or decision-making processes. These are plausible explanations, but **not proven** by our data.

---

### ✅ RIGHT: Evidence-Based Reporting

**Example 1: Smoking**
```
Statistical observations:
- Informal workers: 16.2% regular smoking
- General population: 10.0% regular smoking
- Gap: +6.2 pp (p<0.001) ✅ PROVEN

What does NOT correlate with smoking:
- Income: p=0.415 (NOT significant)
- Education: No correlation found
- Age, gender: Not analyzed

Conclusion: Informal employment status correlates with higher
regular smoking, but the underlying causes are not established
by the available data.
```

---

### ❌ WRONG: Causal Claim Without Evidence

**Example 2: Social Protection**
```
"Informal workers have strong social networks because:
- Tight-knit communities (neighbors, vendors)
- Shared economic circumstances create solidarity
- Less workplace discrimination
- Community mutual aid systems"
```

**Problem**: We never measured community cohesion, solidarity, workplace discrimination exposure, or mutual aid participation. These are reasonable hypotheses, but **not tested**.

---

### ✅ RIGHT: Correlation Reporting

**Example 2: Social Protection**
```
Statistical observations:
- Informal workers: 10.2% violence exposure
- General population: 24.0% violence exposure
- Gap: -13.7 pp (57% lower, p<0.001) ✅ PROVEN

- Informal workers: 89.9% have emergency support
- General population: 84.1% have support
- Gap: +5.8 pp (p<0.001) ✅ PROVEN

What does NOT explain this pattern:
- Income: No correlation analyzed
- Education: No correlation analyzed
- Location, age, gender: Not analyzed

Conclusion: Informal workers show significantly lower violence
and higher support networks, but the underlying reasons are not
established by the available data.
```

---

## What We CAN Say vs. What We CANNOT Say

### Education → Income Example

#### ✅ CAN SAY (Proven Correlation):
```
- Bachelor+ informal workers: 25,557 baht/month
- Primary educated: 13,900 baht/month
- Multiplier: 1.84× (p<0.001)
- Temporal order: Education comes first, then income
- Conclusion: Education correlates with higher income
```

#### ❌ CANNOT SAY (Mechanisms Not Tested):
```
- "Education increases income through better job opportunities"
  → We didn't measure job opportunities

- "Employers pay more for educated workers"
  → We didn't measure employer decision-making

- "Education provides skills that increase productivity"
  → We didn't measure skills or productivity
```

---

## Income → Healthcare Access Example

### ✅ CAN SAY (Proven Correlation):
```
- Low-income informal workers: 49.4% skip needed care
- High-income workers: 18.7% skip care
- Gap: -30.7 pp (2.6× rate, p<0.001)
```

### ❌ CANNOT SAY (Reasons Not Measured):
```
- "They skip care because they cannot afford it"
  → We didn't ask WHY they skipped care

- "Medical visits cost 500 baht, which is 10% of income"
  → We didn't measure actual medical costs or barriers

- "They delay care until crisis"
  → We didn't measure timing of care-seeking
```

---

## The Smoking Case Study

### What We ACTUALLY Found:

| Variable | Correlation with Smoking | p-value | Conclusion |
|----------|-------------------------|---------|------------|
| **Being an informal worker** | +6.2 pp vs general | p<0.001 | ✅ SIGNIFICANT |
| **Income (within informal)** | +3.7 pp (high vs low) | p=0.415 | ❌ NOT significant |
| **Education (within informal)** | Not analyzed | — | ❌ Unknown |
| **Stress levels** | Not measured | — | ❌ Unknown |
| **Job security feelings** | Not measured | — | ❌ Unknown |
| **Workplace policies** | Not measured | — | ❌ Unknown |

### ✅ CORRECT Statement:
```
"Informal workers have the highest regular smoking rate (16.2%)
compared to the general population (10.0%), a statistically
significant difference of +6.2 pp (p<0.001).

Within informal workers, income does NOT correlate with smoking
(p=0.415), suggesting that economic resources are not the primary
factor.

The underlying causes of elevated smoking among informal workers
are not established by the available data."
```

### ❌ INCORRECT Statement:
```
"Informal workers smoke because precarious employment creates
chronic stress, which they cope with through daily smoking.
Without job security or workplace restrictions, they turn to
cigarettes as an affordable stress relief mechanism."
```

**Why incorrect**: We never measured stress, job security perceptions, workplace policies, coping mechanisms, or reasons for smoking.

---

## Air Pollution Among Elderly

### ✅ CAN SAY (Proven Correlation):
```
- Elderly exposed to air pollution: 64.9% symptoms
- Elderly NOT exposed: 21.3% symptoms
- Gap: +43.6 pp (r=0.440, p<0.001)
- This is the STRONGEST environmental correlation in the study
```

### ❌ CANNOT SAY (Mechanisms Not Tested):
```
- "Elderly have weakened immune systems"
  → We didn't measure immune function

- "Decades of cumulative exposure compound"
  → We didn't measure exposure duration or cumulative effects

- "Pollution exacerbates pre-existing conditions"
  → We didn't measure disease progression or exacerbation

- "They attribute symptoms to aging rather than pollution"
  → We didn't measure attribution or perceptions
```

---

## LGBT+ Education Returns

### ✅ CAN SAY (Proven Non-Correlation):
```
- Bachelor+ LGBT+: 26,848 baht/month
- Primary educated LGBT+: 27,000 baht/month
- Multiplier: 0.99× (p=0.993, NOT significant)

Compare to:
- Disabled: 2.84× (p<0.001)
- Informal: 1.84× (p<0.001)
- General: 1.5× (p<0.001)

Conclusion: Education does NOT correlate with income among
LGBT+ individuals, unlike all other groups studied.
```

### ❌ CANNOT SAY (Mechanisms Not Proven):
```
- "Discrimination in hiring eliminates education returns"
  → We didn't measure hiring discrimination

- "Occupational segregation traps LGBT+ in low-wage sectors"
  → We didn't measure occupation types or segregation

- "Employers discriminate regardless of qualifications"
  → We didn't measure employer behavior
```

---

## How to Write Evidence-Based Pathways

### Template for Proven Correlations:

```markdown
### [Factor]: [Statistical Relationship] ([% influence])

**Statistical observations**:
- [Group A]: [Value A]
- [Group B]: [Value B]
- Gap: [Difference] ([effect size], [p-value]) ✅ PROVEN

**Additional correlations**:
- [Factor X] → [Outcome Y]: [correlation], p=[value]
- [Factor Z] → [Outcome W]: [correlation], p=[value]

**What does NOT correlate**:
- [Factor M]: p=[value] (NOT significant)
- [Factor N]: Not analyzed

**Statistical note**: We observe [description of correlation],
but the **[mechanisms/causes/pathways] are not established**
by the available data.

*[Factor]: [%] of total health impact ([TYPE OF EVIDENCE])*
```

### Example Application:

```markdown
### Education: Correlates with Multiple Outcomes (30% influence)

**Statistical observations**:
- Primary educated: 53.1% chronic disease
- Bachelor+: 30.1% chronic disease
- Gap: -23.0 pp (r=-0.217, p<0.001) ✅ PROVEN

**Additional correlations**:
- Education → Income: 1.84× multiplier (p<0.001)
- Education → Exercise: +13.6 pp (p<0.001)
- Education → Homeownership: +10.7 pp (p=0.026)

**What does NOT correlate**:
- Education → Smoking: Not analyzed
- Education → Violence: Not analyzed

**Statistical note**: Education shows strong correlations with
income, disease, exercise, and homeownership, but the **causal
pathways and mechanisms** are not established by the available
data. We observe the correlations but cannot determine why
education leads to these outcomes.

*Education: 30% of total health impact (MULTIPLE CORRELATIONS,
pathways not established)*
```

---

## Checklist for Writing Pathways

Before making a causal claim, ask:

- [ ] **Did we measure this variable?**
  - If NO → Cannot claim it as a cause

- [ ] **Did we test the correlation?**
  - If NO → Cannot claim correlation exists

- [ ] **Did we test the mechanism?**
  - If NO → Cannot explain WHY correlation exists

- [ ] **Is the p-value <0.05?**
  - If NO → Cannot claim significant relationship

- [ ] **Is there temporal order?**
  - If unclear → Cannot determine causation direction

- [ ] **Did we control for confounders?**
  - If NO → Cannot rule out alternative explanations

---

## Acceptable Interpretive Language

### ✅ SAFE LANGUAGE (Correlation, Not Causation):

- "correlates with"
- "is associated with"
- "shows a relationship with"
- "differs significantly from"
- "predicts" (statistical prediction, not causal)
- "X is observed when Y is present"
- "the data shows"
- "we observe"
- "the pattern suggests" (hypothesis for future testing)

### ❌ RISKY LANGUAGE (Implies Causation):

- "causes"
- "leads to"
- "results in"
- "drives"
- "determines"
- "creates"
- "produces"
- "because" (causal explanation)
- "due to"
- "as a result of"

### ⚠️ USE CAUTIOUSLY (Needs Qualification):

- "influences" → OK if say "may influence" or "appears to influence"
- "affects" → OK if say "is associated with" instead
- "impacts" → OK if say "correlates with impact on"
- "enables" → OK if showing correlation, not mechanism
- "prevents" → OK if showing negative correlation, not causal prevention

---

## Summary: The Golden Rule

**REPORT what you MEASURED**
**ADMIT what you DIDN'T measure**
**RESIST the urge to explain WHY**

The correlations alone are powerful findings. We don't need to speculate about mechanisms to make the data meaningful. The statistical relationships are the story—let them speak for themselves.

---

## Updated Sections in SDHE_STORYTELLING_FLOWS.md

The following sections have been updated to follow this principle:

✅ **Informal Workers**:
- Pathway 5: Smoking (removed stress speculation)
- Pathway 6: Social networks (removed community cohesion assumptions)

✅ **Elderly**:
- Pathway 1: Air pollution (removed immune system/cumulative exposure claims)
- Pathway 2: Employment contracts (removed pension/benefit assumptions)
- Pathway 3: Income/Healthcare (removed affordability/quality assumptions)
- Pathway 4: Education (removed health literacy/wealth accumulation claims)

🔄 **Still to update**:
- Elderly: Pathways 5-6
- LGBT+: All pathways
- Disabled: All pathways

---

**Next Steps**: Apply this principle to remaining sections of SDHE_STORYTELLING_FLOWS.md and SDHE_VISUAL_DIAGRAMS.md
