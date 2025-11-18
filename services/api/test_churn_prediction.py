"""
Test churn risk calculation with realistic client data
"""
import sys
import os

# Add ML models to path
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml'))
sys.path.insert(0, ml_path)

from models.churn_predictor import ChurnPredictor

# Initialize predictor
print("Initializing Churn Predictor...")
predictor = ChurnPredictor()

# Test scenarios
test_cases = [
    {
        'name': 'High Risk Client',
        'total_licenses': 100,
        'total_users': 20,  # Low utilization (20%)
        'monthly_spend': 500,  # Low spend
        'health_score': 45
    },
    {
        'name': 'Medium Risk Client',
        'total_licenses': 100,
        'total_users': 60,  # Moderate utilization (60%)
        'monthly_spend': 1500,  # Moderate spend
        'health_score': 65
    },
    {
        'name': 'Low Risk Client',
        'total_licenses': 100,
        'total_users': 85,  # High utilization (85%)
        'monthly_spend': 3500,  # High spend
        'health_score': 88
    },
    {
        'name': 'Edge Case - Very Low',
        'total_licenses': 5,
        'total_users': 2000,
        'monthly_spend': 16,
        'health_score': 76
    }
]

print("\n" + "="*70)
print("CHURN RISK PREDICTION TESTS")
print("="*70)

for test in test_cases:
    print(f"\n{test['name']}")
    print("-" * 70)
    print(f"  Licenses: {test['total_licenses']}")
    print(f"  Users: {test['total_users']}")
    print(f"  Monthly Spend: ${test['monthly_spend']}")
    print(f"  Health Score: {test['health_score']}")
    
    utilization = (test['total_users'] / test['total_licenses']) * 100
    print(f"  Utilization: {utilization:.1f}%")
    
    try:
        result = predictor.predict(test)
        print(f"\n  Churn Probability: {result['probability']*100:.1f}%")
        print(f"  Risk Level: {result['risk_level'].upper()}")
        
        if result.get('factors'):
            print(f"  Risk Factors:")
            for factor in result['factors'][:3]:  # Show top 3
                print(f"    - {factor['factor']}: {factor['description']}")
    except Exception as e:
        print(f"  ERROR: {e}")

print("\n" + "="*70 + "\n")
