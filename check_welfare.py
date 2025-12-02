import pandas as pd

df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
elderly = df[(df['age'] >= 60) & (df['disable_status'] != 1)]

print('Welfare values for Elderly:')
print(elderly['welfare'].value_counts(dropna=False))
print('\nWelfare value types:')
print(elderly['welfare'].dtype)
print('\nTotal elderly:', len(elderly))
print('\nSample welfare values:')
print(elderly[['welfare']].head(20))
