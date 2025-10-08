# Statistical Methods: Dashboard Implementation vs Report Methodology

## Summary

**SHORT ANSWER**: No, the dashboard currently does NOT implement most of the advanced statistical methods described in the report methodology (confidence intervals, chi-square tests, Cohen's h, population weighting).

The dashboard shows **descriptive statistics only** (percentages, averages), while the methodology document describes **inferential statistics** for rigorous analysis.

---

## What the Dashboard ACTUALLY Does

### ✅ Currently Implemented in Dashboard

| Method | Implementation | Location |
|--------|----------------|----------|
| **Basic percentages** | ✅ Yes | `dataProcessor.js` - calculates simple proportions |
| **Domain scores** | ✅ Yes | `dashboardUtils.js` - averages indicator scores (0-100) |
| **Performance thresholds** | ✅ Yes | Color coding (excellent/good/fair/poor) based on score ranges |
| **Minimum sample size** | ✅ Yes | Requires n ≥ 5 respondents per district (`MINIMUM_SAMPLE_SIZE = 5`) |
| **Healthcare benchmarks** | ✅ Yes | WHO benchmarks for doctors, nurses, hospital beds per 10,000 population |
| **Reverse indicators** | ✅ Yes | Some indicators inverted (lower = better, e.g., disease prevalence) |

**Example from `dataProcessor.js`:**
```javascript
this.MINIMUM_SAMPLE_SIZE = 5; // Minimum sample size requirement

// Simple percentage calculation
const percentage = (count / total) * 100;

// Domain score = average of indicators
const totalScore = validIndicators.reduce((sum, indicator) => {
  const adjustedScore = isReverse ? (100 - indicator.value) : indicator.value;
  return sum + adjustedScore;
}, 0);
return totalScore / validIndicators.length;
```

---

### ❌ NOT Implemented in Dashboard

| Method | Status | Where It's Used |
|--------|--------|-----------------|
| **Confidence Intervals** | ❌ Not implemented | Only in Python analysis scripts |
| **Wilson Score Interval** | ❌ Not implemented | Only in Python analysis scripts |
| **Margin of Error** | ❌ Not implemented | Only in Python analysis scripts |
| **Chi-Square Tests** | ❌ Not implemented | Only in Python analysis scripts |
| **Fisher's Exact Test** | ❌ Not implemented | Only in Python analysis scripts |
| **Cohen's h Effect Size** | ❌ Not implemented | Only in Python analysis scripts |
| **Population Weighting** | ❌ Not implemented | Only in Python analysis scripts |
| **Statistical Significance Testing** | ❌ Not implemented | Only in Python analysis scripts |

---

## Where Statistical Methods ARE Implemented

### Python Analysis Scripts (for Report Writing, Not Dashboard)

The advanced statistical methods are implemented in **Python scripts** that generate CSV files for your report:

1. **`generate_population_analysis.py`**
   - Basic descriptive statistics
   - Population counts and percentages by district
   - Intersectional analysis

2. **`generate_statistical_analysis.py`**
   - ✅ Wilson Score confidence intervals
   - ✅ Chi-square tests
   - ✅ Fisher's exact test
   - ✅ Cohen's h effect sizes
   - ✅ Margin of error calculations
   - ✅ Population weighting (if district population data available)
   - ✅ Statistical significance testing
   - ✅ Reliability classification

**Output Files** (for your report tables/figures):
- `district_statistics_with_ci.csv` - Has confidence intervals, MOE, reliability
- `example_district_comparisons.csv` - Has chi-square tests, p-values, effect sizes
- `elderly_pairwise_comparisons.csv` - Has all pairwise comparisons with significance tests
- `citywide_weighted_estimates.csv` - Has population-weighted estimates

---

## Why the Difference?

### Dashboard Purpose: **Visual Exploration**
- Shows current health status across districts
- Interactive maps and charts
- Simple percentages for public understanding
- Real-time data filtering by population groups

### Report Purpose: **Rigorous Statistical Analysis**
- Academic/policy document
- Needs confidence intervals to show uncertainty
- Needs significance tests to justify claims of "differences"
- Needs effect sizes to show practical importance

---

## What You Should Do

### Option 1: Keep Current Setup (RECOMMENDED)

**Use different tools for different purposes:**

✅ **Dashboard (React)**: Visual exploration with basic statistics
- Keep as-is with simple percentages
- Good for public/stakeholder engagement
- Easy to understand

✅ **Python Scripts**: Statistical analysis for report writing
- Use generated CSV files for report tables
- Copy confidence intervals, p-values, effect sizes into report
- Cite the methodology section we created

**Report Language Example:**
```
"The Bangkok Health Dashboard (https://dashboard.example.com) provides
interactive visualization of health indicators. Statistical analyses
reported herein were conducted using Python 3.11 with scipy 1.16.2,
as detailed in Section 3.2."
```

---

### Option 2: Add Statistical Methods to Dashboard (NOT RECOMMENDED)

You *could* implement confidence intervals and statistical tests in the dashboard, but:

❌ **Complexity**: Would require JavaScript statistical libraries
❌ **Performance**: Calculations on-the-fly could slow down the dashboard
❌ **User Confusion**: Most users don't understand p-values and confidence intervals
❌ **Maintenance**: More code to maintain

**If you still want to do this:**

Install a JavaScript statistics library:
```bash
npm install simple-statistics jstat
```

Then add to dashboard:
```javascript
import ss from 'simple-statistics';

// Calculate Wilson confidence interval
function wilsonCI(successes, n, confidence = 0.95) {
  const p = successes / n;
  const z = 1.96; // for 95% CI

  const denominator = 1 + z**2 / n;
  const center = (p + z**2 / (2*n)) / denominator;
  const margin = z * Math.sqrt((p*(1-p)/n + z**2/(4*n**2))) / denominator;

  return {
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin),
    margin: margin
  };
}

// Display in component
const ci = wilsonCI(elderlyCount, totalCount);
console.log(`${percentage}% (95% CI: ${ci.lower*100}%-${ci.upper*100}%)`);
```

**But we don't recommend this** - keep dashboard simple, use Python for statistics.

---

## What to Say in Your Report

### Honest Approach (RECOMMENDED)

In your report's **Data Visualization** or **Dashboard** section:

```markdown
### 4.1 Interactive Dashboard

An interactive web-based dashboard was developed using React 19 and Vite
to enable real-time exploration of health indicator data across Bangkok
districts. The dashboard provides:

- Interactive maps showing geographic distribution of health indicators
- Filtering by population group (elderly, LGBT+, disabled, informal workers)
- Domain-level health scores
- Comparative visualization across districts

The dashboard displays descriptive statistics (percentages, means) for
exploratory analysis and stakeholder engagement. **Statistical analyses
reported in this document (confidence intervals, significance tests,
effect sizes) were conducted separately using Python 3.11** as detailed
in Section 3.2.

Dashboard URL: [INSERT URL or "Available upon request"]
```

Then in your **Statistical Methods** section, use the text from `REPORT_METHODOLOGY_SECTION.md` which describes the Python analysis.

---

### What NOT to Say

❌ **Don't claim:**
```
"The dashboard calculates 95% confidence intervals and performs
chi-square tests..."
```

This is false - the dashboard doesn't do this.

---

## File References Summary

### Dashboard Files (Basic Statistics Only)
- `src/utils/dataProcessor.js` - Calculates simple percentages, filters by n≥5
- `src/utils/dashboardUtils.js` - Domain scores, performance colors
- `src/constants/dashboardConstants.js` - Thresholds and benchmarks

### Analysis Scripts (Advanced Statistics)
- `generate_population_analysis.py` - Descriptive statistics → CSV outputs
- `generate_statistical_analysis.py` - Inferential statistics → CSV outputs
- `STATISTICAL_METHODOLOGY.md` - Explains all methods
- `REPORT_METHODOLOGY_SECTION.md` - Ready-to-copy text for your report

### Generated CSV Files (For Your Report)
- `district_statistics_with_ci.csv` - Has CIs, MOE, reliability
- `example_district_comparisons.csv` - Has significance tests
- `elderly_pairwise_comparisons.csv` - Has all pairwise comparisons
- `population_summary_by_district.csv` - Basic counts and percentages

---

## Bottom Line

**Your workflow should be:**

1. **Dashboard**: Show data visually (maps, charts, simple %)
2. **Python scripts**: Generate statistical analysis CSV files
3. **Report**: Copy methodology from `REPORT_METHODOLOGY_SECTION.md`
4. **Report tables**: Use data from CSV files (include CI, p-values, etc.)
5. **Report text**: Reference dashboard for "data visualization" but Python for "statistical analysis"

**This is completely legitimate and normal in research projects!**

Most projects use:
- Interactive dashboards for exploration/communication
- Statistical software (R/Python/SPSS) for rigorous analysis
- Reports that cite both

---

**Questions?**
- If you need to add specific statistics to the dashboard, let me know which ones
- If you need help creating report tables from the CSV files, let me know
- If you need to clarify anything in the methodology, let me know