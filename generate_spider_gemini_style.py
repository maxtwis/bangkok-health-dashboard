"""
Generate spider chart matching EXACT Gemini format
Uses seaborn styling and same layout as geminchart_new.py
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from math import pi

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

def create_radar_chart(df, output_filename):
    """
    Create radar/spider chart matching Gemini's exact format
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
    plt.yticks([40, 60, 80, 100], ["40", "60", "80", "100"], color="grey", size=9)
    plt.ylim(30, 100)  # Zoom Scale

    # Plot each community
    for i, row in df.iterrows():
        values = row[categories].values.flatten().tolist()
        values += values[:1]

        comm_type = row['Community Type']
        color = comm_colors.get(comm_type, '#808080')

        # Special styling for Bangkok Avg
        line_style = '--' if comm_type == 'Bangkok Avg' else '-'
        line_width = 2.5 if comm_type == 'Bangkok Avg' else 2
        alpha_val = 1.0 if comm_type == 'Bangkok Avg' else 0.7
        marker = None if comm_type == 'Bangkok Avg' else 'o'

        ax.plot(angles, values, linewidth=line_width, linestyle=line_style,
                label=comm_type, color=color, marker=marker, markersize=4, alpha=alpha_val)
        # No Fill

    plt.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1), fontsize=10)
    plt.title('Comparison of SDHE Dimensions by Community Type', y=1.08, fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_filename, bbox_inches='tight', dpi=300)
    plt.close()
    print(f"\nSpider chart saved: {output_filename}")


def main():
    """
    Load real data and generate spider chart
    """
    print("\n" + "="*70)
    print("Generating Spider Chart - Gemini Style")
    print("="*70 + "\n")

    # Load real data
    df = pd.read_csv('community_type_means_with_bangkok_7domains.csv', encoding='utf-8-sig')

    # Prepare data in format needed
    desired_order = [
        'Bangkok Average',
        'Crowded Community',
        'Urban Community',
        'Suburban Community',
        'Housing Estate',
        'High-rise/Condo'
    ]

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

    # Map community names
    name_mapping = {
        'Bangkok Average': 'Bangkok Avg',
        'Crowded Community': 'Crowded Community',
        'Urban Community': 'Urban Community',
        'Suburban Community': 'Suburban Community',
        'Housing Estate': 'Housing Estate',
        'High-rise/Condo': 'High-rise/Condo'
    }

    for comm_name in desired_order:
        row = df[df['Community Type'] == comm_name]
        if len(row) > 0:
            data['Community Type'].append(name_mapping[comm_name])
            data['Economic Security'].append(row['Economic Security Mean'].values[0])
            data['Healthcare Access'].append(row['Healthcare Access Mean'].values[0])
            data['Physical Environment'].append(row['Physical Environment Mean'].values[0])
            data['Social Context'].append(row['Social Context Mean'].values[0])
            data['Health Behaviors'].append(row['Health Behaviors Mean'].values[0])
            data['Health Outcomes'].append(row['Health Outcomes Mean'].values[0])
            data['Education'].append(row['Education Mean'].values[0])
        else:
            print(f"WARNING: Community type '{comm_name}' not found in data!")

    spider_df = pd.DataFrame(data)

    print("Data loaded successfully!")
    print(f"Communities: {spider_df['Community Type'].tolist()}\n")

    # Generate spider chart
    create_radar_chart(spider_df, 'spider_chart_community_GEMINI.png')

    print("\n" + "="*70)
    print("Spider chart generation complete!")
    print("="*70 + "\n")


if __name__ == '__main__':
    main()
