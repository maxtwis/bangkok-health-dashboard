import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# ตั้งค่าสไตล์กราฟ (Clean & Professional)
plt.style.use('seaborn-v0_8-whitegrid')

# --- 1. เตรียมข้อมูล (ตัวอย่าง) ---
# คุณสามารถเปลี่ยนค่าตรงนี้เป็นข้อมูลจริงจากไฟล์ CSV ของคุณได้
data = {
    'districts': ['Min Buri', 'Rat Burana', 'Khlong Sam Wa', 'Khlong Toei', 'Ratchathewi'], # ชื่อเขต (เรียงจากแย่สุดไปดีขึ้น)
    'scores': [61.3, 62.5, 62.6, 62.8, 62.9],  # คะแนนของแต่ละเขต
    'bangkok_avg': 66.1,                       # ค่าเฉลี่ยรวมของ กทม. (Benchmark)
    'title': 'Top 5 Districts with Lowest Economic Security', # ชื่อกราฟ
    'filename': 'District_Chart_Econ.png',     # ชื่อไฟล์ที่จะบันทึก
    'color': '#e74c3c'                         # สีของแท่งกราฟ (เช่น สีแดงสำหรับ Economic)
}

# --- 2. ฟังก์ชันสร้างกราฟ ---
def plot_district_chart(data):
    fig, ax = plt.subplots(figsize=(8, 5)) # ปรับขนาดรูป (กว้าง x สูง)
    
    y_pos = np.arange(len(data['districts']))
    
    # วาดกราฟแท่งแนวนอน
    bars = ax.barh(y_pos, data['scores'], color=data['color'], alpha=0.9, height=0.6)
    
    # ตั้งค่าแกนและชื่อกราฟ
    ax.set_yticks(y_pos)
    ax.set_yticklabels(data['districts'], fontsize=12, color='#333333')
    ax.set_xlabel('Score (0-100)', fontsize=12)
    ax.set_title(data['title'], fontsize=14, pad=15, loc='center', color='#333333')
    
    # กำหนดขอบเขตแกน X (ให้ครอบคลุมทั้งคะแนนเขตและค่าเฉลี่ย + เผื่อที่ว่าง 20%)
    max_val = max(max(data['scores']), data['bangkok_avg'])
    ax.set_xlim(0, max_val * 1.2)
    
    # ลบเส้นกรอบที่ไม่จำเป็น
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    
    # --- ไฮไลต์: เส้นค่าเฉลี่ย กทม. ---
    ax.axvline(x=data['bangkok_avg'], color='#555555', linestyle='--', linewidth=1.5)
    
    # ใส่ป้ายกำกับเส้นค่าเฉลี่ย (วางไว้ด้านบน หรือตำแหน่งที่เหมาะสม)
    # bbox คือกรอบสีขาวรองหลังตัวหนังสือ เพื่อให้อ่านง่ายทับเส้นตาราง
    ax.text(data['bangkok_avg'], len(data['districts']) - 0.5, 
            f' Bangkok Avg ({data["bangkok_avg"]:.1f})', 
            color='#555555', va='bottom', ha='center', fontsize=10, 
            bbox=dict(facecolor='white', alpha=0.9, edgecolor='none', pad=2))
    
    # --- ใส่ตัวเลขคะแนนปลายแท่ง ---
    for i, v in enumerate(data['scores']):
        # Logic: ถ้าแท่งยาวเกินค่าเฉลี่ย ให้เอาเลขไว้ข้างใน (สีขาว) ถ้าสั้นกว่าให้ไว้ข้างนอก (สีดำ)
        # เพื่อป้องกันตัวเลขทับกับเส้นค่าเฉลี่ย
        dist_to_mean = abs(v - data['bangkok_avg'])
        
        label_x = v + 1
        label_color = 'black'
        align = 'left'
        
        # ถ้าปลายแท่งอยู่ใกล้เส้นค่าเฉลี่ยมาก (ระยะห่าง < 8) และค่าน้อยกว่าค่าเฉลี่ย
        # ให้ย้ายตัวเลขเข้าไปอยู่ในแท่งกราฟแทน
        if v <= data['bangkok_avg'] and (data['bangkok_avg'] - v) < 8:
            label_x = v - 1
            align = 'right'
            label_color = 'white'
            
        ax.text(label_x, i, f'{v:.1f}', color=label_color, va='center', ha=align, fontweight='bold')

    # บันทึกและแสดงผล
    plt.tight_layout()
    plt.savefig(data['filename'], dpi=300)
    plt.show()
    print(f"Chart saved as {data['filename']}")

# --- 3. เรียกใช้งาน ---
plot_district_chart(data)