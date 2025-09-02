import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

class BangkokUrbanHealthSurveySimulator:
    def __init__(self):
        # District profiles based on characteristics
        self.district_profiles = {
            # Major CBDs and Shopping Centers - High education, high income, more company employees
            1007: {"name": "เขตปทุมวัน", "type": "cbd_shopping", "edu_weight": 1.3, "income_mult": 1.4, "company_rate": 0.75},
            1039: {"name": "เขตวัฒนา", "type": "upscale_expat", "edu_weight": 1.4, "income_mult": 1.5, "company_rate": 0.70},
            1028: {"name": "เขตสาทร", "type": "cbd", "edu_weight": 1.35, "income_mult": 1.6, "company_rate": 0.80},
            1004: {"name": "เขตบางรัก", "type": "cbd", "edu_weight": 1.3, "income_mult": 1.5, "company_rate": 0.78},
            
            # Historical and Cultural - Mixed income, more informal/tourism jobs
            1001: {"name": "เขตพระนคร", "type": "historical", "edu_weight": 1.0, "income_mult": 0.85, "company_rate": 0.35},
            1002: {"name": "เขตดุสิต", "type": "government", "edu_weight": 1.1, "income_mult": 1.1, "company_rate": 0.40},
            1013: {"name": "เขตสัมพันธวงศ์", "type": "chinatown", "edu_weight": 0.75, "income_mult": 0.9, "company_rate": 0.30},
            
            # Residential and Emerging - Middle class, balanced
            1030: {"name": "เขตจตุจักร", "type": "transport_hub", "edu_weight": 0.95, "income_mult": 0.95, "company_rate": 0.50},
            1037: {"name": "เขตราชเทวี", "type": "mixed_commercial", "edu_weight": 1.2, "income_mult": 1.1, "company_rate": 0.55},
            1017: {"name": "เขตห้วยขวาง", "type": "young_professional", "edu_weight": 1.1, "income_mult": 1.0, "company_rate": 0.60},
            1014: {"name": "เขตพญาไท", "type": "university", "edu_weight": 1.15, "income_mult": 0.9, "company_rate": 0.45},
            1038: {"name": "เขตลาดพร้าว", "type": "suburban", "edu_weight": 0.9, "income_mult": 0.95, "company_rate": 0.48},
            
            # Port and Industrial - Lower education, more informal work
            1033: {"name": "เขตคลองเตย", "type": "port_mixed", "edu_weight": 0.7, "income_mult": 0.8, "company_rate": 0.40},
            1006: {"name": "เขตบางกะปิ", "type": "university_residential", "edu_weight": 1.0, "income_mult": 0.85, "company_rate": 0.45},
            1036: {"name": "เขตดอนเมือง", "type": "airport", "edu_weight": 0.85, "income_mult": 0.9, "company_rate": 0.42},
            1029: {"name": "เขตบางซื่อ", "type": "industrial_developing", "edu_weight": 0.9, "income_mult": 1.0, "company_rate": 0.52},
            1019: {"name": "เขตตลิ่งชัน", "type": "traditional", "edu_weight": 0.75, "income_mult": 0.8, "company_rate": 0.30},
            
            # Other districts - default middle class profile
            1046: {"name": "เขตคลองสามวา", "type": "suburban", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.40},
            1018: {"name": "เขตคลองสาน", "type": "residential", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.42},
            1043: {"name": "เขตคันนายาว", "type": "suburban", "edu_weight": 0.8, "income_mult": 0.85, "company_rate": 0.38},
            1035: {"name": "เขตจอมทอง", "type": "suburban", "edu_weight": 0.8, "income_mult": 0.8, "company_rate": 0.38},
            1026: {"name": "เขตดินแดง", "type": "mixed", "edu_weight": 0.9, "income_mult": 0.9, "company_rate": 0.45},
            1048: {"name": "เขตทวีวัฒนา", "type": "suburban", "edu_weight": 0.8, "income_mult": 0.8, "company_rate": 0.35},
            1049: {"name": "เขตทุ่งครุ", "type": "suburban", "edu_weight": 0.8, "income_mult": 0.8, "company_rate": 0.35},
            1015: {"name": "เขตธนบุรี", "type": "traditional", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.40},
            1020: {"name": "เขตบางกอกน้อย", "type": "traditional", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.38},
            1016: {"name": "เขตบางกอกใหญ่", "type": "traditional", "edu_weight": 0.8, "income_mult": 0.85, "company_rate": 0.38},
            1021: {"name": "เขตบางขุนเทียน", "type": "suburban", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.40},
            1005: {"name": "เขตบางเขน", "type": "suburban", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.42},
            1031: {"name": "เขตบางคอแหลม", "type": "mixed", "edu_weight": 0.9, "income_mult": 0.95, "company_rate": 0.48},
            1040: {"name": "เขตบางแค", "type": "suburban", "edu_weight": 0.8, "income_mult": 0.8, "company_rate": 0.38},
            1047: {"name": "เขตบางนา", "type": "developing", "edu_weight": 0.95, "income_mult": 1.0, "company_rate": 0.55},
            1050: {"name": "เขตบางบอน", "type": "suburban", "edu_weight": 0.75, "income_mult": 0.8, "company_rate": 0.35},
            1025: {"name": "เขตบางพลัด", "type": "mixed", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.42},
            1027: {"name": "เขตบึงกุ่ม", "type": "suburban", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.42},
            1032: {"name": "เขตประเวศ", "type": "suburban", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.40},
            1008: {"name": "เขตป้อมปราบศัตรูพ่าย", "type": "traditional", "edu_weight": 0.8, "income_mult": 0.85, "company_rate": 0.38},
            1009: {"name": "เขตพระโขนง", "type": "mixed", "edu_weight": 0.95, "income_mult": 0.95, "company_rate": 0.50},
            1022: {"name": "เขตภาษีเจริญ", "type": "suburban", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.40},
            1010: {"name": "เขตมีนบุรี", "type": "suburban", "edu_weight": 0.8, "income_mult": 0.8, "company_rate": 0.38},
            1012: {"name": "เขตยานนาวา", "type": "mixed", "edu_weight": 0.9, "income_mult": 0.9, "company_rate": 0.45},
            1024: {"name": "เขตราษฎร์บูรณะ", "type": "suburban", "edu_weight": 0.8, "income_mult": 0.8, "company_rate": 0.38},
            1011: {"name": "เขตลาดกระบัง", "type": "airport_industrial", "edu_weight": 0.85, "income_mult": 0.9, "company_rate": 0.45},
            1045: {"name": "เขตวังทองหลาง", "type": "suburban", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.40},
            1034: {"name": "เขตสวนหลวง", "type": "residential", "edu_weight": 0.9, "income_mult": 0.9, "company_rate": 0.45},
            1044: {"name": "เขตสะพานสูง", "type": "suburban", "edu_weight": 0.8, "income_mult": 0.8, "company_rate": 0.38},
            1042: {"name": "เขตสายไหม", "type": "suburban", "edu_weight": 0.8, "income_mult": 0.8, "company_rate": 0.38},
            1023: {"name": "เขตหนองแขม", "type": "suburban", "edu_weight": 0.8, "income_mult": 0.8, "company_rate": 0.38},
            1003: {"name": "เขตหนองจอก", "type": "rural_suburban", "edu_weight": 0.75, "income_mult": 0.75, "company_rate": 0.32},
            1041: {"name": "เขตหลักสี่", "type": "suburban", "edu_weight": 0.85, "income_mult": 0.85, "company_rate": 0.40},
        }
        
    def get_district_profile(self, district_code):
        """Get district profile or return default"""
        return self.district_profiles.get(district_code, {
            "name": f"เขต{district_code}", 
            "type": "suburban", 
            "edu_weight": 0.85, 
            "income_mult": 0.85, 
            "company_rate": 0.40
        })
    
    def generate_age_by_district(self, is_lgbt=False, district_profile=None):
        """Generate age based on district characteristics"""
        district_type = district_profile.get('type', 'suburban') if district_profile else 'suburban'
        
        # Different age distributions by district type
        if district_type in ['cbd', 'cbd_shopping', 'upscale_expat', 'young_professional']:
            # Business districts - more working professionals, fewer teenagers
            if is_lgbt:
                age_weights = [(14, 17, 0.02), (18, 25, 0.25), (26, 35, 0.45), (36, 45, 0.20), (46, 60, 0.08)]
            else:
                age_weights = [(14, 17, 0.01), (18, 25, 0.20), (26, 35, 0.40), (36, 45, 0.28), (46, 60, 0.11)]
        elif district_type in ['university', 'university_residential']:
            # University areas - more young adults
            if is_lgbt:
                age_weights = [(14, 17, 0.05), (18, 25, 0.45), (26, 35, 0.35), (36, 45, 0.10), (46, 60, 0.05)]
            else:
                age_weights = [(14, 17, 0.03), (18, 25, 0.40), (26, 35, 0.35), (36, 45, 0.15), (46, 60, 0.07)]
        elif district_type in ['traditional', 'historical', 'chinatown']:
            # Traditional areas - more elderly, mixed ages
            if is_lgbt:
                age_weights = [(14, 17, 0.08), (18, 25, 0.25), (26, 35, 0.30), (36, 45, 0.20), (46, 60, 0.17)]
            else:
                age_weights = [(14, 17, 0.05), (18, 25, 0.18), (26, 35, 0.25), (36, 45, 0.27), (46, 60, 0.25)]
        else:
            # Suburban/mixed - balanced distribution
            if is_lgbt:
                age_weights = [(14, 17, 0.05), (18, 25, 0.30), (26, 35, 0.40), (36, 45, 0.15), (46, 60, 0.10)]
            else:
                age_weights = [(14, 17, 0.03), (18, 25, 0.22), (26, 35, 0.35), (36, 45, 0.25), (46, 60, 0.15)]
        
        ranges = [(min_age, max_age) for min_age, max_age, _ in age_weights]
        probs = [prob for _, _, prob in age_weights]
        selected_range = random.choices(ranges, weights=probs)[0]
        return random.randint(selected_range[0], selected_range[1])

    def create_empty_record(self):
        """Create a record with all columns initialized to None or 0"""
        record = {
            # Basic info
            'dname': None,
            'age': None,
            'sex': None,
            
            # Disability
            'disable_status': None,
            'disable_work_status': None,
            
            # Diseases
            'diseases_status': None,
        }
        
        # Disease types (1-21 + other)
        for i in range(1, 22):
            record[f'diseases_type_{i}'] = 0
        record['diseases_type_other'] = 0
        record['diseases_type_other'] = None  # Text field
        
        # Drinking
        record.update({
            'drink_status': None,
            'drink_rate': None,
            'drink_amount': None,
            'drink_unit': None,
        })
        
        # Smoking
        record.update({
            'smoke_status': None,
            'smoke_amount': None,
            'smoke_unit': None,
        })
        
        # Exercise and family
        record.update({
            'exercise_status': None,
            'family_status': None,
            'hhsize': None,
            'hh_child_count': None,
            'hh_worker_count': None,
            'hh_elder_count': None,
        })
        
        # Child measurements (up to 5 children)
        for i in range(1, 6):
            record[f'child_height_{i}'] = None
            record[f'child_weight_{i}'] = None
        
        # Physical measurements
        record.update({
            'height': None,
            'weight': None,
        })
        
        # Healthcare
        record.update({
            'welfare': None,
            'welfare_other': None,
            'medical_skip_1': None,
            'medical_skip_2': None,
            'medical_skip_3': None,
            'hh_health_expense': None,
            'health_expense': None,
            'oral_health': None,
            'oral_health_access': None,
            'oral_health_access_reason': None,
        })
        
        # Education
        record.update({
            'speak': None,
            'read': None,
            'write': None,
            'math': None,
            'education': None,
            'training': None,
            'training_type': None,
            'training_type_other': None,
        })
        
        # Occupation
        record.update({
            'occupation_status': None,
            'unoccupied_reason': None,
            'not_working_other': None,
            'occupation_type': None,
            'occupation_freelance_type': None,
            'occupation_type_other': None,
            'income_type': None,
            'income': None,
            'working_hours': None,
            'occupation_contract': None,
            'occupation_welfare': None,
        })
        
        # Occupation welfare types
        for i in range(1, 5):
            record[f'occupation_welfare_type_{i}'] = 0
        record['occupation_welfare_type_other'] = 0
        record['occupation_welfare_other'] = None
        
        # Occupation safety
        record.update({
            'occupation_unpaid': None,
            'occupation_injury': None,
            'occupation_injury_count': None,
            'occupation_small_injury': None,
            'occupation_small_injury_count': None,
        })
        
        # Food security
        record.update({
            'food_insecurity_1': None,
            'food_insecurity_2': None,
        })
        
        # Community safety
        record.update({
            'community_murder': None,
            'physical_violence': None,
            'psychological_violence': None,
            'sexual_violence': None,
            'community_safety': None,
        })
        
        # Discrimination (0-5 + other)
        for i in range(6):
            record[f'discrimination_{i}'] = 0
        record['discrimination_other'] = 0
        record['discrimination_other'] = None  # Text field (reusing same name for text)
        
        # Marriage
        record.update({
            'marriage_status': None,
            'marriage_age': None,
            'decision': None,
        })
        
        # Decision types
        for i in range(1, 4):
            record[f'decision_type_{i}'] = 0
        
        # Community amenities
        record['community_amenity'] = None
        for i in range(5):
            record[f'community_amenity_type_{i}'] = 0
        
        record['helper'] = None
        record['health_pollution'] = None
        
        # Community disasters (0-8)
        for i in range(9):
            record[f'community_disaster_{i}'] = 0
        
        # Self disasters (0-8)
        for i in range(9):
            record[f'self_disaster_{i}'] = 0
        
        # Housing
        record.update({
            'house_status': None,
            'rent_price': None,
            'house_sink': None,
            'water_supply': None,
            'water_supply_other': None,
            'waste_water_disposal': None,
        })
        
        # Community environment (0-7 + other)
        for i in range(8):
            record[f'community_environment_{i}'] = 0
        record['community_environment_other'] = 0
        record['community_environment_other'] = None  # Text field
        
        # Accidents
        record['accident'] = None
        for i in range(1, 4):
            record[f'accident_status_{i}'] = 0
        
        record['comment'] = None
        
        return record

    def generate_age(self, is_lgbt=False):
        """Generate age between 14-60"""
        if is_lgbt:
            age_weights = [(14, 25, 0.35), (26, 35, 0.40), (36, 45, 0.15), (46, 60, 0.10)]
        else:
            age_weights = [(14, 25, 0.20), (26, 35, 0.30), (36, 45, 0.25), (46, 60, 0.25)]
        
        ranges = [(min_age, max_age) for min_age, max_age, _ in age_weights]
        probs = [prob for _, _, prob in age_weights]
        selected_range = random.choices(ranges, weights=probs)[0]
        return random.randint(selected_range[0], selected_range[1])

    def set_diseases(self, record, age, is_lgbt=False):
        """Set disease columns"""
        disease_prob = 0.1 + (age - 14) / 100
        if is_lgbt:
            disease_prob *= 1.1
            # Higher mental health (11) and HIV (10)
            disease_weights = [0.08, 0.15, 0.05, 0.02, 0.01, 0.10, 0.05, 0.03, 0.02, 0.15, 0.20, 0.10, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]
        else:
            disease_weights = [0.15, 0.20, 0.08, 0.03, 0.02, 0.15, 0.08, 0.05, 0.03, 0.02, 0.05, 0.10, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]
        
        if random.random() < disease_prob:
            record['diseases_status'] = 1
            num_diseases = random.choices([1, 2, 3], weights=[0.7, 0.25, 0.05])[0]
            disease_indices = random.choices(range(1, 22), weights=disease_weights, k=num_diseases)
            
            for idx in set(disease_indices):
                record[f'diseases_type_{idx}'] = 1
            
            # Chance for other disease
            if random.random() < 0.05:
                record['diseases_type_other'] = 1
                record['diseases_type_other'] = "โรคอื่นๆ"
        else:
            record['diseases_status'] = 0

    def set_discrimination(self, record, is_lgbt=False):
        """Set discrimination columns"""
        if is_lgbt:
            if random.random() < 0.45:
                # Always include gender discrimination for LGBT
                record['discrimination_3'] = 1
                
                # Add other discriminations
                other_types = [1, 2, 4, 5]
                num_other = random.choices([0, 1, 2], weights=[0.4, 0.4, 0.2])[0]
                if num_other > 0:
                    selected = random.sample(other_types, num_other)
                    for disc_type in selected:
                        record[f'discrimination_{disc_type}'] = 1
                
                # Chance for other discrimination
                if random.random() < 0.1:
                    record['discrimination_other'] = 1
                    record['discrimination_other'] = "เหตุผลอื่นๆ"
            else:
                record['discrimination_0'] = 1  # No discrimination
        else:
            if random.random() < 0.20:
                disc_types = [1, 2, 3, 4, 5]
                num_disc = random.choices([1, 2], weights=[0.8, 0.2])[0]
                selected = random.sample(disc_types, num_disc)
                for disc_type in selected:
                    record[f'discrimination_{disc_type}'] = 1
                
                if random.random() < 0.05:
                    record['discrimination_other'] = 1
                    record['discrimination_other'] = "เหตุผลอื่นๆ"
            else:
                record['discrimination_0'] = 1

    def set_occupation_welfare(self, record, occupation_type):
        """Set occupation welfare type columns"""
        if occupation_type in ['1', '2']:  # Government, state enterprise
            # They usually have comprehensive welfare benefits
            num_benefits = random.choices([3, 4], weights=[0.3, 0.7])[0]
            benefits = random.sample([1, 2, 3, 4], num_benefits)
            for benefit in benefits:
                record[f'occupation_welfare_type_{benefit}'] = 1
            
            if random.random() < 0.2:
                record['occupation_welfare_type_other'] = 1
                record['occupation_welfare_other'] = "สวัสดิการอื่นๆ"
        elif occupation_type == '3':  # Company employees
            # Usually have social security (type 2) and some other benefits
            record['occupation_welfare_type_2'] = 1  # ประกันสังคม ม.33
            
            # May have additional benefits
            if random.random() < 0.7:
                record['occupation_welfare_type_4'] = 1  # โบนัส/วันหยุด
            if random.random() < 0.3:
                record['occupation_welfare_type_1'] = 1  # Some companies provide additional insurance
            if random.random() < 0.1:
                record['occupation_welfare_type_other'] = 1
                record['occupation_welfare_other'] = "ประกันสุขภาพกลุ่ม"
        else:
            # Freelance or informal - limited welfare
            if random.random() < 0.6:
                record['occupation_welfare_type_3'] = 1  # ประกันสังคม ม.39 (self-pay)
            if random.random() < 0.2:
                record['occupation_welfare_type_4'] = 1

    def set_community_amenities(self, record):
        """Set community amenity columns"""
        if record['community_amenity'] == 1:
            num_amenities = random.choices([1, 2, 3], weights=[0.5, 0.35, 0.15])[0]
            amenities = random.sample([1, 2, 3, 4], num_amenities)
            for amenity in amenities:
                record[f'community_amenity_type_{amenity}'] = 1
        else:
            record['community_amenity_type_0'] = 1

    def set_disasters(self, record):
        """Set disaster columns"""
        # Community disasters
        if random.random() < 0.3:
            disaster_types = [1, 2, 3, 4, 5, 6, 7, 8]
            num_disasters = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0]
            selected = random.sample(disaster_types, num_disasters)
            for disaster in selected:
                record[f'community_disaster_{disaster}'] = 1
            
            # Self disasters (subset of community disasters)
            if random.random() < 0.15:
                num_self = random.randint(1, len(selected))
                self_disasters = random.sample(selected, num_self)
                for disaster in self_disasters:
                    record[f'self_disaster_{disaster}'] = 1
            else:
                record['self_disaster_0'] = 1
        else:
            record['community_disaster_0'] = 1
            record['self_disaster_0'] = 1

    def set_community_environment(self, record, is_lgbt=False, district_profile=None):
        """Set community environment problem columns based on population and district"""
        # Bangkok has universal electricity, water, and garbage collection
        # Available problems: 1=crowded buildings, 2=small houses, 6=wastewater, 7=drugs
        
        district_type = district_profile.get('type', 'suburban') if district_profile else 'suburban'
        
        # Determine probability of each problem based on population and district
        if is_lgbt:
            # LGBT population - more likely in crowded/cheaper housing
            if district_type in ['cbd', 'cbd_shopping', 'upscale_expat']:
                # Even in good areas, LGBT might live in smaller/crowded spaces
                problem_weights = {1: 0.30, 2: 0.40, 6: 0.15, 7: 0.10}
            elif district_type in ['port_mixed', 'industrial_developing', 'traditional']:
                # Lower income areas - more problems
                problem_weights = {1: 0.50, 2: 0.45, 6: 0.35, 7: 0.25}
            else:
                # Standard areas
                problem_weights = {1: 0.35, 2: 0.35, 6: 0.25, 7: 0.15}
        else:
            # General middle-class population - rarely in crowded buildings
            if district_type in ['cbd', 'cbd_shopping', 'upscale_expat']:
                # Elite areas - minimal problems, maybe small spaces in condos
                problem_weights = {1: 0.02, 2: 0.20, 6: 0.05, 7: 0.02}
            elif district_type in ['port_mixed', 'industrial_developing']:
                # Mixed areas - some issues but not crowding for middle class
                problem_weights = {1: 0.05, 2: 0.25, 6: 0.30, 7: 0.15}
            elif district_type in ['traditional', 'chinatown', 'historical']:
                # Old areas - drainage issues, some crowding
                problem_weights = {1: 0.10, 2: 0.30, 6: 0.40, 7: 0.10}
            else:
                # Suburban middle-class areas - mainly drainage issues
                problem_weights = {1: 0.03, 2: 0.15, 6: 0.25, 7: 0.08}
        
        # Determine if any problems exist
        has_problems = random.random() < 0.6  # 60% have at least one problem
        
        if has_problems:
            problems_selected = []
            for problem_type, probability in problem_weights.items():
                if random.random() < probability:
                    problems_selected.append(problem_type)
                    record[f'community_environment_{problem_type}'] = 1
            
            # If no problems were selected despite rolling for problems, add most likely one
            if not problems_selected:
                if is_lgbt:
                    record['community_environment_2'] = 1  # Small space
                else:
                    record['community_environment_6'] = 1  # Wastewater/drainage
            
            # Chance for other problems (like noise pollution)
            if random.random() < 0.08:
                record['community_environment_other'] = 1
                record['community_environment_other'] = "มลพิษทางเสียง"  # Noise pollution
        else:
            record['community_environment_0'] = 1  # No problems

    def set_decision_types(self, record):
        """Set decision type columns"""
        if record['decision'] == 1:
            num_decisions = random.choices([1, 2, 3], weights=[0.4, 0.4, 0.2])[0]
            decisions = random.sample([1, 2, 3], num_decisions)
            for decision in decisions:
                record[f'decision_type_{decision}'] = 1

    def set_accident_status(self, record):
        """Set accident status columns"""
        if record['accident'] == 1:
            # Most accidents are minor injuries
            accident_types = random.choices(
                [[1], [1, 2], [2], [2, 3], [1, 2, 3]],
                weights=[0.5, 0.2, 0.15, 0.1, 0.05]
            )[0]
            for acc_type in accident_types:
                record[f'accident_status_{acc_type}'] = 1

    def generate_survey_record(self, is_lgbt=False, district_code=None):
        """Generate a complete survey record with district-specific characteristics"""
        record = self.create_empty_record()
        
        # Select district with weighted probability (CBDs more likely to be surveyed)
        if district_code is None:
            # Weight districts by type - CBDs and commercial areas more likely
            district_weights = []
            district_codes = []
            for code, profile in self.district_profiles.items():
                district_codes.append(code)
                if profile['type'] in ['cbd', 'cbd_shopping', 'upscale_expat']:
                    district_weights.append(1.5)  # Higher survey probability
                elif profile['type'] in ['mixed_commercial', 'young_professional', 'university']:
                    district_weights.append(1.2)
                elif profile['type'] in ['traditional', 'chinatown', 'historical']:
                    district_weights.append(0.8)
                else:
                    district_weights.append(1.0)
            
            district_code = random.choices(district_codes, weights=district_weights)[0]
        
        district_profile = self.get_district_profile(district_code)
        record['dname'] = district_code
        
        # Age distribution can vary by district
        age = self.generate_age_by_district(is_lgbt, district_profile)
        record['age'] = age
        record['sex'] = 'lgbt' if is_lgbt else random.choices(['male', 'female'], weights=[0.48, 0.52])[0]
        
        # Disability
        record['disable_status'] = random.choices([0, 1], weights=[0.95, 0.05])[0]
        if record['disable_status'] == 1:
            record['disable_work_status'] = random.choices([0, 1], weights=[0.3, 0.7])[0]
        
        # Diseases
        self.set_diseases(record, age, is_lgbt)
        
        # Drinking
        record['drink_status'] = random.choices([0, 1, 2], weights=[0.3, 0.5, 0.2])[0]
        if record['drink_status'] == 1:  # Current drinker
            record['drink_rate'] = random.choices([1, 2], weights=[0.3, 0.7])[0]
            record['drink_amount'] = random.randint(1, 10)
            record['drink_unit'] = random.choices(['drink_unit_glass', 'drink_unit_short', 'drink_unit_can', 'drink_unit_bottle'], 
                                                 weights=[0.3, 0.2, 0.3, 0.2])[0]
        
        # Smoking
        record['smoke_status'] = random.choices([0, 1, 2, 3], weights=[0.5, 0.2, 0.2, 0.1])[0]
        if record['smoke_status'] in [2, 3]:  # Occasional or regular smoker
            record['smoke_amount'] = random.randint(1, 20)
            record['smoke_unit'] = random.choices(['smoke_unit_cigarette', 'smoke_unit_pack', 'smoke_unit_head'], 
                                                 weights=[0.5, 0.3, 0.2])[0]
        
        # Exercise
        record['exercise_status'] = random.choices([0, 1, 2, 3], weights=[0.3, 0.35, 0.25, 0.1])[0]
        
        # Family
        record['family_status'] = random.choices([0, 1], weights=[0.25, 0.75])[0]
        if record['family_status'] == 1:
            record['hhsize'] = random.randint(2, 6)
            record['hh_child_count'] = random.choices([0, 1, 2, 3], weights=[0.5, 0.3, 0.15, 0.05])[0]
            record['hh_worker_count'] = random.randint(1, 4)
            record['hh_elder_count'] = random.choices([0, 1, 2], weights=[0.6, 0.3, 0.1])[0]
            
            # Child measurements
            for i in range(1, min(record['hh_child_count'] + 1, 6)):
                record[f'child_height_{i}'] = random.randint(70, 120)
                record[f'child_weight_{i}'] = random.randint(10, 30)
        
        # Physical measurements
        record['height'] = random.randint(150, 185)
        record['weight'] = random.randint(45, 95)
        
        # Education - MUST BE SET BEFORE OCCUPATION (adjusted by district)
        edu_weight = district_profile.get('edu_weight', 1.0)
        
        record['speak'] = 1  # In Bangkok, essentially everyone can speak Thai
        record['read'] = 1 if random.random() > max(0.01, 0.03 / edu_weight) else 0
        record['write'] = 1 if random.random() > max(0.02, 0.05 / edu_weight) else 0
        record['math'] = 1 if random.random() > max(0.03, 0.08 / edu_weight) else 0
        
        # Education levels adjusted for district characteristics
        if age < 18:
            # Teenagers still in school - cannot have tertiary yet
            if age <= 15:
                record['education'] = random.choices([1, 2, 3], weights=[0.05, 0.25, 0.70])[0]
            else:  # 16-17 years old
                record['education'] = random.choices([3, 4, 5], weights=[0.1, 0.7, 0.2])[0]
        elif age < 23:
            # College age (18-22) - varies by district
            if district_profile['type'] in ['cbd', 'upscale_expat', 'university']:
                # High education areas - LGBT youth are equally educated
                if is_lgbt:
                    record['education'] = random.choices([3, 4, 5, 6, 7], weights=[0.005, 0.025, 0.12, 0.30, 0.55])[0]
                else:
                    record['education'] = random.choices([3, 4, 5, 6, 7], weights=[0.005, 0.025, 0.12, 0.30, 0.55])[0]
            else:
                # Standard areas - LGBT often pursue education for better opportunities
                if is_lgbt:
                    record['education'] = random.choices([3, 4, 5, 6, 7], weights=[0.01, 0.04, 0.25, 0.35, 0.35])[0]
                else:
                    record['education'] = random.choices([3, 4, 5, 6, 7], weights=[0.01, 0.04, 0.30, 0.35, 0.30])[0]
        else:
            # Adults 23+ with completed education
            if district_profile['type'] in ['cbd', 'cbd_shopping', 'upscale_expat']:
                # Elite areas - LGBT is equally educated
                if is_lgbt:
                    weights = [0.0005, 0.0005, 0.001, 0.0035, 0.01, 0.035, 0.15, 0.60, 0.20]  # 95% tertiary
                else:
                    weights = [0.0005, 0.0005, 0.001, 0.0035, 0.01, 0.035, 0.15, 0.60, 0.20]  # 95% tertiary
            elif district_profile['type'] in ['university', 'young_professional', 'government']:
                # Professional areas - LGBT often well-educated
                if is_lgbt:
                    weights = [0.001, 0.002, 0.002, 0.01, 0.025, 0.06, 0.30, 0.50, 0.10]  # 90% tertiary
                else:
                    weights = [0.001, 0.002, 0.002, 0.01, 0.025, 0.06, 0.30, 0.50, 0.10]  # 90% tertiary
            elif district_profile['type'] in ['traditional', 'chinatown', 'historical', 'port_mixed']:
                # Traditional/working class areas - LGBT still pursues education
                if is_lgbt:
                    weights = [0.005, 0.01, 0.015, 0.05, 0.08, 0.14, 0.30, 0.35, 0.05]  # 70% tertiary
                else:
                    weights = [0.005, 0.015, 0.02, 0.06, 0.10, 0.20, 0.30, 0.25, 0.05]  # 60% tertiary
            else:
                # Suburban/mixed areas - LGBT slightly higher education (new generation values)
                if is_lgbt:
                    weights = [0.002, 0.003, 0.005, 0.02, 0.04, 0.08, 0.30, 0.45, 0.10]  # 85% tertiary
                else:
                    weights = [0.002, 0.003, 0.005, 0.02, 0.04, 0.08, 0.30, 0.45, 0.10]  # 85% tertiary
            
            # Apply district education weight modifier
            if edu_weight != 1.0:
                # Adjust weights based on district modifier
                tertiary_indices = [6, 7, 8]  # Tertiary education levels
                non_tertiary_indices = [0, 1, 2, 3, 4, 5]
                
                if edu_weight > 1.0:
                    # Increase tertiary education
                    for i in tertiary_indices:
                        weights[i] *= edu_weight
                    for i in non_tertiary_indices:
                        weights[i] /= edu_weight
                else:
                    # Decrease tertiary education
                    for i in tertiary_indices:
                        weights[i] *= edu_weight
                    for i in non_tertiary_indices:
                        weights[i] /= edu_weight
                
                # Normalize weights
                total = sum(weights)
                weights = [w/total for w in weights]
            
            record['education'] = random.choices([0, 1, 2, 3, 4, 5, 6, 7, 8], weights=weights)[0]
        
        record['training'] = random.choices([0, 1], weights=[0.7, 0.3])[0]
        if record['training'] == 1:
            record['training_type'] = random.choices([1, 2, 'other'], weights=[0.4, 0.5, 0.1])[0]
            if record['training_type'] == 'other':
                record['training_type_other'] = "อบรมออนไลน์"
        
        # Occupation AFTER education (needs education to determine occupation type)
        if age < 18:
            record['occupation_status'] = 0
            record['unoccupied_reason'] = 3  # Studying
        elif age > 60:
            # Some elderly still work, but lower rate
            employment_prob = 0.30 if is_lgbt else 0.35
            if random.random() < employment_prob:
                record['occupation_status'] = 1
            else:
                record['occupation_status'] = 0
                record['unoccupied_reason'] = random.choices([1, 2, 4], weights=[0.3, 0.5, 0.2])[0]
                if record['unoccupied_reason'] == 4:
                    record['not_working_other'] = "เกษียณอายุ"
        else:
            # Working age (18-60)
            if is_lgbt:
                # LGBT faces employment discrimination
                employment_prob = 0.75
            else:
                # General middle-class population - very high employment
                if record['education'] >= 7:  # Bachelor's or higher
                    employment_prob = 0.92  # Highly educated = almost always employed
                elif record['education'] >= 6:  # Diploma/ปวส.
                    employment_prob = 0.90  # Technical diploma = high employment
                elif record['education'] >= 5:  # Vocational certificate
                    employment_prob = 0.88
                else:
                    employment_prob = 0.85  # Even lower education has high employment in Bangkok
            
            if random.random() < employment_prob:
                record['occupation_status'] = 1
                
                # Occupation type - adjusted for district and education
                company_rate_modifier = district_profile.get('company_rate', 0.50)
                
                if record['education'] >= 7:  # Bachelor's or higher
                    if district_profile['type'] in ['cbd', 'cbd_shopping', 'upscale_expat']:
                        # CBD areas - mostly company employees
                        if is_lgbt:
                            occ_weights = [0.03, 0.02, 0.75, 0.08, 0.10, 0.02]
                        else:
                            occ_weights = [0.05, 0.03, 0.72, 0.08, 0.10, 0.02]
                    elif district_profile['type'] == 'government':
                        # Government district - more government workers
                        occ_weights = [0.35, 0.15, 0.35, 0.05, 0.08, 0.02]
                    elif district_profile['type'] in ['traditional', 'chinatown']:
                        # Traditional areas - more business owners
                        occ_weights = [0.02, 0.01, 0.30, 0.35, 0.25, 0.07]
                    else:
                        # Standard distribution with district modifier
                        base_company = 0.60 * company_rate_modifier / 0.50
                        if is_lgbt:
                            occ_weights = [0.05, 0.03, base_company, 0.10, 0.82-base_company, 0.02]
                        else:
                            occ_weights = [0.10, 0.05, base_company, 0.10, 0.73-base_company, 0.02]
                elif record['education'] >= 6:  # Diploma/ปวส.
                    base_company = 0.52 * company_rate_modifier / 0.50
                    if is_lgbt:
                        occ_weights = [0.03, 0.02, base_company, 0.10, 0.80-base_company, 0.05]
                    else:
                        occ_weights = [0.05, 0.03, base_company, 0.10, 0.77-base_company, 0.05]
                elif record['education'] >= 5:  # Vocational certificate
                    base_company = 0.40 * company_rate_modifier / 0.50
                    occ_weights = [0.02, 0.02, base_company, 0.08, 0.75-base_company, 0.13]
                else:  # Lower education
                    base_company = 0.25 * company_rate_modifier / 0.50
                    occ_weights = [0.01, 0.01, base_company, 0.05, 0.65-base_company, 0.28]
                
                # Normalize weights to ensure they sum to 1
                total = sum(occ_weights)
                occ_weights = [w/total for w in occ_weights]
                
                record['occupation_type'] = random.choices([1, 2, 3, 4, 5, 6], weights=occ_weights)[0]
                
                if record['occupation_type'] == 6:
                    record['occupation_freelance_type'] = random.randint(1, 6)
                
                # Income - adjusted by district wealth level
                income_mult = district_profile.get('income_mult', 1.0)
                
                income_ranges = {
                    1: (20000, 45000),  # Government - decent salaries
                    2: (25000, 50000),  # State enterprise - good benefits
                    3: (18000, 40000),  # Company employee - varies widely
                    4: (25000, 80000),  # Private business - can be very successful
                    5: (15000, 45000),  # Freelance - high variation
                    6: (12000, 25000),  # Informal sector - lower but still livable
                }
                
                # Adjust income ranges by district
                income_range = income_ranges[record['occupation_type']]
                adjusted_min = int(income_range[0] * income_mult)
                adjusted_max = int(income_range[1] * income_mult)
                
                # Special adjustments for elite districts
                if district_profile['type'] in ['cbd', 'upscale_expat'] and record['occupation_type'] in [3, 4]:
                    adjusted_min = int(adjusted_min * 1.2)
                    adjusted_max = int(adjusted_max * 1.3)
                
                if is_lgbt:
                    record['income'] = random.randint(int(adjusted_min * 0.9), int(adjusted_max * 0.95))
                else:
                    record['income'] = random.randint(adjusted_min, adjusted_max)
                
                record['income_type'] = random.choices([1, 2], weights=[0.3, 0.7])[0]
                record['working_hours'] = random.randint(6, 12)
                
                # Contract and welfare benefits
                if record['occupation_type'] in [1, 2]:
                    # Government and state enterprise - always have contract and welfare
                    record['occupation_contract'] = 1
                    record['occupation_welfare'] = 1
                    self.set_occupation_welfare(record, str(record['occupation_type']))
                elif record['occupation_type'] == 3:
                    # Company employees - usually have contract and welfare
                    record['occupation_contract'] = random.choices([0, 1], weights=[0.1, 0.9])[0]  # 90% have contract
                    record['occupation_welfare'] = random.choices([0, 1], weights=[0.05, 0.95])[0]  # 95% have welfare
                    if record['occupation_welfare'] == 1:
                        self.set_occupation_welfare(record, str(record['occupation_type']))
                else:
                    # Freelance, business owners, informal sector - less likely to have formal benefits
                    record['occupation_contract'] = random.choices([0, 1], weights=[0.7, 0.3])[0]
                    record['occupation_welfare'] = random.choices([0, 1], weights=[0.8, 0.2])[0]
                    if record['occupation_welfare'] == 1:
                        self.set_occupation_welfare(record, str(record['occupation_type']))
                
                record['occupation_unpaid'] = random.choices([0, 1], weights=[0.9, 0.1])[0]
            else:
                record['occupation_status'] = 0
                # Reasons for unemployment vary by population
                if is_lgbt:
                    # Higher discrimination-related unemployment
                    record['unoccupied_reason'] = random.choices([1, 2, 3, 4], 
                                                                weights=[0.15, 0.60, 0.15, 0.10])[0]
                else:
                    # General population - mostly voluntary or temporary
                    record['unoccupied_reason'] = random.choices([1, 2, 3, 4], 
                                                                weights=[0.10, 0.30, 0.30, 0.30])[0]
                if record['unoccupied_reason'] == 4:
                    record['not_working_other'] = random.choice(["ดูแลครอบครัว", "พักรักษาตัว", "รอเริ่มงานใหม่"])
        
        # Healthcare - NOW linked to occupation type (AFTER occupation is determined)
        if record['occupation_status'] == 1:
            if record['occupation_type'] == 3:
                # Company employees MUST have social security
                record['welfare'] = 2  # สิทธิประกันสังคม
            elif record['occupation_type'] in [1, 2]:
                # Government and state enterprise have their own welfare
                record['welfare'] = 1  # สิทธิสวัสดิการข้าราชการ/รัฐวิสาหกิจ
            elif record['occupation_type'] in [4, 5]:
                # Business owners and freelancers - mixed
                record['welfare'] = random.choices([2, 3, 4], weights=[0.30, 0.65, 0.05])[0]
            else:
                # Informal sector - mostly universal coverage
                record['welfare'] = random.choices([2, 3, 4], weights=[0.10, 0.85, 0.05])[0]
        else:
            # Unemployed - mostly universal coverage
            record['welfare'] = random.choices([3, 4], weights=[0.95, 0.05])[0]
        
        if record['welfare'] == 4:  # Other insurance
            record['welfare_other'] = "ประกันสุขภาพเอกชน"
        
        record['medical_skip_1'] = 1 if random.random() < (0.25 if is_lgbt else 0.15) else 0
        record['medical_skip_2'] = 1 if random.random() < (0.20 if is_lgbt else 0.12) else 0
        record['medical_skip_3'] = 1 if random.random() < (0.18 if is_lgbt else 0.10) else 0
        
        record['hh_health_expense'] = random.randint(0, 5000)
        record['health_expense'] = random.randint(0, 3000)
        
        record['oral_health'] = random.choices([0, 1], weights=[0.65, 0.35])[0]
        if record['oral_health'] == 1:
            record['oral_health_access'] = 1 if random.random() < (0.5 if is_lgbt else 0.65) else 0
            if record['oral_health_access'] == 0:
                record['oral_health_access_reason'] = random.choice(["ไม่มีเวลา", "ค่าใช้จ่ายสูง", "กลัวหมอฟัน"])
        
        # Education
        record['speak'] = 1  # In Bangkok, essentially everyone can speak Thai
        record['read'] = 1 if random.random() > 0.03 else 0  # 97% literacy in Bangkok
        record['write'] = 1 if random.random() > 0.05 else 0  # 95% can write
        record['math'] = 1 if random.random() > 0.08 else 0  # 92% basic math
        
        # Education levels adjusted for Bangkok urban middle-class context
        # 0=never, 1=primary1-3, 2=primary4-6, 3=secondary1-3, 4=secondary4-6, 
        # 5=vocational cert, 6=diploma/ปวส, 7=bachelor's, 8=postgrad
        
        if age < 18:
            # Teenagers still in school - cannot have tertiary yet
            if age <= 15:
                record['education'] = random.choices([1, 2, 3], weights=[0.05, 0.25, 0.70])[0]
            else:  # 16-17 years old
                record['education'] = random.choices([3, 4, 5], weights=[0.1, 0.7, 0.2])[0]
        elif age < 23:
            # College age (18-22) - many have or pursuing tertiary
            if is_lgbt:
                # LGBT young adults - 60% have/pursuing tertiary
                record['education'] = random.choices(
                    [3, 4, 5, 6, 7], 
                    weights=[0.02, 0.08, 0.30, 0.35, 0.25]
                )[0]
            else:
                # General young adults - 65% have/pursuing tertiary  
                record['education'] = random.choices(
                    [3, 4, 5, 6, 7], 
                    weights=[0.01, 0.04, 0.30, 0.35, 0.30]
                )[0]
        else:
            # Adults 23+ with completed education
            if is_lgbt:
                # LGBT adults - aim for 75% tertiary overall
                record['education'] = random.choices(
                    [0, 1, 2, 3, 4, 5, 6, 7, 8], 
                    weights=[0.002, 0.003, 0.005, 0.02, 0.04, 0.13, 0.30, 0.40, 0.10]  # 80% tertiary
                )[0]
            else:
                # General middle-class adults - aim for 80% tertiary overall
                record['education'] = random.choices(
                    [0, 1, 2, 3, 4, 5, 6, 7, 8], 
                    weights=[0.001, 0.002, 0.002, 0.01, 0.025, 0.06, 0.30, 0.50, 0.10]  # 90% tertiary
                )[0]
        
        record['training'] = random.choices([0, 1], weights=[0.7, 0.3])[0]
        if record['training'] == 1:
            record['training_type'] = random.choices([1, 2, 'other'], weights=[0.4, 0.5, 0.1])[0]
            if record['training_type'] == 'other':
                record['training_type_other'] = "อบรมออนไลน์"
        
        # Occupation
        if age < 18:
            record['occupation_status'] = 0
            record['unoccupied_reason'] = 3  # Studying
        elif age > 60:
            # Some elderly still work, but lower rate
            employment_prob = 0.30 if is_lgbt else 0.35
            if random.random() < employment_prob:
                record['occupation_status'] = 1
            else:
                record['occupation_status'] = 0
                record['unoccupied_reason'] = random.choices([1, 2, 'other'], weights=[0.3, 0.5, 0.2])[0]
                if record['unoccupied_reason'] == 'other':
                    record['not_working_other'] = "เกษียณอายุ"
        else:
            # Working age (18-60)
            if is_lgbt:
                # LGBT faces employment discrimination
                employment_prob = 0.75
            else:
                # General middle-class population - very high employment
                if record['education'] >= 7:  # Bachelor's or higher
                    employment_prob = 0.92  # Highly educated = almost always employed
                elif record['education'] >= 6:  # Diploma/ปวส.
                    employment_prob = 0.90  # Technical diploma = high employment
                elif record['education'] >= 5:  # Vocational certificate
                    employment_prob = 0.88
                else:
                    employment_prob = 0.85  # Even lower education has high employment in Bangkok
            
            if random.random() < employment_prob:
                record['occupation_status'] = 1
                
                # Occupation type - adjusted for Bangkok middle-class reality
                # Most educated people work as company employees
                if record['education'] >= 7:  # Bachelor's or higher
                    if is_lgbt:
                        # LGBT with degree - heavily in private sector
                        # 1=gov, 2=state, 3=company, 4=business, 5=freelance, 6=informal
                        occ_weights = [0.05, 0.03, 0.65, 0.10, 0.15, 0.02]
                    else:
                        # General population with degree - many company employees
                        occ_weights = [0.10, 0.05, 0.60, 0.10, 0.13, 0.02]
                elif record['education'] >= 6:  # Diploma/ปวส.
                    if is_lgbt:
                        occ_weights = [0.03, 0.02, 0.55, 0.10, 0.25, 0.05]
                    else:
                        occ_weights = [0.05, 0.03, 0.52, 0.10, 0.25, 0.05]
                elif record['education'] >= 5:  # Vocational certificate
                    occ_weights = [0.02, 0.02, 0.40, 0.08, 0.35, 0.13]
                else:  # Lower education
                    occ_weights = [0.01, 0.01, 0.25, 0.05, 0.40, 0.28]
                
                record['occupation_type'] = random.choices([1, 2, 3, 4, 5, 6], weights=occ_weights)[0]
                
                if record['occupation_type'] == 6:
                    record['occupation_freelance_type'] = random.randint(1, 6)
                
                # Income ranges by occupation type - adjusted for Bangkok middle class
                income_ranges = {
                    1: (20000, 45000),  # Government - decent salaries
                    2: (25000, 50000),  # State enterprise - good benefits
                    3: (18000, 40000),  # Company employee - varies widely
                    4: (25000, 80000),  # Private business - can be very successful
                    5: (15000, 45000),  # Freelance - high variation
                    6: (12000, 25000),  # Informal sector - lower but still livable
                }
                
                income_range = income_ranges[record['occupation_type']]
                if is_lgbt:
                    record['income'] = random.randint(int(income_range[0] * 0.9), int(income_range[1] * 0.95))
                else:
                    record['income'] = random.randint(income_range[0], income_range[1])
                
                record['income_type'] = random.choices([1, 2], weights=[0.3, 0.7])[0]
                record['working_hours'] = random.randint(6, 12)
                
                # Contract and welfare benefits
                if record['occupation_type'] in [1, 2]:
                    # Government and state enterprise - always have contract and welfare
                    record['occupation_contract'] = 1
                    record['occupation_welfare'] = 1
                    self.set_occupation_welfare(record, str(record['occupation_type']))
                elif record['occupation_type'] == 3:
                    # Company employees - usually have contract and welfare
                    record['occupation_contract'] = random.choices([0, 1], weights=[0.1, 0.9])[0]  # 90% have contract
                    record['occupation_welfare'] = random.choices([0, 1], weights=[0.05, 0.95])[0]  # 95% have welfare
                    if record['occupation_welfare'] == 1:
                        self.set_occupation_welfare(record, str(record['occupation_type']))
                else:
                    # Freelance, business owners, informal sector - less likely to have formal benefits
                    record['occupation_contract'] = random.choices([0, 1], weights=[0.7, 0.3])[0]
                    record['occupation_welfare'] = random.choices([0, 1], weights=[0.8, 0.2])[0]
                    if record['occupation_welfare'] == 1:
                        self.set_occupation_welfare(record, str(record['occupation_type']))
                
                record['occupation_unpaid'] = random.choices([0, 1], weights=[0.9, 0.1])[0]
            else:
                record['occupation_status'] = 0
                # Reasons for unemployment vary by population
                if is_lgbt:
                    # Higher discrimination-related unemployment
                    record['unoccupied_reason'] = random.choices([1, 2, 3, 'other'], 
                                                                weights=[0.15, 0.60, 0.15, 0.10])[0]
                else:
                    # General population - mostly voluntary or temporary
                    record['unoccupied_reason'] = random.choices([1, 2, 3, 'other'], 
                                                                weights=[0.10, 0.30, 0.30, 0.30])[0]
                if record['unoccupied_reason'] == 'other':
                    record['not_working_other'] = random.choice(["ดูแลครอบครัว", "พักรักษาตัว", "รอเริ่มงานใหม่"])
        
        # Occupation injuries
        record['occupation_injury'] = random.choices([0, 1], weights=[0.92, 0.08])[0]
        if record['occupation_injury'] == 1:
            record['occupation_injury_count'] = random.randint(1, 3)
        
        record['occupation_small_injury'] = random.choices([0, 1], weights=[0.85, 0.15])[0]
        if record['occupation_small_injury'] == 1:
            record['occupation_small_injury_count'] = random.randint(1, 5)
        
        # Food security
        record['food_insecurity_1'] = 1 if random.random() < (0.25 if is_lgbt else 0.15) else 0
        record['food_insecurity_2'] = 1 if random.random() < (0.15 if is_lgbt else 0.08) else 0
        
        # Community safety - murder is very rare in Bangkok
        if is_lgbt:
            # LGBT might be in slightly riskier areas
            if district_profile['type'] in ['port_mixed', 'industrial_developing']:
                record['community_murder'] = random.choices([0, 1], weights=[0.97, 0.03])[0]  # 3% chance
            else:
                record['community_murder'] = random.choices([0, 1], weights=[0.99, 0.01])[0]  # 1% chance
        else:
            # General middle-class population - extremely rare
            if district_profile['type'] in ['cbd', 'cbd_shopping', 'upscale_expat', 'suburban']:
                record['community_murder'] = 0  # Never in good areas
            elif district_profile['type'] in ['port_mixed', 'industrial_developing']:
                record['community_murder'] = random.choices([0, 1], weights=[0.995, 0.005])[0]  # 0.5% chance
            else:
                record['community_murder'] = random.choices([0, 1], weights=[0.998, 0.002])[0]  # 0.2% chance
        record['physical_violence'] = 1 if random.random() < (0.15 if is_lgbt else 0.08) else 0
        record['psychological_violence'] = 1 if random.random() < (0.30 if is_lgbt else 0.15) else 0
        record['sexual_violence'] = 1 if random.random() < (0.08 if is_lgbt else 0.03) else 0
        record['community_safety'] = random.choices(['1', '2', '3', '4_1'], weights=[0.1, 0.2, 0.4, 0.3])[0]
        
        # Discrimination
        self.set_discrimination(record, is_lgbt)
        
        # Marriage
        if age < 18:
            record['marriage_status'] = 0
        elif is_lgbt:
            record['marriage_status'] = random.choices([0, 1, 2, 3], weights=[0.60, 0.15, 0.20, 0.05])[0]
        else:
            record['marriage_status'] = random.choices([0, 1, 2, 3], weights=[0.35, 0.40, 0.20, 0.05])[0]
        
        if record['marriage_status'] in [1, 2] and age >= 18:
            record['marriage_age'] = random.randint(18, min(age, 35))
        
        # Decisions
        record['decision'] = random.choices([0, 1], weights=[0.3, 0.7])[0] if is_lgbt else random.choices([0, 1], weights=[0.2, 0.8])[0]
        self.set_decision_types(record)
        
        # Community amenities
        record['community_amenity'] = random.choices([0, 1], weights=[0.6, 0.4])[0]
        self.set_community_amenities(record)
        
        record['helper'] = random.choices([0, 1], weights=[0.2, 0.8])[0]
        record['health_pollution'] = random.choices([0, 1], weights=[0.35, 0.65])[0]
        
        # Disasters
        self.set_disasters(record)
        
        # Housing - varies significantly by district
        if district_profile['type'] in ['cbd', 'cbd_shopping', 'upscale_expat']:
            # Elite areas - mostly renting expensive condos
            if is_lgbt:
                record['house_status'] = random.choices([1, 2, 3, 4, 5], weights=[0.05, 0.75, 0.15, 0.02, 0.03])[0]
            else:
                record['house_status'] = random.choices([1, 2, 3, 4, 5], weights=[0.10, 0.70, 0.15, 0.02, 0.03])[0]
        elif district_profile['type'] in ['traditional', 'chinatown', 'historical']:
            # Traditional areas - more ownership, some old housing
            if is_lgbt:
                record['house_status'] = random.choices([1, 2, 3, 4, 5], weights=[0.25, 0.40, 0.25, 0.08, 0.02])[0]
            else:
                record['house_status'] = random.choices([1, 2, 3, 4, 5], weights=[0.35, 0.35, 0.25, 0.04, 0.01])[0]
        elif district_profile['type'] in ['port_mixed', 'industrial_developing']:
            # Mixed/industrial areas - some informal housing
            if is_lgbt:
                record['house_status'] = random.choices([1, 2, 3, 4, 5], weights=[0.10, 0.50, 0.20, 0.15, 0.05])[0]
            else:
                record['house_status'] = random.choices([1, 2, 3, 4, 5], weights=[0.15, 0.45, 0.25, 0.10, 0.05])[0]
        else:
            # Suburban/standard areas
            if is_lgbt:
                record['house_status'] = random.choices([1, 2, 3, 4, 5], weights=[0.15, 0.55, 0.20, 0.05, 0.05])[0]
            else:
                record['house_status'] = random.choices([1, 2, 3, 4, 5], weights=[0.25, 0.45, 0.20, 0.05, 0.05])[0]
        
        # Rent prices vary significantly by district
        if record['house_status'] == 2:
            base_rent = 5000  # Base rent
            
            if district_profile['type'] in ['cbd', 'cbd_shopping', 'upscale_expat']:
                # Very expensive areas
                rent_mult = 3.0
            elif district_profile['type'] in ['young_professional', 'mixed_commercial']:
                # Expensive areas
                rent_mult = 2.0
            elif district_profile['type'] in ['university', 'transport_hub']:
                # Moderate-expensive areas
                rent_mult = 1.5
            elif district_profile['type'] in ['traditional', 'chinatown', 'historical']:
                # Cheaper old town areas
                rent_mult = 0.8
            else:
                # Standard suburban areas
                rent_mult = 1.0
            
            # Also consider income
            if record.get('income'):
                if record['income'] < 15000:
                    record['rent_price'] = random.randint(int(2000 * rent_mult), int(4000 * rent_mult))
                elif record['income'] < 25000:
                    record['rent_price'] = random.randint(int(3500 * rent_mult), int(7000 * rent_mult))
                elif record['income'] < 40000:
                    record['rent_price'] = random.randint(int(5000 * rent_mult), int(12000 * rent_mult))
                else:
                    record['rent_price'] = random.randint(int(8000 * rent_mult), int(20000 * rent_mult))
            else:
                record['rent_price'] = random.randint(int(3000 * rent_mult), int(6000 * rent_mult))
        
        # In Bangkok, everyone has access to basic utilities - this is non-negotiable
        record['house_sink'] = 1  # 100% have water for handwashing
        
        # Water supply - everyone has access, just different sources
        # But in modern Bangkok, most use tap water or buy bottled water
        if district_profile['type'] in ['cbd', 'cbd_shopping', 'upscale_expat']:
            # Elite areas - bottled water and filtered tap
            record['water_supply'] = random.choices([1, 2], weights=[0.4, 0.6])[0]
        elif district_profile['type'] in ['traditional', 'chinatown', 'port_mixed']:
            # Older areas - more reliance on vending machines and bottled
            record['water_supply'] = random.choices([1, 2, 4], weights=[0.3, 0.4, 0.3])[0]
        else:
            # Standard areas - mixed sources
            record['water_supply'] = random.choices([1, 2, 4], weights=[0.4, 0.4, 0.2])[0]
        # 1=tap water, 2=bottled water, 4=water vending machine
        
        # Sewage and waste disposal - Bangkok has citywide sewage system
        record['waste_water_disposal'] = 1  # 100% have proper sewage system
        
        # Note: We don't have electricity field in the record, but if we did, it would be 100%
        # Bangkok has universal electricity access
        
        # Community environment - varies by population and district
        self.set_community_environment(record, is_lgbt, district_profile)
        
        # Accidents
        record['accident'] = random.choices([0, 1], weights=[0.85, 0.15])[0]
        self.set_accident_status(record)
        
        record['comment'] = ""
        
        return record

    def generate_dataset(self, n_lgbt=500, n_general=1500):
        """Generate complete dataset"""
        records = []
        
        print(f"Generating {n_lgbt} LGBT population records...")
        lgbt_tertiary_count = 0
        for i in range(n_lgbt):
            record = self.generate_survey_record(is_lgbt=True)
            if record['education'] >= 6:
                lgbt_tertiary_count += 1
            records.append(record)
            if (i + 1) % 100 == 0:
                print(f"  Generated {i + 1} LGBT records...")
        
        print(f"Generating {n_general} general population records...")
        general_tertiary_count = 0
        general_male_count = 0
        general_female_count = 0
        
        for i in range(n_general):
            record = self.generate_survey_record(is_lgbt=False)
            if record['education'] >= 6:
                general_tertiary_count += 1
            if record['sex'] == 'male':
                general_male_count += 1
            elif record['sex'] == 'female':
                general_female_count += 1
            records.append(record)
            if (i + 1) % 100 == 0:
                print(f"  Generated {i + 1} general population records...")
        
        print(f"\n--- Generation Statistics ---")
        print(f"LGBT: {n_lgbt} records, {lgbt_tertiary_count} with tertiary ({lgbt_tertiary_count/n_lgbt*100:.1f}%)")
        print(f"General: {n_general} records, {general_tertiary_count} with tertiary ({general_tertiary_count/n_general*100:.1f}%)")
        print(f"  - Male: {general_male_count}")
        print(f"  - Female: {general_female_count}")
        print(f"  - LGBT: 0 (should be 0 in general population)")
        
        # Create DataFrame
        df = pd.DataFrame(records)
        
        # Ensure column order matches the provided format
        column_order = [
            'dname', 'age', 'sex', 'disable_status', 'disable_work_status', 'diseases_status',
            'diseases_type_1', 'diseases_type_2', 'diseases_type_3', 'diseases_type_4', 'diseases_type_5',
            'diseases_type_6', 'diseases_type_7', 'diseases_type_8', 'diseases_type_9', 'diseases_type_10',
            'diseases_type_11', 'diseases_type_12', 'diseases_type_13', 'diseases_type_14', 'diseases_type_15',
            'diseases_type_16', 'diseases_type_17', 'diseases_type_18', 'diseases_type_19', 'diseases_type_20',
            'diseases_type_21', 'diseases_type_other', 'diseases_type_other',
            'drink_status', 'drink_rate', 'drink_amount', 'drink_unit',
            'smoke_status', 'smoke_amount', 'smoke_unit', 'exercise_status',
            'family_status', 'hhsize', 'hh_child_count', 'hh_worker_count', 'hh_elder_count',
            'child_height_1', 'child_weight_1', 'child_height_2', 'child_weight_2',
            'child_height_3', 'child_weight_3', 'child_height_4', 'child_weight_4',
            'child_height_5', 'child_weight_5', 'height', 'weight',
            'welfare', 'welfare_other', 'medical_skip_1', 'medical_skip_2', 'medical_skip_3',
            'hh_health_expense', 'health_expense', 'oral_health', 'oral_health_access', 'oral_health_access_reason',
            'speak', 'read', 'write', 'math', 'education', 'training', 'training_type', 'training_type_other',
            'occupation_status', 'unoccupied_reason', 'not_working_other', 'occupation_type',
            'occupation_freelance_type', 'occupation_type_other', 'income_type', 'income', 'working_hours',
            'occupation_contract', 'occupation_welfare',
            'occupation_welfare_type_1', 'occupation_welfare_type_2', 'occupation_welfare_type_3',
            'occupation_welfare_type_4', 'occupation_welfare_type_other', 'occupation_welfare_other',
            'occupation_unpaid', 'occupation_injury', 'occupation_injury_count',
            'occupation_small_injury', 'occupation_small_injury_count',
            'food_insecurity_1', 'food_insecurity_2', 'community_murder',
            'physical_violence', 'psychological_violence', 'sexual_violence', 'community_safety',
            'discrimination_1', 'discrimination_2', 'discrimination_3', 'discrimination_4',
            'discrimination_5', 'discrimination_other', 'discrimination_0', 'discrimination_other',
            'marriage_status', 'marriage_age', 'decision',
            'decision_type_1', 'decision_type_2', 'decision_type_3',
            'community_amenity', 'community_amenity_type_1', 'community_amenity_type_2',
            'community_amenity_type_3', 'community_amenity_type_4', 'community_amenity_type_0',
            'helper', 'health_pollution',
            'community_disaster_1', 'community_disaster_2', 'community_disaster_3', 'community_disaster_4',
            'community_disaster_5', 'community_disaster_6', 'community_disaster_7', 'community_disaster_8',
            'community_disaster_0',
            'self_disaster_1', 'self_disaster_2', 'self_disaster_3', 'self_disaster_4',
            'self_disaster_5', 'self_disaster_6', 'self_disaster_7', 'self_disaster_8', 'self_disaster_0',
            'house_status', 'rent_price', 'house_sink', 'water_supply', 'water_supply_other', 'waste_water_disposal',
            'community_environment_1', 'community_environment_2', 'community_environment_3',
            'community_environment_4', 'community_environment_5', 'community_environment_other',
            'community_environment_0', 'community_environment_6', 'community_environment_7',
            'community_environment_other',
            'accident', 'accident_status_1', 'accident_status_2', 'accident_status_3', 'comment'
        ]
        
        # Reorder columns
        df = df[column_order]
        
        # Shuffle
        df = df.sample(frac=1).reset_index(drop=True)
        
        return df

