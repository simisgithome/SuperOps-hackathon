import sys
sys.path.insert(0, '../ml/models')
from ml_churn_predictor import get_ml_churn_predictor

p = get_ml_churn_predictor()

# Test Fair Client: 30 lic, 85 users, $8500 spend, 283% util, health 55.4
result = p.predict({
    'total_licenses': 30,
    'total_users': 85,
    'monthly_spend': 8500,
    'health_score': 55.4
})

print(f"Fair Client (CL0002 pattern):")
print(f"  Licenses: 30, Users: 85, Spend: $8500")
print(f"  Utilization: 283%, Health: 55.4")
print(f"  Predicted Churn: {result['probability']*100:.0f}% ({result['risk_level']})")
print(f"  Expected: 66% (medium)")
print(f"  Difference: {abs(result['probability']*100 - 66):.1f} percentage points")
