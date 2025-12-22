"""
Generate individual bar charts for each indicator in each population group's community analysis
Following the same style as generate_charts_gemini_style.py

Uses CSV files from community_population_group_indicator_analysis.py:
- community_elderly_60plus_*.csv
- community_disabled_*.csv
- community_informal_workers_*.csv
- community_lgbtqplus_*.csv
"""

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import seaborn as sns
import os

# Set seaborn style
sns.set_style("whitegrid")

# Community colors (matching Gemini)
COMMUNITY_COLORS = {
    'High-rise/Condo': '#9467bd',   # Purple
    'Housing Estate': '#d62728',    # Red
    'Crowded Community': '#1f77b4', # Blue
    'Urban Community': '#ff7f0e',   # Orange
    'Suburban Community': '#2ca02c' # Green
}

COMMUNITY_ORDER = [
    'High-rise/Condo',
    'Housing Estate',
    'Suburban Community',
    'Urban Community',
    'Crowded Community'
]

# Mapping from CSV column names to display names
COMMUNITY_NAME_MAP = {
    'Suburban': 'Suburban Community',
    'Housing Estate': 'Housing Estate',
    'High-rise': 'High-rise/Condo',
    'Urban': 'Urban Community',
    'Crowded': 'Crowded Community'
}

# Population group file mappings
POPULATION_GROUP_FILES = {
    'Elderly (60+)': {
        'Economic Security': 'community_elderly_60plus_economic_security.csv',
        'Healthcare Access': 'community_elderly_60plus_healthcare_access.csv',
        'Physical Environment': 'community_elderly_60plus_physical_environment.csv',
        'Social Context': 'community_elderly_60plus_social_context.csv',
        'Health Behaviors': 'community_elderly_60plus_health_behaviors.csv',
        'Health Outcomes': 'community_elderly_60plus_health_outcomes.csv',
        'Education': 'community_elderly_60plus_education.csv'
    },
    'Disabled': {
        'Economic Security': 'community_disabled_economic_security.csv',
        'Healthcare Access': 'community_disabled_healthcare_access.csv',
        'Physical Environment': 'community_disabled_physical_environment.csv',
        'Social Context': 'community_disabled_social_context.csv',
        'Health Behaviors': 'community_disabled_health_behaviors.csv',
        'Health Outcomes': 'community_disabled_health_outcomes.csv',
        'Education': 'community_disabled_education.csv'
    },
    'Informal Workers': {
        'Economic Security': 'community_informal_workers_economic_security.csv',
        'Healthcare Access': 'community_informal_workers_healthcare_access.csv',
        'Physical Environment': 'community_informal_workers_physical_environment.csv',
        'Social Context': 'community_informal_workers_social_context.csv',
        'Health Behaviors': 'community_informal_workers_health_behaviors.csv',
        'Health Outcomes': 'community_informal_workers_health_outcomes.csv',
        'Education': 'community_informal_workers_education.csv'
    },
    'LGBTQ+': {
        'Economic Security': 'community_lgbtqplus_economic_security.csv',
        'Healthcare Access': 'community_lgbtqplus_healthcare_access.csv',
        'Physical Environment': 'community_lgbtqplus_physical_environment.csv',
        'Social Context': 'community_lgbtqplus_social_context.csv',
        'Health Behaviors': 'community_lgbtqplus_health_behaviors.csv',
        'Health Outcomes': 'community_lgbtqplus_health_outcomes.csv',
        'Education': 'community_lgbtqplus_education.csv'
    }
}