# Example usage
if __name__ == "__main__":
    # Initialize simulator
    simulator = BangkokUrbanHealthSurveySimulator()
    
    # Generate dataset
    print("Starting Bangkok Urban Health Survey Simulation")
    print("-" * 60)
    
    df = simulator.generate_dataset(n_lgbt=500, n_general=1500)
    
    # Display info
    print(f"\nDataset generated successfully!")
    print(f"Total records: {len(df)}")
    print(f"Total columns: {len(df.columns)}")
    
    # Detailed population breakdown
    print(f"\n--- Population Breakdown ---")
    print(f"LGBT (sex='lgbt'): {(df['sex'] == 'lgbt').sum()}")
    print(f"Male (sex='male'): {(df['sex'] == 'male').sum()}")
    print(f"Female (sex='female'): {(df['sex'] == 'female').sum()}")
    print(f"General Population (male+female): {((df['sex'] == 'male') | (df['sex'] == 'female')).sum()}")
    
    # Education statistics
    print(f"\n--- Education Statistics ---")
    print(f"Overall tertiary (education >= 6): {(df['education'] >= 6).sum()} / {len(df)} = {(df['education'] >= 6).mean()*100:.1f}%")
    
    # For general population only
    general_pop = df[(df['sex'] == 'male') | (df['sex'] == 'female')]
    print(f"General population tertiary: {(general_pop['education'] >= 6).sum()} / {len(general_pop)} = {(general_pop['education'] >= 6).mean()*100:.1f}%")
    
    # For LGBT only
    lgbt_pop = df[df['sex'] == 'lgbt']
    print(f"LGBT population tertiary: {(lgbt_pop['education'] >= 6).sum()} / {len(lgbt_pop)} = {(lgbt_pop['education'] >= 6).mean()*100:.1f}%")
    
    # Education distribution
    print(f"\n--- Education Level Distribution (All) ---")
    education_dist = df['education'].value_counts().sort_index()
    for level, count in education_dist.items():
        level_names = {
            0: "Never studied", 1: "Primary 1-3", 2: "Primary 4-6", 
            3: "Secondary 1-3", 4: "Secondary 4-6", 5: "Vocational Cert",
            6: "Diploma/ปวส.", 7: "Bachelor's", 8: "Postgraduate"
        }
        print(f"  Level {level} ({level_names.get(level, 'Unknown')}): {count} ({count/len(df)*100:.1f}%)")
    
    # Age-filtered education (exclude young people still in school)
    adults = df[df['age'] >= 25]
    print(f"\n--- Adult (25+) Education ---")
    print(f"Adults with tertiary: {(adults['education'] >= 6).sum()} / {len(adults)} = {(adults['education'] >= 6).mean()*100:.1f}%")
    
    print(f"\n--- Occupation & Welfare Statistics ---")
    employed = df[df['occupation_status'] == 1]
    if len(employed) > 0:
        print(f"Employed: {len(employed)} ({len(employed)/len(df)*100:.1f}%)")
        occ_dist = employed['occupation_type'].value_counts().sort_index()
        occ_names = {
            1: "Government", 2: "State Enterprise", 3: "Company Employee",
            4: "Private Business", 5: "Freelance", 6: "Informal"
        }
        for occ_type, count in occ_dist.items():
            print(f"  Type {occ_type} ({occ_names.get(occ_type, 'Unknown')}): {count} ({count/len(employed)*100:.1f}%)")
    
    print(f"\n--- Health Insurance (Welfare) ---")
    welfare_dist = df['welfare'].value_counts().sort_index()
    welfare_names = {
        1: "Government/State", 
        2: "Social Security", 
        3: "Universal (Gold Card)",
        4: "Other/Private"
    }
    for welfare_type, count in welfare_dist.items():
        name = welfare_names.get(welfare_type, f"Unknown ({welfare_type})")
        print(f"  Type {welfare_type} ({name}): {count} ({count/len(df)*100:.1f}%)")
    
    # Check correlation
    print(f"\n--- Company Employees (Type 3) Welfare ---")
    company_employees = df[df['occupation_type'] == 3]
    if len(company_employees) > 0:
        print(f"Total company employees: {len(company_employees)}")
        ce_welfare = company_employees['welfare'].value_counts()
        for w_type, count in ce_welfare.items():
            print(f"  Welfare {w_type}: {count} ({count/len(company_employees)*100:.1f}%)")
    
    # Save to CSV
    output_file = "bangkok_survey_simulated_exact_format.csv"
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"\n✓ Dataset saved to: {output_file}")