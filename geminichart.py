import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from math import pi

# ---------------------------------------------------------
# 1. Prepare Data (MOCKED DATA based on Narrative in Source 254-258)
# PLEASE REPLACE THIS SECTION WITH YOUR ACTUAL CSV LOAD
# ---------------------------------------------------------

# Mock data reflecting the trends described:
# - Housing/Condo: High Physical/Economic, Low Behavior/Outcomes
# - Crowded: Low Physical/Economic, High Social
data = {
    'Community Type': ['Bangkok Average', 'Crowded Community', 'Urban Community', 
                       'Suburban Community', 'Housing Estate', 'High-rise/Condo'],
    'Economic Security': [66.1, 55.0, 68.0, 65.0, 75.0, 78.0],
    'Healthcare Access': [60.8, 58.0, 62.0, 50.0, 65.0, 63.0],
    'Physical Environment': [73.4, 55.0, 70.0, 72.0, 85.0, 82.0],
    'Social Context': [92.8, 93.5, 90.0, 91.0, 88.0, 85.0],
    'Health Behaviors': [65.4, 60.0, 64.0, 66.0, 58.0, 55.0], # Condo/Housing have lower behavior scores
    'Health Outcomes': [39.5, 35.0, 40.0, 38.0, 42.0, 45.0],
    'Education': [57.5, 50.0, 60.0, 55.0, 70.0, 75.0]
}

df = pd.DataFrame(data)

# Set styles
plt.style.use('seaborn-v0_8-whitegrid')
colors = ['#000000', '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'] # Black for BKK Avg
markers = ['o', 's', '^', 'D', 'v', 'X']

# ---------------------------------------------------------
# 2. Graph 1: Spider Chart (Radar Chart)
# ---------------------------------------------------------
def create_radar_chart(df):
    categories = list(df.columns[1:])
    N = len(categories)
    
    angles = [n / float(N) * 2 * pi for n in range(N)]
    angles += angles[:1]
    
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))
    
    # Draw one axe per variable + labels
    plt.xticks(angles[:-1], categories, color='black', size=10)
    
    # Draw ylabels
    ax.set_rlabel_position(0)
    plt.yticks([40, 60, 80, 100], ["40", "60", "80", "100"], color="grey", size=8)
    plt.ylim(30, 100) # Max Zoom as requested
    
    # Plot each community
    for i, row in df.iterrows():
        values = df.loc[i].drop('Community Type').values.flatten().tolist()
        values += values[:1]
        
        line_style = '--' if row['Community Type'] == 'Bangkok Average' else '-'
        line_width = 2 if row['Community Type'] == 'Bangkok Average' else 1.5
        alpha_val = 0.8 if row['Community Type'] == 'Bangkok Average' else 0.6
        
        ax.plot(angles, values, linewidth=line_width, linestyle=line_style, label=row['Community Type'], marker=markers[i], color=colors[i])
        # No Fill as requested

    plt.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    plt.title('Comparison of SDHE Dimensions by Community Type', y=1.08, fontsize=14, fontweight='bold')
    plt.show()

create_radar_chart(df)

# ---------------------------------------------------------
# 3. Graph 2-8: Horizontal Bar Charts per Domain
# ---------------------------------------------------------
def create_domain_bar_chart(df, domain_name):
    # Sort for better visualization (optional, or keep fixed order)
    # We keep fixed order to compare across charts easily, but exclude Avg for the bars
    plot_df = df[df['Community Type'] != 'Bangkok Average'].copy()
    bkk_avg = df[df['Community Type'] == 'Bangkok Average'][domain_name].values[0]
    
    plt.figure(figsize=(10, 6))
    
    # Create horizontal bars
    bars = plt.barh(plot_df['Community Type'], plot_df[domain_name], color=colors[1:])
    
    # Add vertical line for Bangkok Average
    plt.axvline(x=bkk_avg, color='black', linestyle='--', linewidth=2, label=f'Bangkok Avg ({bkk_avg})')
    
    # Formatting
    plt.xlabel('Score (0-100)')
    plt.title(f'{domain_name}: Comparison by Community Type', fontsize=12)
    plt.xlim(0, 105) # Fixed scale
    plt.legend()
    
    # Add values on bars
    for bar in bars:
        width = bar.get_width()
        plt.text(width + 1, bar.get_y() + bar.get_height()/2, f'{width:.1f}', 
                 va='center', fontsize=10, fontweight='bold')

    plt.tight_layout()
    plt.show()

# Generate chart for each domain
domains = df.columns[1:]
for domain in domains:
    create_domain_bar_chart(df, domain)