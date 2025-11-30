# Methodology Consistency Check: REPORT_SDHE_ANALYSIS_SECTION.md

## Summary of Findings

### Population Size Comparison

| Group | Non-Priority (Overlapping) | Priority (Mutually Exclusive) | Difference |
|---|---|---|---|
| **LGBT+** | 685 | 685 | 0 (no difference) |
| **Elderly (60+)** | 2,986 | 2,964 | 22 |
| **Disabled** | 638 | 229 | **409** |
| **Informal Workers** | 2,645 | 1,330 | **1,315** |
| **General Population** | - | 1,315 | - |

### What the Report Actually Uses

Based on analysis of REPORT_SDHE_ANALYSIS_SECTION.md:

#### ✅ **LGBT+ (n=685)** - CONSISTENT
- Uses: 685
- Matches BOTH methods (same number because no LGBT+ are excluded in priority classification)
- **Status: CORRECT**

#### ❓ **Elderly** - NEEDS VERIFICATION
- Multiple n values found in report (none matching 2,964 or 2,986 exactly in the sample scan)
- Need to check specific tables manually
- **Status: UNCLEAR**

#### ❌ **Disabled (n=638)** - USES NON-PRIORITY
- Uses: **638** (all disabled people)
- Should use with priority: **229** (non-elderly, non-LGBT+ disabled only)
- **Difference: 409 people** are elderly disabled or LGBT+ disabled
- **Status: INCORRECT if trying to use priority method**

#### ❌ **Informal Workers (n=2,645)** - USES NON-PRIORITY
- Uses: **2,645** (all informal workers)
- Should use with priority: **1,330** (working-age, non-disabled, non-LGBT+ informal only)
- **Difference: 1,315 people** are elderly informal, disabled informal, or LGBT+ informal
- **Status: INCORRECT if trying to use priority method**

---

## Who Are the Overlapping People?

### Disabled Group (638 total → 229 after priority)
- **Elderly + Disabled:** 387 people (excluded in priority method → go to "Elderly")
- **LGBT+ + Disabled:** 22 people (excluded in priority method → go to "LGBT+")
- **Non-elderly, non-LGBT+ Disabled:** 229 people (kept in priority method)

### Informal Workers Group (2,645 total → 1,330 after priority)
- **Elderly + Informal:** 1,147 people (excluded → go to "Elderly")
- **Disabled + Informal:** 55 people (excluded → go to "Disabled" if not elderly/LGBT+)
- **LGBT+ + Informal:** 113 people (excluded → go to "LGBT+")
- **Working-age, non-disabled, non-LGBT+ Informal:** 1,330 people (kept)

---

## Analysis Type by Section

### Sections Using NON-PRIORITY Method (Overlapping Groups)

Most of REPORT_SDHE_ANALYSIS_SECTION.md uses **n=638 disabled** and **n=2,645 informal workers**, indicating:

1. **Employment & Income Domain** - Uses n=2,645 informal workers
2. **Education Domain** - Uses n=638 disabled, n=2,645 informal
3. **Healthcare Access Domain** - Uses n=638 disabled, n=2,645 informal
4. **Health Behaviors Section** - MIXED (see below)

### Sections Using PRIORITY Method (Mutually Exclusive)

Based on finding **n=744** and **n=1,330** in the report:

1. **Some health behavior tables** - Uses n=744 or n=1,330 (closer to priority method)
   - n=744 might be informal workers with complete data for specific analysis
   - n=1,330 matches priority classification exactly

---

## The Core Issue

**The report is NOT consistently using one methodology.** It mixes:

### Approach A: Priority Classification (ANALYSIS_METHODOLOGY_LOGIC.md)
- **Purpose:** Compare vulnerable groups to find which needs most intervention
- **Method:** Mutually exclusive groups (each person counted once)
- **Numbers:** Elderly=2,964, Disabled=229, Informal=1,330, LGBT+=685, General=1,315
- **Used in:** Some health behavior correlations

### Approach B: Characteristic-Based Analysis (Most of the report)
- **Purpose:** Understand health patterns by characteristic (disability, informal work) across all demographics
- **Method:** Overlapping groups (people can belong to multiple)
- **Numbers:** Elderly=2,986, Disabled=638, Informal=2,645, LGBT+=685
- **Used in:** Most domain analyses (employment, education, healthcare, etc.)

---

## Implications

### If Using Non-Priority (Current Approach B):

**Pros:**
- Analyzes disability impact across ALL disabled people (including elderly disabled)
- Analyzes informal work impact across ALL informal workers (including elderly informal)
- Larger sample sizes (638 vs 229, 2,645 vs 1,330)
- Better for understanding characteristic-specific impacts

**Cons:**
- People counted multiple times in different analyses
- Cannot compare "which vulnerable group is worst off" (overlapping memberships)
- A 70-year-old disabled informal worker appears in 3 different groups
- Total vulnerable population > actual population (double/triple counting)

### If Using Priority (Methodology Document Approach A):

**Pros:**
- Clean comparisons between groups (mutually exclusive)
- Each person counted exactly once
- Can answer "which group needs most urgent intervention"
- Matches ANALYSIS_METHODOLOGY_LOGIC.md

**Cons:**
- Much smaller samples for disabled (229 vs 638) and informal (1,330 vs 2,645)
- "Disabled" group excludes elderly disabled (who may have different disability experiences)
- "Informal workers" group excludes elderly informal (who may face compounded vulnerabilities)
- Loses information about intersectional experiences

---

## Recommendation

**You need to decide which approach to use consistently:**

### Option 1: Keep Current Approach (Non-Priority) - RECOMMENDED
- Explicitly document that analysis uses overlapping groups
- Add note: "Population groups are NOT mutually exclusive. A person can be analyzed as both 'elderly' and 'informal worker' if they have both characteristics."
- Update ANALYSIS_METHODOLOGY_LOGIC.md to reflect this approach
- Keep n=638 disabled, n=2,645 informal workers

### Option 2: Convert Everything to Priority Method
- Change all n=638 → n=229 for disabled
- Change all n=2,645 → n=1,330 for informal workers
- Re-run all analyses with mutually exclusive groups
- MASSIVE rewrite of entire report
- Loses statistical power due to smaller samples

### Option 3: Hybrid Approach (Document What You're Doing)
- Use NON-PRIORITY for within-characteristic analyses (e.g., income among disabled, smoking by informal work type)
- Use PRIORITY for cross-group comparisons (e.g., which group has highest disease rate)
- Clearly label which tables use which method
- Add methodology section explaining both approaches

---

## Immediate Action Needed

1. **Verify elderly numbers** - Check if report uses n=2,964 (priority) or n=2,986 (non-priority)

2. **Document current approach** - Add clear note in report explaining:
   - "This analysis uses overlapping population groups"
   - "A 65-year-old informal worker is analyzed in both 'Elderly' and 'Informal Workers' sections"
   - "This allows understanding how age and employment type each affect health"

3. **Update methodology document** - Either:
   - Update ANALYSIS_METHODOLOGY_LOGIC.md to reflect non-priority approach, OR
   - Convert report to priority approach (major work)

4. **Clarify Table 1 vs Table 2** discrepancy:
   - Table 1 (n=1,330, 16.2% smoking): Should this use priority?
   - Table 2 (n=1,945, 15.5% smoking): Uses non-priority (all informal by occupation type)
   - Add note explaining why numbers differ
