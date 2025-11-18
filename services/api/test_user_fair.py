import sys
sys.path.insert(0, '../ml/models')
from ml_churn_predictor import get_ml_churn_predictor

p = get_ml_churn_predictor()

# User's specific case: Fair Client with health 55.4
result = p.predict({
    'total_licenses': 30,
    'total_users': 85,
    'monthly_spend': 8500,
    'health_score': 55.4
})

print(f"User's Fair Client Pattern:")
print(f"  Licenses: 30, Users: 85, Spend: $8,500")
print(f"  Utilization: 283%, Health: 55.4")
print(f"  Predicted Churn: {result['probability']*100:.0f}% ({result['risk_level']})")
print(f"  Expected: 66% (medium)")
print(f"  Status: {'✓ PASS' if abs(result['probability']*100 - 66) < 5 else '✗ FAIL'}")
