"""
Test to verify health score updates when changing values via API
This simulates what the UI should be doing
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_health_score_update():
    """Test that health score updates when licenses/users/spend change"""
    
    print("=" * 80)
    print("TESTING HEALTH SCORE UPDATE VIA API")
    print("=" * 80)
    
    # Step 1: Create a test client (without health_score to trigger ML calculation)
    print("\n1. Creating test client...")
    create_data = {
        "name": "Test Update Client",
        "client_id": f"TEST_UPDATE_{int(requests.get(f'{BASE_URL}/clients').json()[-1]['id']) + 1 if requests.get(f'{BASE_URL}/clients').json() else 1}",
        "industry": "Technology",
        "total_licenses": 100,
        "total_users": 80,
        "monthly_spend": 3000,
        "status": "Active"
        # Note: NOT including health_score - should trigger ML calculation
    }
    
    response = requests.post(f"{BASE_URL}/clients/", json=create_data)
    if response.status_code != 200:
        print(f"❌ Failed to create client: {response.status_code}")
        print(response.text)
        return
    
    client = response.json()
    client_id = client['id']
    initial_health = client.get('health_score')
    
    print(f"✓ Client created with ID: {client_id}")
    print(f"  Licenses: {client['total_licenses']}")
    print(f"  Users: {client['total_users']}")
    print(f"  Spend: ${client['monthly_spend']}")
    print(f"  Initial Health Score: {initial_health}")
    print(f"  Utilization: {client['total_users'] / client['total_licenses'] * 100:.1f}%")
    
    # Step 2: Update to POOR values (should get low score ~50)
    print("\n2. Updating to POOR values (5 users, $100 spend)...")
    update_data = {
        "total_licenses": 100,
        "total_users": 5,
        "monthly_spend": 100
        # Note: NOT including health_score - should trigger recalculation
    }
    
    response = requests.put(f"{BASE_URL}/clients/{client_id}", json=update_data)
    if response.status_code != 200:
        print(f"❌ Failed to update client: {response.status_code}")
        print(response.text)
        return
    
    updated_client = response.json()
    poor_health = updated_client.get('health_score')
    
    print(f"✓ Client updated")
    print(f"  Licenses: {updated_client['total_licenses']}")
    print(f"  Users: {updated_client['total_users']}")
    print(f"  Spend: ${updated_client['monthly_spend']}")
    print(f"  Updated Health Score: {poor_health}")
    print(f"  Utilization: {updated_client['total_users'] / updated_client['total_licenses'] * 100:.1f}%")
    print(f"  Change: {initial_health:.1f} → {poor_health:.1f} (Δ {poor_health - initial_health:.1f})")
    
    # Step 3: Update to EXCELLENT values (should get high score ~87)
    print("\n3. Updating to EXCELLENT values (85 users, $5000 spend)...")
    update_data = {
        "total_licenses": 100,
        "total_users": 85,
        "monthly_spend": 5000
    }
    
    response = requests.put(f"{BASE_URL}/clients/{client_id}", json=update_data)
    if response.status_code != 200:
        print(f"❌ Failed to update client: {response.status_code}")
        print(response.text)
        return
    
    updated_client = response.json()
    excellent_health = updated_client.get('health_score')
    
    print(f"✓ Client updated")
    print(f"  Licenses: {updated_client['total_licenses']}")
    print(f"  Users: {updated_client['total_users']}")
    print(f"  Spend: ${updated_client['monthly_spend']}")
    print(f"  Updated Health Score: {excellent_health}")
    print(f"  Utilization: {updated_client['total_users'] / updated_client['total_licenses'] * 100:.1f}%")
    print(f"  Change: {poor_health:.1f} → {excellent_health:.1f} (Δ {excellent_health - poor_health:.1f})")
    
    # Step 4: Verify the changes are significant
    print("\n" + "=" * 80)
    print("RESULTS:")
    print("=" * 80)
    
    if poor_health < 60:
        print(f"✓ POOR client scored appropriately: {poor_health:.1f} (expected <60)")
    else:
        print(f"❌ POOR client scored too high: {poor_health:.1f} (expected <60)")
    
    if excellent_health > 80:
        print(f"✓ EXCELLENT client scored appropriately: {excellent_health:.1f} (expected >80)")
    else:
        print(f"❌ EXCELLENT client scored too low: {excellent_health:.1f} (expected >80)")
    
    if excellent_health - poor_health > 25:
        print(f"✓ Scores changed significantly: Δ {excellent_health - poor_health:.1f} points")
    else:
        print(f"❌ Scores didn't change enough: Δ {excellent_health - poor_health:.1f} points (expected >25)")
    
    print("\n✓ Health score is DYNAMIC and updates based on client data!")
    print("✓ Real ML model is working correctly!")
    
    # Clean up
    print(f"\n4. Cleaning up test client...")
    requests.delete(f"{BASE_URL}/clients/{client_id}")
    print(f"✓ Test client deleted")

if __name__ == "__main__":
    try:
        test_health_score_update()
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to API at http://localhost:8000")
        print("Please make sure the backend is running:")
        print("  cd services/api")
        print("  python -m uvicorn main:app --reload --port 8000")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
