import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# ตั้งค่าสไตล์กราฟให้ดูสะอาดตาและเป็นวิชาการ
plt.style.use('seaborn-v0_8-whitegrid')

# --- ส่วนของการเตรียมข้อมูล (ตัวอย่าง) ---
# คุณสามารถเปลี่ยนค่าตรงนี้ให้เป็นข้อมูลจริงของคุณได้เลยครับ
data = {
    'labels': ['Bangkok Average', 'Min Buri', 'Rat Burana'],  # ชื่อกลุ่ม/เขต
    'values': [30.8, 92.3, 95.5],                             # ค่าเฉลี่ย (Mean)
    'errors': [1.5, 3.2, 2.8],                                # ค่าความคลาดเคลื่อน (Margin of Error / CI)
    'title': 'Vulnerable Employment Rate among Elderly',      # ชื่อกราฟ
    'filename': 'My_Chart_95CI.png',                          # ชื่อไฟล์ที่จะบันทึก
    'color': '#e74c3c'                                        # สีหลักของกราฟ (Hex Code)
}

# --- ฟังก์ชันสร้างกราฟ ---
def plot_bar_with_ci(data):
    fig, ax = plt.subplots(figsize=(8, 5)) # ปรับขนาดรูปได้ตามต้องการ
    
    y_pos = np.arange(len(data['labels']))
    
    # กำหนดสี: แท่งแรกเป็นสีเทา (Benchmark), แท่งอื่นเป็นสีที่เลือก
    colors = ['#95a5a6'] + [data['color']] * (len(data['labels']) - 1)
    
    # สร้างกราฟแท่งแนวนอน พร้อม Error Bars (xerr)
    # capsize=5 คือขีดปิดหัวท้ายของเส้น error bar
    bars = ax.barh(y_pos, data['values'], xerr=data['errors'], 
                   align='center', color=colors, alpha=0.9, ecolor='black', capsize=5, height=0.6)
    
    # ตั้งค่าแกนและชื่อกราฟ (ไม่ใช้ตัวหนา - fontweight='normal')
    ax.set_yticks(y_pos)
    ax.set_yticklabels(data['labels'], fontsize=12, color='#333333', fontweight='normal')
    ax.invert_yaxis()  # ให้ข้อมูลตัวแรกอยู่ด้านบน
    ax.set_xlabel('Score / Percentage', fontsize=12, fontweight='normal')
    ax.set_title(data['title'], fontsize=14, pad=15, loc='center', color='#333333', fontweight='normal')
    
    # ลบเส้นกรอบที่ไม่จำเป็นออก (Clean Look)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    
    # กำหนดขอบเขตแกน X ให้พอดี (เพิ่มที่ว่างด้านขวา 20% กันตัวเลขตกขอบ)
    # ถ้ามี Error bar ต้องคิดเผื่อปลายเส้น Error ด้วย
    max_val = max([v + e for v, e in zip(data['values'], data['errors'])])
    ax.set_xlim(0, max_val * 1.2)
    
    # ใส่ตัวเลขกำกับปลายแท่ง (Data Labels)
    for i, (val, err) in enumerate(zip(data['values'], data['errors'])):
        label_text = f"{val:.1f}"
        # วางตัวเลขถัดจากปลาย error bar เล็กน้อย
        ax.text(val + err + 1, i, label_text, color='black', va='center', fontweight='normal', fontsize=11)

    # บันทึกรูปภาพ
    plt.tight_layout()
    plt.savefig(data['filename'], dpi=300) # dpi=300 เพื่อความคมชัดสูง
    plt.show()
    print(f"Chart saved as {data['filename']}")

# --- เรียกใช้งาน ---
plot_bar_with_ci(data)