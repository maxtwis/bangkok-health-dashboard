"""
Generate individual bar charts for each indicator in each domain
One chart per indicator, styled exactly like Gemini's example
"""

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os

# Community colors matching the spider chart
COMMUNITY_COLORS = {
    'Crowded Community': '#1f77b4',      # Blue
    'Urban Community': '#ff7f0e',         # Orange
    'Suburban Community': '#2ca02c',      # Green
    'Housing Estate': '#d62728',          # Red
    'High-rise/Condo': '#9467bd'          # Purple
}

COMMUNITY_ORDER = [
    'High-rise/Condo',
    'Housing Estate',
    'Suburban Community',
    'Urban Community',
    'Crowded Community'
]

# Domain file mappings
DOMAIN_FILES = {
    'Economic Security': 'community_economic_security_comparison.csv',
    'Healthcare Access': 'community_healthcare_access_comparison.csv',
    'Physical Environment': 'community_physical_environment_comparison.csv',
    'Social Context': 'community_social_context_comparison.csv',
    'Health Behaviors': 'community_health_behaviors_comparison.csv',
    'Health Outcomes': 'community_health_outcomes_comparison.csv',
    'Education': 'community_education_comparison.csv'
}

def create_indicator_bar_chart(indicator_name, bangkok_avg, communities_data, filename, domain_name):
    """
    Create horizontal bar chart for a single indicator
    Style matches Gemini's example exactly
    """
    fig, ax = plt.subplots(figsize=(10, 6))

    # Prepare data
    communities = []
    values = []
    colors = []

    for comm, val in communities_data.items():
        if pd.notna(val):
            communities.append(comm)
            values.append(val)
            colors.append(COMMUNITY_COLORS[comm])

    # Create horizontal bars
    bars = ax.barh(communities, values, color=colors, height=0.6)

    # Add Bangkok Average reference line
    ax.axvline(x=bangkok_avg, color='black', linestyle='--', linewidth=2,
               label=f'Bangkok Avg ({bangkok_avg:.1f})', zorder=10)

    # Add value labels on bars
    for bar, val in zip(bars, values):
        width = bar.get_width()
        # Position label at end of bar
        label_x = width + 2
        ax.text(label_x, bar.get_y() + bar.get_height()/2, f'{val:.1f}',
                va='center', fontsize=10, fontweight='bold')

    # Formatting
    # Determine appropriate x-axis limit
    max_val = max(values)
    if max_val > 200:  # Special case for large values (e.g., income in Baht)
        x_limit = max_val * 1.15  # Add 15% margin
        xlabel = 'Value'
    else:
        x_limit = 110
        xlabel = 'Score (0-100)'

    ax.set_xlabel(xlabel, fontsize=11)
    ax.set_title(f'{domain_name}: {indicator_name}', fontsize=12, fontweight='bold', pad=10)
    ax.set_xlim(0, x_limit)
    ax.grid(axis='x', alpha=0.3, linestyle=':', linewidth=0.5)
    ax.legend(loc='upper right', fontsize=10)

    plt.tight_layout()
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    plt.close()


def generate_all_indicator_charts():
    """
    Generate individual bar charts for each indicator in each domain
    """
    print("\n" + "="*70)
    print("Generating Individual Indicator Bar Charts")
    print("="*70 + "\n")

    # Create output directory
    output_dir = 'indicator_charts'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}\n")

    total_charts = 0

    for domain_name, csv_file in DOMAIN_FILES.items():
        print(f"\n{domain_name}:")
        print("-" * 70)

        # Load the domain data
        df = pd.read_csv(csv_file, encoding='utf-8-sig')

        # Create chart for each indicator
        for _, row in df.iterrows():
            indicator_name = row['Indicator']
            bangkok_avg = row['Bangkok Avg']

            # Prepare community data
            communities_data = {}
            for comm in COMMUNITY_ORDER:
                if comm in df.columns:
                    communities_data[comm] = row[comm]

            # Create safe filename
            safe_domain = domain_name.lower().replace(' ', '_')
            safe_indicator = indicator_name.replace('(', '').replace(')', '').replace('%', 'pct').replace(' ', '_').replace('-', '_').replace('/', '_').lower()
            filename = os.path.join(output_dir, f'{safe_domain}_{safe_indicator}.png')

            # Generate chart
            try:
                create_indicator_bar_chart(indicator_name, bangkok_avg, communities_data,
                                          filename, domain_name)
                print(f"  OK {indicator_name}")
                total_charts += 1
            except Exception as e:
                print(f"  X Error with {indicator_name}: {str(e)}")

    print("\n" + "="*70)
    print(f"Successfully generated {total_charts} indicator bar charts!")
    print(f"All charts saved in: {output_dir}/")
    print("="*70 + "\n")


if __name__ == '__main__':
    generate_all_indicator_charts()
