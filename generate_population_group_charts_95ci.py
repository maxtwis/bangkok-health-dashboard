"""
Generate population group comparison charts with 95% Confidence Intervals
Matching gemini95chart.py format - one chart per domain
"""

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import os

# Set style
plt.style.use('seaborn-v0_8-whitegrid')

# Population group colors - matching the example image
population_colors = {
    'Disabled': '#87CEEB',              # Light Blue
    'Elderly': '#90EE90',               # Light Green
    'General Population': '#FA8072',    # Salmon/Coral (benchmark in middle)
    'Informal Workers': '#FFD700',      # Gold/Yellow
    'LGBTQ+': '#DDA0DD'                 # Plum/Light Purple
}

def calculate_95ci_margin(sd, n):
    """
    Calculate margin of error for 95% confidence interval
    Margin = 1.96 * (SD / sqrt(N))
    """
    return 1.96 * (sd / np.sqrt(n))


def plot_population_bar_with_ci(labels, values, errors, title, filename, benchmark_label='General Population'):
    """
    Create VERTICAL bar chart with 95% CI error bars
    Matching gemini95chart.py example image format exactly
    """
    fig, ax = plt.subplots(figsize=(10, 6))

    x_pos = np.arange(len(labels))

    # Colors: each group gets its own distinct color
    colors = [population_colors.get(label, '#3498db') for label in labels]

    # Create VERTICAL bar chart with error bars (yerr not xerr!)
    bars = ax.bar(x_pos, values, yerr=errors,
                  align='center', color=colors, alpha=0.9,
                  ecolor='black', capsize=5, width=0.6)

    # X-axis labels
    ax.set_xticks(x_pos)
    ax.set_xticklabels(labels, fontsize=11, color='#333333', fontweight='normal')

    # Axis labels and title
    ax.set_ylabel('Score (0-100)', fontsize=12, fontweight='normal')
    ax.set_title(title, fontsize=14, pad=15, loc='center', color='#333333', fontweight='normal')

    # Clean look - remove unnecessary spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # Y-axis limits (add 20% space on top)
    max_val = max([v + e for v, e in zip(values, errors)])
    ax.set_ylim(0, min(max_val * 1.2, 110))  # Cap at 110 for percentage scores

    # Add value labels on TOP of bars
    for i, (val, err) in enumerate(zip(values, errors)):
        label_text = f"{val:.1f}"
        # Position above the error bar
        ax.text(i, val + err + 2, label_text, color='black', ha='center',
                fontweight='normal', fontsize=11)

    # Save figure
    plt.tight_layout()
    plt.savefig(filename, dpi=300)
    plt.close()
    print(f"  OK {filename}")


def generate_all_population_group_charts():
    """
    Generate bar charts for all 7 domains comparing 5 population groups
    """
    print("\n" + "="*70)
    print("Generating Population Group Comparison Charts (95% CI)")
    print("="*70 + "\n")

    # Create output directory
    output_dir = 'population_group_charts_95ci'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}\n")

    # Load data
    df = pd.read_csv('weighted_means_by_group.csv', encoding='utf-8-sig')

    # Define domains
    domains = {
        'Economic Security': ('Economic Security Mean', 'Economic Security SD'),
        'Healthcare Access': ('Healthcare Access Mean', 'Healthcare Access SD'),
        'Physical Environment': ('Physical Environment Mean', 'Physical Environment SD'),
        'Social Context': ('Social Context Mean', 'Social Context SD'),
        'Health Behaviors': ('Health Behaviors Mean', 'Health Behaviors SD'),
        'Health Outcomes': ('Health Outcomes Mean', 'Health Outcomes SD'),
        'Education': ('Education Mean', 'Education SD')
    }

    # Desired order for population groups (matching example image)
    group_order = [
        'Disabled',
        'Elderly',
        'General Population',  # Benchmark in middle
        'Informal Workers',
        'LGBTQ+'
    ]

    total_charts = 0

    for domain_name, (mean_col, sd_col) in domains.items():
        print(f"Generating: {domain_name}")

        # Extract data for each population group
        labels = []
        values = []
        errors = []

        for group in group_order:
            row = df[df['Population Group'] == group]
            if len(row) > 0:
                labels.append(group)
                mean_val = row[mean_col].values[0]
                sd_val = row[sd_col].values[0]
                n_val = row['N'].values[0]

                # Calculate 95% CI margin of error
                margin = calculate_95ci_margin(sd_val, n_val)

                values.append(mean_val)
                errors.append(margin)

        # Create safe filename
        safe_domain = domain_name.lower().replace(' ', '_')
        filename = os.path.join(output_dir, f'population_group_{safe_domain}_95ci.png')

        # Generate chart
        try:
            title = f'{domain_name}: Comparison with 95% Confidence Intervals'
            plot_population_bar_with_ci(labels, values, errors, title, filename)
            total_charts += 1
        except Exception as e:
            print(f"  X Error: {str(e)}")

    print("\n" + "="*70)
    print(f"Successfully generated {total_charts} population group charts!")
    print(f"All charts saved in: {output_dir}/")
    print("="*70 + "\n")


if __name__ == '__main__':
    generate_all_population_group_charts()
