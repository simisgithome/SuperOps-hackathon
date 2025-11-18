"""
Verify Fair Client Implementation
"""
import sys
sys.path.insert(0, '../ml/models')
from ml_churn_predictor import get_ml_churn_predictor
from database import SessionLocal
from models.models import Client

print("=" * 70)
print("FAIR CLIENT VERIFICATION")
print("=" * 70)

# Test ML Model directly
print("\n1. ML Model Prediction:")
print("-" * 70)
predictor = get_ml_churn_predictor()
result = predictor.predict({
    'total_licenses': 30,
    'total_users': 85,
    'monthly_spend': 8500,
    'health_score': 55.4
})

print(f"   Input: 30 licenses, 85 users (283% util), $8,500 spend, 55.4 health")
print(f"   Predicted Churn: {result['probability']*100:.1f}%")
print(f"   Risk Level: {result['risk_level']}")
print(f"   Expected: 66% (medium)")
print(f"   Difference: {abs(result['probability']*100 - 66):.1f} percentage points")
print(f"   Status: {'✅ PASS' if abs(result['probability']*100 - 66) < 5 else '❌ FAIL'}")

# Check Database
print("\n2. Database (Backend):")
print("-" * 70)
db = SessionLocal()
client = db.query(Client).filter(
    Client.total_licenses == 30,
    Client.total_users == 85
).first()

if client:
    churn_pct = client.churn_probability * 100
    print(f"   Client ID: {client.client_id}")
    print(f"   Stored Churn: {churn_pct:.1f}%")
    print(f"   Stored Risk Level: {client.churn_risk}")
    print(f"   Expected: 66% (medium)")
    print(f"   Status: {'✅ PASS' if abs(churn_pct - 66) < 5 and client.churn_risk == 'medium' else '❌ FAIL'}")
else:
    print("   ❌ No matching client found in database")

db.close()

# Color Coding
print("\n3. Frontend Color Coding:")
print("-" * 70)
churn_value = result['probability'] * 100
if churn_value < 30:
    color = "🟢 Green (low)"
elif churn_value < 70:
    color = "🟡 Yellow (medium)"
else:
    color = "🔴 Red (high)"

print(f"   Churn Value: {churn_value:.1f}%")
print(f"   Color: {color}")
print(f"   Expected: 🟡 Yellow (medium)")
print(f"   Status: {'✅ PASS' if color == '🟡 Yellow (medium)' else '❌ FAIL'}")

print("\n" + "=" * 70)
print("VERIFICATION COMPLETE")
print("=" * 70)
