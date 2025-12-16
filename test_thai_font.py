import matplotlib.pyplot as plt
import seaborn as sns

# Set seaborn style first
sns.set_style("whitegrid")

# Set Thai font
plt.rcParams['font.sans-serif'] = ['Angsana New', 'Tahoma', 'Browallia New']
plt.rcParams['font.family'] = 'sans-serif'

# Create simple test chart
fig, ax = plt.subplots(figsize=(8, 6))

# Thai text test
thai_text = ['บ้านเดี่ยว', 'ห้องแถว ตึกแถว', 'ทาวน์เฮาส์/บ้านแฝด',
              'แฟลต อพาร์ทเมนต์ คอนโด', 'ห้องภายในบ้าน']
values = [100, 200, 150, 300, 50]

ax.barh(thai_text, values)
ax.set_xlabel('Values', fontsize=12)
ax.set_ylabel('ประเภทที่อยู่อาศัย (House Type)', fontsize=12)
ax.set_title('ทดสอบแบบอักษรไทย (Thai Font Test)', fontsize=14, fontweight='bold')

plt.tight_layout()
plt.savefig('housing_gap_charts/thai_font_test.png', dpi=300)
print("Test chart saved: housing_gap_charts/thai_font_test.png")
print("\nPlease check if Thai characters are displaying correctly (not as squares)")
