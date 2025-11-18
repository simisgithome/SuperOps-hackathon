"""Simple test to check churn API response"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Test creating one client
client_data = {
    "name": "Test Churn",
    "client_id": "TEST_CH_001",
    "industry": "Technology",
    "total_licenses": 75,
    "total_users": 200,
    "monthly_spend": 18000,
    "status": "Active"
}

print("Creating client...")
print(json.dumps(client_data, indent=2))
print()

response = requests.post(f"{BASE_URL}/clients/", json=client_data)

print(f"Status Code: {response.status_code}")
print()

if response.status_code == 200:
    client = response.json()
    print("Response:")
    print(json.dumps(client, indent=2))
    print()
    print(f"Health Score: {client.get('health_score')}")
    print(f"Churn Probability: {client.get('churn_probability')}")
    print(f"Churn Risk: {client.get('churn_risk')}")
    
    # Clean up
    requests.delete(f"{BASE_URL}/clients/{client['id']}")
    print(f"\nClient {client['id']} deleted")
else:
    print("Error:")
    print(response.text)
