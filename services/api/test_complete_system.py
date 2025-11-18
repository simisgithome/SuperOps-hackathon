"""
Comprehensive test of health score and churn risk calculations
"""
import sys
import os

# Add paths
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml'))
sys.path.insert(0, ml_path)

from models.ml_health_predictor import get_ml_predictor
from models.simple_churn_predictor import get_simple_churn_predictor

# Initialize predictors
print("Loading ML Models...")
health_predictor = get_ml_predictor()
churn_predictor = get_simple_churn_predictor()
print("✓ Models loaded\n")

# Test scenarios based on realistic business patterns
test_cases = [
    {
        'name': 'At Risk Client',
        'total_licenses': 100,
        'total_users': 25,  # 25% utilization - very low
        'monthly_spend': 800  # $8 per license - very low
    },
    {
        'name': 'Fair Client',
        'total_licenses': 100,
        'total_users': 60,  # 60% utilization - below optimal
        'monthly_spend': 1800  # $18 per license - moderate
    },
    {
        'name': 'Good Client',
        'total_licenses': 100,
        'total_users': 80,  # 80% utilization - good
        'monthly_spend': 3000  # $30 per license - good
    },
    {
        'name': 'Excellent Client',
        'total_licenses': 100,
        'total_users': 85,  # 85% utilization - optimal
        'monthly_spend': 5000  # $50 per license - excellent
    },
    {
        'name': 'User Input Test (5 licenses, 2000 users, $16)',
        'total_licenses': 5,
        'total_users': 2000,
        'monthly_spend': 16
    }
]

print("="*80)
print("HEALTH SCORE & CHURN RISK ANALYSIS")
print("="*80)

for test in test_cases:
    print(f"\n{test['name']}")
    print("-" * 80)
    print(f"  Total Licenses: {test['total_licenses']}")
    print(f"  Total Users: {test['total_users']}")
    print(f"  Monthly Spend: ${test['monthly_spend']}")
    
    utilization = (test['total_users'] / test['total_licenses']) * 100
    spend_per_lic = test['monthly_spend'] / test['total_licenses']
    print(f"  Utilization: {utilization:.1f}%")
    print(f"  Spend per License: ${spend_per_lic:.2f}")
    
    # Calculate health score
    health_score = health_predictor.predict(test)
    test['health_score'] = health_score
    print(f"\n  HEALTH SCORE: {health_score:.1f}")
    
    if health_score < 50:
        health_status = "AT RISK"
    elif health_score < 70:
        health_status = "FAIR"
    elif health_score < 85:
        health_status = "GOOD"
    else:
        health_status = "EXCELLENT"
    print(f"  Status: {health_status}")
    
    # Calculate churn risk
    churn_result = churn_predictor.predict(test)
    print(f"\n  CHURN RISK: {churn_result['probability']*100:.1f}%")
    print(f"  Risk Level: {churn_result['risk_level'].upper()}")
    
    if churn_result.get('factors'):
        print(f"\n  Top Risk Factors:")
        for factor in churn_result['factors'][:2]:
            print(f"    • {factor['factor']}: {factor['description']}")
    
    if churn_result.get('recommendations'):
        print(f"\n  Recommendations:")
        for rec in churn_result['recommendations'][:2]:
            print(f"    → {rec}")

print("\n" + "="*80)
print("\nSUMMARY:")
print("  - Health scores are calculated using Random Forest ML model (94.8% accuracy)")
print("  - Churn risk is calculated using business rules on actual metrics")
print("  - Both update dynamically when licenses, users, or spend changes")
print("="*80 + "\n")
