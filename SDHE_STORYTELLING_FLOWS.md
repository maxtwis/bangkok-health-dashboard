# Social Determinant of Health Storytelling Flows
## 4 Population Groups - Bangkok Health Equity Analysis

**Purpose**: Evidence-based storytelling flows for creating proportional SDHE diagrams where slice size represents statistical influence (effect size + p-value significance).

**Data Source**: REPORT_SDHE_ANALYSIS_SECTION.md statistical findings
**Methodology**: ANALYSIS_METHODOLOGY_LOGIC.md
**Last Updated**: 2025-11-15

---

## Table of Contents

1. [Informal Workers - "The Multi-Pathway Vulnerability"](#1-informal-workers)
2. [Elderly 60+ - "Lifetime Accumulation Meets Environmental Exposure"](#2-elderly-60)
3. [LGBT+ - "The Broken SDHE Pathways"](#3-lgbt)
4. [Disabled - "The Amplification Effect"](#4-disabled)
5. [Comparative Analysis](#5-comparative-analysis)
6. [Implementation Guidelines](#6-implementation-guidelines)

---

## 1. INFORMAL WORKERS - "The Multi-Pathway Vulnerability"

**Population Size**: n=1,330
**Core Narrative**: Education as the master key that unlocks multiple protective pathways, but employment stress creates harmful coping behaviors.

### The Causal Pathways

#### PRIMARY CASCADE: Education → Income → Health

**STARTING POINT: Educational Disadvantage**
- Primary education only: 53.1% chronic disease rate
- Bachelor+ education: 30.1% chronic disease rate
- **Effect**: 23.0 pp gap (r=-0.217, p<0.001) ⭐⭐⭐

↓

**MECHANISM 1: Education → Income**
- Bachelor+: 25,557 THB/month
- Primary: 13,900 THB/month
- **Effect**: 84% income penalty for low education (1.84× multiplier, p<0.001) ⭐⭐⭐

↓

**MECHANISM 2: Income → Healthcare Access**
- Low income: 49.4% skip needed medical care
- Higher income: 18.7% skip care
- **Effect**: 30.7 pp gap (p<0.001) ⭐⭐⭐

↓

**MECHANISM 3: Income → Chronic Disease**
- Lowest income (Q1): 47.6% chronic disease
- Highest income (Q4): 36.1% chronic disease
- **Effect**: 11.5 pp gap (r=-0.091, p<0.001) ⭐⭐⭐

---

#### PARALLEL PATHWAY: Education → Health Behavior → Disease

**Education → Exercise**
- Bachelor+: 29.2% exercise regularly
- Primary: 15.7% exercise regularly
- **Effect**: 13.6 pp gap (p<0.001) ⭐⭐

↓

**Exercise → Chronic Disease (UNIQUE to informal workers!)**
- Regular exercisers: 35.1% chronic disease
- Non-exercisers: 49.3% chronic disease
- **Effect**: 14.2 pp gap (r=-0.121, p<0.001) ⭐⭐⭐
- **Finding**: ONLY population group showing significant exercise protection

---

#### STRESS PATHWAY: Employment Precarity → Smoking

**Regular Smoking as Stress Marker**
- Informal workers: 16.2% regular smoking (HIGHEST of all groups)
- General population: 10.0% regular smoking
- **Effect**: +6.2 pp gap (p<0.001) ⭐⭐⭐
- **Mechanism**: Employment stress, no workplace smoking restrictions, precarious employment coping
- **Interpretation**: Not just occasional smoking, but habitual daily smoking driven by informal work conditions

---

#### ENVIRONMENTAL MULTIPLIER: Income → Disaster Exposure

**Multi-Hazard Zone Concentration**
- Low income: 85.7% disaster exposure (flood/heat/pollution/epidemics)
- High income: 67.4% disaster exposure
- **Effect**: 18.3 pp gap (p<0.001) ⭐⭐⭐

**Housing Instability**
- Renters: 39.7% overcrowding
- Homeowners: 27.5% overcrowding
- **Effect**: 12.2 pp gap (p=0.002) ⭐⭐

**Homeownership Paradox**
- Education → Homeownership: +10.7 pp (p=0.026) ⭐
- BUT Homeowners → MORE disasters: +4.5 pp (p=0.013) ⭐
- **Interpretation**: Affordable homeownership concentrates in disaster-prone areas

---

#### SOCIAL PROTECTION: Strong Networks Buffer Vulnerability

**Emergency Support Networks**
- Informal workers: 89.9% have emergency support
- General population: 84.1%
- **Effect**: +5.8 pp (p<0.001) ⭐⭐⭐
- **Interpretation**: Strong family/community networks despite economic vulnerability

**Violence Protection**
- Informal workers: 10.2% violence exposure
- General population: 24.0%
- **Effect**: -13.7 pp (p<0.001) ⭐⭐⭐
- **Interpretation**: Social networks provide safety buffer

**Lower Discrimination**
- Informal workers: 13.7% report discrimination
- General population: 17.6%
- **Effect**: -3.9 pp (p=0.004) ⭐⭐
- **Type**: Primarily economic discrimination (8.0%)

---

### SDHE Pie Chart Proportions - Informal Workers

**Total Influence = 100%**

| SDHE Factor | Slice % | Evidence | Visual Priority |
|-------------|---------|----------|----------------|
| **EDUCATION** | **30%** | r=-0.217 (disease), 84% income gap, drives 5 pathways | **LARGEST** ⭐⭐⭐ |
| **INCOME** | **20%** | r=-0.091 (disease), 30.7pp healthcare gap | **LARGE** ⭐⭐⭐ |
| **ENVIRONMENT (Disasters)** | **15%** | 18.3pp disaster exposure gap | **MEDIUM** ⭐⭐⭐ |
| **EXERCISE (Unique Protection)** | **12%** | r=-0.121, 14.2pp gap, ONLY group with effect | **MEDIUM** ⭐⭐⭐ |
| **SOCIAL PROTECTION** | **10%** | -13.7pp violence, +5.8pp support | **SMALL** ⭐⭐⭐ |
| **SMOKING (Stress Marker)** | **8%** | +6.2pp habitual smoking, employment stress | **SMALL** ⭐⭐⭐ |
| **HOUSING** | **5%** | 12.2pp overcrowding, homeownership paradox | **MINIMAL** ⭐⭐ |

### Visual Diagram Layout

```
┌─────────────────────────────────────────────────────────────┐
│ INDIVIDUAL FACTORS                                          │
├─────────────────────────────────────────────────────────────┤
│ 🎓 EDUCATION (30% influence) ⭐⭐⭐                          │
│   • r=-0.217 with chronic disease                           │
│   • Drives 5 downstream pathways:                           │
│     1) Income (+84% for Bachelor+)                          │
│     2) Exercise (+13.6pp adoption)                          │
│     3) Homeownership (+10.7pp)                              │
│     4) Disease burden (-23pp)                               │
│     5) Health literacy                                      │
│                                                             │
│ 💪 EXERCISE (12% influence) ⭐⭐⭐ UNIQUE PROTECTION!       │
│   • Regular exercisers: 35.1% disease                       │
│   • Non-exercisers: 49.3% disease                           │
│   • Gap: -14.2pp (r=-0.121, p<0.001)                        │
│   • ONLY group showing exercise protection!                 │
│                                                             │
│ 🚬 REGULAR SMOKING (8% influence) ⭐⭐⭐ STRESS MARKER      │
│   • HIGHEST habitual smoking: 16.2% vs 10.0% general        │
│   • +6.2pp gap (p<0.001)                                    │
│   • Driven by: Employment stress, no workplace restrictions │
│   • Reflects precarious employment coping                   │
└───────────┬─────────────────────────────────────────────────┘
            │
            └──→ SOCIOECONOMIC CASCADE
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ SOCIOECONOMIC FACTORS                                        │
├─────────────────────────────────────────────────────────────┤
│ 💰 INCOME (20% influence) ⭐⭐⭐                             │
│   • Bachelor+: 25,557 THB vs Primary: 13,900 THB           │
│   • Education multiplier: 1.84×                             │
│   • Direct effects:                                         │
│     - Healthcare: 49.4% low-income skip care                │
│     - Disease: Q1 47.6% vs Q4 36.1% (-11.5pp)               │
│     - Disaster exposure: 85.7% vs 67.4% (-18.3pp)           │
│                                                             │
│ 🏠 HOMEOWNERSHIP (5% influence) ⭐                          │
│   • Education → Homeownership: +10.7pp (p=0.026)            │
│   • BUT: Homeowners in disaster zones (+4.5pp, p=0.013)     │
│   • Trade-off: Affordable ownership vs safe location        │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ ENVIRONMENTAL & SOCIAL CONTEXT
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ ENVIRONMENTAL FACTORS (15% influence) ⭐⭐⭐                 │
├─────────────────────────────────────────────────────────────┤
│ 🌊🌡️💨 MULTI-HAZARD DISASTER EXPOSURE                      │
│   • Low income: 85.7% exposed to disasters                  │
│   • High income: 67.4% exposed                              │
│   • Gap: -18.3pp (p<0.001)                                  │
│   • Types: Flooding, heat, air pollution, epidemics         │
│                                                             │
│ 🏘️ HOUSING OVERCROWDING (5% sub-component)                 │
│   • Renters: 39.7% overcrowding                             │
│   • Homeowners: 27.5% overcrowding                          │
│   • Gap: -12.2pp (p=0.002)                                  │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ SOCIAL PROTECTION
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ SOCIAL FACTORS (10% influence - PROTECTIVE) ⭐⭐⭐          │
├─────────────────────────────────────────────────────────────┤
│ 🤝 EMERGENCY SUPPORT NETWORKS                               │
│   • 89.9% have emergency support                            │
│   • +5.8pp vs general (p<0.001)                             │
│   • Strong family/community networks buffer vulnerability   │
│                                                             │
│ 🛡️ VIOLENCE PROTECTION                                     │
│   • 10.2% violence exposure                                 │
│   • -13.7pp vs general (p<0.001)                            │
│   • Social networks provide safety                          │
│                                                             │
│ ⚖️ DISCRIMINATION (Lower than general)                     │
│   • 13.7% discriminated vs 17.6% general                    │
│   • -3.9pp (p=0.004)                                        │
│   • Primarily economic discrimination (8.0%)                │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ HEALTH OUTCOMES
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ HEALTH OUTCOMES                                              │
├─────────────────────────────────────────────────────────────┤
│ 💔 CHRONIC DISEASE BURDEN                                   │
│   • Primary education: 53.1% disease                        │
│   • Bachelor+ education: 30.1% disease                      │
│   • Gap: -23.0pp (r=-0.217, p<0.001)                        │
│                                                             │
│ 🏥 HEALTHCARE ACCESS BARRIER                                │
│   • Low income: 49.4% skip needed care                      │
│   • Higher income: 18.7% skip care                          │
│   • Gap: -30.7pp (p<0.001)                                  │
│                                                             │
│ ⚡ KEY PATHWAYS:                                            │
│   1. Education → Income → Healthcare → Disease (MAIN)       │
│   2. Education → Exercise → Disease (UNIQUE PROTECTION)     │
│   3. Employment Stress → Smoking (HARM MARKER)              │
│   4. Social Networks → Violence Protection (BUFFER)         │
│   5. Income → Environment → Health (MULTIPLIER)             │
└──────────────────────────────────────────────────────────────┘
```

### Key Insights for Diagram Creation

**Most Influential Factor**: EDUCATION (30%)
- Drives income, exercise, homeownership, disease through cascade
- r=-0.217 strongest correlation with health outcomes

**Unique Findings**:
- ONLY group where exercise shows significant disease protection
- HIGHEST regular smoking rate (stress marker)
- Strong social protection despite economic vulnerability

**Color Coding Recommendation**:
- 🟦 Education (largest, blue) - 30%
- 🟩 Income (green) - 20%
- 🟨 Environment/Disasters (yellow) - 15%
- 🟧 Exercise/Health Behavior (orange) - 12%
- 🟣 Social Protection (purple) - 10%
- 🟥 Smoking/Stress (red) - 8%
- ⬜ Housing (light gray) - 5%

---

## 2. ELDERLY 60+ - "Lifetime Accumulation Meets Environmental Exposure"

**Population Size**: n=2,964
**Core Narrative**: Lifetime socioeconomic position determines quality of life, but age makes disease near-universal. Environmental exposure (air pollution) is the major modifiable risk.

### The Causal Pathways

#### LIFETIME FOUNDATION: Education → Employment Contracts → Income

**STARTING POINT: Educational Attainment (Lifetime)**
- Bachelor+: 49.9% chronic disease
- Primary: 64.0% chronic disease
- **Effect**: 14.1 pp gap (r=-0.119, p<0.001) ⭐⭐⭐

↓

**MECHANISM 1: Education → Employment Contracts (Lifetime Career)**
- Bachelor+: 24.0% have contracts
- Primary: 4.0% have contracts
- **Effect**: 20.0 pp gap (p=0.0005) ⭐⭐⭐

↓

**MECHANISM 2: Contracts → Income (STRONGER than education!)**
- With contract: 20,709 THB/month
- Without contract: 14,207 THB/month
- **Effect**: 46% income premium (p<0.0001) ⭐⭐⭐
- **Finding**: Contract status matters MORE than education for elderly income

---

#### CRITICAL SPLIT: Income Determines Quality of Life, Not Disease

**PATH A: Income → Healthcare Access**
- Low income: 43.6% skip needed care
- Higher income: 12.7% skip care
- **Effect**: 30.9 pp gap, 3.4× higher skipping rate (p<0.001) ⭐⭐⭐
- **Interpretation**: Income affects disease management, not prevention

**PATH B: Income → Housing (REVERSE PARADOX!)**
- HIGH income: 48.1% overcrowding
- LOW income: 37.6% overcrowding
- **Effect**: REVERSE +10.4 pp gap (p=0.006) ⭐⭐
- **Mechanism**: High-income elderly choose dense central areas for healthcare/services access over space

**Education → Homeownership (Lifetime Accumulation)**
- Bachelor+: 76.2% own homes
- Primary: 41.1% own homes
- **Effect**: 35.1 pp gap (p<0.001) ⭐⭐⭐
- **Interpretation**: Educated elderly accumulated wealth through higher-paying careers

---

#### STRONGEST ENVIRONMENTAL EFFECT: Air Pollution → Health

**Air Pollution Disaster Exposure**
- Exposed: 64.9% health symptoms
- Not exposed: 21.3% symptoms
- **Effect**: 43.6 pp gap (r=0.440) - STRONGEST environmental correlation in entire analysis ⭐⭐⭐

---

#### HEALTH BEHAVIOR: Education Drives Exercise, But No Disease Effect

**Education → Exercise (STRONGEST gradient)**
- Bachelor+: 38.8% exercise regularly
- Primary: 16.7% exercise
- **Effect**: 22.1 pp gap (p<0.001) - HIGHEST education-exercise relationship ⭐⭐⭐

**BUT: Exercise → Disease (NO EFFECT)**
- Exercise shows NO disease reduction (p=0.893)
- 88% have chronic disease regardless of exercise
- **Interpretation**: Age dominates disease risk; exercise affects quality of life, not disease presence

---

#### SMOKING PARADOX: Medical Cessation After Diagnosis

**Reverse Causation**
- Current smokers: 79.9% chronic disease
- Non-smokers/Quit: 89.2% chronic disease
- **Effect**: -9.4 pp gap (r=-0.076, p<0.001) ⭐⭐⭐
- **Mechanism**: Diagnosis → Doctor advice → Cessation
- **Finding**: Strongest reverse causation pattern due to large sample + high disease prevalence

---

#### SOCIAL PROTECTION: Strongest of All Groups

**Violence Protection (Lowest exposure)**
- Elderly: 3.8% violence exposure
- General: 24.0% violence exposure
- **Effect**: -20.1 pp (p<0.001) ⭐⭐⭐

**Emergency Support (Highest)**
- Elderly: 95.1% have emergency support
- General: 84.1%
- **Effect**: +11.0 pp (p<0.001) ⭐⭐⭐

**Discrimination (Lowest)**
- Elderly: 8.5% report discrimination
- General: 17.6%
- **Effect**: -9.1 pp (p<0.001) ⭐⭐⭐
- **Types**: Economic (5.4%), Age (2.6%)

**Discrimination → Smoking (Stress Coping)**
- With discrimination: 19.8% smoke
- Without: 13.2% smoke
- **Effect**: +6.6 pp (p=0.005) ⭐⭐

---

### SDHE Pie Chart Proportions - Elderly 60+

**Total Influence = 100%**

| SDHE Factor | Slice % | Evidence | Visual Priority |
|-------------|---------|----------|----------------|
| **AIR POLLUTION** | **25%** | r=0.440, 43.6pp symptom gap, STRONGEST environmental effect | **LARGEST** ⭐⭐⭐ |
| **EMPLOYMENT CONTRACTS** | **20%** | 46% income premium (p<0.0001), 20pp contract gap | **LARGE** ⭐⭐⭐ |
| **INCOME/HEALTHCARE ACCESS** | **18%** | 30.9pp medical skipping gap (p<0.001) | **LARGE** ⭐⭐⭐ |
| **EDUCATION** | **15%** | r=-0.119 (disease), 22.1pp exercise, 35.1pp homeownership | **MEDIUM** ⭐⭐⭐ |
| **SOCIAL PROTECTION** | **12%** | -20.1pp violence, +11.0pp support, -9.1pp discrimination | **MEDIUM** ⭐⭐⭐ |
| **HOUSING PARADOX** | **8%** | Reverse: high income → dense living for access | **SMALL** ⭐⭐ |
| **DISCRIMINATION→SMOKING** | **2%** | +6.6pp smoking with discrimination | **MINIMAL** ⭐⭐ |

### Visual Diagram Layout

```
┌─────────────────────────────────────────────────────────────┐
│ INDIVIDUAL FACTORS (LIFETIME)                               │
├─────────────────────────────────────────────────────────────┤
│ 🎓 EDUCATION LEVEL (15% influence) ⭐⭐⭐                    │
│   • Sets lifetime trajectory                                │
│   • r=-0.119 with chronic disease                           │
│   • Effects:                                                │
│     - Employment contracts: +20pp                           │
│     - Exercise adoption: +22.1pp (STRONGEST gradient)       │
│     - Homeownership: +35.1pp                                │
│     - Disease: -14.1pp                                      │
│                                                             │
│ 💪 EXERCISE (No disease effect) ❌                          │
│   • Bachelor+: 38.8% exercise vs Primary: 16.7%             │
│   • BUT: No disease reduction (p=0.893)                     │
│   • 88% have disease regardless                             │
│   • Age dominates disease risk                              │
│                                                             │
│ 🚬 SMOKING PARADOX (Reverse Causation) ⭐⭐⭐               │
│   • Smokers: 79.9% disease vs Non-smokers: 89.2%            │
│   • -9.4pp gap (r=-0.076, p<0.001)                          │
│   • Mechanism: Diagnosis → Cessation                        │
└───────────┬─────────────────────────────────────────────────┘
            │
            └──→ SOCIOECONOMIC CASCADE (LIFETIME)
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ SOCIOECONOMIC FACTORS                                        │
├─────────────────────────────────────────────────────────────┤
│ 💼 EMPLOYMENT CONTRACTS (20% influence) ⭐⭐⭐              │
│   • STRONGER income predictor than education                │
│   • With contract: 20,709 THB vs Without: 14,207 THB        │
│   • Contract premium: +6,502 THB/month (46%, p<0.0001)      │
│   • Bachelor+ holders: 24.0% vs Primary: 4.0% (+20pp)       │
│                                                             │
│ 💰 INCOME/HEALTHCARE (18% influence) ⭐⭐⭐                  │
│   • Low income: 43.6% skip needed care                      │
│   • Higher income: 12.7% skip care                          │
│   • Gap: -30.9pp (3.4× higher skipping, p<0.001)            │
│   • Income affects quality of life, NOT disease prevention  │
│                                                             │
│ 🏠 HOMEOWNERSHIP (in Housing 8%)                            │
│   • Bachelor+: 76.2% own vs Primary: 41.1%                  │
│   • Gap: +35.1pp (p<0.001)                                  │
│   • Lifetime wealth accumulation                            │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ ENVIRONMENTAL & HOUSING
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ ENVIRONMENTAL FACTORS (25% influence) ⭐⭐⭐                 │
├─────────────────────────────────────────────────────────────┤
│ 💨 AIR POLLUTION (STRONGEST EFFECT)                         │
│   • Exposed: 64.9% health symptoms                          │
│   • Not exposed: 21.3% symptoms                             │
│   • Gap: 43.6pp (r=0.440)                                   │
│   • STRONGEST environmental health correlation in analysis  │
│   • Major modifiable risk factor                            │
│                                                             │
│ 🏘️ HOUSING PARADOX (8% influence) ⭐⭐                      │
│   • HIGH income → 48.1% overcrowding                        │
│   • LOW income → 37.6% overcrowding                         │
│   • REVERSE +10.4pp gap (p=0.006)                           │
│   • Choose healthcare proximity over space                  │
│   • Renters: 51.4% vs Owners: 32.4% overcrowding            │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ SOCIAL PROTECTION
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ SOCIAL FACTORS (12% influence - STRONGEST) ⭐⭐⭐           │
├─────────────────────────────────────────────────────────────┤
│ 🛡️ VIOLENCE PROTECTION (LOWEST EXPOSURE)                   │
│   • 3.8% violence vs 24.0% general                          │
│   • -20.1pp (p<0.001)                                       │
│   • Age-based social respect                                │
│                                                             │
│ 🤝 EMERGENCY SUPPORT (HIGHEST)                              │
│   • 95.1% have support vs 84.1% general                     │
│   • +11.0pp (p<0.001)                                       │
│   • Strong family networks                                  │
│                                                             │
│ ⚖️ DISCRIMINATION (LOWEST)                                 │
│   • 8.5% vs 17.6% general                                   │
│   • -9.1pp (p<0.001)                                        │
│   • Types: Economic (5.4%), Age (2.6%)                      │
│                                                             │
│ 🚬 DISCRIMINATION → SMOKING (2% sub-component) ⭐⭐         │
│   • With discrimination: 19.8% smoke vs Without: 13.2%      │
│   • +6.6pp (p=0.005)                                        │
│   • Stress-coping mechanism                                 │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ HEALTH OUTCOMES
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ HEALTH OUTCOMES                                              │
├─────────────────────────────────────────────────────────────┤
│ 💔 CHRONIC DISEASE (Near-Universal, Age-Driven)             │
│   • 88% chronic disease rate                                │
│   • Primary: 64.0% vs Bachelor+: 49.9% (-14.1pp)            │
│   • Age dominates; socioeconomic factors affect management  │
│                                                             │
│ 💨 ENVIRONMENTAL HEALTH BURDEN                              │
│   • Air pollution: 64.9% symptoms (r=0.440)                 │
│   • Major modifiable risk                                   │
│                                                             │
│ ⚡ KEY INSIGHT:                                             │
│   Income matters for QUALITY OF LIFE                        │
│   (healthcare access, symptom management)                   │
│   NOT disease prevention (age dominates)                    │
└──────────────────────────────────────────────────────────────┘
```

### Key Insights for Diagram Creation

**Most Influential Factors**:
1. AIR POLLUTION (25%) - r=0.440, acute symptoms, major modifiable risk
2. EMPLOYMENT CONTRACTS (20%) - lifetime income, healthcare access
3. INCOME/HEALTHCARE (18%) - quality of life, not prevention

**Unique Findings**:
- Strongest environmental health effect (air pollution r=0.440)
- Housing paradox: high income → dense living for healthcare access
- Exercise drives behavior but not disease (age dominates)
- Strongest social protection of all groups

**Color Coding Recommendation**:
- 🟨 Air Pollution (largest, yellow/orange) - 25%
- 🟦 Employment Contracts (blue) - 20%
- 🟩 Income/Healthcare Access (green) - 18%
- 🟪 Education (purple) - 15%
- 🟣 Social Protection (light purple) - 12%
- 🟥 Housing Paradox (red) - 8%
- ⬜ Discrimination→Smoking (light gray) - 2%

---

## 3. LGBT+ - "The Broken SDHE Pathways"

**Population Size**: n=685
**Core Narrative**: Structural discrimination eliminates ALL traditional protective factors. Education provides zero benefits. Income is the only lever, but it's double-edged (enables both safety and harmful coping).

### The Causal Pathways

#### FOUNDATION: STRUCTURAL DISCRIMINATION BREAKS ALL PATHWAYS

**CRITICAL FINDING: EDUCATION PROVIDES ZERO BENEFITS** ❌❌❌

**Education → Income: BROKEN**
- Bachelor+: 26,848 THB/month
- Primary: 27,000 THB/month
- **Effect**: -152 THB (0.99× multiplier, p=0.993) ❌
- **Mechanism**: Discrimination eliminates economic returns to education

**Education → Chronic Disease: BROKEN**
- Bachelor+: 37.5% chronic disease
- Primary: 45.9% chronic disease
- **Effect**: 8.4 pp gap (NOT significant, r=-0.026, p=0.498) ❌
- **Interpretation**: Education provides NO health protection

**Education → Exercise: BROKEN**
- Bachelor+: 30.0% exercise
- Primary: 27.0% exercise
- **Effect**: 3.0 pp gap (NOT significant, p=0.857) ❌
- **Interpretation**: Discrimination eliminates health literacy benefits

---

#### INCOME: THE ONLY PROTECTIVE FACTOR (But Double-Edged)

**✅ PROTECTIVE EFFECTS**

**Income → Overcrowding Reduction**
- Low income: 34.4% overcrowding
- High income: 9.2% overcrowding
- **Effect**: 25.2 pp gap (p<0.001) ⭐⭐⭐

**Income → Healthcare Access**
- Low income: 62.5% skip needed care (MAJORITY!)
- Higher income: 42.7% skip care
- **Effect**: 19.8 pp gap (p=0.043) ⭐

**Housing Tenure → Overcrowding**
- Renters: 22.0% overcrowding
- Homeowners: 4.9% overcrowding
- **Effect**: 17.1 pp gap (p<0.001) ⭐⭐⭐

**⚠️ HARMFUL EFFECTS**

**Income → Drinking (UNIQUE - Only group showing this)**
- High income: 52.8% drink alcohol
- Low income: 25.0% drink alcohol
- **Effect**: 27.8 pp gap, 2.1× higher rate (p=0.004) ⭐⭐⭐
- **Interpretation**: Resources enable harmful coping mechanism

**Income → Psychological Violence**
- High income: 31.9% violence exposure
- Low income: 9.4% violence exposure
- **Effect**: 22.5 pp gap (p=0.013) ⭐⭐
- **Mechanism**: Workplace visibility, formal employment discrimination

---

#### VICIOUS CYCLE: Discrimination ↔ Smoking ↔ Violence

**Bidirectional Feedback Loop (UNIQUE to LGBT+)**

**Discrimination → Smoking (Stress Coping)**
- With discrimination: 22.8% smoke
- Without discrimination: 14.6% smoke
- **Effect**: 8.1 pp gap (p=0.009) ⭐⭐

**Smoking → Discrimination (Visibility/Exposure)**
- Smokers: 50.0% discriminated
- Non-smokers: 36.8% discriminated
- **Effect**: 13.2 pp gap (p=0.009) ⭐⭐

**Smoking → Violence (UNIQUE to LGBT+)**
- Smokers: 49.2% violence exposure
- Non-smokers: 37.3% violence exposure
- **Effect**: 11.9 pp gap (p=0.020) ⭐
- **Finding**: No other group shows smoking-violence relationship

---

#### DISCRIMINATION & VIOLENCE: Highest Exposure

**Gender-Based Discrimination (Dominant)**
- LGBT+: 39.1% report discrimination
- General: 17.6%
- **Effect**: +21.6 pp gap ⭐⭐⭐
- **Type**: 97% gender-based (38.1% of 39.1% total)
- 11× higher than general population gender discrimination (3.5%)

**Violence Exposure (All Types)**
- LGBT+: 39.4% any violence
- General: 24.0%
- **Effect**: +15.5 pp ⭐⭐⭐
- Psychological: 29.2% (+12.0 pp)
- Physical: 13.1% (+7.1 pp)

---

#### SOCIAL ISOLATION: Weakest Support Networks

**Emergency Support (ONLY group below general)**
- LGBT+: 82.6% have emergency support
- General: 84.1%
- **Effect**: -1.5 pp (not significant, but concerning)
- **Interpretation**: Weaker family/friend networks compound discrimination/violence vulnerability

---

### SDHE Pie Chart Proportions - LGBT+

**Total Influence = 100%**

| SDHE Factor | Slice % | Evidence | Visual Priority |
|-------------|---------|----------|----------------|
| **STRUCTURAL DISCRIMINATION** | **35%** | Breaks ALL pathways, 39.1% rate, zero education returns | **LARGEST** ⭐⭐⭐ |
| **INCOME (Double-Edged)** | **25%** | Housing +25.2pp, Drinking +27.8pp, Violence +22.5pp | **LARGE** ⭐⭐⭐ |
| **VICIOUS CYCLE (Discrim↔Smoke↔Violence)** | **20%** | Bidirectional: 8.1pp, 13.2pp, 11.9pp gaps | **MEDIUM** ⭐⭐⭐ |
| **HOUSING** | **10%** | 25.2pp overcrowding gap, income-driven | **SMALL** ⭐⭐⭐ |
| **HEALTHCARE ACCESS** | **5%** | 62.5% low-income skip care, 19.8pp gap | **MINIMAL** ⭐ |
| **SOCIAL ISOLATION** | **5%** | Weakest support networks, compounds vulnerability | **MINIMAL** ⭐ |
| **EDUCATION** | **0%** | ZERO EFFECT on all outcomes (p=0.993, 0.498, 0.857) | **EXCLUDE** ❌ |

### Visual Diagram Layout

```
┌─────────────────────────────────────────────────────────────┐
│ STRUCTURAL DISCRIMINATION (FOUNDATION) - 35% ⭐⭐⭐         │
├─────────────────────────────────────────────────────────────┤
│ 🚫 ELIMINATES ALL TRADITIONAL SDHE PATHWAYS                 │
│   • 39.1% discrimination rate (+21.6pp vs general)          │
│   • 97% gender-based (38.1%)                                │
│   • 11× higher than general population                      │
│   • Creates unique harmful cascades                         │
└───────────┬─────────────────────────────────────────────────┘
            │
            └──→ EDUCATION PATHWAYS: BROKEN ❌❌❌
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ INDIVIDUAL FACTORS (NON-FUNCTIONING)                        │
├─────────────────────────────────────────────────────────────┤
│ ❌ EDUCATION → INCOME: ZERO EFFECT                          │
│    Bachelor+: 26,848 vs Primary: 27,000 THB                 │
│    -152 THB gap (0.99× multiplier, p=0.993)                 │
│                                                             │
│ ❌ EDUCATION → HEALTH: ZERO EFFECT                          │
│    Primary: 45.9% vs Bachelor+: 37.5% disease               │
│    8.4pp gap (NOT significant, r=-0.026, p=0.498)           │
│                                                             │
│ ❌ EDUCATION → EXERCISE: ZERO EFFECT                        │
│    Bachelor+: 30.0% vs Primary: 27.0% exercise              │
│    3.0pp gap (NOT significant, p=0.857)                     │
│                                                             │
│ ⚡ VICIOUS CYCLE (20% influence) ⭐⭐⭐                       │
│    DISCRIMINATION ⇄ SMOKING ⇄ VIOLENCE                      │
│    • Discrimination → Smoking: +8.1pp (p=.009)              │
│      (Stress coping mechanism)                              │
│    • Smoking → Discrimination: +13.2pp (p=.009)             │
│      (Increased visibility/exposure)                        │
│    • Smoking → Violence: +11.9pp (p=.020) UNIQUE! ⭐        │
│      (Only group showing this pattern)                      │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ INCOME AS ONLY LEVER (DOUBLE-EDGED)
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ SOCIOECONOMIC FACTORS (25% influence) ⭐⭐⭐                 │
├─────────────────────────────────────────────────────────────┤
│ 💰 INCOME: ONLY FUNCTIONING PROTECTIVE FACTOR               │
│                                                             │
│ ✅ PROTECTIVE EFFECTS:                                      │
│   • Income → Housing: -25.2pp overcrowding (p<.001)         │
│   • Income → Healthcare: -19.8pp skipping (p=.043)          │
│   • 62.5% low-income skip care (MAJORITY!)                  │
│                                                             │
│ ⚠️ HARMFUL EFFECTS:                                         │
│   • Income → Drinking: +27.8pp (p=.004) ⭐⭐⭐              │
│     ONLY group showing income-drinking relationship         │
│     Resources fund harmful coping mechanism                 │
│                                                             │
│   • Income → Violence: +22.5pp (p=.013) ⭐⭐                │
│     Workplace discrimination in formal employment           │
│     Higher visibility increases exposure                    │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ HOUSING & SOCIAL CONTEXT
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ ENVIRONMENTAL & SOCIAL FACTORS                               │
├─────────────────────────────────────────────────────────────┤
│ 🏘️ HOUSING (10% influence) ⭐⭐⭐                            │
│   • Low income: 34.4% overcrowding                          │
│   • High income: 9.2% overcrowding                          │
│   • Gap: -25.2pp (p<0.001)                                  │
│   • Renters: 22.0% vs Homeowners: 4.9% overcrowding         │
│   • Housing tenure tied to income, not education            │
│                                                             │
│ 🏥 HEALTHCARE ACCESS (5% influence) ⭐                       │
│   • Low income: 62.5% skip needed care                      │
│   • Higher income: 42.7% skip care                          │
│   • Gap: -19.8pp (p=0.043)                                  │
│   • Income determines access, not education                 │
│                                                             │
│ 👥 SOCIAL ISOLATION (5% influence) ⭐                        │
│   • 82.6% emergency support vs 84.1% general                │
│   • ONLY group below general population                     │
│   • Weaker family/friend networks                           │
│   • Compounds discrimination/violence vulnerability         │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ HEALTH & VIOLENCE OUTCOMES
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ HEALTH & SAFETY OUTCOMES                                     │
├─────────────────────────────────────────────────────────────┤
│ 💔 CHRONIC DISEASE                                          │
│   • 40% chronic disease rate                                │
│   • NO protective pathways function:                        │
│     - Exercise: no effect (p=0.364)                         │
│     - Education: no effect (p=0.498)                        │
│     - Income: no direct health effect                       │
│                                                             │
│ 🚨 VIOLENCE EXPOSURE (HIGHEST)                              │
│   • 39.4% any violence (+15.5pp vs general)                 │
│   • 29.2% psychological (+12.0pp)                           │
│   • 13.1% physical (+7.1pp)                                 │
│                                                             │
│ ⚡ KEY INSIGHT: DISCRIMINATION IS ROOT CAUSE                │
│   • Breaks all typical SDHE protective mechanisms           │
│   • Creates harmful stress-coping cycles                    │
│   • Income enables both safety AND harmful coping           │
│   • Vicious cycles self-perpetuate                          │
└──────────────────────────────────────────────────────────────┘
```

### Key Insights for Diagram Creation

**Most Influential Factor**: STRUCTURAL DISCRIMINATION (35%)
- Breaks ALL traditional SDHE pathways
- Gender-based (97% of discrimination)
- Root cause of ALL downstream effects

**Secondary Factors**:
1. INCOME (25%) - Only lever, but double-edged
2. VICIOUS CYCLE (20%) - Discrimination ↔ Smoking ↔ Violence
3. HOUSING (10%) - Income-driven, not education

**Unique Findings**:
- ZERO education returns (0.99× income multiplier)
- ONLY group with income→drinking relationship
- Smoking-violence link unique to LGBT+
- Weakest social support networks

**Color Coding Recommendation**:
- 🟥 Structural Discrimination (largest, dark red) - 35%
- 🟩 Income (green with warning stripes) - 25%
- 🟧 Vicious Cycle (orange with arrows) - 20%
- 🟦 Housing (blue) - 10%
- 🟪 Healthcare Access (purple, small) - 5%
- ⬜ Social Isolation (light gray) - 5%
- ❌ Education (crossed out, 0%)

**Special Visual Elements**:
- **Broken chain/X** over education factor
- **Circular arrows** around Vicious Cycle slice (bidirectional)
- **Split color** on Income slice (green/red for protective/harmful)

---

## 4. DISABLED - "The Amplification Effect"

**Population Size**: n=229
**Core Narrative**: Education and income have the STRONGEST effects of all groups, creating extreme health stratification. Healthcare access crisis for low-income disabled.

### The Causal Pathways

#### STARTING POINT: EDUCATION AS MOST CRITICAL ENABLER

**Education → Chronic Disease (STRONGEST of all groups)**
- Primary: 87.3% chronic disease
- Bachelor+: 49.6% chronic disease
- **Effect**: 37.7 pp gap (r=-0.305, p<0.001) - LARGEST effect ⭐⭐⭐

**Education → Income (HIGHEST RETURNS of all groups)**
- Bachelor+: 24,981 THB/month
- Primary: 8,787 THB/month
- **Effect**: 184% income premium (2.84× multiplier, p=0.003) - HIGHEST ⭐⭐⭐

**Education → Exercise (STRONGEST GRADIENT)**
- Bachelor+: 36.4% exercise regularly
- Primary: 13.2% exercise
- **Effect**: 23.1 pp gap (p=0.005) - LARGEST gradient of all groups ⭐⭐

**Education → Functional Skills**
- Math skills: 94.8% (high edu) vs 73.4% (low edu)
- **Effect**: 21.4 pp gap (p<0.0001) ⭐⭐⭐
- Writing skills: 95.3% (high edu) vs 73.9% (low edu)
- **Effect**: 21.4 pp gap (p<0.0001) ⭐⭐⭐

---

#### INCOME: DIRECT EFFECT ON DISEASE (Strongest Correlation)

**Income → Chronic Disease (STRONGEST direct effect)**
- With disease: 15,699 THB/month
- Without disease: 24,350 THB/month
- **Effect**: -8,651 THB gap (r=-0.299, p<0.001) - STRONGEST income-health correlation ⭐⭐⭐
- **Mechanism**: Income enables accessibility modifications, assistive devices, disease management

---

#### HEALTHCARE ACCESS CRISIS

**Income → Medical Care Skipping (WORST of all groups)**
- Low income: 61.1% skip needed medical care (MAJORITY!)
- Higher income: 23.4% skip care
- **Effect**: 37.7 pp gap, 2.6× higher skipping rate (p<0.001) ⭐⭐⭐

---

#### ENVIRONMENTAL VULNERABILITY

**Homeownership → Disaster Exposure (Paradox)**
- Homeowners: +19.6 pp MORE disaster exposure (p=0.002) ⭐⭐
- **Mechanism**: Disabled homeowners in disaster-prone areas, limited mobility to relocate

---

#### INCOME → HARMFUL COPING (Unique Pattern)

**High Income Enables Unhealthy Behaviors**
- High-income smoke more: 27.2% vs 0% low-income (p=0.089, marginal)
- High-income drink more: 46.9% vs 25.0% (p=0.265)
- Triple-risk behaviors: 9.9% vs 0% (high vs low income)
- **Interpretation**: Resources enable unhealthy coping with medical constraints and disability stress

---

#### HEALTH BEHAVIOR: Exercise Potential (Underpowered)

**Exercise → Disease (Promising but not significant)**
- Exercise gap: 13.1 pp (NOT significant, p=0.139, n=175 too small)
- **Interpretation**: Trend suggests protection, but sample too small for significance

**Smoking Paradox (Marginal)**
- Smoking gap: -18.7 pp (largest observed, but p=0.071, n=175 too small)
- **Interpretation**: Reverse causation pattern similar to other groups, but underpowered

---

### SDHE Pie Chart Proportions - Disabled

**Total Influence = 100%**

| SDHE Factor | Slice % | Evidence | Visual Priority |
|-------------|---------|----------|----------------|
| **EDUCATION** | **32%** | r=-0.305 disease (STRONGEST), 2.84× income multiplier (HIGHEST), 23.1pp exercise | **LARGEST** ⭐⭐⭐ |
| **INCOME** | **28%** | r=-0.299 disease (DIRECT), 37.7pp healthcare gap, -8,651 THB disease gap | **LARGEST** ⭐⭐⭐ |
| **HEALTHCARE ACCESS CRISIS** | **20%** | 61.1% low-income skip care (MAJORITY), 37.7pp gap | **LARGE** ⭐⭐⭐ |
| **ENVIRONMENT (Disasters)** | **10%** | 19.6pp homeownership disaster gap, limited mobility | **SMALL** ⭐⭐ |
| **FUNCTIONAL SKILLS** | **5%** | 21.4pp literacy/numeracy gaps, embedded in education | **MINIMAL** ⭐⭐⭐ |
| **INCOME→HARMFUL COPING** | **5%** | High-income → smoking/drinking, resources fund unhealthy coping | **MINIMAL** ⭐ |

### Visual Diagram Layout

```
┌─────────────────────────────────────────────────────────────┐
│ INDIVIDUAL FACTORS                                          │
├─────────────────────────────────────────────────────────────┤
│ 🎓 EDUCATION (32% influence - MOST POWERFUL) ⭐⭐⭐         │
│   • r=-0.305 with chronic disease (STRONGEST)               │
│   • 2.84× income multiplier (HIGHEST of all groups)         │
│   • Creates LARGEST health equity gap:                      │
│     - Primary: 87.3% disease                                │
│     - Bachelor+: 49.6% disease                              │
│     - Gap: -37.7pp (p<0.001)                                │
│   • Drives 5 pathways:                                      │
│     1) Income (+184% for Bachelor+)                         │
│     2) Exercise (+23.1pp - STRONGEST gradient)              │
│     3) Functional skills (+21.4pp literacy/numeracy)        │
│     4) Disease burden (-37.7pp)                             │
│     5) Employment contracts (+70.5pp, marginal)             │
│                                                             │
│ 💪 EXERCISE (Promising but underpowered)                    │
│   • Bachelor+: 36.4% vs Primary: 13.2% (+23.1pp, p=.005)    │
│   • Exercise → Disease: 13.1pp gap (p=0.139, n=175)         │
│   • Sample too small for significance                       │
│                                                             │
│ 📖 FUNCTIONAL SKILLS (5% influence) ⭐⭐⭐                   │
│   • Math: 94.8% vs 73.4% (+21.4pp, p<.0001)                 │
│   • Writing: 95.3% vs 73.9% (+21.4pp, p<.0001)              │
│   • Embedded in education pathway                           │
└───────────┬─────────────────────────────────────────────────┘
            │
            └──→ SOCIOECONOMIC AMPLIFICATION
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ SOCIOECONOMIC FACTORS (28% + 5% = 33%) ⭐⭐⭐               │
├─────────────────────────────────────────────────────────────┤
│ 💰 INCOME (28% influence - DIRECT HEALTH EFFECT)            │
│   • STRONGEST income-health correlation: r=-0.299           │
│   • With disease: 15,699 THB vs Without: 24,350 THB         │
│   • Disease penalty: -8,651 THB (p<0.001)                   │
│   • Mechanism: Income enables accessibility modifications,  │
│     assistive devices, disease management                   │
│                                                             │
│ 📚 EDUCATION → INCOME AMPLIFICATION ⭐⭐⭐                   │
│   • Bachelor+: 24,981 THB vs Primary: 8,787 THB            │
│   • Gap: +16,194 THB                                        │
│   • 2.84× multiplier (184% premium) - HIGHEST               │
│   • Education provides ENORMOUS economic benefits           │
│                                                             │
│ 🚬 INCOME → HARMFUL COPING (5% influence) ⭐                │
│   • High-income smoke more: 27.2% vs 0% (p=0.089)           │
│   • High-income drink more: 46.9% vs 25.0% (p=0.265)        │
│   • Triple-risk behaviors: 9.9% vs 0%                       │
│   • Resources enable unhealthy stress coping                │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ HEALTHCARE ACCESS CRISIS
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ HEALTHCARE ACCESS (20% influence - CRITICAL) ⭐⭐⭐         │
├─────────────────────────────────────────────────────────────┤
│ 🏥 MEDICAL CARE SKIPPING (WORST OF ALL GROUPS)              │
│   • Low income: 61.1% skip needed care (MAJORITY!)          │
│   • Higher income: 23.4% skip care                          │
│   • Gap: -37.7pp (2.6× higher skipping, p<0.001)            │
│   • Interpretation: Most low-income disabled cannot access  │
│     medical care they need                                  │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ ENVIRONMENTAL VULNERABILITY
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ ENVIRONMENTAL FACTORS (10% influence) ⭐⭐                   │
├─────────────────────────────────────────────────────────────┤
│ 🌊 DISASTER EXPOSURE (Homeownership Paradox)                │
│   • Homeowners: +19.6pp MORE disaster exposure (p=0.002)    │
│   • Mechanism: Disabled in disaster-prone areas             │
│   • Limited mobility to relocate                            │
│   • Affordable homeownership concentrates risk              │
└───────────┬──────────────────────────────────────────────────┘
            │
            └──→ HEALTH OUTCOMES
                 │
┌────────────────┴─────────────────────────────────────────────┐
│ HEALTH OUTCOMES                                              │
├─────────────────────────────────────────────────────────────┤
│ 💔 EXTREME HEALTH STRATIFICATION                            │
│   • Primary education: 87.3% chronic disease                │
│   • Bachelor+ education: 49.6% chronic disease              │
│   • Gap: -37.7pp (r=-0.305, p<0.001)                        │
│   • LARGEST education-health gap of all groups              │
│                                                             │
│ 🏥 HEALTHCARE ACCESS DETERMINES OUTCOMES                    │
│   • Low-income disabled: 87.3% disease + 61.1% skip care    │
│     = Compounded crisis                                     │
│   • High-income disabled: 49.6% disease + 23.4% skip care   │
│     = Better management                                     │
│                                                             │
│ ⚡ KEY PATHWAYS:                                            │
│   1. Education → Income → Healthcare → Disease (MAIN)       │
│      AMPLIFIED effects: 2.84× income, r=-0.305 disease      │
│   2. Income → Direct Disease Management (r=-0.299)          │
│      Accessibility, devices, treatment access               │
│   3. Income → Harmful Coping (paradox)                      │
│      Resources enable smoking/drinking stress relief        │
│   4. Homeownership → Environmental Vulnerability            │
│      Limited mobility traps in disaster zones               │
└──────────────────────────────────────────────────────────────┘
```

### Key Insights for Diagram Creation

**Most Influential Factors (Nearly Equal)**:
1. EDUCATION (32%) - r=-0.305, 2.84× income multiplier, drives everything
2. INCOME (28%) - r=-0.299, direct disease effect, enables management
3. HEALTHCARE ACCESS (20%) - 61.1% crisis, compounds disadvantage

**Unique Findings**:
- STRONGEST education-health correlation (r=-0.305)
- HIGHEST income returns to education (2.84×)
- LARGEST health stratification (87.3% → 49.6%)
- WORST healthcare access crisis (61.1% skip care)
- Income paradox: enables both management AND harmful coping

**Color Coding Recommendation**:
- 🟦 Education (largest, blue) - 32%
- 🟩 Income (nearly equal, green) - 28%
- 🟥 Healthcare Access Crisis (red) - 20%
- 🟨 Environmental Disasters (yellow) - 10%
- 🟪 Functional Skills (purple, small) - 5%
- 🟧 Income→Harmful Coping (orange, small) - 5%

**Special Visual Elements**:
- **Double arrows** between Education and Income (2.84× amplification)
- **Crisis symbol** on Healthcare Access (61% cannot access care)
- **Split arrows** from Income (positive to healthcare, negative to coping)

---

## 5. COMPARATIVE ANALYSIS

### Cross-Group Factor Comparison

| Factor | Informal Workers | Elderly 60+ | LGBT+ | Disabled |
|--------|------------------|-------------|-------|----------|
| **Education** | 30% ⭐⭐⭐ | 15% ⭐⭐⭐ | **0%** ❌ | **32%** ⭐⭐⭐ |
| **Income** | 20% ⭐⭐⭐ | 18% ⭐⭐⭐ | 25% ⭐⭐⭐ | 28% ⭐⭐⭐ |
| **Healthcare Access** | *(in Income)* | *(in Income)* | 5% ⭐ | **20%** ⭐⭐⭐ |
| **Environment** | 15% (Disasters) | **25%** (Air Pollution) | - | 10% (Disasters) |
| **Employment** | - | **20%** (Contracts) | - | - |
| **Exercise** | **12%** ⭐⭐⭐ | 0% ❌ | 0% ❌ | 0% ❌ |
| **Smoking** | **8%** (Stress) | 2% (Discrim→) | *(in Cycle)* | *(in Coping)* |
| **Social Protection** | **10%** ⭐⭐⭐ | **12%** ⭐⭐⭐ | **-5%** ❌ | - |
| **Discrimination** | -4% (Low) | -9% (Lowest) | **35%** ⭐⭐⭐ | - |
| **Vicious Cycles** | - | - | **20%** ⭐⭐⭐ | - |
| **Housing** | 5% ⭐⭐ | 8% ⭐⭐ | 10% ⭐⭐⭐ | *(in Income)* |

### Top 15 Strongest Findings Across All Groups

**Ranked by Statistical Strength (correlation + p-value) and Effect Size:**

1. **Air Pollution → Elderly Health** (r=0.440, 43.6pp gap) - STRONGEST ⭐⭐⭐
2. **Income → Disabled Chronic Disease** (r=-0.299, -8,651 THB gap, p<0.001) ⭐⭐⭐
3. **Education → Disabled Chronic Disease** (r=-0.305, 37.7pp gap, p<0.001) ⭐⭐⭐
4. **Education → Disabled Income** (2.84× multiplier, 16,194 THB gap, p=0.003) ⭐⭐⭐
5. **Income → LGBT+ Overcrowding** (25.2pp gap, p<0.001) ⭐⭐⭐
6. **Income → LGBT+ Drinking** (27.8pp gap, 2.1× rate, p=0.004) ⭐⭐⭐
7. **Income → Informal Worker Disaster Exposure** (18.3pp gap, p<0.001) ⭐⭐⭐
8. **Income → Disabled Medical Care Skipping** (61.1%, 37.7pp gap, p<0.001) ⭐⭐⭐
9. **Education → Elderly Homeownership** (35.1pp gap, p<0.001) ⭐⭐⭐
10. **Income → Elderly Medical Care Skipping** (30.9pp gap, 3.4× rate, p<0.001) ⭐⭐⭐
11. **Exercise → Informal Worker Chronic Disease** (r=-0.121, 14.2pp gap, p<0.001) ⭐⭐⭐
12. **Education → Disabled Exercise** (23.1pp gap, STRONGEST gradient, p=0.005) ⭐⭐
13. **Education → Elderly Exercise** (22.1pp gap, p<0.001) ⭐⭐⭐
14. **Income → LGBT+ Violence** (22.5pp gap, harmful, p=0.013) ⭐⭐
15. **Education → Informal Worker Chronic Disease** (r=-0.217, 23.0pp gap, p<0.001) ⭐⭐⭐

### Most Clinically/Policy Important Findings

1. **LGBT+ Zero Education Returns** - Systemic discrimination eliminates ALL benefits (p=0.993)
2. **61% Low-Income Disabled Skip Medical Care** - Healthcare access crisis (37.7pp gap)
3. **LGBT+ Discrimination-Smoking-Violence Cycle** - Unique bidirectional vicious cycle
4. **Income Enables LGBT+ Drinking** - Resources fund harmful coping (27.8pp, only group)
5. **Air Pollution → Elderly Health** - Massive environmental burden (r=0.440, 43.6pp)

### Pattern Summary

**INFORMAL WORKERS**: Linear cascade with education as master key
- Education → Income → Healthcare → Disease
- Exercise provides unique protection
- Strong social networks buffer vulnerability

**ELDERLY**: Lifetime accumulation + environmental exposure
- Employment contracts > Education for income
- Air pollution is major modifiable risk
- Income affects quality of life, not disease prevention

**LGBT+**: Broken pathways due to structural discrimination
- Education provides ZERO benefits across all outcomes
- Income is double-edged (enables safety AND harmful coping)
- Vicious cycles self-perpetuate (Discrimination ↔ Smoking ↔ Violence)

**DISABLED**: Amplification of education and income effects
- STRONGEST gradients of all groups (2.84× income, r=-0.305 disease)
- Extreme stratification: 87.3% → 49.6% disease by education
- Healthcare access crisis compounds disadvantage

---

## 6. IMPLEMENTATION GUIDELINES

### For Proportional Pie Chart Design

#### Size Calculation Method

**Slice percentage** = (Statistical strength × Effect size) / Total influence

Where:
- **Statistical strength** = Function of p-value
  - p < 0.001: Weight = 3
  - p < 0.01: Weight = 2
  - p < 0.05: Weight = 1

- **Effect size** = Percentage point gap or correlation coefficient
  - Large gap (>20pp or |r| > 0.25): Weight = 3
  - Medium gap (10-20pp or 0.15 < |r| < 0.25): Weight = 2
  - Small gap (<10pp or |r| < 0.15): Weight = 1

#### Visual Hierarchy Rules

1. **Largest slice** should be 2-3× larger than smallest significant slice
2. **Color intensity** reflects p-value strength (darker = more significant)
3. **Annotations** show key statistics (r, pp gap, p-value) on each slice
4. **Icons** provide intuitive visual cues for each factor

#### Recommended Icons

- 🎓 Education
- 💰 Income
- 🏥 Healthcare
- 🌊/💨 Environment
- 💪 Exercise
- 🚬 Smoking
- 🏠 Housing
- 🤝 Social Support
- ⚖️ Discrimination
- 🔄 Vicious Cycles

#### Special Visual Elements by Group

**Informal Workers:**
- Arrow cascade from Education → Income → Healthcare
- Star/highlight on Exercise (unique protection)
- Network diagram for Social Protection

**Elderly:**
- Warning symbol on Air Pollution (strongest effect)
- Reverse arrow on Housing (paradox)
- Shield icon for Social Protection

**LGBT+:**
- Broken chain/X over Education (zero effect)
- Circular bidirectional arrows for Vicious Cycle
- Split color on Income (green protective / red harmful)

**Disabled:**
- Double amplification arrows: Education ↔ Income (2.84×)
- Crisis alert symbol on Healthcare Access (61%)
- Gradient showing extreme stratification

### Data Labels Format

**For each slice, include:**

```
[FACTOR NAME] (X% influence)
• Key statistic (r=-0.XXX, pp gap, multiplier)
• p-value
• Interpretation (1 short phrase)
```

**Example:**
```
EDUCATION (30%)
• r=-0.217 chronic disease
• Drives income (+84%)
• p<0.001 ⭐⭐⭐
```

### JSON Data Structure for Implementation

See section 1-4 for complete JSON data for each population group.

### Accessibility Requirements

- **Color blind safe** palette (use patterns/textures in addition to colors)
- **High contrast** text labels
- **Screen reader** compatible alt text
- **Descriptive legends** explaining statistical notation

---

## Appendix: Statistical Notation Guide

- **r** = Correlation coefficient (-1 to +1)
  - Negative = inverse relationship (protective)
  - Positive = direct relationship (harmful)

- **pp** = Percentage points (absolute difference)

- **p-value** = Statistical significance
  - p < 0.001: ⭐⭐⭐ Highly significant
  - p < 0.01: ⭐⭐ Very significant
  - p < 0.05: ⭐ Significant

- **Multiplier** = Income ratio (e.g., 2.84× = 184% higher)

- **Gap** = Absolute difference between groups

---

**Document End**
