"""
Test that ML model produces expected scores for specific inputs
"""
import sys
import os

# Add ML models to path
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml'))
sys.path.insert(0, ml_path)

from models.ml_health_predictor import get_ml_predictor

# Initialize predictor (will retrain with new logic)
print("Loading/Training ML Model...")
predictor = get_ml_predictor()
print("Model ready\n")

# Test case: Expected score around 41.3
test_case = {
    'name': 'Very Poor Client (Expected ~41.3)',
    'total_licenses': 100,
    'total_users': 5,      # 5% utilization - very poor
    'monthly_spend': 100   # $1 per license - extremely low
}

print("="*70)
print("EXPECTED SCORE TEST")
print("="*70)

print(f"\nTest: {test_case['name']}")
print(f"  Total Licenses: {test_case['total_licenses']}")
print(f"  Total Users: {test_case['total_users']}")
print(f"  Monthly Spend: ${test_case['monthly_spend']}")

utilization = (test_case['total_users'] / test_case['total_licenses']) * 100
spend_per_lic = test_case['monthly_spend'] / test_case['total_licenses']

print(f"  Utilization: {utilization:.1f}%")
print(f"  Spend per License: ${spend_per_lic:.2f}")

# Calculate score
score = predictor.predict(test_case)

print(f"\n  Calculated Score: {score:.1f}")
print(f"  Expected Score: ~41.3")

# Check if close to expected
difference = abs(score - 41.3)
if difference <= 5:
    print(f"  Result: PASS (within 5 points)")
elif difference <= 10:
    print(f"  Result: ACCEPTABLE (within 10 points)")
else:
    print(f"  Result: NEEDS ADJUSTMENT (difference: {difference:.1f})")

if score < 50:
    status = "AT RISK"
elif score < 70:
    status = "FAIR"
elif score < 85:
    status = "GOOD"
else:
    status = "EXCELLENT"

print(f"  Status: {status}")
print("="*70)

# Additional test cases for validation
print("\nADDITIONAL VALIDATION TESTS:")
print("-"*70)

other_tests = [
    {
        'name': 'Fair Client',
        'total_licenses': 100,
        'total_users': 60,
        'monthly_spend': 1800,
        'expected_range': (60, 75)
    },
    {
        'name': 'Good Client',
        'total_licenses': 100,
        'total_users': 80,
        'monthly_spend': 3000,
        'expected_range': (80, 90)
    }
]

for test in other_tests:
    score = predictor.predict(test)
    util = (test['total_users'] / test['total_licenses']) * 100
    expected_min, expected_max = test['expected_range']
    
    status = "PASS" if expected_min <= score <= expected_max else "CHECK"
    print(f"\n{test['name']}: Util={util:.0f}%, Spend=${test['monthly_spend']}")
    print(f"  Score: {score:.1f} (Expected: {expected_min}-{expected_max}) - {status}")

print("\n" + "="*70 + "\n")
