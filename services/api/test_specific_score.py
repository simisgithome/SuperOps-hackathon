#!/usr/bin/env python3
"""Calculate health score for specific values."""

from routers.clients import calculate_health_score_ml

# Test data
test_data = {
    'total_licenses': 2,
    'total_users': 2000,
    'monthly_spend': 50,
    'contract_value': None
}

# Calculate score
score = calculate_health_score_ml(test_data)

# Calculate utilization
utilization = (2000 / 2 * 100)

# Print results
print('=' * 60)
print('HEALTH SCORE CALCULATION')
print('=' * 60)
print()
print('Input Values:')
print(f'  Total Licenses: {test_data["total_licenses"]}')
print(f'  Total Users: {test_data["total_users"]}')
print(f'  Monthly Spend: ${test_data["monthly_spend"]}')
print(f'  Utilization: {utilization:.0f}%')
print()
print(f'Expected Health Score: {score}')
print()

# Determine status
if score < 50:
    print('Status: 🔴 AT RISK')
    print('Reason: Very low spending indicates minimal engagement')
elif score < 70:
    print('Status: 🟡 FAIR')
elif score < 85:
    print('Status: 🔵 GOOD')
else:
    print('Status: 🟢 EXCELLENT')
    print('Reason: Massive over-utilization shows high demand')

print()
print('=' * 60)
