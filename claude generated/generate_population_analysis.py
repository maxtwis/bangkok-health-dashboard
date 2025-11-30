#!/usr/bin/env python3
"""
Population Count Analysis Generator
Generates CSV files with population demographics analysis matching survey_sampling.csv with district_code.csv
"""

import pandas as pd
import numpy as np
from pathlib import Path

def load_data():
    """Load survey data and district code mapping"""
    try:
        # Load survey data
        survey_df = pd.read_csv('public/data/survey_sampling.csv')
        print(f"Loaded {len(survey_df)} survey responses")

        # Load district code mapping
        district_df = pd.read_csv('public/data/district_code.csv')
        print(f"Loaded {len(district_df)} district mappings")

        return survey_df, district_df
    except FileNotFoundError as e:
        print(f"Error loading data files: {e}")
        return None, None

def calculate_population_groups(survey_df):
    """Calculate population group classifications"""
    # Clean column names and handle BOM
    survey_df.columns = survey_df.columns.str.replace('\ufeff', '')

    # Calculate population groups
    survey_df['elderly'] = (survey_df['age'] >= 60).astype(int)
    survey_df['lgbt'] = (survey_df['sex'] == 'lgbt').astype(int)
    survey_df['disabled'] = (survey_df['disable_status'] == 1).astype(int)
    survey_df['informal'] = (survey_df['occupation_contract'] == 0).astype(int)

    # General population = not in any of the 4 categories
    survey_df['general'] = (
        (survey_df['elderly'] == 0) &
        (survey_df['lgbt'] == 0) &
        (survey_df['disabled'] == 0) &
        (survey_df['informal'] == 0)
    ).astype(int)

    return survey_df

def generate_district_summary(survey_df, district_df):
    """Generate district-level population summary"""
    # Clean district code column name
    district_df.columns = district_df.columns.str.replace('\ufeff', '')

    # Group by district and calculate totals
    district_summary = survey_df.groupby('dname').agg({
        'general': 'sum',
        'lgbt': 'sum',
        'elderly': 'sum',
        'disabled': 'sum',
        'informal': 'sum'
    }).reset_index()

    # Calculate total responses per district
    district_totals = survey_df.groupby('dname').size().reset_index(name='total')
    district_summary = district_summary.merge(district_totals, on='dname')

    # Merge with district names
    district_summary = district_summary.merge(
        district_df,
        left_on='dname',
        right_on='dcode',
        how='left'
    )

    # Calculate percentages
    district_summary['general_pct'] = (district_summary['general'] / district_summary['total'] * 100).round(1)
    district_summary['lgbt_pct'] = (district_summary['lgbt'] / district_summary['total'] * 100).round(1)
    district_summary['elderly_pct'] = (district_summary['elderly'] / district_summary['total'] * 100).round(1)
    district_summary['disabled_pct'] = (district_summary['disabled'] / district_summary['total'] * 100).round(1)
    district_summary['informal_pct'] = (district_summary['informal'] / district_summary['total'] * 100).round(1)

    # Reorder columns
    columns_order = [
        'dcode', 'dname_y', 'total',
        'general', 'general_pct',
        'lgbt', 'lgbt_pct',
        'elderly', 'elderly_pct',
        'disabled', 'disabled_pct',
        'informal', 'informal_pct'
    ]

    district_summary = district_summary[columns_order]
    district_summary = district_summary.rename(columns={
        'dcode': 'district_code',
        'dname_y': 'district_name',
        'general': 'general_count',
        'lgbt': 'lgbt_count',
        'elderly': 'elderly_count',
        'disabled': 'disabled_count',
        'informal': 'informal_count'
    })

    # Sort by district code
    district_summary = district_summary.sort_values('district_code')

    return district_summary

def generate_overall_summary(survey_df):
    """Generate overall population summary"""
    total_responses = len(survey_df)

    summary_data = {
        'population_group': ['Total Population', 'General Population', 'Elderly (60+)', 'LGBT+ Community', 'People with Disabilities', 'Informal Workers'],
        'count': [
            total_responses,
            survey_df['general'].sum(),
            survey_df['elderly'].sum(),
            survey_df['lgbt'].sum(),
            survey_df['disabled'].sum(),
            survey_df['informal'].sum()
        ]
    }

    summary_df = pd.DataFrame(summary_data)
    summary_df['percentage'] = (summary_df['count'] / total_responses * 100).round(1)

    return summary_df

def categorize_districts_by_response(district_summary):
    """Categorize districts by response levels"""
    district_summary['response_category'] = pd.cut(
        district_summary['total'],
        bins=[0, 109, 149, float('inf')],
        labels=['Low Response (<110)', 'Medium Response (110-149)', 'High Response (>150)']
    )

    return district_summary

