"""
Real Data Visualization - Community SDHE Comparison
Uses ACTUAL data from community_type_means_with_bangkok_7domains.csv
Same visualization style as Gemini's mock, but with real values
"""

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from math import pi

print("Loading real data from community_type_means_with_bangkok_7domains.csv...")

# ---------------------------------------------------------
# 1. Load REAL Data
# ---------------------------------------------------------

# Load the real data
real_df = pd.read_csv('community_type_means_with_bangkok_7domains.csv', encoding='utf-8-sig')

print(f"Loaded {len(real_df)} rows")
print(f"Community types found: {real_df['Community Type'].tolist()}")

# Extract data in the desired order (matching Gemini's layout)
desired_order = [
    'Bangkok Average',
    'Crowded Community',
    'Urban Community',
    'Suburban Community',
    'Housing Estate',
    'High-rise/Condo'
]

# Select and prepare data
data = {
    'Community Type': [],
    'Economic Security': [],
    'Healthcare Access': [],
    'Physical Environment': [],
    'Social Context': [],
    'Health Behaviors': [],
    'Health Outcomes': [],
    'Education': []
}

for comm_name in desired_order:
    row = real_df[real_df['Community Type'] == comm_name]
    if len(row) > 0:
        data['Community Type'].append(comm_name)
        data['Economic Security'].append(row['Economic Security Mean'].values[0])
        data['Healthcare Access'].append(row['Healthcare Access Mean'].values[0])
        data['Physical Environment'].append(row['Physical Environment Mean'].values[0])
        data['Social Context'].append(row['Social Context Mean'].values[0])
        data['Health Behaviors'].append(row['Health Behaviors Mean'].values[0])
        data['Health Outcomes'].append(row['Health Outcomes Mean'].values[0])
        data['Education'].append(row['Education Mean'].values[0])
    else:
        print(f"WARNING: Community type '{comm_name}' not found in data!")

df = pd.DataFrame(data)

print("\nData loaded successfully!")
print(f"Communities: {df['Community Type'].tolist()}")
print("\nDomain ranges:")
for domain in df.columns[1:]:
    print(f"  {domain}: {df[domain].min():.1f} - {df[domain].max():.1f}")

# Set styles (same as Gemini's)
plt.style.use('seaborn-v0_8-whitegrid')
colors = ['#000000', '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']  # Black for BKK Avg
markers = ['o', 's', '^', 'D', 'v', 'X']

# ---------------------------------------------------------
# 2. Create Spider Chart (Radar Chart) - EXACT STYLE
# ---------------------------------------------------------

def create_radar_chart(df, filename='spider_chart_real_data.png'):
    """
    Create spider/radar chart matching Gemini's exact style
    """
    categories = list(df.columns[1:])
    N = len(categories)

    angles = [n / float(N) * 2 * pi for n in range(N)]
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))

    # Draw one axis per variable + labels
    plt.xticks(angles[:-1], categories, color='black', size=10)

    # Draw ylabels
    ax.set_rlabel_position(0)
    plt.yticks([40, 60, 80, 100], ["40", "60", "80", "100"], color="grey", size=8)
    plt.ylim(30, 100)  # Max Zoom as in original

    # Plot each community
    for i, row in df.iterrows():
        values = df.loc[i].drop('Community Type').values.flatten().tolist()
        values += values[:1]

        # Bangkok Average gets special styling
        line_style = '--' if row['Community Type'] == 'Bangkok Average' else '-'
        line_width = 2 if row['Community Type'] == 'Bangkok Average' else 1.5
        alpha_val = 0.8 if row['Community Type'] == 'Bangkok Average' else 0.6

        ax.plot(angles, values, linewidth=line_width, linestyle=line_style,
                label=row['Community Type'], marker=markers[i], color=colors[i], alpha=alpha_val)
        # No fill (as in original)

    plt.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    plt.title('Comparison of SDHE Dimensions by Community Type', y=1.08, fontsize=14, fontweight='bold')

    # Save the figure
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"\nSpider chart saved as: {filename}")
    plt.close()  # Close instead of show to avoid hanging

# Generate the spider chart
create_radar_chart(df, filename='community_sdhe_spider_chart_REAL.png')

# ---------------------------------------------------------
# 3. Create Horizontal Bar Charts per Domain (Optional)
# ---------------------------------------------------------

def create_domain_bar_chart(df, domain_name, filename=None):
    """
    Create horizontal bar chart for a specific domain
    """
    # Exclude Bangkok Average from bars, use as reference line
    plot_df = df[df['Community Type'] != 'Bangkok Average'].copy()
    bkk_avg = df[df['Community Type'] == 'Bangkok Average'][domain_name].values[0]

    plt.figure(figsize=(10, 6))

    # Create horizontal bars
    bars = plt.barh(plot_df['Community Type'], plot_df[domain_name], color=colors[1:])

    # Add vertical line for Bangkok Average
    plt.axvline(x=bkk_avg, color='black', linestyle='--', linewidth=2,
                label=f'Bangkok Avg ({bkk_avg:.1f})')

    # Formatting
    plt.xlabel('Score (0-100)')
    plt.title(f'{domain_name}: Comparison by Community Type', fontsize=12, fontweight='bold')
    plt.xlim(0, 105)  # Fixed scale
    plt.legend()

    # Add values on bars
    for bar in bars:
        width = bar.get_width()
        plt.text(width + 1, bar.get_y() + bar.get_height()/2, f'{width:.1f}',
                 va='center', fontsize=10, fontweight='bold')

    plt.tight_layout()

    if filename:
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        print(f"Bar chart saved as: {filename}")

    plt.close()  # Close instead of show to avoid hanging

# Generate bar charts for each domain (optional - comment out if not needed)
# Uncomment the following lines if you want bar charts too:
# print("\nGenerating individual domain bar charts...")
# domains = df.columns[1:]
# for domain in domains:
#     safe_domain = domain.lower().replace(' ', '_')
#     create_domain_bar_chart(df, domain, filename=f'community_{safe_domain}_bar_REAL.png')

print("\nSpider chart visualization complete!")
print("\nFile created:")
print("  - community_sdhe_spider_chart_REAL.png (main spider chart)")
