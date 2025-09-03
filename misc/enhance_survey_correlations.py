#!/usr/bin/env python3
"""
Survey Data Correlation Enhancer

This script enhances the correlations in survey_sampling.csv based on the 
'Interconnected Web of Health' analysis to make the data more realistic while
keeping the correlations subtle and not too obvious.

Based on key correlations from the analysis:
1. Education → Employment → Income cascades
2. Financial barriers → Healthcare access patterns  
3. Health behaviors → Chronic disease clustering
4. Social determinants → Mental health outcomes
5. Environmental factors → Health outcomes
"""

import pandas as pd
import numpy as np
import random
from pathlib import Path

class SurveyCorrelationEnhancer:
    def __init__(self, correlation_strength=0.3):
        """
        Initialize the enhancer with correlation strength
        
        Args:
            correlation_strength (float): How strong to make correlations (0.1-0.5)
                                        Lower = more subtle, Higher = more obvious
        """
        self.strength = correlation_strength
        self.random_state = np.random.RandomState(42)  # Reproducible results
        
        # Key correlation mappings from the interconnected web analysis
        self.correlations = {
            # Education → Employment correlations
            'education_employment': {
                'strength': 0.75,
                'description': 'Higher education → better employment outcomes'
            },
            
            # Employment → Income correlations  
            'employment_income': {
                'strength': 0.65,
                'description': 'Better employment → higher income'
            },
            
            # Income → Healthcare access
            'income_healthcare': {
                'strength': 0.55,
                'description': 'Higher income → better healthcare access'
            },
            
            # Healthcare barriers clustering
            'healthcare_barriers': {
                'strength': 0.8,
                'description': 'Skipped care indicators cluster together'
            },
            
            # Chronic disease clustering
            'chronic_clustering': {
                'strength': 0.7,
                'description': 'Chronic diseases often occur together'
            },
            
            # Mental health and discrimination
            'discrimination_mental': {
                'strength': 0.6,
                'description': 'Discrimination → poor mental health'
            },
            
            # Behavioral health patterns
            'risky_behaviors': {
                'strength': 0.45,
                'description': 'Economic stress → risky health behaviors'
            }
        }
    
    def load_data(self, file_path):
        """Load survey data"""
        return pd.read_csv(file_path, encoding='utf-8-sig')
    
    def enhance_education_employment_cascade(self, df):
        """
        Enhance Education → Employment → Income correlations
        Higher education should lead to better employment and higher income
        """
        print("Enhancing education -> employment -> income correlations...")
        
        # Create education score (0-1 scale)
        edu_scores = df['education'] / 8.0  # Max education level is 8
        
        # Enhance occupation type based on education (subtle adjustment)
        for idx in df.index:
            if df.loc[idx, 'occupation_status'] == 1:  # If employed
                edu_score = edu_scores[idx]
                current_occ = df.loc[idx, 'occupation_type']
                
                # Higher education → more likely to have "better" occupation types
                if edu_score > 0.75 and current_occ in [5, 6] and self.random_state.random() < self.strength:
                    # Sometimes upgrade informal/freelance to company employee
                    df.loc[idx, 'occupation_type'] = 3  # Company employee
                elif edu_score > 0.875 and current_occ == 6 and self.random_state.random() < self.strength * 0.7:
                    # Very high education → government or state enterprise
                    df.loc[idx, 'occupation_type'] = self.random_state.choice([1, 2])
        
        # Enhance income based on education and occupation type
        for idx in df.index:
            if pd.notna(df.loc[idx, 'income']) and df.loc[idx, 'income'] > 0:
                edu_score = edu_scores[idx]
                current_income = df.loc[idx, 'income']
                
                # Higher education should correlate with higher income (subtle boost)
                if edu_score > 0.75 and self.random_state.random() < self.strength:
                    income_boost = 1 + (edu_score - 0.5) * 0.2  # Up to 10% boost
                    df.loc[idx, 'income'] = int(current_income * income_boost)
                    
                # Round to nearest thousand (like the enhanced simulator)
                df.loc[idx, 'income'] = round(df.loc[idx, 'income'] / 1000) * 1000
        
        return df
    
    def enhance_healthcare_access_barriers(self, df):
        """
        Enhance healthcare access correlations
        Lower income → more likely to skip care due to financial barriers
        """
        print("Enhancing healthcare access barrier correlations...")
        
        # Calculate income percentiles for relative comparison
        income_data = df[df['income'] > 0]['income']
        income_25th = income_data.quantile(0.25)
        income_75th = income_data.quantile(0.75)
        
        for idx in df.index:
            current_income = df.loc[idx, 'income']
            
            if pd.notna(current_income) and current_income > 0:
                # Lower income → higher chance of skipping medical care
                if current_income < income_25th:
                    # Low income - increase chance of skipping care
                    for skip_col in ['medical_skip_1', 'medical_skip_2', 'medical_skip_3']:
                        if df.loc[idx, skip_col] == 0 and self.random_state.random() < self.strength * 0.4:
                            df.loc[idx, skip_col] = 1
                    
                    # Also increase health expenses (burden despite skipping care)
                    if self.random_state.random() < self.strength * 0.3:
                        df.loc[idx, 'hh_health_expense'] = int(df.loc[idx, 'hh_health_expense'] * 1.2)
                        df.loc[idx, 'health_expense'] = int(df.loc[idx, 'health_expense'] * 1.15)
                
                elif current_income > income_75th:
                    # High income - reduce chance of skipping care
                    for skip_col in ['medical_skip_1', 'medical_skip_2', 'medical_skip_3']:
                        if df.loc[idx, skip_col] == 1 and self.random_state.random() < self.strength * 0.3:
                            df.loc[idx, skip_col] = 0
        
        # Healthcare barriers should cluster together
        for idx in df.index:
            skip_count = df.loc[idx, ['medical_skip_1', 'medical_skip_2', 'medical_skip_3']].sum()
            
            # If already skipping some care, more likely to skip others
            if skip_count >= 1:
                for skip_col in ['medical_skip_1', 'medical_skip_2', 'medical_skip_3']:
                    if df.loc[idx, skip_col] == 0 and self.random_state.random() < self.strength * 0.5:
                        df.loc[idx, skip_col] = 1
        
        return df
    
    def enhance_chronic_disease_clustering(self, df):
        """
        Enhance chronic disease clustering patterns
        Diabetes, hypertension, and cardiovascular diseases should cluster
        """
        print("Enhancing chronic disease clustering...")
        
        # Define disease clusters based on medical knowledge
        metabolic_diseases = ['diseases_type_2', 'diseases_type_15']  # Diabetes-related, metabolic
        cardiovascular_diseases = ['diseases_type_1', 'diseases_type_6']  # Heart, circulation related
        mental_health_diseases = ['diseases_type_11']  # Mental health
        
        for idx in df.index:
            if df.loc[idx, 'diseases_status'] == 1:  # Has some disease
                
                # Metabolic disease clustering
                metabolic_count = sum([df.loc[idx, col] for col in metabolic_diseases if col in df.columns])
                if metabolic_count >= 1:
                    for disease_col in metabolic_diseases:
                        if disease_col in df.columns and df.loc[idx, disease_col] == 0:
                            if self.random_state.random() < self.strength * 0.4:
                                df.loc[idx, disease_col] = 1
                
                # Cardiovascular disease clustering  
                cardio_count = sum([df.loc[idx, col] for col in cardiovascular_diseases if col in df.columns])
                if cardio_count >= 1:
                    for disease_col in cardiovascular_diseases:
                        if disease_col in df.columns and df.loc[idx, disease_col] == 0:
                            if self.random_state.random() < self.strength * 0.35:
                                df.loc[idx, disease_col] = 1
                
                # Age-related disease progression
                age = df.loc[idx, 'age']
                if age > 45:  # Older adults more likely to have multiple conditions
                    total_diseases = sum([df.loc[idx, f'diseases_type_{i}'] for i in range(1, 22) 
                                        if f'diseases_type_{i}' in df.columns])
                    
                    if total_diseases >= 1 and self.random_state.random() < self.strength * 0.3:
                        # Add another disease occasionally
                        available_diseases = [f'diseases_type_{i}' for i in range(1, 22) 
                                            if f'diseases_type_{i}' in df.columns and df.loc[idx, f'diseases_type_{i}'] == 0]
                        if available_diseases:
                            new_disease = self.random_state.choice(available_diseases)
                            df.loc[idx, new_disease] = 1
        
        return df
    
    def enhance_discrimination_mental_health(self, df):
        """
        Enhance discrimination → mental health correlations
        People experiencing discrimination more likely to have mental health issues
        """
        print("Enhancing discrimination -> mental health correlations...")
        
        for idx in df.index:
            # Count discrimination experiences (excluding 'no discrimination')
            discrimination_count = 0
            for i in range(1, 6):  # discrimination_1 through discrimination_5
                col_name = f'discrimination_{i}'
                if col_name in df.columns:
                    discrimination_count += df.loc[idx, col_name]
            
            # Also count 'other' discrimination
            if 'discrimination_other' in df.columns and df.loc[idx, 'discrimination_other'] == 1:
                discrimination_count += 1
            
            # If experiencing discrimination, increase chance of mental health issues
            if discrimination_count > 0:
                if 'diseases_type_11' in df.columns and df.loc[idx, 'diseases_type_11'] == 0:
                    mental_health_prob = discrimination_count * self.strength * 0.4
                    if self.random_state.random() < mental_health_prob:
                        df.loc[idx, 'diseases_type_11'] = 1
                        # Also set diseases_status to 1 if it wasn't already
                        df.loc[idx, 'diseases_status'] = 1
                
                # Also increase psychological violence correlation
                if 'psychological_violence' in df.columns and df.loc[idx, 'psychological_violence'] == 0:
                    if self.random_state.random() < discrimination_count * self.strength * 0.3:
                        df.loc[idx, 'psychological_violence'] = 1
        
        return df
    
    def enhance_risky_behavior_correlations(self, df):
        """
        Enhance correlations between economic stress and risky health behaviors
        Lower income/unemployment → higher smoking/drinking
        """
        print("Enhancing risky behavior correlations...")
        
        # Calculate income percentiles
        income_data = df[df['income'] > 0]['income']
        income_25th = income_data.quantile(0.25) if len(income_data) > 0 else 20000
        
        for idx in df.index:
            current_income = df.loc[idx, 'income']
            is_unemployed = df.loc[idx, 'occupation_status'] == 0
            
            # Economic stress indicators
            economic_stress = 0
            if pd.notna(current_income) and current_income < income_25th:
                economic_stress += 1
            if is_unemployed:
                economic_stress += 1
            if df.loc[idx, 'food_insecurity_1'] == 1:  # Food insecurity
                economic_stress += 1
            
            # Economic stress → increased smoking
            if economic_stress >= 2 and df.loc[idx, 'smoke_status'] in [0, 1]:  # Non-smoker or quit
                if self.random_state.random() < self.strength * 0.3:
                    df.loc[idx, 'smoke_status'] = self.random_state.choice([2, 3])  # Occasional or regular
                    if df.loc[idx, 'smoke_status'] in [2, 3]:
                        df.loc[idx, 'smoke_amount'] = self.random_state.randint(1, 15)
                        df.loc[idx, 'smoke_unit'] = 'smoke_unit_cigarette'
            
            # Economic stress → increased drinking (but more moderate correlation)
            if economic_stress >= 1 and df.loc[idx, 'drink_status'] == 0:  # Non-drinker
                if self.random_state.random() < self.strength * 0.2:
                    df.loc[idx, 'drink_status'] = 1  # Current drinker
                    df.loc[idx, 'drink_rate'] = self.random_state.choice([1, 2])
                    df.loc[idx, 'drink_amount'] = self.random_state.randint(1, 8)
                    df.loc[idx, 'drink_unit'] = self.random_state.choice(['drink_unit_bottle', 'drink_unit_can'])
        
        return df
    
    def enhance_environmental_health_correlations(self, df):
        """
        Enhance correlations between environmental conditions and health outcomes
        """
        print("Enhancing environmental -> health correlations...")
        
        for idx in df.index:
            # Count environmental problems
            env_problems = 0
            for i in range(1, 8):  # community_environment_1 through community_environment_7
                col_name = f'community_environment_{i}'
                if col_name in df.columns:
                    env_problems += df.loc[idx, col_name]
            
            # Environmental problems → respiratory issues
            if env_problems >= 2:
                # More environmental problems → higher chance of respiratory disease
                if 'diseases_type_7' in df.columns and df.loc[idx, 'diseases_type_7'] == 0:  # Respiratory
                    if self.random_state.random() < env_problems * self.strength * 0.2:
                        df.loc[idx, 'diseases_type_7'] = 1
                        df.loc[idx, 'diseases_status'] = 1
            
            # Poor housing → health impacts
            if df.loc[idx, 'house_status'] in [4, 5]:  # Informal housing
                if self.random_state.random() < self.strength * 0.3:
                    # More likely to have health problems
                    if df.loc[idx, 'diseases_status'] == 0:
                        df.loc[idx, 'diseases_status'] = 1
                        # Add a random disease
                        disease_options = [f'diseases_type_{i}' for i in [3, 7, 12]]  # Common issues
                        disease_col = self.random_state.choice(disease_options)
                        df.loc[idx, disease_col] = 1
        
        return df
    
    def validate_enhancements(self, original_df, enhanced_df):
        """
        Validate that enhancements are realistic and not too obvious
        """
        print("\\nValidating enhancements...")
        
        # Check key correlation improvements
        correlations_to_check = [
            ('education', 'income'),
            ('income', 'medical_skip_1'), 
            ('discrimination_1', 'diseases_type_11'),
            ('smoke_status', 'food_insecurity_1'),
        ]
        
        for col1, col2 in correlations_to_check:
            if col1 in original_df.columns and col2 in enhanced_df.columns:
                # Calculate correlations (only for numeric columns)
                try:
                    orig_corr = original_df[col1].corr(original_df[col2])
                    new_corr = enhanced_df[col1].corr(enhanced_df[col2])
                    
                    if pd.notna(orig_corr) and pd.notna(new_corr):
                        change = new_corr - orig_corr
                        print(f"  {col1} <-> {col2}: {orig_corr:.3f} -> {new_corr:.3f} (Delta{change:+.3f})")
                except:
                    pass
        
        # Check that we didn't make dramatic changes
        key_columns = ['education', 'income', 'diseases_status', 'smoke_status', 'drink_status']
        for col in key_columns:
            if col in original_df.columns:
                orig_mean = original_df[col].mean() if original_df[col].dtype in ['int64', 'float64'] else None
                new_mean = enhanced_df[col].mean() if enhanced_df[col].dtype in ['int64', 'float64'] else None
                
                if orig_mean is not None and new_mean is not None:
                    pct_change = (new_mean - orig_mean) / orig_mean * 100
                    print(f"  {col} mean: {orig_mean:.1f} -> {new_mean:.1f} ({pct_change:+.1f}%)")
    
    def enhance_survey_data(self, input_file, output_file):
        """
        Main method to enhance survey data with realistic correlations
        """
        print(f"Loading survey data from {input_file}...")
        df = self.load_data(input_file)
        original_df = df.copy()
        
        print(f"Original dataset: {len(df)} records, {len(df.columns)} columns")
        print(f"Correlation strength: {self.strength}")
        
        # Apply enhancement methods
        df = self.enhance_education_employment_cascade(df)
        df = self.enhance_healthcare_access_barriers(df)
        df = self.enhance_chronic_disease_clustering(df)  
        df = self.enhance_discrimination_mental_health(df)
        df = self.enhance_risky_behavior_correlations(df)
        df = self.enhance_environmental_health_correlations(df)
        
        # Validate changes
        self.validate_enhancements(original_df, df)
        
        # Save enhanced data
        df.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"\\nEnhanced survey data saved to {output_file}")
        
        return df

def main():
    # File paths
    input_file = Path("../public/data/survey_sampling.csv")
    output_file = Path("../public/data/survey_sampling_enhanced.csv")
    backup_file = Path("../public/data/survey_sampling_original.csv")
    
    # Create backup of original
    if input_file.exists() and not backup_file.exists():
        import shutil
        shutil.copy2(input_file, backup_file)
        print(f"Created backup: {backup_file}")
    
    # Enhance correlations (subtle strength)
    enhancer = SurveyCorrelationEnhancer(correlation_strength=0.25)  # Subtle but meaningful
    enhanced_df = enhancer.enhance_survey_data(input_file, output_file)
    
    print(f"\\n--- Enhancement Complete ---")
    print(f"Original file: {input_file} (backed up to {backup_file})")
    print(f"Enhanced file: {output_file}")
    print(f"Records processed: {len(enhanced_df)}")
    
    # Option to replace original file
    replace_original = input("\\nReplace original survey_sampling.csv with enhanced version? (y/N): ")
    if replace_original.lower() == 'y':
        import shutil
        shutil.copy2(output_file, input_file)
        print(f"Replaced {input_file} with enhanced version")
    else:
        print(f"Enhanced version available at {output_file}")

if __name__ == "__main__":
    main()