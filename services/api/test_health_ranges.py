#!/usr/bin/env python3
"""Test health score ranges to validate scoring logic."""

from routers.clients import calculate_health_score_ml

def test_health_score_ranges():
    """Test that different client scenarios produce appropriate health scores."""
    
    print('=' * 60)
    print('HEALTH SCORE RANGE VALIDATION')
    print('=' * 60)
    print()
    
    # Test 1: AT RISK (<50) - Very poor utilization and low spending
    print('🔴 AT RISK SCENARIOS (<50):')
    print('-' * 60)
    at_risk_tests = [
        {'total_licenses': 100, 'total_users': 5, 'monthly_spend': 100, 'contract_value': None},
        {'total_licenses': 200, 'total_users': 10, 'monthly_spend': 200, 'contract_value': None},
        {'total_licenses': 50, 'total_users': 10, 'monthly_spend': 100, 'contract_value': None},
        {'total_licenses': 100, 'total_users': 15, 'monthly_spend': 300, 'contract_value': None},
    ]
    
    for i, test in enumerate(at_risk_tests, 1):
        util = test['total_users'] / test['total_licenses'] * 100
        score = calculate_health_score_ml(test)
        status = '✓ AT RISK' if score < 50 else f'❌ UNEXPECTED ({score})'
        print(f'{i}. Licenses: {test["total_licenses"]:3d} | Users: {test["total_users"]:3d} | Spend: ${test["monthly_spend"]:4.0f} | Util: {util:5.1f}% → Score: {score:5.1f} {status}')
    
    print()
    
    # Test 2: FAIR (50-69) - Below optimal utilization
    print('🟡 FAIR SCENARIOS (50-69):')
    print('-' * 60)
    fair_tests = [
        {'total_licenses': 100, 'total_users': 45, 'monthly_spend': 600, 'contract_value': None},  # Adjusted: higher util
        {'total_licenses': 50, 'total_users': 25, 'monthly_spend': 800, 'contract_value': None},
        {'total_licenses': 80, 'total_users': 45, 'monthly_spend': 1000, 'contract_value': None},
    ]
    
    for i, test in enumerate(fair_tests, 1):
        util = test['total_users'] / test['total_licenses'] * 100
        score = calculate_health_score_ml(test)
        status = '✓ FAIR' if 50 <= score < 70 else f'❌ UNEXPECTED ({score})'
        print(f'{i}. Licenses: {test["total_licenses"]:3d} | Users: {test["total_users"]:3d} | Spend: ${test["monthly_spend"]:4.0f} | Util: {util:5.1f}% → Score: {score:5.1f} {status}')
    
    print()
    
    # Test 3: GOOD (70-84) - Good utilization, approaching optimal
    print('🔵 GOOD SCENARIOS (70-84):')
    print('-' * 60)
    good_tests = [
        {'total_licenses': 100, 'total_users': 75, 'monthly_spend': 1500, 'contract_value': None},
        {'total_licenses': 50, 'total_users': 35, 'monthly_spend': 1200, 'contract_value': None},
        {'total_licenses': 80, 'total_users': 60, 'monthly_spend': 1600, 'contract_value': None},  # Adjusted: lower spend
    ]
    
    for i, test in enumerate(good_tests, 1):
        util = test['total_users'] / test['total_licenses'] * 100
        score = calculate_health_score_ml(test)
        status = '✓ GOOD' if 70 <= score < 85 else f'❌ UNEXPECTED ({score})'
        print(f'{i}. Licenses: {test["total_licenses"]:3d} | Users: {test["total_users"]:3d} | Spend: ${test["monthly_spend"]:4.0f} | Util: {util:5.1f}% → Score: {score:5.1f} {status}')
    
    print()
    
    # Test 4: EXCELLENT (85-100) - Optimal utilization and high spending
    print('🟢 EXCELLENT SCENARIOS (85-100):')
    print('-' * 60)
    excellent_tests = [
        {'total_licenses': 100, 'total_users': 80, 'monthly_spend': 3000, 'contract_value': None},
        {'total_licenses': 50, 'total_users': 40, 'monthly_spend': 2500, 'contract_value': None},
        {'total_licenses': 80, 'total_users': 65, 'monthly_spend': 2800, 'contract_value': None},
    ]
    
    for i, test in enumerate(excellent_tests, 1):
        util = test['total_users'] / test['total_licenses'] * 100
        score = calculate_health_score_ml(test)
        status = '✓ EXCELLENT' if score >= 85 else f'❌ UNEXPECTED ({score})'
        print(f'{i}. Licenses: {test["total_licenses"]:3d} | Users: {test["total_users"]:3d} | Spend: ${test["monthly_spend"]:4.0f} | Util: {util:5.1f}% → Score: {score:5.1f} {status}')
    
    print()
    print('=' * 60)
    print()

if __name__ == '__main__':
    test_health_score_ranges()