def generate_intersectional_analysis(survey_df):
    """Generate intersectional analysis of population groups"""

    # Two-way intersections
    intersections = []

    # Elderly intersections
    elderly_lgbt = survey_df[(survey_df['elderly'] == 1) & (survey_df['lgbt'] == 1)].shape[0]
    elderly_disabled = survey_df[(survey_df['elderly'] == 1) & (survey_df['disabled'] == 1)].shape[0]
    elderly_informal = survey_df[(survey_df['elderly'] == 1) & (survey_df['informal'] == 1)].shape[0]

    # LGBT+ intersections
    lgbt_disabled = survey_df[(survey_df['lgbt'] == 1) & (survey_df['disabled'] == 1)].shape[0]
    lgbt_informal = survey_df[(survey_df['lgbt'] == 1) & (survey_df['informal'] == 1)].shape[0]

    # Disabled intersections
    disabled_informal = survey_df[(survey_df['disabled'] == 1) & (survey_df['informal'] == 1)].shape[0]

    # Three-way intersections
    elderly_lgbt_disabled = survey_df[(survey_df['elderly'] == 1) & (survey_df['lgbt'] == 1) & (survey_df['disabled'] == 1)].shape[0]
    elderly_lgbt_informal = survey_df[(survey_df['elderly'] == 1) & (survey_df['lgbt'] == 1) & (survey_df['informal'] == 1)].shape[0]
    elderly_disabled_informal = survey_df[(survey_df['elderly'] == 1) & (survey_df['disabled'] == 1) & (survey_df['informal'] == 1)].shape[0]
    lgbt_disabled_informal = survey_df[(survey_df['lgbt'] == 1) & (survey_df['disabled'] == 1) & (survey_df['informal'] == 1)].shape[0]

    # Four-way intersection
    all_four = survey_df[(survey_df['elderly'] == 1) & (survey_df['lgbt'] == 1) & (survey_df['disabled'] == 1) & (survey_df['informal'] == 1)].shape[0]

    total_responses = len(survey_df)

    intersectional_data = {
        'intersection_type': [
            'Elderly + LGBT+', 'Elderly + Disabled', 'Elderly + Informal Workers',
            'LGBT+ + Disabled', 'LGBT+ + Informal Workers', 'Disabled + Informal Workers',
            'Elderly + LGBT+ + Disabled', 'Elderly + LGBT+ + Informal Workers',
            'Elderly + Disabled + Informal Workers', 'LGBT+ + Disabled + Informal Workers',
            'All Four Categories'
        ],
        'count': [
            elderly_lgbt, elderly_disabled, elderly_informal,
            lgbt_disabled, lgbt_informal, disabled_informal,
            elderly_lgbt_disabled, elderly_lgbt_informal,
            elderly_disabled_informal, lgbt_disabled_informal,
            all_four
        ]
    }

    intersectional_df = pd.DataFrame(intersectional_data)
    intersectional_df['percentage_of_total'] = (intersectional_df['count'] / total_responses * 100).round(2)

    return intersectional_df

def main():
    """Main function to generate all analysis files"""
    print("Starting Bangkok Health Dashboard Population Analysis...")

    # Load data
    survey_df, district_df = load_data()
    if survey_df is None or district_df is None:
        return

    # Calculate population groups
    print("Calculating population group classifications...")
    survey_df = calculate_population_groups(survey_df)

    # Generate overall summary
    print("Generating overall population summary...")
    overall_summary = generate_overall_summary(survey_df)
    overall_summary.to_csv('population_summary_overall.csv', index=False, encoding='utf-8-sig')
    print(f"[OK] Saved: population_summary_overall.csv")

    # Generate district summary
    print("Generating district-level analysis...")
    district_summary = generate_district_summary(survey_df, district_df)
    district_summary = categorize_districts_by_response(district_summary)
    district_summary.to_csv('population_summary_by_district.csv', index=False, encoding='utf-8-sig')
    print(f"[OK] Saved: population_summary_by_district.csv")

    # Generate intersectional analysis
    print("Generating intersectional analysis...")
    intersectional_analysis = generate_intersectional_analysis(survey_df)
    intersectional_analysis.to_csv('population_intersectional_analysis.csv', index=False, encoding='utf-8-sig')
    print(f"[OK] Saved: population_intersectional_analysis.csv")

    # Generate separate files by response category
    print("Generating files by response category...")

    high_response = district_summary[district_summary['response_category'] == 'High Response (>150)']
    high_response.to_csv('districts_high_response.csv', index=False, encoding='utf-8-sig')
    print(f"[OK] Saved: districts_high_response.csv ({len(high_response)} districts)")

    medium_response = district_summary[district_summary['response_category'] == 'Medium Response (110-149)']
    medium_response.to_csv('districts_medium_response.csv', index=False, encoding='utf-8-sig')
    print(f"[OK] Saved: districts_medium_response.csv ({len(medium_response)} districts)")

    low_response = district_summary[district_summary['response_category'] == 'Low Response (<110)']
    low_response.to_csv('districts_low_response.csv', index=False, encoding='utf-8-sig')
    print(f"[OK] Saved: districts_low_response.csv ({len(low_response)} districts)")

    # Print summary statistics
    print(f"\n[SUMMARY] Analysis Summary:")
    print(f"   Total survey responses: {len(survey_df):,}")
    print(f"   Districts covered: {district_summary['district_code'].nunique()}")
    print(f"   General Population: {survey_df['general'].sum():,} ({survey_df['general'].sum()/len(survey_df)*100:.1f}%)")
    print(f"   Elderly (60+): {survey_df['elderly'].sum():,} ({survey_df['elderly'].sum()/len(survey_df)*100:.1f}%)")
    print(f"   LGBT+ Community: {survey_df['lgbt'].sum():,} ({survey_df['lgbt'].sum()/len(survey_df)*100:.1f}%)")
    print(f"   People with Disabilities: {survey_df['disabled'].sum():,} ({survey_df['disabled'].sum()/len(survey_df)*100:.1f}%)")
    print(f"   Informal Workers: {survey_df['informal'].sum():,} ({survey_df['informal'].sum()/len(survey_df)*100:.1f}%)")

    print(f"\n[COMPLETE] Population analysis complete! All CSV files generated successfully.")

if __name__ == "__main__":
    main()