def create_indicator_bar_chart(indicator_name, mean_value, communities_data, filename, domain_name, pop_group):
    """
    Create horizontal bar chart for a single indicator
    Style matches generate_charts_gemini_style.py exactly
    """
    # Prepare data
    communities = []
    values = []

    for comm_display in COMMUNITY_ORDER:
        # Map display name back to CSV column name to get value
        csv_name = [k for k, v in COMMUNITY_NAME_MAP.items() if v == comm_display][0]
        val = communities_data.get(csv_name, np.nan)
        if pd.notna(val):
            communities.append(comm_display)
            values.append(val)

    # Create figure
    plt.figure(figsize=(10, 6))

    # Bar colors
    bar_colors = [COMMUNITY_COLORS.get(c, '#808080') for c in communities]

    # Create horizontal bars
    bars = plt.barh(communities, values, color=bar_colors)

    # Mean reference line
    if pd.notna(mean_value):
        plt.axvline(x=mean_value, color='black', linestyle='--', linewidth=2,
                    label=f'Mean ({mean_value:.1f})')

    # Add value labels
    for bar in bars:
        width = bar.get_width()
        plt.text(width + (max(values)*0.01), bar.get_y() + bar.get_height()/2,
                 f'{width:.1f}', va='center', fontweight='bold', fontsize=10)

    # Formatting
    plt.title(f'{pop_group} - {domain_name}: {indicator_name}',
              fontsize=14, fontweight='bold')
    plt.xlabel('Score / Percentage (%)', fontsize=12)
    all_values = values + ([mean_value] if pd.notna(mean_value) else [])
    plt.xlim(0, max(all_values) * 1.2)

    if pd.notna(mean_value):
        plt.legend()

    plt.tight_layout()
    plt.savefig(filename, dpi=300)
    plt.close()


def generate_all_popgroup_charts():
    """
    Generate individual bar charts for each indicator in each population group and domain
    """
    print("\n" + "="*80)
    print("GENERATING COMMUNITY-POPULATION GROUP INDICATOR BAR CHARTS")
    print("="*80 + "\n")

    # Create output directory
    output_dir = 'community_popgroup_indicator_charts'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}\n")

    total_charts = 0

    for pop_group, domains in POPULATION_GROUP_FILES.items():
        print(f"\n{'='*80}")
        print(f"POPULATION GROUP: {pop_group}")
        print(f"{'='*80}\n")

        for domain_name, csv_file in domains.items():
            # Check if file exists
            if not os.path.exists(csv_file):
                print(f"  X Skipping {domain_name}: File not found - {csv_file}")
                continue

            print(f"\n{domain_name}:")
            print("-" * 80)

            # Load the domain data
            try:
                df = pd.read_csv(csv_file, encoding='utf-8-sig')
            except Exception as e:
                print(f"  X Error loading {csv_file}: {str(e)}")
                continue

            # Create chart for each indicator
            for _, row in df.iterrows():
                indicator_name = row['Indicator']
                mean_value = row.get('Mean', np.nan)

                # Prepare community data (using CSV column names, not display names)
                communities_data = {}
                csv_column_names = ['Suburban', 'Housing Estate', 'High-rise', 'Urban', 'Crowded']
                for csv_name in csv_column_names:
                    if csv_name in df.columns:
                        communities_data[csv_name] = row[csv_name]

                # Check if we have any valid data
                valid_data = [v for v in communities_data.values() if pd.notna(v)]
                if len(valid_data) < 2:
                    print(f"  X Skipping {indicator_name}: Insufficient data")
                    continue

                # Create safe filename
                safe_pop = pop_group.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('+', 'plus')
                safe_domain = domain_name.lower().replace(' ', '_')
                safe_indicator = indicator_name.replace('(', '').replace(')', '').replace('%', 'pct').replace(' ', '_').replace('-', '_').replace('/', '_').lower()
                filename = os.path.join(output_dir, f'{safe_pop}_{safe_domain}_{safe_indicator}.png')

                # Generate chart
                try:
                    create_indicator_bar_chart(indicator_name, mean_value, communities_data,
                                              filename, domain_name, pop_group)
                    print(f"  OK {indicator_name}")
                    total_charts += 1
                except Exception as e:
                    print(f"  X Error with {indicator_name}: {str(e)}")

    print("\n" + "="*80)
    print(f"Successfully generated {total_charts} indicator bar charts!")
    print(f"All charts saved in: {output_dir}/")
    print("="*80 + "\n")


if __name__ == '__main__':
    generate_all_popgroup_charts()
