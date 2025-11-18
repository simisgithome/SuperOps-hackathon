import sys
sys.path.insert(0, '../ml/models')
from ml_churn_predictor import get_ml_churn_predictor

p = get_ml_churn_predictor()
result = p.predict({'total_licenses': 75, 'total_users': 200, 'monthly_spend': 18000, 'health_score': 95})
print(f'Churn: {result["probability"]*100:.0f}% ({result["risk_level"]})')
