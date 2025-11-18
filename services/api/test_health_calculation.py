"""Test health score auto-calculation"""
from routers.clients import calculate_basic_health_score, should_auto_calculate_health_score

# Test Case 1: Auto-calculation with sufficient data
print("=" * 80)
print("Test Case 1: Auto-calculation with sufficient data")
print("=" * 80)
client_data_1 = {
    'total_licenses': 100,
    'total_users': 80,
    'monthly_spend': 5000,
    'contract_value': 60000
}
print(f"Input: {client_data_1}")
should_calc = should_auto_calculate_health_score(client_data_1, None)
print(f"Should auto-calculate: {should_calc}")
if should_calc:
    score = calculate_basic_health_score(client_data_1)
    print(f"Calculated Health Score: {score}")
print()

# Test Case 2: Insufficient data (no monthly_spend)
print("=" * 80)
print("Test Case 2: Insufficient data (no monthly_spend)")
print("=" * 80)
client_data_2 = {
    'total_licenses': 100,
    'total_users': 80,
    'monthly_spend': 0,
    'contract_value': 60000
}
print(f"Input: {client_data_2}")
should_calc = should_auto_calculate_health_score(client_data_2, None)
print(f"Should auto-calculate: {should_calc}")
if should_calc:
    score = calculate_basic_health_score(client_data_2)
    print(f"Calculated Health Score: {score}")
else:
    print("Not enough data for auto-calculation")
print()

# Test Case 3: Manual score provided
print("=" * 80)
print("Test Case 3: Manual score provided (should skip auto-calculation)")
print("=" * 80)
client_data_3 = {
    'total_licenses': 100,
    'total_users': 80,
    'monthly_spend': 5000,
    'contract_value': 60000
}
manual_score = 95
print(f"Input: {client_data_3}")
print(f"Manual Score: {manual_score}")
should_calc = should_auto_calculate_health_score(client_data_3, manual_score)
print(f"Should auto-calculate: {should_calc}")
print(f"Final Score: {manual_score} (manual)")
print()

# Test Case 4: Various utilization scenarios
print("=" * 80)
print("Test Case 4: Various utilization scenarios")
print("=" * 80)
scenarios = [
    {'total_licenses': 100, 'total_users': 85, 'monthly_spend': 3000, 'contract_value': 36000, 'desc': 'Optimal utilization (85%)'},
    {'total_licenses': 100, 'total_users': 50, 'monthly_spend': 3000, 'contract_value': 36000, 'desc': 'Low utilization (50%)'},
    {'total_licenses': 100, 'total_users': 98, 'monthly_spend': 3000, 'contract_value': 36000, 'desc': 'Over-utilization (98%)'},
]

for scenario in scenarios:
    desc = scenario.pop('desc')
    print(f"\n{desc}:")
    print(f"  Licenses: {scenario['total_licenses']}, Users: {scenario['total_users']}")
    score = calculate_basic_health_score(scenario)
    print(f"  Health Score: {score}")

print("\n" + "=" * 80)
print("Test completed!")
