import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from math import pi

# ---------------------------------------------------------
# 1. การเตรียมข้อมูลและคำนวณคะแนน (Data Preparation & Calculation)
# ---------------------------------------------------------

# โหลดไฟล์ข้อมูลรายด้าน (เปลี่ยน path ให้ตรงกับเครื่องของคุณ)
files = {
    'economic': 'community_economic_security_comparison.csv',
    'healthcare': 'community_healthcare_access_comparison.csv',
    'physical': 'community_physical_environment_comparison.csv',
    'social': 'community_social_context_comparison.csv',
    'behaviors': 'community_health_behaviors_comparison.csv',
    'outcomes': 'community_health_outcomes_comparison.csv',
    'education': 'community_education_comparison.csv'
}

data_frames = {}
for k, v in files.items():
    data_frames[k] = pd.read_csv(v)

# กำหนดตัวชี้วัดเชิงบวก (ยิ่งมากยิ่งดี) และเชิงลบ (ยิ่งมากยิ่งแย่ - ต้องกลับค่า)
# Positive Indicators
health_pos = ['Health Coverage Rate (%)', 'Dental Access Rate (%)']
phys_pos = ['Home Ownership Rate (%)', 'Water Access (%)', 'Electricity Access (%)', 
            'Waste Management (%)', 'Sanitation Access (%)', 'Has Ramp/Accessibility (%)', 
            'Has Handrails (%)', 'Has Public Recreation Space (%)', 'Has Health Facility (%)']
edu_pos = ['Can Speak Thai (%)', 'Can Read Thai (%)', 'Can Write Thai (%)', 
           'Can Do Basic Math (%)', 'Had Training (%)']
soc_pos = [] 
beh_pos = []
out_pos = []
econ_pos = [] # ใช้เฉพาะอัตรา (Rates) เพื่อความแม่นยำ ไม่รวมรายได้ที่เป็นบาท

# Negative Indicators (Score = 100 - Value)
health_neg = ['Medical Skip due to Cost (%)']
phys_neg = ['Housing Overcrowding (%)', 'Disaster Experience (%)', 'Pollution Exposure (%)']
soc_neg = ['Feels Unsafe (%)', 'Violence Experience (%)', 
           'Discrimination Experience (%)', 'No Social Support (%)']
beh_neg = ['Alcohol Consumption (%)', 'Tobacco Use (%)', 'No Exercise (%)', 'Abnormal BMI (%)']
out_neg = ['Chronic Disease Prevalence (%)', 'Multiple Chronic Diseases (%)']
econ_neg = ['Unemployment Rate (%)', 'Vulnerable Employment (%)', 
            'Food Insecurity - Moderate (%)', 'Food Insecurity - Severe (%)', 
            'Work Injury Rate (%)', 'Catastrophic Health Spending (%)']

domains = {
    'Economic Security': (econ_pos, econ_neg),
    'Healthcare Access': (health_pos, health_neg),
    'Physical Environment': (phys_pos, phys_neg),
    'Social Context': (soc_pos, soc_neg),
    'Health Behaviors': (beh_pos, beh_neg),
    'Health Outcomes': (out_pos, out_neg),
    'Education': (edu_pos, edu_neg)
}

# ฟังก์ชันคำนวณคะแนนรวมรายด้าน (Domain Score Calculation)
def calculate_domain_scores(data_frames, domains):
    results = {}
    valid_comms = ['Bangkok Avg', 'Suburban Community', 'Housing Estate', 
                   'High-rise/Condo', 'Urban Community', 'Crowded Community']
    
    for domain, (pos, neg) in domains.items():
        # Mapping domain name to file key
        file_key = domain.split()[0].lower()
        if domain == 'Social Context': file_key = 'social'
        if domain == 'Health Behaviors': file_key = 'behaviors'
        if domain == 'Health Outcomes': file_key = 'outcomes'
        
        df = data_frames[file_key].copy()
        df['Indicator'] = df['Indicator'].str.strip()
        df_t = df.set_index('Indicator').T
        
        total = 0
        count = 0
        
        # บวกคะแนนตัวชี้วัดเชิงบวก
        for ind in pos:
            if ind in df_t.columns:
                total += pd.to_numeric(df_t[ind])
                count += 1
        # บวกคะแนนตัวชี้วัดเชิงลบ (กลับค่า)
        for ind in neg:
            if ind in df_t.columns:
                total += (100 - pd.to_numeric(df_t[ind]))
                count += 1
                
        if count > 0:
            results[domain] = total / count # ค่าเฉลี่ย
            
    df_result = pd.DataFrame(results)
    df_result.reset_index(inplace=True)
    df_result.rename(columns={'index': 'Community Type'}, inplace=True)
    return df_result[df_result['Community Type'].isin(valid_comms)]

# คำนวณคะแนนจริง
df_spider = calculate_domain_scores(data_frames, domains)

# ---------------------------------------------------------
# 2. การตั้งค่ากราฟและสี (Plotting Setup)
# ---------------------------------------------------------

# กำหนดสีตามประเภทชุมชน (Consistent Color Palette)
comm_colors = {
    'High-rise/Condo': '#9467bd',   # Purple
    'Housing Estate': '#d62728',    # Red
    'Crowded Community': '#1f77b4', # Blue
    'Urban Community': '#ff7f0e',   # Orange
    'Suburban Community': '#2ca02c',# Green
    'Bangkok Avg': '#000000'        # Black
}

