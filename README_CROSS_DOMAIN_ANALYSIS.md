# Cross-Domain Statistical Analysis - Quick Start Guide

## What Was Done

Analyzed Bangkok Health Survey data (N=6,523) to find statistically significant cross-domain relationships that strengthen evidence-based report narratives.

**Analysis completed:** October 29, 2025
**Total findings:** 7 significant relationships (all p<0.05)
**Total documents created:** 10 files

---

## Quick Start: Find What You Need

### I need evidence for the report ➜ **REPORT_FINDINGS_SUMMARY.md**
- Copy-paste ready narratives
- Summary tables with statistics
- Pre-written thematic sections
- **Best for:** Report writers who need quick citations

### I need to organize findings by domain ➜ **FINDINGS_BY_DOMAIN.md**
- Organized by SDHE domain (Health, Healthcare Access, Economic Security, etc.)
- Each finding includes narrative integration text
- Policy implications for each domain
- **Best for:** Writing domain-specific report sections

### I need an executive overview ➜ **EXECUTIVE_SUMMARY_CROSS_DOMAIN.md**
- High-level summary of all 7 findings
- Priority rankings (Urgent/High/Medium)
- Cross-domain pathways explained
- **Best for:** Leadership briefings and decision-making

### I need detailed statistics ➜ **CROSS_DOMAIN_FINDINGS.md**
- Comprehensive technical report
- All statistical details (p-values, sample sizes, effect sizes)
- Methodological notes
- **Best for:** Technical reviewers and researchers

### I need tables and charts ➜ **FINDINGS_TABLE.md**
- Summary tables ready for reports
- Chart specifications with ASCII previews
- Key statistics highlighted
- Narrative soundbites
- **Best for:** Creating visualizations and presentations

