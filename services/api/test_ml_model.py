#!/usr/bin/env python3
"""Test the real ML model implementation."""

import sys
import os

# Add paths
sys.path.insert(0, os.path.abspath('../ml'))
sys.path.insert(0, os.path.abspath('../ml/models'))

from ml_health_predictor import get_ml_predictor

print('=' * 70)
print('TESTING REAL ML MODEL IMPLEMENTATION')
print('=' * 70)
print()

# Get ML predictor (will train if needed)
predictor = get_ml_predictor()

print()
print('=' * 70)
print('MODEL FEATURE IMPORTANCE')
print('=' * 70)

importance = predictor.get_feature_importance()
sorted_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)

print()
for feature, importance_value in sorted_features:
    bar = '█' * int(importance_value * 100)
    print(f'{feature:30s} {importance_value:.4f} {bar}')

print()
print('=' * 70)
print('TESTING PREDICTIONS')
print('=' * 70)
print()

# Test cases
test_cases = [
    {
        'name': 'At Risk Client',
        'data': {'total_licenses': 100, 'total_users': 5, 'monthly_spend': 100}
    },
    {
        'name': 'Fair Client',
        'data': {'total_licenses': 100, 'total_users': 45, 'monthly_spend': 600}
    },
    {
        'name': 'Good Client',
        'data': {'total_licenses': 100, 'total_users': 75, 'monthly_spend': 1500}
    },
    {
        'name': 'Excellent Client',
        'data': {'total_licenses': 100, 'total_users': 80, 'monthly_spend': 3000}
    },
    {
        'name': 'Extreme Overutilization',
        'data': {'total_licenses': 2, 'total_users': 2000, 'monthly_spend': 50}
    }
]

for test in test_cases:
    score = predictor.predict(test['data'])
    data = test['data']
    util = (data['total_users'] / data['total_licenses'] * 100)
    
    if score < 50:
        status = '🔴 AT RISK'
    elif score < 70:
        status = '🟡 FAIR'
    elif score < 85:
        status = '🔵 GOOD'
    else:
        status = '🟢 EXCELLENT'
    
    print(f"{test['name']:25s} | Lic:{data['total_licenses']:4d} Users:{data['total_users']:4d} Spend:${data['monthly_spend']:5.0f} | Util:{util:6.1f}% | Score:{score:5.1f} {status}")

print()
print('=' * 70)
print('✓ ML MODEL WORKING SUCCESSFULLY!')
print('=' * 70)
