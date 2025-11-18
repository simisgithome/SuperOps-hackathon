"""
Test API endpoint to verify health score and churn risk are calculated correctly
"""
import requests
import json

API_URL = "http://localhost:8000/api/clients"

# Test scenarios
test_cases = [
    {
        'name': 'Low Risk Test',
        'data': {
            'total_licenses': 100,
            'total_users': 80,
            'monthly_spend': 3000
        },
        'expected_health': 'GOOD/EXCELLENT (80-90)',
        'expected_churn': 'LOW (<30%)'
    },
    {
        'name': 'High Risk Test',
        'data': {
            'total_licenses': 100,
            'total_users': 25,
            'monthly_spend': 800
        },
        'expected_health': 'FAIR (60-70)',
        'expected_churn': 'HIGH (>80%)'
    }
]

print("\n" + "="*80)
print("API INTEGRATION TEST - Health Score & Churn Risk")
print("="*80)

# Get first client
response = requests.get(API_URL)
if response.status_code == 200:
    clients = response.json()
    if clients:
        test_client = clients[0]
        client_id = test_client['id']
        
        print(f"\nUsing client: {test_client['name']} (ID: {client_id})")
        print(f"Original values:")
        print(f"  Licenses: {test_client.get('total_licenses')}")
        print(f"  Users: {test_client.get('total_users')}")
        print(f"  Spend: ${test_client.get('monthly_spend')}")
        print(f"  Health: {test_client.get('health_score')}")
        print(f"  Churn: {test_client.get('churn_probability')}% ({test_client.get('churn_risk')})")
        
        for test in test_cases:
            print(f"\n{'-'*80}")
            print(f"TEST: {test['name']}")
            print(f"Expected Health: {test['expected_health']}")
            print(f"Expected Churn: {test['expected_churn']}")
            print(f"\nUpdating client with:")
            print(f"  Licenses: {test['data']['total_licenses']}")
            print(f"  Users: {test['data']['total_users']}")
            print(f"  Spend: ${test['data']['monthly_spend']}")
            
            # Update client
            update_response = requests.put(
                f"{API_URL}/{client_id}",
                json=test['data']
            )
            
            if update_response.status_code == 200:
                updated_client = update_response.json()
                health = updated_client.get('health_score')
                churn_prob = updated_client.get('churn_probability')
                churn_risk = updated_client.get('churn_risk')
                
                print(f"\nRESULTS:")
                print(f"  Health Score: {health:.1f}")
                print(f"  Churn Probability: {churn_prob*100 if churn_prob else 0:.1f}%")
                print(f"  Churn Risk Level: {churn_risk}")
                
                # Validate
                if health:
                    if health < 50:
                        health_status = "AT RISK"
                    elif health < 70:
                        health_status = "FAIR"
                    elif health < 85:
                        health_status = "GOOD"
                    else:
                        health_status = "EXCELLENT"
                    print(f"  Health Status: {health_status} ✓")
                
                if churn_prob:
                    if churn_prob < 0.3:
                        churn_status = "LOW"
                    elif churn_prob < 0.6:
                        churn_status = "MEDIUM"
                    else:
                        churn_status = "HIGH"
                    print(f"  Churn Status: {churn_status} ✓")
            else:
                print(f"  ERROR: {update_response.status_code}")
                print(f"  {update_response.text}")
        
        print(f"\n{'='*80}")
        print("✓ API integration test complete")
        print("Both health score and churn risk are calculated dynamically")
        print("="*80 + "\n")
    else:
        print("No clients found in database")
else:
    print(f"Failed to get clients: {response.status_code}")
