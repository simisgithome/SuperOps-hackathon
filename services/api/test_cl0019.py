import sys
sys.path.insert(0, '../ml/models')
from ml_churn_predictor import get_ml_churn_predictor

p = get_ml_churn_predictor()

# Test CL0019: 75 lic, 200 users, $1800 spend
result = p.predict({
    'total_licenses': 75,
    'total_users': 200,
    'monthly_spend': 1800,
    'health_score': 50.2
})

print(f"CL0019 Prediction:")
print(f"  Licenses: 75, Users: 200, Spend: $1800")
print(f"  Utilization: 267%, Health Score: 50.2 (Poor)")
print(f"  Predicted Churn: {result['probability']*100:.0f}% ({result['risk_level']})")
print(f"  Expected: 85-90% (high) - Poor health (50) overrides high utilization")
