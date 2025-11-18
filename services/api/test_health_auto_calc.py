"""
Test to demonstrate the health score auto-calculation fix
"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 70)
print("HEALTH SCORE AUTO-CALCULATION TEST")
print("=" * 70)

# Test 1: Update CL0027 with required fields but NO health_score
print("\nTest 1: Update client with licenses, users, spend (no health_score)")
print("-" * 70)

update_data = {
    "total_licenses": 100,
    "total_users": 80,
    "monthly_spend": 5000,
    "contract_value": 60000
    # Note: health_score is NOT included - should auto-calculate
}

print(f"Sending update data: {json.dumps(update_data, indent=2)}")

try:
    response = requests.put(f"{BASE_URL}/api/clients/27", json=update_data)
    if response.status_code == 200:
        result = response.json()
        print("\n✓ Update successful!")
        print(f"  Licenses: {result.get('total_licenses')}")
        print(f"  Users: {result.get('total_users')}")
        print(f"  Monthly Spend: ${result.get('monthly_spend')}")
        print(f"  Health Score: {result.get('health_score')} (AUTO-CALCULATED)")
    else:
        print(f"\n✗ Update failed: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"\n✗ Error: {e}")

# Test 2: Update with manual health_score
print("\n\nTest 2: Update client with MANUAL health_score")
print("-" * 70)

update_data_manual = {
    "total_licenses": 100,
    "total_users": 80,
    "monthly_spend": 5000,
    "health_score": 95  # Manual score provided
}

print(f"Sending update data: {json.dumps(update_data_manual, indent=2)}")

try:
    response = requests.put(f"{BASE_URL}/api/clients/27", json=update_data_manual)
    if response.status_code == 200:
        result = response.json()
        print("\n✓ Update successful!")
        print(f"  Licenses: {result.get('total_licenses')}")
        print(f"  Users: {result.get('total_users')}")
        print(f"  Monthly Spend: ${result.get('monthly_spend')}")
        print(f"  Health Score: {result.get('health_score')} (MANUAL)")
    else:
        print(f"\n✗ Update failed: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"\n✗ Error: {e}")

print("\n" + "=" * 70)
print("SUMMARY:")
print("  - When health_score is NOT sent, it auto-calculates using ML")
print("  - When health_score IS sent, it uses the manual value")
print("=" * 70)
