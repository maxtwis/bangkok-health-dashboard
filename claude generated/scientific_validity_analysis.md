# Scientific Validity: Non-Priority vs Priority for Population Group Comparisons

## The Core Question

**Is it scientifically valid to use overlapping groups (non-priority) when comparing vulnerable populations to general population?**

Short answer: **NO, it's NOT scientifically valid for cross-group comparisons.**

---

## Why Non-Priority is Problematic for Comparisons

### Problem 1: Contaminated Reference Group

When you say "General Population" in non-priority approach, what does it mean?

**Example with Non-Priority:**
- Disabled group: n=638 (includes elderly disabled, LGBT+ disabled)
- Elderly group: n=2,986 (includes elderly disabled)
- General population: n=??? (does it include disabled? elderly? both? neither?)

**The contamination:**
```
If you compare "Disabled (n=638)" to "General Population":
- Are elderly disabled people in BOTH groups?
- Is your "general" group actually "non-disabled" or "everyone including disabled"?
- You can't have a clean baseline if groups overlap
```

### Problem 2: Non-Independent Comparisons

**Statistical principle violated:** When comparing groups, they must be **mutually exclusive** and **collectively exhaustive**.

**Why this matters:**
```python
# Non-priority approach creates this problem:
Total population = 6,523

LGBT+ = 685
Elderly = 2,986
Disabled = 638
Informal = 2,645
"General" = ???

# If you add these up: 685 + 2,986 + 638 + 2,645 = 6,954
# This is > 6,523 total population!
# You've counted some people 2-3 times
```

**Statistical consequence:** Your p-values and significance tests become **invalid** because you're comparing overlapping samples. Statistical tests assume **independent groups**.

### Problem 3: Confounded Comparisons

**Example:** "Disabled people have higher disease rate than general population"

**With Non-Priority (n=638 disabled):**
- Disabled group includes 387 elderly disabled people (60.7% of disabled group)
- Elderly have high disease rates due to AGE, not disability
- Your "disability effect" is confounded by age

**Question you're actually answering:**
- "Do people who are disabled OR elderly OR both have worse health than young non-disabled people?"
- This is NOT the same as "Does disability cause worse health?"

**With Priority (n=229 disabled):**
- Disabled group is only working-age disabled (exclude elderly)
- Controls for age effect
- Clean comparison: "Does disability alone (controlling for age) affect health?"

---

## When Non-Priority IS Valid

### Valid Use Case 1: Within-Group Analysis

**Question:** "Among ALL disabled people (regardless of age), what predicts health outcomes?"

**Approach:** Use n=638 disabled, analyze income/education effects WITHIN this group

**Why valid:** You're not comparing to other groups, just analyzing patterns within the disability population

### Valid Use Case 2: Characteristic-Specific Analysis

**Question:** "What are occupational hazards specific to motorcycle taxi work?"

**Approach:** Analyze ALL motorcycle taxi drivers (n=96) regardless of age/disability

**Why valid:** The occupation is the focus, age is just a covariate

### Valid Use Case 3: Descriptive Statistics

**Question:** "What percentage of ALL informal workers smoke?"

**Approach:** Use n=2,645 (all informal workers)

**Why valid:** Simple description, not causal inference or group comparison

---

## When Priority IS Required

### Required Use Case 1: Cross-Group Comparisons (Your Report's Main Purpose)

**Question:** "Which vulnerable group has the worst health outcomes?"

**Approach:** MUST use mutually exclusive groups (priority classification)

**Why required:**
- Need clean baseline (general population = everyone NOT in vulnerable groups)
- Need independent groups for statistical tests
- Need to attribute effects correctly (is it disability? age? or both?)

### Required Use Case 2: Resource Allocation Decisions

**Question:** "Should we prioritize interventions for disabled or elderly?"

**Approach:** MUST use priority classification

**Why required:**
- You can't allocate resources to overlapping groups
- A 70-year-old disabled person can only receive ONE targeted intervention package
- Need to know: should they get "elderly program" or "disability program"?

### Required Use Case 3: Prevalence/Burden Estimates

**Question:** "What percentage of Bangkok's population is vulnerable?"

**Approach:** MUST use priority classification

**Why required:**
- Overlapping groups inflate totals
- 685 + 2,986 + 638 + 2,645 = 6,954 > 6,523 total population
- Invalid for public health burden calculations

---

## Your Report's Specific Problem

### What Your Report Does (Tables in Section 5.2)

Looking at your report structure:

```markdown
| Population Group | Indicator | General Pop. | This Group | Gap | p-value |
|---|---|---|---|---|---|
| Elderly | Hypertension | 10% | 76% | +66pp | <0.001 |
| Disabled | Hypertension | 10% | 65% | +55pp | <0.001 |
| Informal | Hypertension | 10% | 25% | +15pp | <0.001 |
```

**Question being asked:** "How does each vulnerable group compare to general population?"

**This REQUIRES priority classification because:**

1. **Statistical validity:** Need independent groups for valid p-values
2. **Interpretability:** Need to know if disability effect is separate from age effect
3. **Actionability:** Need to know which group has excess burden AFTER accounting for overlaps

### What Happens with Non-Priority

**Scenario:** 387 elderly disabled people (counted in BOTH groups)

