"""
Test ML Churn Predictor against observed data patterns
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../ml/models'))

from ml_churn_predictor import get_ml_churn_predictor

def test_churn_predictions():
    """Test churn predictions match observed patterns from the database"""
    
    predictor = get_ml_churn_predictor()
    
    print("=" * 80)
    print("ML CHURN RISK PREDICTOR TEST")
    print("=" * 80)
    print("\nTesting against observed data patterns...")
    print()
    
    # Test cases based on actual database observations
    test_cases = [
        {
            "name": "Excellent Client (CL0003 pattern)",
            "desc": "High utilization (267%), high spend",
            "data": {"total_licenses": 75, "total_users": 200, "monthly_spend": 18000, "health_score": 95.0},
            "expected_churn": 0.08,  # 8% observed
            "expected_level": "low"
        },
        {
            "name": "Very Good Client (CL0007 pattern)", 
            "desc": "Very high utilization (300%), high spend",
            "data": {"total_licenses": 55, "total_users": 165, "monthly_spend": 14500, "health_score": 91.0},
            "expected_churn": 0.10,  # 10% observed
            "expected_level": "low"
        },
        {
            "name": "Good Client (CL0014 pattern)",
            "desc": "High utilization (279%), high spend",
            "data": {"total_licenses": 68, "total_users": 190, "monthly_spend": 17200, "health_score": 93.0},
            "expected_churn": 0.09,  # 9% observed
            "expected_level": "low"
        },
        {
            "name": "Fair Client (CL0002 pattern)",
            "desc": "High utilization (283%), medium spend",
            "data": {"total_licenses": 30, "total_users": 85, "monthly_spend": 8500, "health_score": 78.0},
            "expected_churn": 0.35,  # 35% observed
            "expected_level": "medium"
        },
        {
            "name": "Medium Risk (CL0016 pattern)",
            "desc": "High utilization (289%), medium spend",
            "data": {"total_licenses": 45, "total_users": 130, "monthly_spend": 12200, "health_score": 79.0},
            "expected_churn": 0.34,  # 34% observed
            "expected_level": "medium"
        },
        {
            "name": "High Risk Client (CL0004 pattern)",
            "desc": "High utilization (273%), low spend",
            "data": {"total_licenses": 22, "total_users": 60, "monthly_spend": 6500, "health_score": 65.0},
            "expected_churn": 0.78,  # 78% observed
            "expected_level": "high"
        },
        {
            "name": "Very High Risk (CL0023 pattern)",
            "desc": "High utilization (268%), low spend",
            "data": {"total_licenses": 28, "total_users": 75, "monthly_spend": 7500, "health_score": 62.0},
            "expected_churn": 0.85,  # 85% observed
            "expected_level": "high"
        },
        {
            "name": "Critical Risk (CL0025 pattern)",
            "desc": "High utilization (275%), very low spend",
            "data": {"total_licenses": 20, "total_users": 55, "monthly_spend": 6200, "health_score": 60.0},
            "expected_churn": 0.88,  # 88% observed
            "expected_level": "high"
        },
        {
            "name": "At Risk with Good Health (CL0001)",
            "desc": "Low utilization (25%), low spend",
            "data": {"total_licenses": 100, "total_users": 25, "monthly_spend": 800, "health_score": 66.2},
            "expected_churn": 0.80,  # 80% observed
            "expected_level": "high"
        },
        {
            "name": "Good Utilization Client (CL0020)",
            "desc": "Perfect utilization (100%), low spend",
            "data": {"total_licenses": 10, "total_users": 10, "monthly_spend": 200, "health_score": 75.5},
            "expected_churn": 0.70,  # 70% observed
            "expected_level": "high"
        }
    ]
    
    results = []
    total_error = 0
    
    for i, test in enumerate(test_cases, 1):
        result = predictor.predict(test["data"])
        predicted = result["probability"]
        expected = test["expected_churn"]
        error = abs(predicted - expected)
        total_error += error
        
        util = test["data"]["total_users"] / test["data"]["total_licenses"] * 100
        
        # Check if prediction is within acceptable range
        within_range = error < 0.15  # Within 15 percentage points
        level_correct = result["risk_level"] == test["expected_level"]
        
        status = "✓" if (within_range and level_correct) else "⚠️"
        
        print(f"{status} Test {i}: {test['name']}")
        print(f"   {test['desc']}")
        print(f"   Licenses: {test['data']['total_licenses']} | Users: {test['data']['total_users']} | Spend: ${test['data']['monthly_spend']} | Util: {util:.0f}%")
        print(f"   Health Score: {test['data']['health_score']}")
        print(f"   Expected: {expected*100:.0f}% ({test['expected_level']})")
        print(f"   Predicted: {predicted*100:.0f}% ({result['risk_level']})")
        print(f"   Error: {error*100:.1f} percentage points")
        if not within_range or not level_correct:
            print(f"   ⚠️ Needs adjustment")
        print()
        
        results.append({
            "test": test["name"],
            "predicted": predicted,
            "expected": expected,
            "error": error,
            "within_range": within_range,
            "level_correct": level_correct
        })
    
    # Summary
    avg_error = (total_error / len(test_cases)) * 100
    accurate_count = sum(1 for r in results if r["within_range"] and r["level_correct"])
    accuracy_pct = (accurate_count / len(test_cases)) * 100
    
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Tests Passed: {accurate_count}/{len(test_cases)} ({accuracy_pct:.0f}%)")
    print(f"Average Error: {avg_error:.1f} percentage points")
    
    if accuracy_pct >= 70:
        print("\n✓ ML Churn Predictor is working well!")
        print("✓ Predictions match observed data patterns")
    else:
        print("\n⚠️ Model needs more tuning")
    
    print()

if __name__ == "__main__":
    test_churn_predictions()
