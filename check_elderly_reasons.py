import pandas as pd
import sys

# Set UTF-8 encoding for output
sys.stdout.reconfigure(encoding='utf-8')

df = pd.read_csv('public/data/survey_sampling.csv')

# Get elderly who didn't access oral health
elderly = df[df['age'] >= 60]
elderly_no_access = elderly[elderly['oral_health_access'] == 0]

print(f'Total elderly who did NOT access oral health care: {len(elderly_no_access)}')
print('='*80)

# Categorize
def classify_reason(reason_text):
    if pd.isna(reason_text) or reason_text == '':
        return 'empty/no_reason'

    text = str(reason_text).lower()

    if any(k in text for k in ['แพง', 'สูง', 'ค่า', 'เงิน']):
        return 'cost'
    if 'กลัว' in text:
        return 'fear'
    if 'ไม่มีเวลา' in text or 'เวลา' in text:
        return 'no_time'
    if 'เดิน' in text or 'ไกล' in text:
        return 'distance'
    if any(k in text for k in ['รอ', 'นาน', 'คิว']):
        return 'wait_time'

    return 'other'

elderly_no_access['reason_category'] = elderly_no_access['oral_health_access_reason'].apply(classify_reason)

# Show distribution
print('\nDistribution of reasons:')
for cat, count in elderly_no_access['reason_category'].value_counts().items():
    pct = count / len(elderly_no_access) * 100
    print(f'{cat}: {count} ({pct:.1f}%)')

# Show sample "other" reasons
print('\n' + '='*80)
print('Sample of "OTHER" category reasons (first 30):')
print('='*80)

other_reasons = elderly_no_access[elderly_no_access['reason_category'] == 'other']['oral_health_access_reason']

for i, reason in enumerate(other_reasons.head(30), 1):
    print(f'{i}. {reason}')

# Show empty/NaN reasons
print('\n' + '='*80)
print('Empty/NaN reasons count:')
print('='*80)
empty_count = elderly_no_access[elderly_no_access['reason_category'] == 'empty/no_reason'].shape[0]
print(f'Total empty/NaN: {empty_count}')