```
Using Non-Priority (n=638 disabled):
- 387/638 = 60.7% of "disabled" group are actually elderly
- Elderly have 76% hypertension (due to age)
- These 387 elderly disabled pull up the disabled group's hypertension rate
- Your "disabled effect" is contaminated by age effect

Result: You can't tell if disability ITSELF causes high disease,
        or if it's just because disabled group contains many elderly
```

**With Priority (n=229 disabled):**
```
Using Priority (n=229 disabled):
- 0% of disabled group are elderly (by definition)
- Compare working-age disabled vs working-age general population
- Clean disability effect, controlling for age

Result: You can isolate the effect of disability separate from age
```

---

## Scientific Standards in Public Health Research

### What Peer-Reviewed Journals Require

When comparing population groups, scientific journals require:

1. ✅ **Mutually exclusive groups** (no person in multiple groups)
2. ✅ **Clearly defined reference group** (who is "general population"?)
3. ✅ **Independent samples** for statistical tests
4. ✅ **Control for confounders** (age, in this case)

**Example from literature:**
- CDC health disparity reports: Use mutually exclusive race/ethnicity groups
- WHO disability studies: Separate "elderly with disability" from "working-age with disability"
- Labor economics: Analyze informal workers AFTER controlling for age/education

### The Methodological Critique Your Report Would Face

**Reviewer comment you'd receive:**

> "The authors compare disabled group (n=638) to general population but fail to note that 60.7% of this disabled group are also elderly. Since elderly have higher disease rates due to age, the reported 'disability effect' is confounded by age. The authors should either:
> 1. Use age-stratified analysis (compare working-age disabled to working-age general)
> 2. Use priority classification to separate age and disability effects
> 3. Acknowledge this as a major limitation affecting all comparisons"

---

## My Statistical Recommendation

### For Your Report Structure (Section 5.2 Cross-Group Comparisons)

**You MUST use priority classification** because:

1. **Scientific validity:** Overlapping groups violate statistical independence assumptions
2. **Confounding:** Age effect contaminates disability effect; elderly/disability/informal effects overlap
3. **Interpretability:** Can't answer "which group is worst off" with overlapping groups
4. **Reproducibility:** Published methodology (ANALYSIS_METHODOLOGY_LOGIC.md) specifies priority classification

### Recommended Changes

**Option A: Full Priority Classification (RECOMMENDED)**
```markdown
Change all instances to:
- Elderly: n=2,964 (priority)
- Disabled: n=229 (working-age, non-LGBT+ disabled only)
- Informal: n=1,330 (working-age, non-disabled, non-LGBT+ informal only)
- LGBT+: n=685 (unchanged)
- General: n=1,315 (everyone else)

Benefit: Clean comparisons, valid statistics, defensible methodology
Cost: Smaller samples for disabled (229 vs 638), informal (1,330 vs 2,645)
```

**Option B: Separate Analyses by Type**

1. **Main comparison tables:** Use priority classification (n=229 disabled, n=1,330 informal)
2. **Supplementary deep dives:** Use full groups (n=638 disabled, n=2,645 informal) for within-group analysis
3. **Clear labeling:** "Main Analysis (Mutually Exclusive Groups)" vs "Supplementary Analysis (All Disabled Regardless of Age)"

**Option C: Age-Stratified Analysis (Most Rigorous)**
```markdown
Compare:
- Working-age disabled (n=229) vs working-age general
- Elderly disabled (n=387) vs elderly general (as separate comparison)
- Working-age informal (n=1,330) vs working-age general
- Elderly informal (n=1,147) vs elderly general
```

This controls for age confounding while using all data.

---

## Answer to Your Specific Question

> "Does it make sense to double count when comparing to other population groups?"

**Scientific answer: NO.**

**Reasons:**
1. ❌ Violates statistical independence (invalid p-values)
2. ❌ Confounds age/disability/employment effects (can't isolate causes)
3. ❌ Creates unclear reference group (what is "general"?)
4. ❌ Inflates vulnerable population counts (6,954 > 6,523)
5. ❌ Wouldn't pass peer review in scientific journals
6. ❌ Makes policy recommendations ambiguous (who should get interventions?)

**Valid for:**
- ✅ Descriptive statistics within one group
- ✅ Characteristic-specific analyses (e.g., all motorcycle taxi drivers)
- ✅ Exploratory data analysis

**Not valid for:**
- ❌ Cross-group comparisons (which group is worse off?)
- ❌ Statistical significance testing between groups
- ❌ Causal inference (does X cause Y?)
- ❌ Resource allocation decisions

---

## My Recommendation

**For REPORT_SDHE_ANALYSIS_SECTION.md:**

1. **Use priority classification throughout** (n=229 disabled, n=1,330 informal)
   - This is scientifically valid
   - Matches your methodology document
   - Allows clean comparisons
   - Produces valid p-values

2. **Add supplementary analyses** for overlapping groups where it makes sense
   - "All informal workers by occupation type" (n=2,645)
   - "All disabled by income level" (n=638)
   - Clearly label as "Supplementary: Not mutually exclusive with other groups"

3. **Be transparent** about what you're doing
   - Main tables: Priority classification
   - Supplementary deep dives: Full groups
   - Always state which approach and why

**This approach is:**
- ✅ Scientifically rigorous
- ✅ Statistically valid
- ✅ Transparent and reproducible
- ✅ Defensible in peer review
- ✅ Useful for policy (clear comparisons + detailed breakdowns)
