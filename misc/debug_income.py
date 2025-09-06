import random
import numpy as np

# Test income generation logic
np.random.seed(42)
random.seed(42)

# Sample data
district_profile = {'income_mult': 1.2, 'type': 'suburban'}
income_mult = 1.2

# Daily income ranges
daily_income_ranges = {
    1: (600, 1200),    # Government - rarely daily
    2: (700, 1500),    # State enterprise - rarely daily
    3: (500, 1000),    # Company employee - rarely daily
    5: (400, 1500),    # Private business - varies widely
    6: (300, 800),     # Freelance - common daily wage
}

for occupation_type in [3, 5, 6]:
    print(f"\nOccupation type {occupation_type}:")
    income_range = daily_income_ranges.get(occupation_type, (300, 800))
    print(f"  Original range: {income_range}")
    
    # Apply district adjustment (capped at 1.2x for daily)
    adjusted_min = int(income_range[0] * min(income_mult, 1.2))
    adjusted_max = int(income_range[1] * min(income_mult, 1.2))
    print(f"  Adjusted range: ({adjusted_min}, {adjusted_max})")
    
    # Test 5 random values
    for i in range(5):
        base_income = random.randint(adjusted_min, adjusted_max)
        print(f"    Sample {i+1}: base={base_income}", end="")
        
        # Apply caps
        if base_income > 1500:
            base_income = random.randint(1000, 1500)
            print(f" -> capped high={base_income}", end="")
        elif base_income < 300:
            base_income = 300
            print(f" -> capped low={base_income}", end="")
        
        # Round
        final = round(base_income / 10) * 10
        print(f" -> final={final}")