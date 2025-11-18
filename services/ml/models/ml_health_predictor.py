"""
Real Machine Learning Model for Health Score Prediction
Uses Random Forest Regressor trained on synthetic historical data
"""

import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from datetime import datetime

class MLHealthScorePredictor:
    def __init__(self, model_path='health_score_model.pkl'):
        """Initialize ML model for health score prediction."""
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.feature_names = [
            'total_licenses',
            'total_users',
            'monthly_spend',
            'utilization_ratio',
            'spend_per_license',
            'spend_per_user',
            'on_time_payment_rate',
            'support_tickets_per_month',
            'avg_resolution_days',
            'support_satisfaction',
            'features_used_ratio',
            'days_since_last_contact',
            'contract_age_days'
        ]
        
        # Try to load existing model, otherwise train new one
        if os.path.exists(model_path):
            self.load_model()
        else:
            self.train_model()
    
    def _generate_training_data(self, n_samples=1000):
        """Generate synthetic training data based on business rules."""
        np.random.seed(42)
        
        # Generate features
        total_licenses = np.random.randint(10, 500, n_samples)
        total_users = np.array([
            int(lic * np.random.uniform(0.1, 1.5)) for lic in total_licenses
        ])
        monthly_spend = np.array([
            lic * np.random.uniform(5, 100) for lic in total_licenses
        ])
        
        # Derived features
        utilization_ratio = total_users / total_licenses
        spend_per_license = monthly_spend / total_licenses
        spend_per_user = np.array([
            spend / users if users > 0 else spend 
            for spend, users in zip(monthly_spend, total_users)
        ])
        
        # Additional metrics
        on_time_payment_rate = np.random.uniform(0.6, 1.0, n_samples)
        support_tickets = np.random.poisson(3, n_samples)
        resolution_days = np.random.uniform(1, 7, n_samples)
        satisfaction = np.random.uniform(0.5, 1.0, n_samples)
        features_ratio = np.random.uniform(0.2, 0.9, n_samples)
        days_since_contact = np.random.randint(1, 120, n_samples)
        contract_age = np.random.randint(30, 730, n_samples)
        
        # Create feature matrix
        X = np.column_stack([
            total_licenses,
            total_users,
            monthly_spend,
            utilization_ratio,
            spend_per_license,
            spend_per_user,
            on_time_payment_rate,
            support_tickets,
            resolution_days,
            satisfaction,
            features_ratio,
            days_since_contact,
            contract_age
        ])
        
        # Generate target health scores based on business logic
        y = np.zeros(n_samples)
        
        for i in range(n_samples):
            score = 0
            
            # Payment score (15%)
            payment_score = on_time_payment_rate[i] * 100
            score += payment_score * 0.15
            
            # Support score (20%)
            ticket_score = 100 if 1 <= support_tickets[i] <= 4 else 70
            resolution_score = max(0, 100 - resolution_days[i] * 10)
            support_score = (ticket_score * 0.3 + resolution_score * 0.3 + 
                           satisfaction[i] * 100 * 0.4)
            score += support_score * 0.15  # 15% weight
            
            # Utilization score (30% - MOST IMPORTANT)
            util_pct = utilization_ratio[i] * 100
            if 70 <= util_pct <= 90:
                util_score = 100
            elif 60 <= util_pct < 70:
                util_score = 85
            elif 50 <= util_pct < 60:
                util_score = 70
            elif 40 <= util_pct < 50:
                util_score = 55
            elif 30 <= util_pct < 40:
                util_score = 40
            elif 20 <= util_pct < 30:
                util_score = 30
            elif 10 <= util_pct < 20:
                util_score = 20
            elif util_pct < 10:
                util_score = max(5, util_pct * 1.5)  # Very low, score close to utilization
            elif 90 < util_pct <= 100:
                util_score = 90
            elif util_pct > 100:
                # Heavy penalty for over-utilization
                util_score = max(5, 85 - (util_pct - 100) * 3)
            else:
                util_score = util_pct * 0.9
            score += util_score * 0.35  # 35% weight
            
            # Contract stability / Spending (25% weight)
            age_score = min(contract_age[i] / 365 * 100, 100)
            # Spend level indicator - very low spend is critical
            spend_per_lic = monthly_spend[i] / total_licenses[i] if total_licenses[i] > 0 else 0
            if monthly_spend[i] >= 5000:
                spend_stability = 100
            elif monthly_spend[i] >= 2000:
                spend_stability = 85
            elif monthly_spend[i] >= 1000:
                spend_stability = 65
            elif monthly_spend[i] >= 500:
                spend_stability = 45
            elif monthly_spend[i] >= 200:
                spend_stability = 30
            else:
                # Very low spend: heavily penalize
                base_spend_score = (monthly_spend[i] / 200) * 30
                # Additional penalty for very low spend per license
                if spend_per_lic < 5:
                    base_spend_score = base_spend_score * 0.5  # 50% penalty
                spend_stability = max(5, base_spend_score)
            contract_score = age_score * 0.3 + spend_stability * 0.7
            score += contract_score * 0.25  # 25% weight
            
            # Feature adoption (5%)
            adoption_score = min(features_ratio[i] / 0.7 * 100, 100)
            score += adoption_score * 0.05
            
            # Communication (5%)
            if days_since_contact[i] <= 14:
                comm_score = 100
            elif days_since_contact[i] <= 30:
                comm_score = 85
            elif days_since_contact[i] <= 60:
                comm_score = 70
            elif days_since_contact[i] <= 90:
                comm_score = 50
            else:
                comm_score = max(0, 50 - (days_since_contact[i] - 90) * 0.5)
            score += comm_score * 0.05  # 5% weight
            
            # Critical client penalty: if BOTH util and spend are terrible, apply multiplier
            util_pct_val = utilization_ratio[i] * 100
            spend_per_lic_val = monthly_spend[i] / total_licenses[i] if total_licenses[i] > 0 else 0
            if util_pct_val < 20 and spend_per_lic_val < 5:
                # Graduated penalty based on severity
                penalty = 1.0
                if util_pct_val < 10:
                    penalty -= 0.35  # 35% penalty for <10% util
                else:
                    penalty -= 0.20  # 20% penalty for 10-20% util
                score = score * penalty
            
            # Add some noise
            noise = np.random.normal(0, 3)
            y[i] = np.clip(score + noise, 0, 100)
        
        return X, y
    
    def train_model(self):
        """Train the Random Forest model on synthetic data."""
        print("🔄 Generating training data...")
        X, y = self._generate_training_data(n_samples=1000)
        
        print("🔄 Training Random Forest model...")
        # Initialize scaler
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Random Forest
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_scaled, y)
        
        # Calculate training score
        train_score = self.model.score(X_scaled, y)
        print(f"✓ Model trained successfully! R² Score: {train_score:.4f}")
        
        # Save model
        self.save_model()
        print(f"✓ Model saved to {self.model_path}")
    
    def save_model(self):
        """Save trained model and scaler to disk."""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'trained_date': datetime.now().isoformat()
        }
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self):
        """Load trained model from disk."""
        try:
            with open(self.model_path, 'rb') as f:
                model_data = pickle.load(f)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            print(f"✓ ML Model loaded successfully from {self.model_path}")
            print(f"  Trained on: {model_data.get('trained_date', 'Unknown')}")
        except Exception as e:
            print(f"⚠️ Failed to load model: {e}")
            print("🔄 Training new model...")
            self.train_model()
    
    def predict(self, client_data):
        """
        Predict health score using trained ML model.
        
        Args:
            client_data (dict): Client metrics
            
        Returns:
            float: Predicted health score (0-100)
        """
        # Extract and calculate features
        total_licenses = client_data.get('total_licenses', 50)
        total_users = client_data.get('total_users', 40)
        monthly_spend = client_data.get('monthly_spend', 2000)
        
        # Derived features
        utilization_ratio = total_users / total_licenses if total_licenses > 0 else 0
        spend_per_license = monthly_spend / total_licenses if total_licenses > 0 else 0
        spend_per_user = monthly_spend / total_users if total_users > 0 else 0
        
        # Dynamic defaults based on utilization and spending (key indicators)
        util_pct = utilization_ratio * 100
        
        # Determine client health tier for realistic defaults
        if util_pct < 20 or spend_per_license < 5:
            # Critical/At Risk tier - VERY poor defaults for terrible metrics
            on_time_payment = client_data.get('on_time_payments', 0.50)
            support_tickets = client_data.get('support_tickets_per_month', 8)
            resolution_days = client_data.get('avg_resolution_time_days', 8)
            satisfaction = client_data.get('support_satisfaction', 0.40)
            features_ratio = client_data.get('features_used', 1) / client_data.get('features_available', 15)
            days_since_contact = client_data.get('days_since_last_contact', 180)
            contract_age = client_data.get('contract_age_days', 90)
        elif util_pct < 40 or spend_per_license < 15:
            # Poor tier
            on_time_payment = client_data.get('on_time_payments', 0.75)
            support_tickets = client_data.get('support_tickets_per_month', 4)
            resolution_days = client_data.get('avg_resolution_time_days', 4)
            satisfaction = client_data.get('support_satisfaction', 0.65)
            features_ratio = client_data.get('features_used', 4) / client_data.get('features_available', 15)
            days_since_contact = client_data.get('days_since_last_contact', 75)
            contract_age = client_data.get('contract_age_days', 180)
        elif util_pct < 60 or spend_per_license < 25:
            # Fair tier
            on_time_payment = client_data.get('on_time_payments', 0.80)
            support_tickets = client_data.get('support_tickets_per_month', 3)
            resolution_days = client_data.get('avg_resolution_time_days', 3)
            satisfaction = client_data.get('support_satisfaction', 0.72)
            features_ratio = client_data.get('features_used', 5) / client_data.get('features_available', 15)
            days_since_contact = client_data.get('days_since_last_contact', 50)
            contract_age = client_data.get('contract_age_days', 250)
        else:
            # Good/Excellent tier
            on_time_payment = client_data.get('on_time_payments', 0.90)
            support_tickets = client_data.get('support_tickets_per_month', 2)
            resolution_days = client_data.get('avg_resolution_time_days', 2)
            satisfaction = client_data.get('support_satisfaction', 0.85)
            features_ratio = client_data.get('features_used', 8) / client_data.get('features_available', 15)
            days_since_contact = client_data.get('days_since_last_contact', 30)
            contract_age = client_data.get('contract_age_days', 365)
        
        # Create feature vector
        features = np.array([[
            total_licenses,
            total_users,
            monthly_spend,
            utilization_ratio,
            spend_per_license,
            spend_per_user,
            on_time_payment,
            support_tickets,
            resolution_days,
            satisfaction,
            features_ratio,
            days_since_contact,
            contract_age
        ]])
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict
        prediction = self.model.predict(features_scaled)[0]
        
        # Clip to valid range
        return float(np.clip(prediction, 0, 100))
    
    def get_feature_importance(self):
        """Get feature importance from the trained model."""
        if self.model is None:
            return None
        
        importance = self.model.feature_importances_
        return dict(zip(self.feature_names, importance))


# Singleton instance
_ml_predictor = None

def get_ml_predictor():
    """Get or create ML predictor singleton."""
    global _ml_predictor
    if _ml_predictor is None:
        _ml_predictor = MLHealthScorePredictor()
    return _ml_predictor
