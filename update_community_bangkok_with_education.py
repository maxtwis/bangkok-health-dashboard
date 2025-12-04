"""
Update community_type_means_with_bangkok.csv to include Education domain
"""
import pandas as pd
import numpy as np

# Load the existing community analysis results
community_df = pd.read_csv('public/data/community_data.csv', encoding='utf-8-sig')
full_survey_df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')

print(f"Community data: {len(community_df)} respondents")
print(f"Full survey: {len(full_survey_df)} respondents")

# Calculate Education scores for both datasets
def calculate_education_score(df):
    """Calculate Education domain score"""
    # Literacy Score
    df['literacy_speak_score'] = df['speak'].apply(lambda x: 100 if x == 1 else 0)
    df['literacy_read_score'] = df['read'].apply(lambda x: 100 if x == 1 else 0)
    df['literacy_write_score'] = df['write'].apply(lambda x: 100 if x == 1 else 0)
    df['literacy_math_score'] = df['math'].apply(lambda x: 100 if x == 1 else 0)

    df['literacy_score'] = df[[
        'literacy_speak_score',
        'literacy_read_score',
        'literacy_write_score',
        'literacy_math_score'
    ]].mean(axis=1)

    # Education Level Score (0-8 scale normalized to 0-100)
    def education_level_score(edu):
        if pd.isna(edu):
            return np.nan
        return (edu / 8) * 100

    df['education_level_score'] = df['education'].apply(education_level_score)

    # Training Participation Score
    df['training_score'] = df['training'].apply(lambda x: 100 if x == 1 else 0)

    # Education Domain Score (Literacy 40%, Education Level 40%, Training 20%)
    df['education_score'] = (
        df['literacy_score'] * 0.4 +
        df['education_level_score'] * 0.4 +
        df['training_score'] * 0.2
    )

    return df

# Calculate for both datasets
print("\nCalculating Education scores...")
community_df = calculate_education_score(community_df)
full_survey_df = calculate_education_score(full_survey_df)

# Load existing results from bangkok_average_full_survey.csv
bangkok_full = pd.read_csv('bangkok_average_full_survey.csv', encoding='utf-8-sig')

# Create results dataframe
results = []

# Add Bangkok Average (Full Survey) first
results.append({
    'Community Type': 'Bangkok Average (Full Survey)',
    'N': len(full_survey_df),
    'Economic Security Mean': bangkok_full['Economic Security Mean'].values[0],
    'Economic Security SD': bangkok_full['Economic Security SD'].values[0],
    'Healthcare Access Mean': bangkok_full['Healthcare Access Mean'].values[0],
    'Healthcare Access SD': bangkok_full['Healthcare Access SD'].values[0],
    'Physical Environment Mean': bangkok_full['Physical Environment Mean'].values[0],
    'Physical Environment SD': bangkok_full['Physical Environment SD'].values[0],
    'Social Context Mean': bangkok_full['Social Context Mean'].values[0],
    'Social Context SD': bangkok_full['Social Context SD'].values[0],
    'Health Behaviors Mean': bangkok_full['Health Behaviors Mean'].values[0],
    'Health Behaviors SD': bangkok_full['Health Behaviors SD'].values[0],
    'Health Outcomes Mean': bangkok_full['Health Outcomes Mean'].values[0],
    'Health Outcomes SD': bangkok_full['Health Outcomes SD'].values[0],
    'Education Mean': bangkok_full['Education Mean'].values[0],
    'Education SD': bangkok_full['Education SD'].values[0]
})

# Load old community results for the first 6 domains
old_community = pd.read_csv('community_type_means_with_bangkok.csv', encoding='utf-8-sig')

# Map community type names
community_type_map = {
    'Suburban Community': 'ชุมชนชานเมือง',
    'Housing Estate': 'ชุมชนหมู่บ้านจัดสรร',
    'High-rise/Condo': 'ชุมชนอาคารสูง',
    'Urban Community': 'ชุมชนเมือง',
    'Crowded Community': 'ชุมชนแออัด'
}

# Add community types with Education domain
for idx, row in old_community.iterrows():
    if row['Community Type'] == 'Bangkok Average (Full Survey)':
        continue

    comm_type_thai = community_type_map.get(row['Community Type'], row['Community Type'])

    # Get Education stats for this community type
    comm_data = community_df[community_df['community_type'] == comm_type_thai]

    if len(comm_data) > 0:
        results.append({
            'Community Type': row['Community Type'],
            'N': row['N'],
            'Economic Security Mean': row['Economic Security Mean'],
            'Economic Security SD': row['Economic Security SD'],
            'Healthcare Access Mean': row['Healthcare Access Mean'],
            'Healthcare Access SD': row['Healthcare Access SD'],
            'Physical Environment Mean': row['Physical Environment Mean'],
            'Physical Environment SD': row['Physical Environment SD'],
            'Social Context Mean': row['Social Context Mean'],
            'Social Context SD': row['Social Context SD'],
            'Health Behaviors Mean': row['Health Behaviors Mean'],
            'Health Behaviors SD': row['Health Behaviors SD'],
            'Health Outcomes Mean': row['Health Outcomes Mean'],
            'Health Outcomes SD': row['Health Outcomes SD'],
            'Education Mean': comm_data['education_score'].mean(),
            'Education SD': comm_data['education_score'].std()
        })

# Create dataframe and save
results_df = pd.DataFrame(results)
results_df.to_csv('community_type_means_with_bangkok_7domains.csv', index=False, encoding='utf-8-sig')

print("\n" + "="*80)
print("Updated Community Type Means with Education Domain")
print("="*80)
print(results_df.to_string(index=False))
print("\nSaved to: community_type_means_with_bangkok_7domains.csv")
