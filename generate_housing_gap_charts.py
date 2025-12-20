"""
Generate housing demand-supply gap bar charts
Shows gaps across house types and income levels
Uses seaborn styling matching the Gemini format
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import numpy as np
from matplotlib.ticker import FuncFormatter

# Set seaborn style first
sns.set_style("whitegrid")

# Then set Thai font for proper display (AFTER seaborn style)
# Use Noto Sans Thai for modern, clean Thai character display
plt.rcParams['font.sans-serif'] = ['Noto Sans Thai', 'Angsana New', 'Tahoma', 'Browallia New']
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['axes.unicode_minus'] = False

# Formatter function for axis labels with thousand separators
def comma_formatter(x, pos):
    """Format numbers with comma thousand separators"""
    return f'{int(x):,}'

# Income level colors (different color for each income bracket)
income_colors = {
    '<10000': '#e74c3c',         # Red - lowest income
    '10001-20000': '#e67e22',    # Orange
    '20001-30000': '#f39c12',    # Yellow-Orange
    '30001-40000': '#2ecc71',    # Green
    '40001-50000': '#3498db',    # Blue
    '>50000': '#9b59b6'          # Purple - highest income
}

def load_data(csv_file, province_name):
    """Load and clean the housing data"""
    df = pd.read_csv(csv_file, encoding='utf-8-sig')

    # Clean column names (remove BOM and whitespace)
    df.columns = df.columns.str.strip()

    # Convert gap columns to numeric
    for col in ['GAP_ALL', 'GAP_rent', 'GAP_Sale']:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # Remove rows where all gaps are 0 (no data)
    df = df[(df['GAP_ALL'] != 0) | (df['GAP_rent'] != 0) | (df['GAP_Sale'] != 0)]

    # Exclude specific house types
    exclude_types = ['ที่อยู่อาศัยที่ดัดแปลง', 'ที่อยู่อาศัยแบบอื่นๆ ไม่เข้าพวก']
    df = df[~df['Housetype'].isin(exclude_types)]

    # Remove numbers from the beginning of house type names (e.g., "1 บ้านเดี่ยว" -> "บ้านเดี่ยว")
    df['Housetype'] = df['Housetype'].str.replace(r'^\d+\s*', '', regex=True)

    # Normalize house type names to match the standard order
    house_type_mapping = {
        'ห้องแถว ตึกแถว': 'ห้องแถว/ตึกแถว',
        'ทาวน์เฮาส์/บ้านแฝด': 'ทาวน์เฮ้าส์/บ้านแฝด',
        'ห้องภายในบ้าน (ห้องแบ่งเช่า)': 'ห้องภายในบ้าน',
    }
    df['Housetype'] = df['Housetype'].replace(house_type_mapping)

    return df


def create_grouped_bar_chart(df, gap_column, title, output_filename):
    """
    Create grouped bar chart showing gap by house type and income
    Positive values = undersupply (need more housing)
    Negative values = oversupply (too much housing)
    """
    # Pivot data: house types as rows, income levels as columns
    pivot_df = df.pivot(index='Housetype', columns='Rank', values=gap_column)

    # Reorder income columns
    income_order = ['<10000', '10001-20000', '20001-30000', '30001-40000', '40001-50000', '>50000']
    pivot_df = pivot_df.reindex(columns=income_order)

    # Filter out house types where all values are 0 or NaN (no data)
    pivot_df = pivot_df[(pivot_df.fillna(0) != 0).any(axis=1)]

    # Sort house types by total gap
    house_order = pivot_df.sum(axis=1).sort_values(ascending=False).index
    pivot_df = pivot_df.reindex(house_order)

    # Create figure
    fig, ax = plt.subplots(figsize=(14, 8))

    # Prepare bar positions
    house_types = pivot_df.index
    x = np.arange(len(house_types))
    width = 0.13  # Width of each bar

    # Plot bars for each income level
    for i, income in enumerate(income_order):
        if income in pivot_df.columns:
            values = pivot_df[income].fillna(0)
            offset = (i - 2.5) * width  # Center the bars
            color = income_colors.get(income, '#808080')

            # Format legend label with commas
            if '-' in income:
                parts = income.split('-')
                legend_label = f'{int(parts[0]):,}-{int(parts[1]):,}'
            elif income.startswith('<'):
                legend_label = f'<{int(income[1:]):,}'
            elif income.startswith('>'):
                legend_label = f'>{int(income[1:]):,}'
            else:
                legend_label = income

            bars = ax.bar(x + offset, values, width,
                         label=legend_label,
                         color=color, alpha=0.85)

            # Add value labels on bars (only for significant values)
            for j, (bar, val) in enumerate(zip(bars, values)):
                if abs(val) > 5000:  # Only label significant gaps
                    height = bar.get_height()
                    # Format: show in thousands with 'k' suffix
                    label_text = f'{int(val/1000)}k'

                    # Position label
                    if height > 0:
                        y_pos = height + max(pivot_df.max().max() * 0.01, 100)
                        va = 'bottom'
                    else:
                        y_pos = height - max(abs(pivot_df.min().min()) * 0.01, 100)
                        va = 'top'

                    ax.text(bar.get_x() + bar.get_width()/2, y_pos,
                           label_text, ha='center', va=va,
                           fontsize=7, rotation=0, fontweight='bold')

    # Add zero reference line
    ax.axhline(y=0, color='black', linestyle='-', linewidth=1.5, alpha=0.7)

    # Formatting
    ax.set_xlabel('ประเภทที่อยู่อาศัย (ที่คนอาศัยอยู่)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_ylabel('ช่องว่าง (จำนวนหน่วย)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_title(title, fontsize=14, fontweight='bold', pad=25)
    ax.set_xticks(x)
    ax.set_xticklabels(house_types, rotation=45, ha='right')

    # Format Y-axis with comma thousand separators
    ax.yaxis.set_major_formatter(FuncFormatter(comma_formatter))

    # Legend
    ax.legend(title='รายได้ครัวเรือน (บาท/เดือน)', bbox_to_anchor=(1.05, 1),
             loc='upper left', frameon=True, fontsize=9)

    # Grid
    ax.grid(axis='y', alpha=0.3)
    ax.set_axisbelow(True)

    # Add annotation explaining positive/negative values
    fig.text(0.5, 0.01,
            'ค่าบวก (+) = อุปทานไม่เพียงพอ (ขาดแคลน) | ค่าลบ (-) = อุปทานเกิน (ส่วนเกิน)',
            fontsize=9, style='italic', color='#555555', ha='center')

    plt.tight_layout(rect=[0, 0.03, 1, 0.98])
    plt.savefig(output_filename, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  OK Created: {output_filename}")


def create_stacked_bar_chart(df, gap_column, title, output_filename):
    """
    Create stacked bar chart showing total gap by house type
    Each bar shows contribution from different income levels
    """
    # Pivot data
    pivot_df = df.pivot(index='Housetype', columns='Rank', values=gap_column)

    # Reorder income columns
    income_order = ['<10000', '10001-20000', '20001-30000', '30001-40000', '40001-50000', '>50000']
    pivot_df = pivot_df.reindex(columns=income_order)

    # Filter out house types where all values are 0 or NaN (no data)
    pivot_df = pivot_df[(pivot_df.fillna(0) != 0).any(axis=1)]

    # Sort by total gap
    house_order = pivot_df.sum(axis=1).sort_values(ascending=False).index
    pivot_df = pivot_df.reindex(house_order)

    # Separate positive and negative values for stacking
    pivot_positive = pivot_df.clip(lower=0)
    pivot_negative = pivot_df.clip(upper=0)

    # Create figure
    fig, ax = plt.subplots(figsize=(12, 7))

    # Plot stacked bars
    x_pos = np.arange(len(pivot_df.index))
    bottom_pos = np.zeros(len(pivot_df.index))
    bottom_neg = np.zeros(len(pivot_df.index))

    for income in income_order:
        if income in pivot_df.columns:
            color = income_colors.get(income, '#808080')

            # Format legend label with commas
            if '-' in income:
                parts = income.split('-')
                legend_label = f'{int(parts[0]):,}-{int(parts[1]):,}'
            elif income.startswith('<'):
                legend_label = f'<{int(income[1:]):,}'
            elif income.startswith('>'):
                legend_label = f'>{int(income[1:]):,}'
            else:
                legend_label = income

            # Positive stack
            pos_vals = pivot_positive[income].fillna(0).values
            ax.bar(x_pos, pos_vals, bottom=bottom_pos,
                  label=legend_label,
                  color=color, alpha=0.85, width=0.7)
            bottom_pos += pos_vals

            # Negative stack
            neg_vals = pivot_negative[income].fillna(0).values
            ax.bar(x_pos, neg_vals, bottom=bottom_neg,
                  color=color, alpha=0.85, width=0.7)
            bottom_neg += neg_vals

    # Add total labels on top of bars
    totals = pivot_df.sum(axis=1).values
    for i, (pos, total) in enumerate(zip(x_pos, totals)):
        if abs(total) > 1000:
            label_text = f'{int(total/1000)}k'
            y_pos = total + (max(totals) * 0.02 if total > 0 else min(totals) * 0.02)
            ax.text(pos, y_pos, label_text,
                   ha='center', va='bottom' if total > 0 else 'top',
                   fontweight='bold', fontsize=10)

    # Zero line
    ax.axhline(y=0, color='black', linestyle='-', linewidth=1.5)

    # Formatting
    ax.set_xlabel('ประเภทที่อยู่อาศัย (ที่คนอาศัยอยู่)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_ylabel('ช่องว่างรวม (จำนวนหน่วย)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_title(title, fontsize=14, fontweight='bold', pad=25)
    ax.set_xticks(x_pos)
    ax.set_xticklabels(pivot_df.index, rotation=45, ha='right')

    # Format Y-axis with comma thousand separators
    ax.yaxis.set_major_formatter(FuncFormatter(comma_formatter))

    # Legend
    ax.legend(title='รายได้ครัวเรือน (บาท/เดือน)', bbox_to_anchor=(1.05, 1),
             loc='upper left', frameon=True)

    # Grid
    ax.grid(axis='y', alpha=0.3)
    ax.set_axisbelow(True)

    # Annotation
    fig.text(0.5, 0.01,
            'ค่าบวก (+) = อุปทานไม่เพียงพอ (ขาดแคลน) | ค่าลบ (-) = อุปทานเกิน (ส่วนเกิน)',
            fontsize=9, style='italic', color='#555555', ha='center')

    plt.tight_layout(rect=[0, 0.03, 1, 0.98])
    plt.savefig(output_filename, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  OK Created: {output_filename}")


def create_heatmap_chart(df, gap_column, title, output_filename, global_max_val=200000):
    """
    Create heatmap showing gap intensity across house types and income levels

    Parameters:
    - global_max_val: Fixed maximum value for color scale across all provinces (default: 200000)
    """
    # Pivot data
    pivot_df = df.pivot(index='Housetype', columns='Rank', values=gap_column)

    # Reorder income columns
    income_order = ['<10000', '10001-20000', '20001-30000', '30001-40000', '40001-50000', '>50000']
    pivot_df = pivot_df.reindex(columns=income_order)

    # Sort house types in specified order
    house_type_order = [
        'บ้านเดี่ยว',
        'ทาวน์เฮ้าส์/บ้านแฝด',
        'ห้องแถว/ตึกแถว',
        'ห้องภายในบ้าน',
        'แฟลต อพาร์ทเมนต์ คอนโด'
    ]
    # Only include house types that exist in the data
    existing_types = [ht for ht in house_type_order if ht in pivot_df.index]
    # Add any types not in our predefined order (shouldn't happen after cleanup)
    for ht in pivot_df.index:
        if ht not in existing_types:
            existing_types.append(ht)
    pivot_df = pivot_df.reindex(existing_types)

    # Replace 0 with NaN to show as "ไม่มีข้อมูล"
    pivot_df_display = pivot_df.replace(0, np.nan)

    # Also replace any existing NaN values to ensure consistency
    pivot_df = pivot_df.fillna(0).replace(0, np.nan)

    # Create custom annotation array (show "ไม่มีข้อมูล" for NaN/0, otherwise show value with commas)
    annot_array = pivot_df_display.map(lambda x: 'ไม่มีข้อมูล' if pd.isna(x) else f'{x:,.0f}')

    # Create figure with more space
    fig, ax = plt.subplots(figsize=(14, 8))

    # Use FIXED symmetric color scale centered at 0 for consistency across all provinces
    max_abs_val = global_max_val

    # Create heatmap with diverging colormap (red=undersupply, blue=oversupply)
    heatmap = sns.heatmap(pivot_df, annot=annot_array, fmt='',
                cmap='RdBu_r',  # Reversed: red for positive (shortage), blue for negative (excess)
                center=0,
                vmin=-max_abs_val,  # Symmetric color scale
                vmax=max_abs_val,
                linewidths=0.5, linecolor='gray',
                cbar_kws={'label': 'ช่องว่าง (หน่วย)'},
                annot_kws={'fontsize': 10, 'fontweight': 'normal'},  # Larger font size for better readability
                ax=ax)

    # Add transparent background and "ไม่มีข้อมูล" text on NaN cells (grid lines show through)
    for i in range(len(pivot_df.index)):
        for j in range(len(pivot_df.columns)):
            # Check if cell is NaN or 0 in either pivot_df or the annotation shows "ไม่มีข้อมูล"
            if pd.isna(pivot_df.iloc[i, j]) or annot_array.iloc[i, j] == 'ไม่มีข้อมูล':
                # Add transparent rectangle to cover the colored background from seaborn
                ax.add_patch(plt.Rectangle((j, i), 1, 1,
                                          fill=True,
                                          facecolor='white',
                                          alpha=0,           # Fully transparent
                                          edgecolor='none',
                                          zorder=2))
                # Add text on top (grid lines from heatmap will show through)
                ax.text(j + 0.5, i + 0.5, 'ไม่มีข้อมูล',
                       ha='center', va='center', fontsize=10,
                       color='#666666',      # Dark gray text
                       fontweight='bold',    # Bold text
                       zorder=4)             # Draw on top

    # Format colorbar tick labels with commas
    colorbar = heatmap.collections[0].colorbar
    colorbar.ax.yaxis.set_major_formatter(FuncFormatter(comma_formatter))

    # Formatting
    ax.set_xlabel('รายได้ครัวเรือน (บาท/เดือน)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_ylabel('ประเภทที่อยู่อาศัย (ที่คนอาศัยอยู่)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_title(title, fontsize=14, fontweight='bold', pad=25)

    # Format X-axis labels with commas (income ranges)
    income_labels_formatted = []
    for label in income_order:
        if '-' in label:
            # Format ranges like "10001-20000" -> "10,001-20,000"
            parts = label.split('-')
            formatted = f'{int(parts[0]):,}-{int(parts[1]):,}'
            income_labels_formatted.append(formatted)
        elif label.startswith('<'):
            # Format "<10000" -> "<10,000"
            num = label[1:]
            income_labels_formatted.append(f'<{int(num):,}')
        elif label.startswith('>'):
            # Format ">50000" -> ">50,000"
            num = label[1:]
            income_labels_formatted.append(f'>{int(num):,}')
        else:
            income_labels_formatted.append(label)

    # Rotate labels
    ax.set_xticklabels(income_labels_formatted, rotation=45, ha='right')
    ax.set_yticklabels(ax.get_yticklabels(), rotation=0)

    # Annotation - positioned lower to avoid overlap
    fig.text(0.5, 0.01,
            'สีแดง = อุปทานไม่เพียงพอ (ขาดแคลน) | สีน้ำเงิน = อุปทานเกิน (ส่วนเกิน)',
            fontsize=9, style='italic', color='#555555', ha='center')

    plt.tight_layout(rect=[0, 0.03, 1, 0.98])  # Leave space for title and annotation
    plt.savefig(output_filename, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  OK Created: {output_filename}")


def generate_all_housing_charts(csv_file='housing_chart/BKK.csv', province_name='กรุงเทพมหานคร'):
    """
    Generate all housing gap visualizations for a province

    Parameters:
    - csv_file: Path to the CSV file
    - province_name: Thai name of the province for titles
    """
    print("\n" + "="*80)
    print(f"Generating {province_name} Housing Demand-Supply Gap Charts")
    print("="*80 + "\n")

    # Create output directory based on province
    province_clean = province_name.replace(' ', '_')
    output_dir = f'housing_gap_charts/{province_clean}'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}\n")

    # Load data
    print(f"Loading data from {csv_file}...")
    df = load_data(csv_file, province_name)
    print(f"Loaded {len(df)} records\n")

    # Chart configurations
    charts = [
        {
            'column': 'GAP_ALL',
            'title': f'ช่องว่างระหว่างอุปสงค์และอุปทานที่อยู่อาศัย {province_name} (รวมทุกประเภท)',
            'type': 'all'
        },
        {
            'column': 'GAP_rent',
            'title': f'ช่องว่างระหว่างอุปสงค์และอุปทานที่อยู่อาศัย {province_name} (เช่า)',
            'type': 'rent'
        },
        {
            'column': 'GAP_Sale',
            'title': f'ช่องว่างระหว่างอุปสงค์และอุปทานที่อยู่อาศัย {province_name} (ซื้อ/เป็นเจ้าของ)',
            'type': 'sale'
        }
    ]

    total_charts = 0

    for chart_config in charts:
        col = chart_config['column']
        title = chart_config['title']
        chart_type = chart_config['type']

        print(f"\nGenerating heatmap for: {title}")
        print("-" * 80)

        # Generate heatmap only
        filename = os.path.join(output_dir, f'housing_gap_{chart_type}_heatmap.png')
        create_heatmap_chart(df, col, title, filename)
        total_charts += 1

    print("\n" + "="*80)
    print(f"Successfully generated {total_charts} housing gap heatmaps!")
    print(f"All charts saved in: {output_dir}/")
    print("="*80 + "\n")


if __name__ == '__main__':
    # Generate charts for Bangkok (test)
    generate_all_housing_charts(
        csv_file='housing_chart/BKK.csv',
        province_name='กรุงเทพมหานคร'
    )
