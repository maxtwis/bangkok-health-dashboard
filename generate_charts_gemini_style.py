"""
Generate bar charts matching EXACT Gemini format
Uses seaborn styling and same layout as geminchart_new.py
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

def create_bar_chart(df, indicator_col, title, output_filename, bkk_col_name='Bangkok Avg'):
    """
    Create bar chart matching Gemini's exact format
    """
    # Find the indicator row
    if 'Indicator' in df.columns:
        row = df[df['Indicator'] == indicator_col]
        if row.empty:
            print(f"  Warning: Indicator '{indicator_col}' not found")
            return
        row = row.iloc[0]

        categories = ['Crowded Community', 'Urban Community', 'Suburban Community',
                      'Housing Estate', 'High-rise/Condo']
        values = [row[cat] for cat in categories]
        bkk_val = row[bkk_col_name]
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
    plt.title(title, fontsize=14, fontweight='bold')
    plt.xlabel('Score / Percentage (%)', fontsize=12)
    plt.xlim(0, max(values + [bkk_val]) * 1.2)
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_filename, dpi=300)
    plt.close()


def generate_all_bar_charts():
    """
    Generate bar charts for all indicators using Gemini format
    """
    print("\n" + "="*70)
    print("Generating Bar Charts - Gemini Style")
    print("="*70 + "\n")

    # Create output directory
    output_dir = 'gemini_style_charts'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}\n")

    total_charts = 0

    for domain_name, csv_file in DOMAIN_FILES.items():
        print(f"\n{domain_name}:")
        print("-" * 70)

        # Load data
        df = pd.read_csv(csv_file, encoding='utf-8-sig')

        # Generate chart for each indicator
        for _, row in df.iterrows():
            indicator_name = row['Indicator']

            # Create safe filename
            safe_domain = domain_name.lower().replace(' ', '_')
            safe_indicator = indicator_name.replace('(', '').replace(')', '').replace('%', 'pct').replace(' ', '_').replace('-', '_').replace('/', '_').lower()
            filename = os.path.join(output_dir, f'{safe_domain}_{safe_indicator}.png')

            # Generate chart
            try:
                # Handle special case for income (very large values)
                if 'Income' in indicator_name and 'Baht' in indicator_name:
                    # Skip or handle specially
                    print(f"  Skipped: {indicator_name} (outlier values)")
                    continue

                create_bar_chart(df, indicator_name, f'{domain_name}: {indicator_name}', filename)
                print(f"  OK {indicator_name}")
                total_charts += 1
            except Exception as e:
                print(f"  X Error with {indicator_name}: {str(e)}")

    print("\n" + "="*70)
    print(f"Successfully generated {total_charts} bar charts!")
    print(f"All charts saved in: {output_dir}/")
    print("="*70 + "\n")


if __name__ == '__main__':
    generate_all_bar_charts()
