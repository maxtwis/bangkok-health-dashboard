"""
Generate Gemini-style comparison bar charts for community-population group analysis
Shows dramatic comparisons with annotations, arrows, and multiplier text

Focus on most impactful comparisons:
- Elderly: High income vs Low income
- Disabled: High education vs Low education
- Informal Workers: High income vs Low income
- LGBTQ+: Different generations

Each chart highlights the "hidden character" within vulnerable populations
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import pandas as pd
import numpy as np
import os

# Color scheme
COLOR_GOOD = '#4CAF50'  # Green for positive outcomes
COLOR_BAD = '#F44336'   # Red for negative outcomes
COLOR_NEUTRAL = '#2196F3'  # Blue for neutral

def add_comparison_annotation(ax, x1, x2, y_pos, text, color='#4CAF50'):
    """
    Add Gemini-style curved arrow annotation showing comparison
    """
    # Draw curved arrow
    arrow = FancyArrowPatch(
        (x1, y_pos), (x2, y_pos),
        arrowstyle='->,head_width=0.4,head_length=0.8',
        connectionstyle="arc3,rad=.3",
        color=color,
        linewidth=2.5,
        zorder=10
    )
    ax.add_patch(arrow)

    # Add text in the middle
    mid_x = (x1 + x2) / 2
    mid_y = y_pos + 0.15  # Slightly above the arrow
    ax.text(mid_x, mid_y, text,
            fontsize=12, fontweight='bold', color=color,
            ha='center', va='bottom',
            bbox=dict(boxstyle='round,pad=0.5', facecolor='white',
                     edgecolor=color, linewidth=2),
            zorder=11)

def create_comparison_chart(data, title, filename, reverse_indicator=False):
    """
    Create Gemini-style comparison bar chart

    Parameters:
    - data: dict with 'groups', 'values', 'group_labels'
    - title: Chart title
    - filename: Output filename
    - reverse_indicator: If True, lower values are better (e.g., unemployment)
    """
    fig, ax = plt.subplots(figsize=(10, 6))

    groups = data['groups']
    values = data['values']
    labels = data['group_labels']

    # Determine colors based on values
    colors = []
    for i, val in enumerate(values):
        if reverse_indicator:
            # Lower is better - worst group is red, best is green
            colors.append(COLOR_BAD if val == max(values) else COLOR_GOOD)
        else:
            # Higher is better - worst group is red, best is green
            colors.append(COLOR_GOOD if val == max(values) else COLOR_BAD)

    # Create horizontal bars
    bars = ax.barh(groups, values, color=colors, height=0.5, edgecolor='black', linewidth=1.5)

    # Add value labels on bars
    for i, (bar, val, label) in enumerate(zip(bars, values, labels)):
        width = bar.get_width()
        label_x = width + max(values) * 0.02

        # Main value
        ax.text(label_x, bar.get_y() + bar.get_height()/2, f'{val:.1f}%',
                va='center', fontsize=14, fontweight='bold')

        # Group label
        ax.text(-max(values) * 0.02, bar.get_y() + bar.get_height()/2, label,
                va='center', ha='right', fontsize=11, fontweight='bold')

    # Calculate multiplier/difference
    if len(values) == 2:
        diff = abs(values[0] - values[1])
        ratio = max(values) / min(values) if min(values) > 0 else float('inf')

        # Add comparison annotation
        if reverse_indicator:
            # Lower is better, so if values[0] > values[1], values[1] is better
            if values[0] > values[1]:
                comparison_text = f"{ratio:.1f}x Lower\n({diff:.1f}% difference)"
                color = COLOR_GOOD
            else:
                comparison_text = f"{ratio:.1f}x Higher\n({diff:.1f}% difference)"
                color = COLOR_BAD
        else:
            # Higher is better
            if values[0] > values[1]:
                comparison_text = f"{ratio:.1f}x Higher\n({diff:.1f}% difference)"
                color = COLOR_GOOD
            else:
                comparison_text = f"{ratio:.1f}x Lower\n({diff:.1f}% difference)"
                color = COLOR_BAD

        # Position annotation
        y_pos = len(groups) - 0.5
        x_start = min(values) * 0.8
        x_end = max(values) * 0.8

        add_comparison_annotation(ax, x_start, x_end, y_pos, comparison_text, color)

    # Formatting
    ax.set_xlabel('Percentage (%)', fontsize=12, fontweight='bold')
    ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(0, max(values) * 1.25)
    ax.grid(axis='x', alpha=0.3, linestyle=':', linewidth=0.5)
    ax.set_yticks([])  # Hide y-axis ticks since we have custom labels

    # Remove top and right spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)

    plt.tight_layout()
    plt.savefig(filename, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

    print(f"  OK Generated: {filename}")

def generate_all_comparison_charts():
    """
    Generate all key comparison charts
    """
    print("\n" + "="*80)
    print("GENERATING COMMUNITY-POPULATION COMPARISON CHARTS")
    print("Gemini-Style Visual Analytics")
    print("="*80 + "\n")

    # Create output directory
    output_dir = 'community_popgroup_charts'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}\n")

    # Load community data to calculate sub-group statistics
    community_df = pd.read_csv('public/data/community_data.csv', encoding='utf-8-sig')

    # Helper function to calculate monthly income
    def calculate_monthly_income(row):
        if pd.isna(row.get('income', None)) or row.get('income', 0) == 0:
            return np.nan
        if row.get('income_type', 2) == 1:
            return row['income'] * 30
        else:
            return row['income']

    community_df['monthly_income'] = community_df.apply(calculate_monthly_income, axis=1)

    # Calculate derived indicators
    community_df['unemployed'] = community_df['occupation_status'].apply(lambda x: 1 if x == 0 else 0)
    community_df['catastrophic_spending'] = community_df.apply(
        lambda row: 1 if row.get('monthly_income', 0) > 0 and pd.notna(row.get('hh_health_expense', 0)) and
                         row.get('hh_health_expense', 0) / row.get('monthly_income', 1) > 0.10 else
                    (0 if row.get('monthly_income', 0) > 0 and pd.notna(row.get('hh_health_expense', 0)) else np.nan),
        axis=1
    )
    community_df['medical_skip_cost'] = community_df['medical_skip_1'].apply(lambda x: 1 if x == 1 else 0)
    community_df['has_health_coverage'] = community_df['welfare'].apply(
        lambda x: 1 if (x in [1, 2, 3, '1', '2', '3'] or (isinstance(x, (int, float)) and x in [1, 2, 3])) else 0
    )
    community_df['food_insecurity_severe'] = community_df['food_insecurity_2'].apply(lambda x: 1 if x == 1 else 0)
    community_df['no_exercise'] = community_df['exercise_status'].apply(lambda x: 1 if x == 0 else 0)
    community_df['feels_unsafe'] = community_df['community_safety'].apply(lambda x: 1 if x in [1, 2] else 0)
    community_df['has_chronic_disease'] = community_df['diseases_status'].apply(lambda x: 1 if x == 1 else 0)

    # Define population groups
    community_df['is_elderly'] = community_df['age'] >= 60
    community_df['is_disabled'] = community_df['disable_status'] == 1
    community_df['is_informal'] = (community_df['occupation_status'] == 1) & (community_df['occupation_contract'] == 0)
    community_df['is_lgbt'] = community_df['sex'] == 'lgbt'

    print("COMPARISON 1: ELDERLY - High Income vs Low Income")
    print("-" * 80)

    # Filter elderly
    elderly_df = community_df[community_df['is_elderly']].copy()

    # Create income quartiles
    elderly_df['income_group'] = pd.qcut(elderly_df['monthly_income'].dropna(),
                                          q=4, labels=['Lowest 25%', 'Low-Mid 25%', 'Mid-High 25%', 'Highest 25%'],
                                          duplicates='drop')

    # Compare lowest vs highest income quartiles
    low_income = elderly_df[elderly_df['income_group'] == 'Lowest 25%']
    high_income = elderly_df[elderly_df['income_group'] == 'Highest 25%']

    # Chart 1: Catastrophic Health Spending
    low_catastrophic = (low_income['catastrophic_spending'].sum() / low_income['catastrophic_spending'].count()) * 100
    high_catastrophic = (high_income['catastrophic_spending'].sum() / high_income['catastrophic_spending'].count()) * 100

    create_comparison_chart({
        'groups': ['High Income\nElderly', 'Low Income\nElderly'],
        'values': [high_catastrophic, low_catastrophic],
        'group_labels': [f'Highest 25%\n(n={len(high_income)})', f'Lowest 25%\n(n={len(low_income)})']
    },
    'Catastrophic Health Spending among Elderly by Income Level',
    os.path.join(output_dir, 'elderly_income_catastrophic_spending.png'),
    reverse_indicator=True)

    # Chart 2: Medical Skip due to Cost
    low_skip = (low_income['medical_skip_cost'].sum() / len(low_income)) * 100
    high_skip = (high_income['medical_skip_cost'].sum() / len(high_income)) * 100

    create_comparison_chart({
        'groups': ['High Income\nElderly', 'Low Income\nElderly'],
        'values': [high_skip, low_skip],
        'group_labels': [f'Highest 25%\n(n={len(high_income)})', f'Lowest 25%\n(n={len(low_income)})']
    },
    'Medical Care Skipped Due to Cost - Elderly by Income',
    os.path.join(output_dir, 'elderly_income_medical_skip.png'),
    reverse_indicator=True)

    # Chart 3: Food Insecurity
    low_food = (low_income['food_insecurity_severe'].sum() / len(low_income)) * 100
    high_food = (high_income['food_insecurity_severe'].sum() / len(high_income)) * 100

    create_comparison_chart({
        'groups': ['High Income\nElderly', 'Low Income\nElderly'],
        'values': [high_food, low_food],
        'group_labels': [f'Highest 25%\n(n={len(high_income)})', f'Lowest 25%\n(n={len(low_income)})']
    },
    'Severe Food Insecurity among Elderly by Income Level',
    os.path.join(output_dir, 'elderly_income_food_insecurity.png'),
    reverse_indicator=True)

    print("\nCOMPARISON 2: DISABLED - High Education vs Low Education")
    print("-" * 80)

    # Filter disabled
    disabled_df = community_df[community_df['is_disabled']].copy()

    # Categorize education
    def categorize_education(edu):
        if pd.isna(edu) or edu in [0, 1, 2]:
            return 'Primary/None'
        elif edu in [3, 4, 5, 6]:
            return 'Secondary'
        else:
            return 'Bachelor+'

    disabled_df['education_level'] = disabled_df['education'].apply(categorize_education)

    low_ed = disabled_df[disabled_df['education_level'] == 'Primary/None']
    high_ed = disabled_df[disabled_df['education_level'] == 'Bachelor+']

    # Chart 4: Employment Rate
    low_employed = ((low_ed['occupation_status'] == 1).sum() / len(low_ed)) * 100
    high_employed = ((high_ed['occupation_status'] == 1).sum() / len(high_ed)) * 100

    create_comparison_chart({
        'groups': ['High Education\nDisabled', 'Low Education\nDisabled'],
        'values': [high_employed, low_employed],
        'group_labels': [f'Bachelor+\n(n={len(high_ed)})', f'Primary/None\n(n={len(low_ed)})']
    },
    'Employment Rate among Disabled Persons by Education Level',
    os.path.join(output_dir, 'disabled_education_employment.png'),
    reverse_indicator=False)

    # Chart 5: Health Coverage
    low_coverage = (low_ed['has_health_coverage'].sum() / len(low_ed)) * 100
    high_coverage = (high_ed['has_health_coverage'].sum() / len(high_ed)) * 100

    create_comparison_chart({
        'groups': ['High Education\nDisabled', 'Low Education\nDisabled'],
        'values': [high_coverage, low_coverage],
        'group_labels': [f'Bachelor+\n(n={len(high_ed)})', f'Primary/None\n(n={len(low_ed)})']
    },
    'Health Coverage Rate among Disabled by Education',
    os.path.join(output_dir, 'disabled_education_health_coverage.png'),
    reverse_indicator=False)

    print("\nCOMPARISON 3: INFORMAL WORKERS - High Income vs Low Income")
    print("-" * 80)

    # Filter informal workers
    informal_df = community_df[community_df['is_informal']].copy()

    # Create income quartiles
    informal_df['income_group'] = pd.qcut(informal_df['monthly_income'].dropna(),
                                           q=3, labels=['Low Income', 'Middle Income', 'High Income'],
                                           duplicates='drop')

    low_inc_informal = informal_df[informal_df['income_group'] == 'Low Income']
    high_inc_informal = informal_df[informal_df['income_group'] == 'High Income']

    # Chart 6: Catastrophic Health Spending
    low_cat_inf = (low_inc_informal['catastrophic_spending'].sum() / low_inc_informal['catastrophic_spending'].count()) * 100
    high_cat_inf = (high_inc_informal['catastrophic_spending'].sum() / high_inc_informal['catastrophic_spending'].count()) * 100

    create_comparison_chart({
        'groups': ['High Income\nInformal Workers', 'Low Income\nInformal Workers'],
        'values': [high_cat_inf, low_cat_inf],
        'group_labels': [f'Top Third\n(n={len(high_inc_informal)})', f'Bottom Third\n(n={len(low_inc_informal)})']
    },
    'Catastrophic Health Spending among Informal Workers by Income',
    os.path.join(output_dir, 'informal_income_catastrophic_spending.png'),
    reverse_indicator=True)

    # Chart 7: Feeling Unsafe
    low_unsafe = (low_inc_informal['feels_unsafe'].sum() / len(low_inc_informal)) * 100
    high_unsafe = (high_inc_informal['feels_unsafe'].sum() / len(high_inc_informal)) * 100

    create_comparison_chart({
        'groups': ['High Income\nInformal Workers', 'Low Income\nInformal Workers'],
        'values': [high_unsafe, low_unsafe],
        'group_labels': [f'Top Third\n(n={len(high_inc_informal)})', f'Bottom Third\n(n={len(low_inc_informal)})']
    },
    'Feeling Unsafe in Community - Informal Workers by Income',
    os.path.join(output_dir, 'informal_income_feels_unsafe.png'),
    reverse_indicator=True)

    # Chart 8: No Exercise
    low_exercise = (low_inc_informal['no_exercise'].sum() / len(low_inc_informal)) * 100
    high_exercise = (high_inc_informal['no_exercise'].sum() / len(high_inc_informal)) * 100

    create_comparison_chart({
        'groups': ['High Income\nInformal Workers', 'Low Income\nInformal Workers'],
        'values': [high_exercise, low_exercise],
        'group_labels': [f'Top Third\n(n={len(high_inc_informal)})', f'Bottom Third\n(n={len(low_inc_informal)})']
    },
    'No Physical Exercise - Informal Workers by Income Level',
    os.path.join(output_dir, 'informal_income_no_exercise.png'),
    reverse_indicator=True)

    print("\nCOMPARISON 4: LGBTQ+ - Different Generations")
    print("-" * 80)

    # Filter LGBTQ+
    lgbt_df = community_df[community_df['is_lgbt']].copy()

    # Categorize by generation
    def categorize_generation(age):
        if pd.isna(age):
            return np.nan
        if 18 <= age <= 27:
            return 'Gen Z (18-27)'
        elif 28 <= age <= 43:
            return 'Gen Y (28-43)'
        elif age >= 44:
            return 'Gen X+ (44+)'
        return np.nan

    lgbt_df['generation'] = lgbt_df['age'].apply(categorize_generation)

    gen_z = lgbt_df[lgbt_df['generation'] == 'Gen Z (18-27)']
    gen_x = lgbt_df[lgbt_df['generation'] == 'Gen X+ (44+)']

    if len(gen_z) >= 5 and len(gen_x) >= 5:
        # Chart 9: Health Coverage
        z_coverage = (gen_z['has_health_coverage'].sum() / len(gen_z)) * 100
        x_coverage = (gen_x['has_health_coverage'].sum() / len(gen_x)) * 100

        create_comparison_chart({
            'groups': ['Gen Z\nLGBTQ+', 'Gen X+\nLGBTQ+'],
            'values': [z_coverage, x_coverage],
            'group_labels': [f'Ages 18-27\n(n={len(gen_z)})', f'Ages 44+\n(n={len(gen_x)})']
        },
        'Health Coverage Rate among LGBTQ+ by Generation',
        os.path.join(output_dir, 'lgbt_generation_health_coverage.png'),
        reverse_indicator=False)

        # Chart 10: Chronic Disease
        z_chronic = (gen_z['has_chronic_disease'].sum() / len(gen_z)) * 100
        x_chronic = (gen_x['has_chronic_disease'].sum() / len(gen_x)) * 100

        create_comparison_chart({
            'groups': ['Gen Z\nLGBTQ+', 'Gen X+\nLGBTQ+'],
            'values': [z_chronic, x_chronic],
            'group_labels': [f'Ages 18-27\n(n={len(gen_z)})', f'Ages 44+\n(n={len(gen_x)})']
        },
        'Chronic Disease Prevalence among LGBTQ+ by Generation',
        os.path.join(output_dir, 'lgbt_generation_chronic_disease.png'),
        reverse_indicator=True)
    else:
        print("  WARNING: Insufficient sample size for LGBTQ+ generational comparison")

    print("\n" + "="*80)
    print(f"CHART GENERATION COMPLETE!")
    print(f"All charts saved in: {output_dir}/")
    print("="*80 + "\n")

if __name__ == '__main__':
    generate_all_comparison_charts()
