"""
Advanced Churn Prediction Model
Predicts the probability of client churn using ensemble ML techniques
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_recall_curve
import xgboost as xgb
import joblib
import os
from datetime import datetime, timedelta

class ChurnPredictor:
    def __init__(self):
        self.model = None
        self.scaler = RobustScaler()  # More robust to outliers
        self.feature_importance = {}
        self.feature_names = [
            # Financial indicators
            'contract_value', 'monthly_spend', 'revenue_trend',
            # Usage metrics
            'total_licenses', 'total_users', 'license_utilization',
            # Support and engagement
            'days_since_last_ticket', 'support_ticket_frequency',
            'ticket_resolution_time', 'critical_tickets_ratio',
            # Payment and contract
            'payment_history_score', 'contract_age_days', 
            'late_payments_count', 'contract_renewal_count',
            # Engagement metrics
            'engagement_score', 'feature_usage_score',
            'login_frequency', 'active_users_trend',
            # Health indicators
            'health_score', 'health_score_trend',
            'satisfaction_score'
        ]
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize or load the ensemble churn prediction model"""
        model_path = os.path.join('trained_models', 'churn_model.pkl')
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            # Create an ensemble of models
            rf = RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=20,
                min_samples_leaf=10,
                class_weight='balanced',
                random_state=42
            )
            
            gb = GradientBoostingClassifier(
                n_estimators=200,
                learning_rate=0.05,
                max_depth=6,
                subsample=0.8,
                random_state=42
            )
            
            xgb_model = xgb.XGBClassifier(
                n_estimators=200,
                learning_rate=0.05,
                max_depth=6,
                min_child_weight=2,
                gamma=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                objective='binary:logistic',
                random_state=42
            )
            
            # Create voting classifier
            self.model = VotingClassifier(
                estimators=[
                    ('rf', rf),
                    ('gb', gb),
                    ('xgb', xgb_model)
                ],
                voting='soft'  # Use probability estimates for voting
            )
            
            # Train with synthetic data for demo
            self._train_demo_model()
    
    def _train_demo_model(self):
        """Train model with realistic synthetic data"""
        np.random.seed(42)
        n_samples = 2000
        
        # Generate base features
        data = {
            'contract_value': np.random.lognormal(9, 1, n_samples),  # Contract values
            'monthly_spend': np.random.lognormal(8, 0.8, n_samples),  # Monthly spend
            'revenue_trend': np.random.normal(0, 0.2, n_samples),  # Revenue trend
            'total_licenses': np.random.randint(10, 1000, n_samples),
            'total_users': [],  # Will calculate based on licenses
            'license_utilization': np.random.beta(5, 2, n_samples),  # Right-skewed utilization
            'days_since_last_ticket': np.random.exponential(30, n_samples),
            'support_ticket_frequency': np.random.gamma(2, 2, n_samples),
            'ticket_resolution_time': np.random.lognormal(2, 0.5, n_samples),
            'critical_tickets_ratio': np.random.beta(2, 5, n_samples),
            'payment_history_score': np.random.beta(8, 2, n_samples),  # Most pay well
            'contract_age_days': np.random.uniform(1, 1095, n_samples),  # 0-3 years
            'late_payments_count': np.random.poisson(1, n_samples),
            'contract_renewal_count': np.random.poisson(2, n_samples),
            'engagement_score': np.random.beta(5, 2, n_samples),
            'feature_usage_score': np.random.beta(5, 2, n_samples),
            'login_frequency': np.random.gamma(3, 2, n_samples),
            'active_users_trend': np.random.normal(0.05, 0.2, n_samples),
            'health_score': np.random.beta(6, 2, n_samples) * 100,
            'health_score_trend': np.random.normal(0, 0.15, n_samples),
            'satisfaction_score': np.random.beta(5, 2, n_samples) * 10
        }
        
        # Calculate dependent features
        data['total_users'] = (data['total_licenses'] * data['license_utilization']).astype(int)
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Create target variable based on realistic business rules
        churn_probability = (
            # Financial health factors
            (df['revenue_trend'] < -0.1).astype(int) * 0.3 +
            (df['late_payments_count'] > 2).astype(int) * 0.2 +
            
            # Usage and engagement factors
            (df['license_utilization'] < 0.6).astype(int) * 0.15 +
            (df['engagement_score'] < 0.4).astype(int) * 0.2 +
            (df['active_users_trend'] < -0.1).astype(int) * 0.25 +
            
            # Support and satisfaction factors
            (df['critical_tickets_ratio'] > 0.3).astype(int) * 0.2 +
            (df['ticket_resolution_time'] > 15).astype(int) * 0.15 +
            (df['satisfaction_score'] < 6).astype(int) * 0.3 +
            
            # Health indicators
            (df['health_score'] < 60).astype(int) * 0.25 +
            (df['health_score_trend'] < -0.1).astype(int) * 0.2
        ) / 2.2  # Normalize to [0,1] range
        
        # Convert probabilities to binary labels with some randomness
        y = (churn_probability + np.random.normal(0, 0.1, n_samples) > 0.5).astype(int)
        
        # Convert DataFrame to numpy array for training
        X = df.values
        
        # Fit scaler and model
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        
        # Save model
        os.makedirs('trained_models', exist_ok=True)
        joblib.dump(self.model, os.path.join('trained_models', 'churn_model.pkl'))
        joblib.dump(self.scaler, os.path.join('trained_models', 'churn_scaler.pkl'))
    
    def predict(self, features):
        """
        Predict churn probability for a client
        
        Args:
            features (dict): Client features
            
        Returns:
            dict: Prediction results with probability and risk factors
        """
        # Extract and prepare features
        X = self._prepare_features(features)
        
        # Scale features
        X_scaled = self.scaler.transform(X.reshape(1, -1))
        
        # Get prediction probability
        churn_probability = self.model.predict_proba(X_scaled)[0][1]
        
        # Determine risk level
        if churn_probability < 0.3:
            risk_level = "low"
        elif churn_probability < 0.6:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        # Identify risk factors
        risk_factors = self._identify_risk_factors(features, X)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(risk_level, risk_factors)
        
        return {
            "probability": float(churn_probability),
            "risk_level": risk_level,
            "factors": risk_factors,
            "recommendations": recommendations
        }
    
    def _prepare_features(self, features):
        """Prepare features for prediction - match exact feature order"""
        feature_values = []
        
        # Get basic metrics
        total_licenses = features.get('total_licenses', 50)
        total_users = features.get('total_users', 40)
        monthly_spend = features.get('monthly_spend', 2000)
        contract_value = features.get('contract_value', monthly_spend * 12)
        health_score = features.get('health_score', 75)
        
        # Calculate utilization and trends
        utilization = total_users / total_licenses if total_licenses > 0 else 0
        
        # Revenue trend - estimate based on utilization and spend
        if utilization > 0.8 and monthly_spend > 1500:
            revenue_trend = 0.05  # Positive
        elif utilization < 0.5 or monthly_spend < 1000:
            revenue_trend = -0.15  # Negative
        else:
            revenue_trend = 0.0  # Stable
        
        # Active users trend - based on utilization
        if utilization > 0.8:
            active_users_trend = 0.1
        elif utilization < 0.5:
            active_users_trend = -0.1
        else:
            active_users_trend = 0.0
        
        # Health score trend - simplified
        health_score_trend = 0.0 if health_score >= 70 else -0.1
        
        # Estimate engagement metrics based on utilization and spend
        if utilization > 0.7 and monthly_spend / total_licenses > 20:
            payment_score = 0.9
            engagement = 0.8
            satisfaction = 8.5
            tickets_per_month = 2
            resolution_time = 12
            critical_ratio = 0.1
            late_payments = 0
            contract_age = 300
            renewals = 2
            feature_usage = 0.7
            login_freq = 8
            days_since_ticket = 20
            ticket_freq = 2
        elif utilization < 0.5 or monthly_spend / total_licenses < 10:
            payment_score = 0.65
            engagement = 0.4
            satisfaction = 5.5
            tickets_per_month = 6
            resolution_time = 30
            critical_ratio = 0.35
            late_payments = 3
            contract_age = 120
            renewals = 0
            feature_usage = 0.3
            login_freq = 2
            days_since_ticket = 60
            ticket_freq = 6
        else:
            payment_score = 0.8
            engagement = 0.65
            satisfaction = 7.0
            tickets_per_month = 3
            resolution_time = 20
            critical_ratio = 0.2
            late_payments = 1
            contract_age = 200
            renewals = 1
            feature_usage = 0.5
            login_freq = 5
            days_since_ticket = 35
            ticket_freq = 3
        
        # Build feature vector in exact order
        feature_values = [
            contract_value,
            monthly_spend,
            revenue_trend,
            total_licenses,
            total_users,
            utilization,
            days_since_ticket,
            ticket_freq,
            resolution_time,
            critical_ratio,
            payment_score,
            contract_age,
            late_payments,
            renewals,
            engagement,
            feature_usage,
            login_freq,
            active_users_trend,
            health_score,
            health_score_trend,
            satisfaction
        ]
        
        return np.array(feature_values)
    
    def _identify_risk_factors(self, features, X):
        """Identify key risk factors contributing to churn"""
        factors = []
        
        # Check various risk indicators
        if X[4] > 60:  # Days since last ticket
            factors.append({
                "factor": "Low engagement",
                "severity": "high",
                "description": f"No support tickets in {int(X[4])} days"
            })
        
        if X[5] > 0.5:  # High ticket frequency
            factors.append({
                "factor": "High support burden",
                "severity": "medium",
                "description": "Above average support ticket frequency"
            })
        
        if X[1] < features.get('contract_value', 10000) * 0.05:  # Low spend relative to contract
            factors.append({
                "factor": "Underutilization",
                "severity": "medium",
                "description": "Monthly spend much lower than contract value"
            })
        
        if X[8] < 0.5:  # Low engagement score
            factors.append({
                "factor": "Declining engagement",
                "severity": "high",
                "description": "User engagement trending downward"
            })
        
        return factors
    
    def _generate_recommendations(self, risk_level, risk_factors):
        """Generate actionable recommendations based on risk"""
        recommendations = []
        
        if risk_level == "high":
            recommendations.append("Schedule immediate check-in call with client")
            recommendations.append("Review service quality and address pain points")
            recommendations.append("Consider offering incentives or upgrades")
        
        elif risk_level == "medium":
            recommendations.append("Monitor engagement metrics closely")
            recommendations.append("Proactive outreach to ensure satisfaction")
        
        # Add specific recommendations based on factors
        for factor in risk_factors:
            if factor["factor"] == "Low engagement":
                recommendations.append("Increase touchpoints and engagement activities")
            elif factor["factor"] == "High support burden":
                recommendations.append("Provide additional training or documentation")
            elif factor["factor"] == "Underutilization":
                recommendations.append("Offer optimization consultation to increase value")
        
        return recommendations