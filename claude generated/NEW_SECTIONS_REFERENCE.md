# Community Profile - New Sections Reference

This document provides a visual reference for the new detailed disaggregated data sections added to the Community Profile component.

## Section Structure

All sections follow this consistent format:

```
┌─────────────────────────────────────────────────────────┐
│ [TEAL HEADER] Section Title                            │
├─────────────────────────────────────────────────────────┤
│ [Context paragraph explaining the data]                │
│                                                         │
│ • Category 1: N people (XX.X%)                         │
│ • Category 2: N people (XX.X%)                         │
│ • Category 3: N people (XX.X%)                         │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘
```

## 1. Occupation Type Breakdown
**Visibility**: Only shown if there are employed people
**Target Population**: People with occupation_status === 1

### Thai Header
```
┌─────────────────────────────────────────────────────────┐
│ ประเภทอาชีพ (เฉพาะผู้มีงานทำ)                          │
└─────────────────────────────────────────────────────────┘
```

### English Header
```
┌─────────────────────────────────────────────────────────┐
│ Occupation Type Breakdown (Employed People)             │
└─────────────────────────────────────────────────────────┘
```

### Data Categories
- รับราชการ / Government Employee
- รัฐวิสาหกิจ / State Enterprise
- พนักงานบริษัท/ลูกจ้าง / Company Employee
- ธุรกิจส่วนตัว / Private Business
- อาชีพอิสระ / Freelance
- อื่นๆ / Others (conditional)

## 2. Freelance Type Breakdown
**Visibility**: Only shown if there are freelance workers
**Target Population**: People with occupation_type === 6

### Thai Header
```
┌─────────────────────────────────────────────────────────┐
│ ประเภทอาชีพอิสระ                                        │
└─────────────────────────────────────────────────────────┘
```

### English Header
```
┌─────────────────────────────────────────────────────────┐
│ Freelance Type Breakdown                                │
└─────────────────────────────────────────────────────────┘
```

### Data Categories
- รับจ้างทั่วไป / General Labor
- ขายของออนไลน์ / Online Seller
- ไรเดอร์ / Rider
- วินมอเตอร์ไซต์ / Motorcycle Taxi
- ค้าขาย / Trading
- ผู้ค้าหาบเร่แผงลอย / Street Vendor

## 3. Health Insurance Type Breakdown
**Visibility**: Always shown
**Target Population**: All respondents

### Thai Header
```
┌─────────────────────────────────────────────────────────┐
│ ประเภทหลักประกันสุขภาพ                                  │
└─────────────────────────────────────────────────────────┘
```

### English Header
```
┌─────────────────────────────────────────────────────────┐
│ Health Insurance Type Breakdown                         │
└─────────────────────────────────────────────────────────┘
```

### Data Categories
- สิทธิสวัสดิการข้าราชการ/รัฐวิสาหกิจ / Civil Servant Welfare
- สิทธิประกันสังคม / Social Security
- สิทธิหลักประกันสุขภาพ 30 บาท (บัตรทอง) / Universal Health Coverage (30 Baht)
- อื่นๆ / Others (conditional)

## 4. Oral Health Access Reason
**Visibility**: Only shown if there are people without dental access
**Target Population**: People with oral_health === 1 AND oral_health_access === 0

### Thai Header
```
┌─────────────────────────────────────────────────────────┐
│ เหตุผลที่ไม่เข้าถึงบริการทันตกรรม                       │
└─────────────────────────────────────────────────────────┘
```

### English Header
```
┌─────────────────────────────────────────────────────────┐
│ Reasons for Not Accessing Dental Care                   │
└─────────────────────────────────────────────────────────┘
```

### Data Categories (conditional - only shown if count > 0)
- ค่าใช้จ่ายสูง/ไม่มีเงิน / Too expensive/No money
- กลัวหมอฟัน / Fear of dentist
- ระยะทางไกล/ไปไม่สะดวก / Too far/Distance
- รอนาน/คิวยาว / Long wait time
- รักษาเอง/รอหายเอง / Self-treatment
- เหตุผลอื่นๆ / Other reasons

### Keyword Detection Logic
```javascript
// Too expensive/No money
if (reason.includes('แพง') || reason.includes('สูง') ||
    reason.includes('ค่า') || reason.includes('เงิน'))

// Fear of dentist
if (reason.includes('กลัว'))

// Too far/Distance
if (reason.includes('เดิน') || reason.includes('ไกล'))

// Long wait time
if (reason.includes('รอ') || reason.includes('นาน') || reason.includes('คิว'))

// Self-treatment
if (reason.includes('หาย') || reason.includes('ยา') || reason.includes('เอง'))
```

