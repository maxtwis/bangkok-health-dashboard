"""
Generate Top 5 Worst District Charts for Each Domain and Indicator
Using Gemini seaborn style with horizontal bars
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Set seaborn style (matching Gemini)
sns.set_style("whitegrid")

# District ID to name mapping
DISTRICT_NAMES = {
    1001: 'Phra Nakhon', 1002: 'Dusit', 1003: 'Nong Chok', 1004: 'Bang Rak',
    1005: 'Bang Khen', 1006: 'Bang Kapi', 1007: 'Pathum Wan', 1008: 'Pom Prap Sattru Phai',
    1009: 'Phra Khanong', 1010: 'Min Buri', 1011: 'Lat Krabang', 1012: 'Yan Nawa',
    1013: 'Samphanthawong', 1014: 'Phaya Thai', 1015: 'Thon Buri', 1016: 'Bangkok Yai',
    1017: 'Huai Khwang', 1018: 'Khlong San', 1019: 'Taling Chan', 1020: 'Bangkok Noi',
    1021: 'Bang Khun Thian', 1022: 'Phasi Charoen', 1023: 'Nong Khaem', 1024: 'Rat Burana',
    1025: 'Bang Phlat', 1026: 'Din Daeng', 1027: 'Bueng Kum', 1028: 'Sathon',
    1029: 'Bang Sue', 1030: 'Chatuchak', 1031: 'Bang Kho Laem', 1032: 'Prawet',
    1033: 'Khlong Toei', 1034: 'Suan Luang', 1035: 'Chom Thong', 1036: 'Don Mueang',
    1037: 'Ratchathewi', 1038: 'Lat Phrao', 1039: 'Watthana', 1040: 'Bang Khae',
    1041: 'Lak Si', 1042: 'Sai Mai', 1043: 'Khan Na Yao', 1044: 'Saphan Sung',
    1045: 'Wang Thonglang', 1046: 'Khlong Sam Wa', 1047: 'Bang Na', 1048: 'Thawi Watthana',
    1049: 'Thung Khru', 1050: 'Bang Bon'
}

# Domain colors (RED for worst districts - matching reference image)
DOMAIN_COLORS = {
    'economic_security': '#E57373',      # Red
    'healthcare_access': '#E57373',      # Red
    'physical_environment': '#E57373',   # Red
    'social_context': '#E57373',         # Red
    'health_behaviors': '#E57373',       # Red
    'health_outcomes': '#E57373',        # Red
    'education': '#E57373'               # Red
}

# Domain display names
DOMAIN_DISPLAY_NAMES = {
    'economic_security': 'Economic Security',
    'healthcare_access': 'Healthcare Access',
    'physical_environment': 'Physical Environment',
    'social_context': 'Social Context',
    'health_behaviors': 'Health Behaviors',
    'health_outcomes': 'Health Outcomes',
    'education': 'Education'
}


def create_district_chart(title, districts, scores, bangkok_avg, output_filename, color='#E57373', unit='Score (0-100)', notable_district=None):
    """
    Create horizontal bar chart for top 5 worst districts
    Matching Gemini's exact format from reference images

    Args:
        title: Chart title
        districts: List of district names (top 5 worst)
        scores: List of scores for those districts
        bangkok_avg: Bangkok average score
        output_filename: Path to save the chart
        color: Bar color (default green)
        unit: Unit label for x-axis (default 'Score (0-100)')
        notable_district: Dict with 'name' and 'value' for notable mention (optional)
    """
    fig, ax = plt.subplots(figsize=(10, 5))

    # Reverse order so worst is at top
    districts_reversed = districts[::-1]
    scores_reversed = scores[::-1]

    y_pos = range(len(districts_reversed))

    # Create horizontal bars
    bars = ax.barh(y_pos, scores_reversed, color=color, alpha=0.9, height=0.6)

    # Set y-axis labels
    ax.set_yticks(y_pos)
    ax.set_yticklabels(districts_reversed, fontsize=11, color='#333333')

    # Set title and labels
    ax.set_title(title, fontsize=13, pad=15, loc='left', color='#333333', fontweight='normal')
    ax.set_xlabel(unit, fontsize=11, color='#666666')

    # Set x-axis limits
    max_val = max(max(scores_reversed), bangkok_avg)
    ax.set_xlim(0, max_val * 1.25)

    # Remove spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)

    # Add Bangkok average reference line with legend (lighter color and thinner line)
    ax.axvline(x=bangkok_avg, color='#757575', linestyle='--', linewidth=1.2, alpha=0.7,
               label=f'Bangkok Avg ({bangkok_avg:.1f})', zorder=1)

    # Add value labels at end of bars
    for i, v in enumerate(scores_reversed):
        # Position label outside bar
        label_x = v + (max_val * 0.015)
        ax.text(label_x, i, f'{v:.1f}',
                color='#333333', va='center', ha='left', fontweight='bold', fontsize=10)

    # Grid styling
    ax.grid(axis='x', alpha=0.3, linestyle='-', linewidth=0.5)
    ax.set_axisbelow(True)

    # Add legend box (matching domain charts style)
    ax.legend(loc='upper right', frameon=True, fontsize=10)

    # Add notable district annotation if provided
    if notable_district:
        # Add annotation at bottom left
        note_text = f"Note: {notable_district['name']} ({notable_district['value']:.1f}) not shown"
        ax.text(0.02, 0.02, note_text, transform=ax.transAxes,
                fontsize=9, color='#666666', style='italic',
                bbox=dict(boxstyle='round,pad=0.5', facecolor='#FFF9C4', alpha=0.8, edgecolor='#FBC02D'))

    plt.tight_layout()
    plt.savefig(output_filename, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()


def process_domain_file(csv_file, domain_key):
    """
    Process a domain comparison CSV and generate charts for all indicators

    Args:
        csv_file: Path to the CSV file
        domain_key: Domain key (e.g., 'economic_security')

    Returns:
        Number of charts generated
    """
    df = pd.read_csv(csv_file, encoding='utf-8-sig')

    charts_generated = 0
    domain_name = DOMAIN_DISPLAY_NAMES[domain_key]
    color = DOMAIN_COLORS[domain_key]

    output_dir = 'district_top5_charts'
    domain_dir = os.path.join(output_dir, domain_key)

    # Create directories
    os.makedirs(domain_dir, exist_ok=True)

    # Load domain priority districts (top 5 worst by domain score)
    domain_priority_districts = set()
    try:
        district_scores_df = pd.read_csv('district_scores_elderly.csv', encoding='utf-8-sig')
        domain_col_name = {
            'economic_security': 'Economic Security',
            'healthcare_access': 'Healthcare Access',
            'physical_environment': 'Physical Environment',
            'social_context': 'Social Context',
            'health_behaviors': 'Health Behaviors',
            'health_outcomes': 'Health Outcomes',
            'education': 'Education'
        }.get(domain_key)

        if domain_col_name and domain_col_name in district_scores_df.columns:
            worst_5 = district_scores_df.nsmallest(5, domain_col_name)
            for _, row in worst_5.iterrows():
                dist_id = int(row['District'])
                dist_name = DISTRICT_NAMES.get(dist_id, f'District {dist_id}')
                domain_priority_districts.add(dist_name)
    except Exception as e:
        print(f"  Warning: Could not load domain priority districts: {e}")

    # Process each indicator (each row)
    for idx, row in df.iterrows():
        indicator_name = row['Indicator']
        bangkok_avg = row['Bangkok Avg']

        # Get top 5 district columns (District 1, District 2, etc.)
        district_cols = [col for col in df.columns if col.startswith('District ')]

        # Extract district IDs and scores
        districts = []
        scores = []

        for col in district_cols[:5]:  # Top 5 only
            district_id = int(col.split()[1])
            district_name = DISTRICT_NAMES.get(district_id, f'District {district_id}')
            score = row[col]

            # Skip if score is 0 or NaN
            if pd.isna(score) or score == 0:
                continue

            districts.append(district_name)
            scores.append(float(score))

        # Skip if we don't have enough data
        if len(districts) < 2:
            continue

        # Create chart title (clarifying this shows elderly in priority districts based on domain scores)
        chart_title = f'{indicator_name} Among Elderly in Priority Districts'

        # Determine unit based on indicator name
        if 'Baht' in indicator_name or 'Income' in indicator_name:
            unit = 'Amount (Baht)'
        elif 'Average Education Level' in indicator_name:
            unit = 'Years of Education'
        elif '(%)' in indicator_name or 'Rate' in indicator_name or 'Prevalence' in indicator_name:
            unit = 'Percentage (%)'
        else:
            unit = 'Score (0-100)'

        # Check if worst district for this indicator is NOT in priority districts
        notable_district = None
        if domain_priority_districts and len(districts) > 0:
            worst_district_for_indicator = districts[0]  # First in CSV is worst
            worst_score = scores[0]

            # If the worst district for this indicator is NOT in the domain's priority list
            if worst_district_for_indicator not in domain_priority_districts:
                notable_district = {
                    'name': worst_district_for_indicator,
                    'value': worst_score
                }

        # Create safe filename
        safe_indicator = indicator_name.lower().replace(' ', '_').replace('/', '_').replace('(', '').replace(')', '').replace('%', 'pct')
        filename = os.path.join(domain_dir, f'{safe_indicator}.png')

        # Generate chart
        try:
            create_district_chart(
                title=chart_title,
                districts=districts,
                scores=scores,
                bangkok_avg=bangkok_avg,
                output_filename=filename,
                color=color,
                unit=unit,
                notable_district=notable_district
            )
            charts_generated += 1
            print(f"  OK {indicator_name}")
        except Exception as e:
            print(f"  X {indicator_name}: {str(e)}")

    return charts_generated


def generate_domain_level_charts():
    """
    Generate domain-level charts showing top 5 worst districts by domain score
    """
    print("\n" + "="*80)
    print("Generating Domain-Level District Charts")
    print("="*80 + "\n")

    # Load district scores
    district_scores_file = 'district_scores_elderly.csv'
    if not os.path.exists(district_scores_file):
        print(f"! File not found: {district_scores_file}")
        return 0

    df = pd.read_csv(district_scores_file, encoding='utf-8-sig')

    output_dir = 'district_top5_charts'
    domain_dir = os.path.join(output_dir, 'domain_scores')
    os.makedirs(domain_dir, exist_ok=True)

    # Domain columns in CSV (matching the column names)
    domain_columns = {
        'economic_security': 'Economic Security',
        'healthcare_access': 'Healthcare Access',
        'physical_environment': 'Physical Environment',
        'social_context': 'Social Context',
        'health_behaviors': 'Health Behaviors',
        'health_outcomes': 'Health Outcomes',
        'education': 'Education'
    }

    charts_generated = 0

    for domain_key, column_name in domain_columns.items():
        if column_name not in df.columns:
            print(f"  X Column not found: {column_name}")
            continue

        domain_name = DOMAIN_DISPLAY_NAMES[domain_key]
        color = DOMAIN_COLORS[domain_key]

        # Sort by domain score (ascending = worst first)
        df_sorted = df.sort_values(by=column_name).head(5)

        districts = []
        scores = []

        for _, row in df_sorted.iterrows():
            district_id = int(row['District'])
            district_name = DISTRICT_NAMES.get(district_id, f'District {district_id}')
            score = float(row[column_name])

            districts.append(district_name)
            scores.append(score)

        # Calculate Bangkok average
        bangkok_avg = df[column_name].mean()

        # Create chart title
        chart_title = f'Top 5 Districts with Lowest Elderly {domain_name}'

        # Create safe filename
        safe_domain = domain_key.lower()
        filename = os.path.join(domain_dir, f'{safe_domain}.png')

        # Generate chart
        try:
            create_district_chart(
                title=chart_title,
                districts=districts,
                scores=scores,
                bangkok_avg=bangkok_avg,
                output_filename=filename,
                color=color,
                unit='Score (0-100)'
            )
            charts_generated += 1
            print(f"  OK {domain_name}")
        except Exception as e:
            print(f"  X {domain_name}: {str(e)}")

    print(f"\n   Generated {charts_generated} domain-level charts\n")
    return charts_generated


def generate_all_district_charts():
    """
    Generate all district top 5 charts for all domains and indicators
    """
    print("\n" + "="*80)
    print("Generating Top 5 Worst District Charts - Gemini Style")
    print("="*80 + "\n")

    # Domain files mapping
    domain_files = {
        'economic_security': 'elderly_economic_security_comparison.csv',
        'healthcare_access': 'elderly_healthcare_access_comparison.csv',
        'physical_environment': 'elderly_physical_environment_comparison.csv',
        'social_context': 'elderly_social_context_comparison.csv',
        'health_behaviors': 'elderly_health_behaviors_comparison.csv',
        'health_outcomes': 'elderly_health_outcomes_comparison.csv',
        'education': 'elderly_education_comparison.csv'
    }

    total_charts = 0

    for domain_key, csv_file in domain_files.items():
        if not os.path.exists(csv_file):
            print(f"! Skipping {DOMAIN_DISPLAY_NAMES[domain_key]}: File not found ({csv_file})")
            continue

        print(f"\nProcessing {DOMAIN_DISPLAY_NAMES[domain_key]}...")
        charts_count = process_domain_file(csv_file, domain_key)
        total_charts += charts_count
        print(f"   Generated {charts_count} charts")

    # Generate domain-level charts
    domain_charts_count = generate_domain_level_charts()
    total_charts += domain_charts_count

    print("\n" + "="*80)
    print(f"Successfully generated {total_charts} district charts!")
    print(f"  - Indicator-level: {total_charts - domain_charts_count} charts")
    print(f"  - Domain-level: {domain_charts_count} charts")
    print(f"All charts saved in: district_top5_charts/")
    print("="*80 + "\n")


if __name__ == '__main__':
    generate_all_district_charts()
