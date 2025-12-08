"""
Generate domain-level bar charts matching EXACT Gemini format
One bar chart per domain showing overall domain scores
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Community colors (matching Gemini)
comm_colors = {
    'High-rise/Condo': '#9467bd',   # Purple
    'Housing Estate': '#d62728',    # Red
    'Crowded Community': '#1f77b4', # Blue
    'Urban Community': '#ff7f0e',   # Orange
    'Suburban Community': '#2ca02c',# Green
    'Bangkok Avg': '#000000'        # Black
}

# Set seaborn style
sns.set_style("whitegrid")

def create_domain_bar_chart(domain_name, values_dict, output_filename):
    """
    Create horizontal bar chart for a domain's overall scores
    Matching Gemini's exact format
    """
    # Prepare data
    categories = ['Crowded Community', 'Urban Community', 'Suburban Community',
                  'Housing Estate', 'High-rise/Condo']
    values = [values_dict[cat] for cat in categories]
    bkk_val = values_dict['Bangkok Avg']

    plot_data = pd.DataFrame({'Community Type': categories, 'Value': values})

    # Create figure
    plt.figure(figsize=(10, 6))

    # Bar colors
    bar_colors = [comm_colors.get(c, '#808080') for c in plot_data['Community Type']]

    # Create horizontal bars
    bars = plt.barh(plot_data['Community Type'], plot_data['Value'], color=bar_colors)

    # Bangkok Average reference line
    plt.axvline(x=bkk_val, color='black', linestyle='--', linewidth=2,
                label=f'Bangkok Avg ({bkk_val:.1f})')

    # Add value labels
    for bar in bars:
        width = bar.get_width()
        plt.text(width + (max(values)*0.01), bar.get_y() + bar.get_height()/2,
                 f'{width:.1f}', va='center', fontweight='bold', fontsize=10)

    # Formatting
    plt.title(f'{domain_name}: Comparison by Community Type', fontsize=14, fontweight='bold')
    plt.xlabel('Score (0-100)', fontsize=12)
    plt.xlim(0, max(values + [bkk_val]) * 1.2)
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_filename, dpi=300)
    plt.close()


def generate_all_domain_bar_charts():
    """
    Generate bar charts for all 7 domain-level scores
    """
    print("\n" + "="*70)
    print("Generating Domain Bar Charts - Gemini Style")
    print("="*70 + "\n")

    # Create output directory
    output_dir = 'gemini_style_charts'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Load domain-level data
    df = pd.read_csv('community_type_means_with_bangkok_7domains.csv', encoding='utf-8-sig')

    # Map community names
    name_mapping = {
        'Bangkok Average': 'Bangkok Avg',
        'Crowded Community': 'Crowded Community',
        'Urban Community': 'Urban Community',
        'Suburban Community': 'Suburban Community',
        'Housing Estate': 'Housing Estate',
        'High-rise/Condo': 'High-rise/Condo'
    }

    # Domain columns in the CSV
    domains = {
        'Economic Security': 'Economic Security Mean',
        'Healthcare Access': 'Healthcare Access Mean',
        'Physical Environment': 'Physical Environment Mean',
        'Social Context': 'Social Context Mean',
        'Health Behaviors': 'Health Behaviors Mean',
        'Health Outcomes': 'Health Outcomes Mean',
        'Education': 'Education Mean'
    }

    total_charts = 0

    for domain_name, col_name in domains.items():
        print(f"Generating: {domain_name}")

        # Extract values for each community
        values_dict = {}
        for _, row in df.iterrows():
            orig_name = row['Community Type']
            mapped_name = name_mapping.get(orig_name, orig_name)
            values_dict[mapped_name] = row[col_name]

        # Create safe filename
        safe_domain = domain_name.lower().replace(' ', '_')
        filename = os.path.join(output_dir, f'DOMAIN_{safe_domain}.png')

        # Generate chart
        try:
            create_domain_bar_chart(domain_name, values_dict, filename)
            print(f"  OK {filename}")
            total_charts += 1
        except Exception as e:
            print(f"  X Error: {str(e)}")

    print("\n" + "="*70)
    print(f"Successfully generated {total_charts} domain bar charts!")
    print(f"All charts saved in: {output_dir}/")
    print("="*70 + "\n")


if __name__ == '__main__':
    generate_all_domain_bar_charts()
