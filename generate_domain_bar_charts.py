"""
Generate bar charts for each SDHE domain showing all indicators
Styled exactly like Gemini's example with Bangkok Average reference line
"""

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

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

def create_domain_bar_chart(domain_name, filename):
    """
    Create horizontal bar chart for a specific domain with all indicators
    Style matches Gemini's example exactly - one chart per indicator
    """
    # Load the domain data
    csv_file = DOMAIN_FILES[domain_name]
    df = pd.read_csv(csv_file, encoding='utf-8-sig')

    # Get number of indicators
    num_indicators = len(df)

    # Calculate layout: 2 columns, enough rows
    ncols = 2
    nrows = (num_indicators + 1) // 2  # Ceiling division

    # Fixed figure size
    fig, axes = plt.subplots(nrows, ncols, figsize=(16, nrows * 3.5))

    # Flatten axes array for easier indexing
    if nrows == 1:
        axes = axes.reshape(1, -1)
    axes = axes.flatten()

    # Create a bar chart for each indicator
    for idx, (_, row) in enumerate(df.iterrows()):
        ax = axes[idx]
        indicator_name = row['Indicator']
        bangkok_avg = row['Bangkok Avg']

        # Prepare data for communities (exclude Bangkok Avg and Gap)
        communities = []
        values = []
        colors = []

        for comm in COMMUNITY_ORDER:
            if comm in df.columns:
                val = row[comm]
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
            label_x = width + 2  # Slight offset
            ax.text(label_x, bar.get_y() + bar.get_height()/2, f'{val:.1f}',
                    va='center', fontsize=9, fontweight='bold')

        # Formatting
        ax.set_xlabel('Score (0-100)', fontsize=9)
        ax.set_title(indicator_name, fontsize=10, fontweight='bold', pad=8)
        ax.set_xlim(0, 110)  # Fixed scale with room for labels
        ax.grid(axis='x', alpha=0.3, linestyle=':', linewidth=0.5)
        ax.legend(loc='upper right', fontsize=8)

    # Hide extra subplots if odd number of indicators
    for idx in range(num_indicators, len(axes)):
        axes[idx].set_visible(False)

    # Overall title
    fig.suptitle(f'{domain_name}: Comparison by Community Type',
                 fontsize=16, fontweight='bold', y=0.995)

    plt.tight_layout(rect=[0, 0, 1, 0.99])
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"OK {domain_name} bar chart saved: {filename}")
    plt.close()


def generate_all_domain_charts():
    """
    Generate bar charts for all 7 SDHE domains
    """
    print("\n" + "="*60)
    print("Generating Domain Bar Charts with Indicators")
    print("="*60 + "\n")

    for domain_name in DOMAIN_FILES.keys():
        safe_name = domain_name.lower().replace(' ', '_')
        filename = f'domain_{safe_name}_indicators_REAL.png'

        try:
            create_domain_bar_chart(domain_name, filename)
        except Exception as e:
            print(f"X Error generating {domain_name}: {str(e)}")

    print("\n" + "="*60)
    print("All domain bar charts generated successfully!")
    print("="*60 + "\n")

    print("Files created:")
    for domain_name in DOMAIN_FILES.keys():
        safe_name = domain_name.lower().replace(' ', '_')
        print(f"  - domain_{safe_name}_indicators_REAL.png")


if __name__ == '__main__':
    generate_all_domain_charts()