## 5. Education Level
**Visibility**: Always shown
**Target Population**: All respondents

### Thai Header
```
┌─────────────────────────────────────────────────────────┐
│ ระดับการศึกษา                                           │
└─────────────────────────────────────────────────────────┘
```

### English Header
```
┌─────────────────────────────────────────────────────────┐
│ Education Level                                          │
└─────────────────────────────────────────────────────────┘
```

### Data Categories
- ไม่เคยเรียน / Never attended
- ประถมศึกษาตอนต้น (ป.1-3) / Primary lower (1-3)
- ประถมศึกษาตอนปลาย (ป.4-6) / Primary upper (4-6)
- มัธยมศึกษาตอนต้น (ม.1-3) / Secondary lower
- มัธยมศึกษาตอนปลาย (ม.4-6) / Secondary upper
- ปวช. / Vocational Certificate
- ปวส. / Vocational Diploma
- ปริญญาตรี / Bachelor's degree
- สูงกว่าปริญญาตรี / Higher than Bachelor's

## 6. Chronic Disease Types
**Visibility**: Only shown if there are people with chronic diseases
**Target Population**: People with diseases_status === 1

### Thai Header
```
┌─────────────────────────────────────────────────────────┐
│ ประเภทโรคเรื้อรัง                                        │
└─────────────────────────────────────────────────────────┘
```

### English Header
```
┌─────────────────────────────────────────────────────────┐
│ Chronic Disease Types                                    │
└─────────────────────────────────────────────────────────┘
```

### Data Categories (conditional - only shown if count > 0)
- เบาหวาน / Diabetes
- ความดันโลหิตสูง / Hypertension
- โรคเกาต์ / Gout
- ไตวายเรื้อรัง / Chronic Kidney Disease
- มะเร็ง / Cancer
- ไขมันในเลือดสูง / High Cholesterol
- กล้ามเนื้อหัวใจขาดเลือด / Ischemic Heart Disease
- โรคตับ / Liver Disease
- หลอดเลือดสมอง / Stroke
- เฮชไอวี (HIV) / HIV
- โรคทางจิตเวช / Mental Health
- ภูมิแพ้ / Allergies
- โรคกระดูกและข้อ / Bone/Joint Disease
- โรคระบบทางเดินหายใจ / Respiratory Disease
- ถุงลมโป่งพอง / Emphysema
- โลหิตจาง / Anemia
- กระเพาะอาหาร / Stomach Ulcer
- ลมชัก / Epilepsy
- ลำไส้ / Intestinal Disease
- อัมพาต / Paralysis
- อัมพฤกษ์ / Dementia

## Color Scheme

### Section Headers
- Background: `bg-teal-700` (#0F766E)
- Text: `text-white`
- Padding: `px-4 py-2`
- Margin bottom: `mb-4`

### Content
- Text color: `text-gray-700` for regular text
- Font weight: `font-semibold` for labels
- List style: Bullet points (`list-disc list-inside`)
- Spacing: `space-y-2` between list items

### Context Paragraphs
- Text color: `text-gray-600`
- Margin bottom: `mb-3`

## Example Output Format

```
Thai Example:
จากผู้มีงานทำทั้งหมด 150 คน แบ่งตามประเภทอาชีพได้ดังนี้:

• รับราชการ: 25 คน (16.7%)
• รัฐวิสาหกิจ: 10 คน (6.7%)
• พนักงานบริษัท/ลูกจ้าง: 45 คน (30.0%)
• ธุรกิจส่วนตัว: 30 คน (20.0%)
• อาชีพอิสระ: 40 คน (26.7%)

English Example:
Among 150 employed people, occupation types are as follows:

• Government Employee: 25 people (16.7%)
• State Enterprise: 10 people (6.7%)
• Company Employee: 45 people (30.0%)
• Private Business: 30 people (20.0%)
• Freelance: 40 people (26.7%)
```

## Percentage Calculation

All percentages are calculated as:
```javascript
(count / total) * 100
```

Where:
- For Occupation Types: total = employed people
- For Freelance Types: total = freelance workers
- For Insurance Types: total = all respondents
- For Oral Health Reasons: total = people without dental access
- For Education Levels: total = all respondents
- For Disease Types: total = people with chronic diseases

All percentages are displayed with 1 decimal place using `.toFixed(1)`.