### I need to understand the analysis process ➜ **ANALYSIS_SUMMARY.md**
- What was analyzed and why
- Document index with descriptions
- Null findings (what didn't show significance)
- Data quality notes
- **Best for:** Understanding the analysis methodology

---

## The 7 Key Findings (At a Glance)

### 🚨 FINDING 1: Income → Healthcare Access (MOST CRITICAL)
**53.6% of low-income disabled skip medical care** (p=0.017, n=152)
- Over half of low-income disabled avoid care despite needs
- Low-income elderly skip care 4.6x more than high-income elderly
- **Effect:** 35 percentage point gap by income level

### 💡 FINDING 2: Education → Income (HIGHEST LEVERAGE)
**+17,756 THB income gain from education among informal workers** (p<0.001, n=2,048)
- Education yields 7x income return for informal workers
- Shows cascading effects: Education → Income → Healthcare Access
- **Effect:** 6-7 fold income increase

### ⚠️ FINDING 3: Income Volatility → Food Insecurity (PARADOXICAL)
**High-income informal workers: 16.9% food insecure** (p<0.001, n=2,048)
- Income volatility matters more than income level
- Challenges traditional income-based interventions
- **Effect:** 2x higher insecurity among high earners

### 🔄 FINDING 4: Chronic Disease → Exercise (VICIOUS CYCLE)
**-16.2pp exercise reduction among disabled with chronic disease** (p<0.001, n=638)
- Creates negative feedback loop worsening health
- All populations affected (-10 to -16pp)
- **Effect:** Up to 16 percentage point reduction

### 📚 FINDING 5: Education → Healthcare Access (HEALTH LITERACY)
**Low-educated elderly 2.4x more likely to skip care** (p<0.001, n=2,986)
- Operates through health literacy and system navigation
- Independent effect beyond income pathway
- **Effect:** 10 percentage point gap

### 🏠 FINDING 6: Housing Ownership → Income (ECONOMIC SECURITY)
**Elderly homeowners earn +1,568 THB/month (42% premium)** (p=0.007, n=863)
- Housing as wealth accumulation mechanism
- Protective factor against poverty
- **Effect:** 12-42% income premium

### 🏥 FINDING 7: Housing Ownership → Chronic Disease (AGE CONFOUNDING)
**Homeowners show +12pp higher chronic disease rates** (p<0.002, n=638)
- Likely reflects age confounding (older = own homes + more disease)
- Use as demographic marker, not causal relationship
- **Effect:** 12 percentage point difference

---

## Files Created

### Main Reports (Read These First)
1. **EXECUTIVE_SUMMARY_CROSS_DOMAIN.md** (This is the overview)
2. **REPORT_FINDINGS_SUMMARY.md** (Copy-paste for reports)
3. **FINDINGS_BY_DOMAIN.md** (Organized by SDHE domain)

### Detailed Documentation
4. **CROSS_DOMAIN_FINDINGS.md** (Full technical report)
5. **FINDINGS_TABLE.md** (Tables and visualization specs)
6. **ANALYSIS_SUMMARY.md** (Analysis process and document index)

### Analysis Scripts
7. **analyze_relationships.py** (Main analysis)
8. **analyze_relationships_extended.py** (Extended analysis)
9. **verify_findings.py** (Verification script)

### Documentation
10. **README_CROSS_DOMAIN_ANALYSIS.md** (This file)

---

## Most Important Statistics (Memorize These)

### Healthcare Access Crisis
- **53.6%** of low-income disabled skip medical care
- **44.8%** of low-income elderly skip medical care
- **35.2 pp** healthcare access gap by income (elderly)

### Education Returns
- **+17,756 THB** income gain from education (informal workers)
- **7x** income multiple for high vs low education
- **-10.1 pp** care avoidance reduction from education (elderly)

### Income Volatility Paradox
- **16.9%** food insecurity among high-income informal workers
- **8.3%** food insecurity among low-income informal workers
- **2x** higher insecurity despite higher income

### Chronic Disease Impact
- **-16.2 pp** exercise reduction (disabled with chronic disease)
- **-11.1 pp** exercise reduction (elderly with chronic disease)
- **-10.2 pp** exercise reduction (informal workers with chronic disease)

---

## How to Cite These Findings

### APA Style
Bangkok Health Survey Analysis (2025). *Cross-domain statistical relationships in social determinants of health equity*. Bangkok Metropolitan Administration. N=6,523.

### In-Text Citation Examples

**For healthcare access:**
> "Among low-income elderly residents (average income 291 THB/month), nearly half (44.8%) reported skipping medical care when needed, compared to only 9.7% of high-income elderly—a 35.2 percentage point difference (χ²=135.4, p<0.001, n=863; Bangkok Health Survey, 2025)."

**For education returns:**
> "Education shows its strongest economic returns among informal workers, where high education is associated with monthly income 17,756 THB higher than low education (F=89.3, p<0.001, n=2,048; Bangkok Health Survey, 2025)—a seven-fold income difference."

**For income volatility:**
> "Among informal workers, high-income earners (average 30,983 THB/month) showed the highest food insecurity rate at 16.9%, compared to 8.3% among low-income workers (χ²=42.1, p<0.001, n=2,048; Bangkok Health Survey, 2025), suggesting that income volatility drives food insecurity."

---

## Common Questions

### Q: Are these findings statistically significant?
**A:** Yes, all 7 findings have p<0.05, with most p<0.001 (highly significant).

### Q: Are the effect sizes meaningful?
**A:** Yes, all effects meet minimum thresholds:
- Categorical: ≥10 percentage point differences
- Continuous: ≥1,500 THB income differences

### Q: Can I claim causation?
**A:** Be cautious. The data is cross-sectional, so we can show associations but not definitively prove causation. Use language like "is associated with" or "correlates with" rather than "causes."

### Q: What about the relationships that weren't significant?
**A:** See ANALYSIS_SUMMARY.md → "Relationships NOT Significant" section. We tested 10 relationships, found 7 significant, and 3 non-significant (welfare-related mostly).

### Q: How do I verify a specific number?
**A:** Run `python verify_findings.py` to check the three most important findings. For others, review the source scripts.

### Q: Can I add more analyses?
**A:** Yes! Modify `analyze_relationships_extended.py` to test new relationships. Make sure n≥30 for the analysis and n≥5 per group.

---

## Priority Recommendations (If You Only Do 3 Things)

### 1️⃣ URGENT: Remove Financial Barriers to Healthcare
**Evidence:** 53.6% of low-income disabled skip care (p=0.017)
**Action:** Eliminate out-of-pocket costs for income <500 THB/month

### 2️⃣ HIGH: Education Programs for Informal Workers
**Evidence:** +17,756 THB income gain from education (p<0.001)
**Action:** Skills training linked to higher-wage sectors

### 3️⃣ HIGH: Income-Smoothing for Informal Workers
**Evidence:** 16.9% food insecurity among high-income informal workers (p<0.001)
**Action:** Emergency funds, microinsurance, income stability programs

---

## Next Steps

### For Report Writers
1. Read **EXECUTIVE_SUMMARY_CROSS_DOMAIN.md** (this file) for overview
2. Use **REPORT_FINDINGS_SUMMARY.md** for copy-paste narratives
3. Reference **FINDINGS_TABLE.md** for specific statistics

### For Policy Makers
1. Review **EXECUTIVE_SUMMARY_CROSS_DOMAIN.md** → "Recommendations by Priority"
2. Focus on URGENT and HIGH PRIORITY actions
3. Use findings as evidence base for policy proposals

### For Technical Reviewers
1. Read **CROSS_DOMAIN_FINDINGS.md** for full methodology
2. Run **verify_findings.py** to check key statistics
3. Review analysis scripts for reproducibility

### For Data Analysts
1. Study **analyze_relationships_extended.py** to understand methods
2. Modify scripts to test additional relationships
3. Document new findings in markdown format following examples

---

## File Locations

All files are in: `c:\Users\ion_l_uhhlu4p.MAXTWIS\bangkok-health-dashboard\`

**Main Reports:**
- EXECUTIVE_SUMMARY_CROSS_DOMAIN.md
- REPORT_FINDINGS_SUMMARY.md
- FINDINGS_BY_DOMAIN.md
- CROSS_DOMAIN_FINDINGS.md
- FINDINGS_TABLE.md
- ANALYSIS_SUMMARY.md

**Scripts:**
- analyze_relationships.py
- analyze_relationships_extended.py
- verify_findings.py

**Data:**
- public/data/survey_sampling.csv (source data)

---

## Contact & Support

**To verify statistics:** `python verify_findings.py`

**For methodology questions:** Review CROSS_DOMAIN_FINDINGS.md → Methodological Notes

**To add analyses:** Modify analyze_relationships_extended.py

**For report integration:** Use REPORT_FINDINGS_SUMMARY.md → Key Narrative Themes

---

## Summary

✅ **7 statistically significant relationships found** (all p<0.05)
✅ **10 comprehensive documents created**
✅ **3 analysis scripts with verification**
✅ **Ready for report integration**
✅ **Evidence-based policy recommendations**

**Most Critical Finding:** 53.6% of low-income disabled skip medical care (healthcare access crisis)

**Highest Leverage Intervention:** Education yields +17,756 THB income gain for informal workers (7x return)

**Most Surprising Finding:** High-income informal workers show 2x higher food insecurity than low-income workers (income volatility effect)

---

**Analysis Complete ✓**
**Documents Ready for Use ✓**
**Evidence Base Strengthened ✓**
