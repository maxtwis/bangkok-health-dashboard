"""
Generate spider chart for 5 population groups across all 7 domains
Matching Gemini style with proper colors
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from math import pi

# Population group colors - stronger versions of 95% CI bar chart colors
population_colors = {
    'Disabled': '#4169E1',              # Royal Blue (stronger than light blue)
    'Elderly': '#32CD32',               # Lime Green (stronger than light green)
    'General Population': '#FF6347',    # Tomato Red (stronger than salmon)
    'Informal Workers': '#FFD700',      # Gold (same, already strong)
    'LGBTQ+': '#BA55D3'                 # Medium Orchid (stronger than plum)
}

# Set seaborn style
sns.set_style("whitegrid")

def create_population_radar_chart(df, output_filename):
    """
    Create radar/spider chart for population groups
    """
    categories = list(df.columns[1:])
    N = len(categories)

    angles = [n / float(N) * 2 * pi for n in range(N)]
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))

    # X-axis (domain names)
    plt.xticks(angles[:-1], categories, color='black', size=11)

    # Y-axis (score scale)
    ax.set_rlabel_position(0)
    plt.yticks([20, 40, 60, 80, 100], ["20", "40", "60", "80", "100"], color="grey", size=9)
    plt.ylim(0, 100)  # Full scale 0-100

    # Plot each population group
    for i, row in df.iterrows():
        values = row[categories].values.flatten().tolist()
        values += values[:1]

        pop_group = row['Population Group']
        color = population_colors.get(pop_group, '#808080')

        # General Population gets special styling (thicker line)
        if pop_group == 'General Population':
            line_width = 2.5
            alpha_val = 1.0
            line_style = '--'
        else:
            line_width = 2
            alpha_val = 0.7
            line_style = '-'

        ax.plot(angles, values, linewidth=line_width, linestyle=line_style,
                label=pop_group, color=color, marker='o', markersize=4, alpha=alpha_val)

    plt.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1), fontsize=10)
    plt.title('Comparison of SDHE Dimensions by Population Group', y=1.08, fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_filename, bbox_inches='tight', dpi=300)
    plt.close()
    print(f"\nSpider chart saved: {output_filename}")


def main():
    """
    Load population group data and generate spider chart
    """
    print("\n" + "="*70)
    print("Generating Population Group Spider Chart")
    print("="*70 + "\n")

    # Load data
    df = pd.read_csv('weighted_means_by_group.csv', encoding='utf-8-sig')

    # Prepare data in format needed
    group_order = [
        'Disabled',
        'Elderly',
        'General Population',
        'Informal Workers',
        'LGBTQ+'
    ]

    data = {
        'Population Group': [],
        'Economic Security': [],
        'Healthcare Access': [],
        'Physical Environment': [],
        'Social Context': [],
        'Health Behaviors': [],
        'Health Outcomes': [],
        'Education': []
    }

    for group in group_order:
        row = df[df['Population Group'] == group]
        if len(row) > 0:
            data['Population Group'].append(group)
            data['Economic Security'].append(row['Economic Security Mean'].values[0])
            data['Healthcare Access'].append(row['Healthcare Access Mean'].values[0])
            data['Physical Environment'].append(row['Physical Environment Mean'].values[0])
            data['Social Context'].append(row['Social Context Mean'].values[0])
            data['Health Behaviors'].append(row['Health Behaviors Mean'].values[0])
            data['Health Outcomes'].append(row['Health Outcomes Mean'].values[0])
            data['Education'].append(row['Education Mean'].values[0])
        else:
            print(f"WARNING: Population group '{group}' not found in data!")

    spider_df = pd.DataFrame(data)

    print("Data loaded successfully!")
    print(f"Population Groups: {spider_df['Population Group'].tolist()}\n")

    # Generate spider chart
    create_population_radar_chart(spider_df, 'spider_chart_population_groups.png')

    print("\n" + "="*70)
    print("Population group spider chart generation complete!")
    print("="*70 + "\n")


if __name__ == '__main__':
    main()
