"""
Simplified Real-Time Churn Risk Calculator
Based on actual client metrics: licenses, users, monthly spend, health score
"""

import numpy as np

class SimpleChurnPredictor:
    """
    Calculate churn risk probability based on key client metrics.
    Uses business rules derived from actual usage patterns.
    """
    
    def predict(self, client_data):
        """
        Predict churn risk based on client metrics.
        
        Args:
            client_data (dict): Must contain total_licenses, total_users, monthly_spend
            
        Returns:
            dict: Contains probability, risk_level, factors, recommendations
        """
        # Extract metrics
        total_licenses = client_data.get('total_licenses', 50)
        total_users = client_data.get('total_users', 40)
        monthly_spend = client_data.get('monthly_spend', 2000)
        health_score = client_data.get('health_score', 75)
        
        # Calculate key indicators
        utilization = (total_users / total_licenses * 100) if total_licenses > 0 else 0
        spend_per_license = monthly_spend / total_licenses if total_licenses > 0 else 0
        
        # Initialize churn probability
        churn_prob = 0.5  # Base 50%
        
        risk_factors = []
        
        # Factor 1: Utilization (35% weight)
        # Optimal: 70-90%, Underutilization is a major churn indicator
        if utilization < 40:
            churn_prob += 0.25
            risk_factors.append({
                "factor": "Low utilization",
                "severity": "high",
                "description": f"Only {utilization:.1f}% license utilization (very low)"
            })
        elif utilization < 60:
            churn_prob += 0.15
            risk_factors.append({
                "factor": "Below average utilization",
                "severity": "medium",
                "description": f"{utilization:.1f}% license utilization"
            })
        elif utilization > 95:
            churn_prob += 0.10
            risk_factors.append({
                "factor": "Over-utilization",
                "severity": "medium",
                "description": f"{utilization:.1f}% license utilization (may need more licenses)"
            })
        elif 70 <= utilization <= 90:
            churn_prob -= 0.15  # Optimal range
        
        # Factor 2: Spending Level (30% weight)
        # Low spend indicates weak commitment
        if spend_per_license < 10:
            churn_prob += 0.20
            risk_factors.append({
                "factor": "Very low spend per license",
                "severity": "high",
                "description": f"Only ${spend_per_license:.2f} per license per month"
            })
        elif spend_per_license < 20:
            churn_prob += 0.10
            risk_factors.append({
                "factor": "Low spend per license",
                "severity": "medium",
                "description": f"${spend_per_license:.2f} per license per month"
            })
        elif spend_per_license >= 30:
            churn_prob -= 0.10  # Good spending
        
        # Factor 3: Health Score (25% weight)
        if health_score < 50:
            churn_prob += 0.20
            risk_factors.append({
                "factor": "Poor health score",
                "severity": "high",
                "description": f"Health score of {health_score:.1f} indicates serious issues"
            })
        elif health_score < 70:
            churn_prob += 0.10
            risk_factors.append({
                "factor": "Fair health score",
                "severity": "medium",
                "description": f"Health score of {health_score:.1f} needs improvement"
            })
        elif health_score >= 85:
            churn_prob -= 0.15  # Excellent health
        
        # Factor 4: Total Revenue (10% weight)
        if monthly_spend < 500:
            churn_prob += 0.10
            risk_factors.append({
                "factor": "Low total revenue",
                "severity": "medium",
                "description": f"Only ${monthly_spend:.2f} monthly revenue"
            })
        elif monthly_spend >= 5000:
            churn_prob -= 0.10  # Enterprise client, less likely to churn
        
        # Clip probability to 0-1 range
        churn_prob = np.clip(churn_prob, 0.05, 0.95)
        
        # Determine risk level
        if churn_prob < 0.3:
            risk_level = "low"
        elif churn_prob < 0.6:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        # Generate recommendations
        recommendations = self._generate_recommendations(risk_level, risk_factors, 
                                                        utilization, health_score, monthly_spend)
        
        return {
            "probability": float(churn_prob),
            "risk_level": risk_level,
            "factors": risk_factors,
            "recommendations": recommendations
        }
    
    def _generate_recommendations(self, risk_level, risk_factors, utilization, health_score, monthly_spend):
        """Generate actionable recommendations"""
        recommendations = []
        
        # Risk level based recommendations
        if risk_level == "high":
            recommendations.append("URGENT: Schedule immediate retention call")
            recommendations.append("Review and address all pain points")
            recommendations.append("Consider offering special incentives or discounts")
        elif risk_level == "medium":
            recommendations.append("Proactive check-in within 2 weeks")
            recommendations.append("Assess satisfaction and identify improvement areas")
        
        # Specific factor recommendations
        if utilization < 50:
            recommendations.append("Investigate why licenses are underutilized")
            recommendations.append("Offer training to increase user adoption")
        elif utilization > 95:
            recommendations.append("Discuss license expansion opportunities")
        
        if health_score < 70:
            recommendations.append("Focus on improving health metrics")
            recommendations.append("Increase support and engagement touchpoints")
        
        if monthly_spend < 1000:
            recommendations.append("Explore upsell opportunities")
            recommendations.append("Demonstrate additional value features")
        
        return recommendations[:5]  # Return top 5


# Singleton instance
_simple_churn_predictor = None

def get_simple_churn_predictor():
    """Get or create simple churn predictor singleton."""
    global _simple_churn_predictor
    if _simple_churn_predictor is None:
        _simple_churn_predictor = SimpleChurnPredictor()
    return _simple_churn_predictor
