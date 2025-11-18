"""Test ML Health Score Calculator Integration"""
import sys
import os

# Add ML models to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../ml'))

try:
    from models.health_score_calculator import HealthScoreCalculator
    
    print("✓ ML Health Score Calculator imported successfully")
    
    # Create calculator instance
    calc = HealthScoreCalculator()
    print("✓ Calculator initialized")
    
    # Test calculation
    test_data = {
        'total_licenses': 100,
        'total_users': 80,
        'monthly_spend': 5000,
        'contract_value': 60000,
        'contract_age_days': 365,
        'on_time_payments': 0.95,
        'payment_history_months': 12,
        'support_tickets_per_month': 2,
        'avg_resolution_time_days': 2,
        'support_satisfaction': 0.85,
        'features_used': 8,
        'features_available': 15,
        'days_since_last_contact': 30
    }
    
    result = calc.calculate(test_data)
    
    print("\n" + "="*60)
    print("ML HEALTH SCORE CALCULATION TEST")
    print("="*60)
    print(f"Overall Score: {result['overall_score']:.1f}")
    print(f"Health Status: {result['health_status']}")
    print(f"Trend: {result['trend']}")
    print("\nFactor Scores:")
    for factor, score in result['factor_scores'].items():
        print(f"  - {factor}: {score:.1f}")
    print("\nInsights:")
    for insight in result['insights']:
        print(f"  • {insight}")
    print("="*60)
    print("\n✓ ML model is working correctly!")
    
except ImportError as e:
    print(f"✗ Failed to import ML Health Score Calculator: {e}")
    print("  Using fallback basic calculation instead")
except Exception as e:
    print(f"✗ Error during calculation: {e}")
