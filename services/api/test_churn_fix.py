import requests
import json
import time

# Wait for backend to reload
time.sleep(2)

data = {
    'name': 'Test ML Churn',
    'client_id': 'TEST_CHURN_NEW',
    'industry': 'Technology',
    'total_licenses': 75,
    'total_users': 200,
    'monthly_spend': 18000,
    'status': 'Active'
}

print("Testing ML churn calculation after fix...")
print()

r = requests.post('http://localhost:8000/api/clients/', json=data)

if r.status_code == 200:
    result = r.json()
    print("✓ Client created successfully")
    print(f"  Health Score: {result.get('health_score')}")
    print(f"  Churn Probability: {result.get('churn_probability')}")
    print(f"  Churn Risk: {result.get('churn_risk')}")
    
    if result.get('churn_probability') is not None:
        print()
        print(f"✅ SUCCESS! Churn: {result.get('churn_probability')*100:.0f}% ({result.get('churn_risk')})")
    else:
        print()
        print("❌ Churn probability still None")
    
    # Clean up
    requests.delete(f'http://localhost:8000/api/clients/{result["id"]}')
else:
    print(f"❌ Error {r.status_code}: {r.text}")