sns.set_style("whitegrid")

# ---------------------------------------------------------
# 3. สร้างกราฟ Spider Chart (Radar Chart)
# ---------------------------------------------------------

def create_radar_chart(df, output_filename):
    categories = list(df.columns[1:])
    N = len(categories)
    
    angles = [n / float(N) * 2 * pi for n in range(N)]
    angles += angles[:1]
    
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))
    
    # แกน X (ชื่อด้าน)
    plt.xticks(angles[:-1], categories, color='black', size=11)
    
    # แกน Y (สเกลคะแนน)
    ax.set_rlabel_position(0)
    plt.yticks([40, 60, 80, 100], ["40", "60", "80", "100"], color="grey", size=9)
    plt.ylim(30, 100) # Zoom Scale
    
    # พล็อตเส้นแต่ละชุมชน
    for i, row in df.iterrows():
        values = row[categories].values.flatten().tolist()
        values += values[:1]
        
        comm_type = row['Community Type']
        color = comm_colors.get(comm_type, '#808080')
        
        # เส้นประสำหรับค่าเฉลี่ย กทม.
        line_style = '--' if comm_type == 'Bangkok Avg' else '-'
        line_width = 2.5 if comm_type == 'Bangkok Avg' else 2
        alpha_val = 1.0 if comm_type == 'Bangkok Avg' else 0.7
        marker = None if comm_type == 'Bangkok Avg' else 'o'
        
        ax.plot(angles, values, linewidth=line_width, linestyle=line_style, 
                label=comm_type, color=color, marker=marker, markersize=4, alpha=alpha_val)
        # No Fill (ไม่ระบายสีข้างใน)

    plt.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1), fontsize=10)
    plt.title('Comparison of SDHE Dimensions by Community Type', y=1.08, fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_filename, bbox_inches='tight', dpi=300)
    plt.show()

# เรียกใช้ฟังก์ชันสร้าง Spider Chart
create_radar_chart(df_spider, 'spider_chart_community_final.png')

# ---------------------------------------------------------
# 4. สร้างกราฟ Bar Chart (สำหรับรายตัวชี้วัดหรือรายด้าน)
# ---------------------------------------------------------

def create_bar_chart(df, indicator_col, title, output_filename, bkk_col_name='Bangkok Avg'):
    # ค้นหาแถวข้อมูลที่ต้องการ
    if 'Indicator' in df.columns:
        row = df[df['Indicator'] == indicator_col]
        if row.empty: return
        row = row.iloc[0]
        categories = ['Crowded Community', 'Urban Community', 'Suburban Community', 
                      'Housing Estate', 'High-rise/Condo']
        values = [row[cat] for cat in categories]
        bkk_val = row[bkk_col_name]
        plot_data = pd.DataFrame({'Community Type': categories, 'Value': values})
    else:
        # กรณีข้อมูลมาในรูปแบบ Column (เช่น Unemployment Working Age)
        plot_data = df[df['Community Type'] != 'Bangkok Average (Full Survey)'].copy()
        values = plot_data[indicator_col]
        bkk_val = df[df['Community Type'] == 'Bangkok Average (Full Survey)'][indicator_col].values[0]
        plot_data.rename(columns={indicator_col: 'Value'}, inplace=True)

    # สร้างกราฟ
    plt.figure(figsize=(10, 6))
    
    # กำหนดสีแท่งกราฟตามประเภทชุมชน
    bar_colors = [comm_colors.get(c, '#808080') for c in plot_data['Community Type']]
    
    bars = plt.barh(plot_data['Community Type'], plot_data['Value'], color=bar_colors)
    
    # เส้นค่าเฉลี่ย กทม.
    plt.axvline(x=bkk_val, color='black', linestyle='--', linewidth=2, label=f'Bangkok Avg ({bkk_val:.1f})')
    
    # ใส่ตัวเลขกำกับ
    for bar in bars:
        width = bar.get_width()
        plt.text(width + (max(values)*0.01), bar.get_y() + bar.get_height()/2, 
                 f'{width:.1f}', va='center', fontweight='bold', fontsize=10)
                 
    plt.title(title, fontsize=14, fontweight='bold')
    plt.xlabel('Score / Percentage (%)', fontsize=12)
    plt.xlim(0, max(values + [bkk_val]) * 1.2) # เว้นที่ด้านขวา
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_filename, dpi=300)
    plt.show()

# ตัวอย่างการเรียกใช้ (Example Usage)
# 1. Bar Chart สำหรับ Dental Access (จากไฟล์ Healthcare)
create_bar_chart(data_frames['healthcare'], 'Dental Access Rate (%)', 
                 'Dental Access Rate by Community Type', 'bar_chart_dental.png')

# 2. Bar Chart สำหรับ Domain Score (ใช้ข้อมูลที่คำนวณเสร็จแล้วจาก df_spider)
# ต้องแปลง format เล็กน้อยเพื่อให้เข้ากับฟังก์ชัน create_bar_chart แบบแรก หรือเขียนใหม่
# แต่ถ้าจะพล็อต Domain Score ให้ใช้ข้อมูลจาก df_spider ได้เลยครับ