"""
Test health score calculation with specific values
"""
import sys
import os

# Add ML models to path
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml'))
sys.path.insert(0, ml_path)

from models.ml_health_predictor import get_ml_predictor

# Initialize predictor
predictor = get_ml_predictor()

# Test data
client_data = {
    'total_licenses': 5,
    'total_users': 2000,
    'monthly_spend': 16
}

print("\n" + "="*50)
print("HEALTH SCORE CALCULATION TEST")
print("="*50)

print("\nClient Data:")
print(f"  Total Licenses: {client_data['total_licenses']}")
print(f"  Total Users: {client_data['total_users']}")
print(f"  Monthly Spend: ${client_data['monthly_spend']}")

# Calculate utilization
utilization = (client_data['total_users'] / client_data['total_licenses']) * 100
print(f"\nUtilization: {utilization:.1f}% ({client_data['total_users']} users / {client_data['total_licenses']} licenses)")

# Calculate score
score = predictor.predict(client_data)

print(f"\nCalculated Health Score: {score}")

# Determine status
if score < 50:
    status = "AT RISK"
elif score < 70:
    status = "FAIR"
elif score < 85:
    status = "GOOD"
else:
    status = "EXCELLENT"

print(f"Status: {status}")
print("="*50 + "\n")
