"""
Education Domain Calculation - Domain 7
Indicators: Literacy (speak, read, write, math), Education Level, Training Participation

This provides the calculation logic to be integrated into all SDHE analyses
"""

import pandas as pd
import numpy as np

def calculate_education_score(df):
    """
    Calculate Education Domain score for a dataframe

    Indicators:
    1. speak: Can speak Thai (1=yes, 0=no)
    2. read: Can read Thai (1=yes, 0=no)
    3. write: Can write Thai (1=yes, 0=no)
    4. math: Can do basic math (1=yes, 0=no)
    5. education: Highest education level (0-8 scale)
    6. training: Training participation in past 12 months (1=yes, 0=no)

    Returns: DataFrame with education_score column added
    """

    # Literacy Score (25 points each = 100 total)
    df['literacy_speak_score'] = df['speak'].apply(lambda x: 100 if x == 1 else 0)
    df['literacy_read_score'] = df['read'].apply(lambda x: 100 if x == 1 else 0)
    df['literacy_write_score'] = df['write'].apply(lambda x: 100 if x == 1 else 0)
    df['literacy_math_score'] = df['math'].apply(lambda x: 100 if x == 1 else 0)

    # Overall literacy score (average of 4 skills)
    df['literacy_score'] = df[[
        'literacy_speak_score',
        'literacy_read_score',
        'literacy_write_score',
        'literacy_math_score'
    ]].mean(axis=1)

    # Education Level Score
    # Scale: 0=no school, 1-2=primary, 3-4=secondary, 5-6=vocational, 7-8=university
    # Normalize to 0-100 scale
    def education_level_score(edu):
        if pd.isna(edu):
            return np.nan
        # Convert 0-8 scale to 0-100
        return (edu / 8) * 100

    df['education_level_score'] = df['education'].apply(education_level_score)

    # Training Participation Score
    # Recent training indicates continuous learning
    df['training_score'] = df['training'].apply(lambda x: 100 if x == 1 else 0)

    # Education Domain Score
    # Weighted: Literacy (40%), Education Level (40%), Training (20%)
    df['education_score'] = (
        df['literacy_score'] * 0.4 +
        df['education_level_score'] * 0.4 +
        df['training_score'] * 0.2
    )

    return df


# Test the function
if __name__ == "__main__":
    print("="*80)
    print("EDUCATION DOMAIN CALCULATION TEST")
    print("="*80)

    # Load sample data
    df = pd.read_csv('public/data/survey_sampling.csv', encoding='utf-8-sig')
    print(f"\nLoaded {len(df)} respondents")

    # Calculate education score
    df = calculate_education_score(df)

    # Show summary statistics
    print("\nEducation Domain Statistics:")
    print(f"Mean Education Score: {df['education_score'].mean():.2f}")
    print(f"Median Education Score: {df['education_score'].median():.2f}")
    print(f"Std Dev: {df['education_score'].std():.2f}")
    print(f"Min: {df['education_score'].min():.2f}")
    print(f"Max: {df['education_score'].max():.2f}")

    # Show component scores
    print("\nComponent Scores:")
    print(f"Literacy Score: {df['literacy_score'].mean():.2f}")
    print(f"Education Level Score: {df['education_level_score'].mean():.2f}")
    print(f"Training Score: {df['training_score'].mean():.2f}")

    # Show literacy breakdown
    print("\nLiteracy Breakdown (% who can):")
    print(f"Speak Thai: {(df['speak'] == 1).sum() / len(df) * 100:.1f}%")
    print(f"Read Thai: {(df['read'] == 1).sum() / len(df) * 100:.1f}%")
    print(f"Write Thai: {(df['write'] == 1).sum() / len(df) * 100:.1f}%")
    print(f"Basic Math: {(df['math'] == 1).sum() / len(df) * 100:.1f}%")

    # Show education level distribution
    print("\nEducation Level Distribution:")
    edu_dist = df['education'].value_counts().sort_index()
    edu_labels = {
        0: 'No school',
        1: 'Primary 1-3',
        2: 'Primary 4-6',
        3: 'Secondary 1-3',
        4: 'Secondary 4-6',
        5: 'Vocational Certificate',
        6: 'Vocational Diploma',
        7: 'Bachelor',
        8: 'Post-graduate'
    }
    for level, count in edu_dist.items():
        pct = count / len(df) * 100
        label = edu_labels.get(level, f'Level {level}')
        print(f"  {label}: {count} ({pct:.1f}%)")

    # Show training participation
    training_pct = (df['training'] == 1).sum() / len(df) * 100
    print(f"\nTraining Participation (past 12 months): {training_pct:.1f}%")

    print("\n" + "="*80)
    print("TEST COMPLETE")
    print("="*80)
