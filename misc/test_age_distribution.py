#!/usr/bin/env python3
"""
Test script to verify age distributions in the Bangkok Health Survey simulator
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from simulated import BangkokUrbanHealthSurveySimulator

def test_age_distributions():
    """Test age distributions for LGBT vs General population"""
    simulator = BangkokUrbanHealthSurveySimulator()
    
    # Test sample size for reliable statistics  
    test_size = 1000
    
    # Test LGBT ages
    lgbt_ages = []
    for _ in range(test_size):
        # Test with different district profiles
        district_profile = simulator.get_district_profile(1007)  # Central economic
        age = simulator.generate_age_by_district(is_lgbt=True, district_profile=district_profile)
        lgbt_ages.append(age)
    
    # Test General population ages
    general_ages = []
    for _ in range(test_size):
        district_profile = simulator.get_district_profile(1007)  # Central economic
        age = simulator.generate_age_by_district(is_lgbt=False, district_profile=district_profile)
        general_ages.append(age)
    
    # Analyze age distributions
    def analyze_ages(ages, population_type):
        elderly = [a for a in ages if a >= 46]  # 46-60 considered elderly
        middle_aged = [a for a in ages if 36 <= a < 46]
        young_adult = [a for a in ages if 18 <= a < 36] 
        teen = [a for a in ages if a < 18]
        
        total = len(ages)
        print(f"\\n{population_type} Age Distribution (n={total}):")
        print(f"  Teen (14-17):      {len(teen):3d} ({len(teen)/total*100:4.1f}%)")
        print(f"  Young Adult (18-35): {len(young_adult):3d} ({len(young_adult)/total*100:4.1f}%)")
        print(f"  Middle Age (36-45):  {len(middle_aged):3d} ({len(middle_aged)/total*100:4.1f}%)")
        print(f"  Elderly (46-60):     {len(elderly):3d} ({len(elderly)/total*100:4.1f}%) <- Should be rare for LGBT")
        print(f"  Average Age:         {sum(ages)/total:.1f} years")
        return len(elderly)/total
    
    lgbt_elderly_rate = analyze_ages(lgbt_ages, "LGBT")
    general_elderly_rate = analyze_ages(general_ages, "GENERAL")
    
    # Check if LGBT elderly rate is very rare (should be ≤ 2%)
    print(f"\\n--- VALIDATION RESULTS ---")
    if lgbt_elderly_rate <= 0.02:
        print(f"SUCCESS: LGBT elderly rate ({lgbt_elderly_rate*100:.1f}%) is very rare (<=2%)")
    else:
        print(f"PROBLEM: LGBT elderly rate ({lgbt_elderly_rate*100:.1f}%) is too high (>2%)")
    
    print(f"General elderly rate: {general_elderly_rate*100:.1f}% (expected 8-25%)")
    
    # Test all archetypes
    print(f"\\n--- TESTING ALL ARCHETYPES ---")
    archetypes_to_test = {
        1007: "central_economic",
        1001: "historic_cultural", 
        1033: "transition_disparity",
        1030: "ascendant_residential",
        1011: "logistical_industrial",
        1021: "green_fringe"
    }
    
    for district_code, archetype in archetypes_to_test.items():
        profile = simulator.get_district_profile(district_code)
        ages = []
        for _ in range(200):  # Smaller sample per archetype
            age = simulator.generate_age_by_district(is_lgbt=True, district_profile=profile)
            ages.append(age)
        elderly_count = len([a for a in ages if a >= 46])
        elderly_rate = elderly_count / len(ages)
        status = "PASS" if elderly_rate <= 0.03 else "FAIL"  # Allow 3% for statistical variation
        print(f"{status} {archetype:20s}: {elderly_count:2d}/200 elderly ({elderly_rate*100:4.1f}%)")

if __name__ == "__main__":
    test_age_distributions()