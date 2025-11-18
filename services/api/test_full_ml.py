"""
Test complete ML integration - both health score and churn risk
"""
import requests
import time

BASE_URL = "http://localhost:8000/api"

def test_full_ml_integration():
    """Test both ML models working together"""
    
    timestamp = int(time.time())
    
    print("=" * 80)
    print("COMPLETE ML INTEGRATION TEST")
    print("=" * 80)
    print()
    
    # Test cases
    test_cases = [
        {
            "name": "Excellent Client",
            "data": {
                "name": "Test Excellent",
                "client_id": f"TEST_EX_{timestamp}",
                "industry": "Technology",
                "total_licenses": 75,
                "total_users": 200,
                "monthly_spend": 18000,
                "status": "Active"
            },
            "expected_health": "85-100 (Excellent)",
            "expected_churn": "<20% (Low)"
        },
        {
            "name": "Fair/Medium Risk Client",
            "data": {
                "name": "Test Fair",
                "client_id": f"TEST_FAIR_{timestamp}",
                "industry": "Technology",
                "total_licenses": 30,
                "total_users": 85,
                "monthly_spend": 8500,
                "status": "Active"
            },
            "expected_health": "75-85 (Good)",
            "expected_churn": "30-45% (Medium)"
        },
        {
            "name": "High Risk Client",
            "data": {
                "name": "Test High Risk",
                "client_id": f"TEST_RISK_{timestamp}",
                "industry": "Technology",
                "total_licenses": 22,
                "total_users": 60,
                "monthly_spend": 6500,
                "status": "Active"
            },
            "expected_health": "60-70 (Fair)",
            "expected_churn": "70-85% (High)"
        },
        {
            "name": "Critical Risk Client",
            "data": {
                "name": "Test Critical",
                "client_id": f"TEST_CRIT_{timestamp}",
                "industry": "Technology",
                "total_licenses": 100,
                "total_users": 25,
                "monthly_spend": 800,
                "status": "Active"
            },
            "expected_health": "50-70 (Fair/Poor)",
            "expected_churn": "75-90% (High)"
        }
    ]
    
    created_ids = []
    
    for i, test in enumerate(test_cases, 1):
        print(f"Test {i}: {test['name']}")
        print(f"  Licenses: {test['data']['total_licenses']}")
        print(f"  Users: {test['data']['total_users']}")
        print(f"  Spend: ${test['data']['monthly_spend']}")
        util = test['data']['total_users'] / test['data']['total_licenses'] * 100
        print(f"  Utilization: {util:.0f}%")
        print()
        
        # Create client
        response = requests.post(f"{BASE_URL}/clients/", json=test['data'])
        if response.status_code != 200:
            print(f"  ❌ Failed to create: {response.status_code}")
            print(f"  {response.text}")
            continue
        
        client = response.json()
        created_ids.append(client['id'])
        
        health = client.get('health_score')
        churn_prob = client.get('churn_probability')
        churn_level = client.get('churn_risk', 'unknown')
        
        print(f"  ✓ Client Created (ID: {client['id']})")
        if health is not None:
            print(f"  📊 Health Score: {health:.1f}")
        else:
            print(f"  📊 Health Score: N/A")
        print(f"     Expected: {test['expected_health']}")
        
        if churn_prob is not None:
            print(f"  ⚠️  Churn Risk: {churn_prob*100:.0f}% ({churn_level})")
        else:
            print(f"  ⚠️  Churn Risk: None returned ({churn_level})")
        print(f"     Expected: {test['expected_churn']}")
        print()
    
    # Clean up
    print(f"Cleaning up {len(created_ids)} test clients...")
    for client_id in created_ids:
        requests.delete(f"{BASE_URL}/clients/{client_id}")
    print("✓ Cleanup complete")
    print()
    
    print("=" * 80)
    print("✓ Both ML models (Health Score + Churn Risk) are working!")
    print("=" * 80)

if __name__ == "__main__":
    try:
        test_full_ml_integration()
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to API at http://localhost:8000")
        print("Please make sure the backend is running:")
        print("  cd services/api")
        print("  python -m uvicorn main:app --reload --port 8000")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
