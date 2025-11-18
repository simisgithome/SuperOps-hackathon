"""
Real ML-based Churn Risk Predictor
Uses Random Forest to predict churn probability based on client metrics
"""

import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

class MLChurnPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_file = os.path.join(os.path.dirname(__file__), '../../../services/api/churn_model.pkl')
        self.scaler_file = os.path.join(os.path.dirname(__file__), '../../../services/api/churn_scaler.pkl')
        
        # Try to load existing model
        if os.path.exists(self.model_file) and os.path.exists(self.scaler_file):
            try:
                with open(self.model_file, 'rb') as f:
                    self.model = pickle.load(f)
                with open(self.scaler_file, 'rb') as f:
                    self.scaler = pickle.load(f)
                print("✓ Churn ML Model loaded from disk")
            except Exception as e:
                print(f"Warning: Could not load churn model: {e}")
                self.model = None
        
        # Train if no model exists
        if self.model is None:
            print("🔄 Training Churn ML Model...")
            self.train_model()
    
    def _generate_training_data(self, n_samples=1000):
        """
        Generate synthetic training data based on observed patterns from table:
        
        KEY PATTERNS FROM DATA:
        1. HIGH UTILIZATION (>250%) = Strong engagement = LOWER churn (even with medium spend)
           - CL0003: 267% util, $18k spend → 8% churn
           - CL0005: 278% util, $22k spend → 12% churn
           - CL0007: 300% util, $14.5k spend → 10% churn
           - CL0019: 267% util, $1.8k spend → should be ~17% (not 84%!)
        
        2. MEDIUM UTILIZATION (100-250%) + Good spend ($8k+) = MEDIUM churn (30-40%)
           - CL0002: 283% util, $8.5k spend → 35% churn
           
        3. LOW SPEND (<$8k) regardless of utilization = HIGH churn (60-90%)
           - But HIGH UTILIZATION (>250%) provides significant protection!
        
        REVISED LOGIC: Utilization >250% is a STRONG positive signal
        """
        np.random.seed(42)
        
        # Generate diverse client scenarios
        total_licenses = np.random.randint(10, 250, n_samples)
        
        X = []
        y = []
        
        for i in range(n_samples):
            licenses = total_licenses[i]
            
            # First determine utilization tier (CRITICAL FACTOR for high util)
            util_tier = np.random.choice(['very_high_util', 'high_util', 'medium_util', 'low_util'], 
                                        p=[0.20, 0.25, 0.30, 0.25])
            
            if util_tier == 'very_high_util':
                # Very high utilization (>250%) - STRONG engagement signal
                users = int(licenses * np.random.uniform(2.5, 4.0))  # 250-400% utilization
                
                # Even with lower spend, churn is LOW due to high engagement
                if np.random.random() < 0.30:  # 30% have high spend
                    monthly_spend = np.random.uniform(10000, 25000)
                    health_score = np.random.uniform(85, 100)
                    churn_prob = np.random.uniform(0.05, 0.15)  # 5-15% churn
                elif np.random.random() < 0.35:  # 24% have medium-high spend ($7-12k)
                    monthly_spend = np.random.uniform(7000, 12000)
                    health_score = np.random.uniform(50, 85)  # Can have poor to good health
                    # Medium-high spend + very high util = medium churn even with poor health
                    if health_score < 60:  # Very poor health (50-60)
                        churn_prob = np.random.uniform(0.60, 0.75)  # 60-75% churn (medium-high)
                    elif health_score < 70:  # Poor health (60-70)
                        churn_prob = np.random.uniform(0.50, 0.68)  # 50-68% churn (medium)
                    else:  # Fair to good health (70+)
                        churn_prob = np.random.uniform(0.08, 0.25)  # 8-25% churn (low)
                elif np.random.random() < 0.4:  # 18% have medium spend ($4-7k)
                    monthly_spend = np.random.uniform(4000, 7000)
                    health_score = np.random.uniform(65, 88)
                    if health_score < 70:
                        churn_prob = np.random.uniform(0.45, 0.65)  # 45-65% churn
                    else:
                        churn_prob = np.random.uniform(0.15, 0.35)  # 15-35% churn
                else:  # 28% have lower spend but still protected by engagement
                    monthly_spend = np.random.uniform(1500, 4000)
                    # Health score determines churn more than utilization when spend is low
                    health_score = np.random.uniform(60, 85)
                    if health_score < 70:  # Poor health overrides utilization protection
                        churn_prob = np.random.uniform(0.70, 0.90)  # 70-90% churn
                    else:  # Good health with high engagement = protected
                        churn_prob = np.random.uniform(0.08, 0.25)  # 8-25% churn
                
            elif util_tier == 'high_util':
                # High utilization (150-250%) - Good engagement
                users = int(licenses * np.random.uniform(1.5, 2.8))
                
                if np.random.random() < 0.5:
                    monthly_spend = np.random.uniform(8000, 20000)
                    health_score = np.random.uniform(75, 95)
                    churn_prob = np.random.uniform(0.15, 0.40)  # 15-40% churn
                else:
                    monthly_spend = np.random.uniform(3000, 10000)
                    health_score = np.random.uniform(60, 80)
                    if health_score < 70:  # Poor health = high churn even with good util
                        churn_prob = np.random.uniform(0.65, 0.85)  # 65-85% churn
                    else:  # Fair+ health with good utilization
                        churn_prob = np.random.uniform(0.30, 0.55)  # 30-55% churn
                
            elif util_tier == 'medium_util':
                # Medium utilization (50-150%)
                users = int(licenses * np.random.uniform(0.5, 1.8))
                
                if np.random.random() < 0.3:
                    monthly_spend = np.random.uniform(5000, 15000)
                    health_score = np.random.uniform(65, 85)
                    churn_prob = np.random.uniform(0.35, 0.60)  # 35-60% churn
                else:
                    monthly_spend = np.random.uniform(1000, 7000)
                    health_score = np.random.uniform(50, 75)
                    churn_prob = np.random.uniform(0.55, 0.80)  # 55-80% churn
                
            else:  # low_util
                # Low utilization (<50%) - High risk
                users = int(licenses * np.random.uniform(0.05, 0.7))
                monthly_spend = np.random.uniform(500, 5000)
                health_score = np.random.uniform(40, 70)
                churn_prob = np.random.uniform(0.70, 0.95)  # 70-95% churn
            
            # Calculate derived features
            utilization_ratio = users / licenses if licenses > 0 else 0
            spend_per_license = monthly_spend / licenses if licenses > 0 else 0
            spend_per_user = monthly_spend / users if users > 0 else 0
            
            # Spending level category
            if monthly_spend > 15000:
                spend_category = 4
            elif monthly_spend > 10000:
                spend_category = 3
            elif monthly_spend > 8000:
                spend_category = 2
            elif monthly_spend > 5000:
                spend_category = 1
            else:
                spend_category = 0
            
            # Spend per license category
            if spend_per_license > 200:
                spl_category = 4
            elif spend_per_license > 150:
                spl_category = 3
            elif spend_per_license > 100:
                spl_category = 2
            elif spend_per_license > 50:
                spl_category = 1
            else:
                spl_category = 0
            
            # Utilization category (IMPORTANT!)
            if utilization_ratio > 2.5:
                util_category = 4  # VERY HIGH - strong protection
            elif utilization_ratio > 2.0:
                util_category = 3  # HIGH
            elif utilization_ratio > 1.0:
                util_category = 2  # MEDIUM
            elif utilization_ratio > 0.5:
                util_category = 1  # FAIR
            else:
                util_category = 0  # LOW
            
            # Health score category
            if health_score > 85:
                health_category = 4
            elif health_score > 75:
                health_category = 3
            elif health_score > 65:
                health_category = 2
            elif health_score > 55:
                health_category = 1
            else:
                health_category = 0
            
            # Feature vector (12 features)
            features = [
                licenses,
                users,
                monthly_spend,
                utilization_ratio,
                spend_per_license,
                spend_per_user,
                health_score,
                util_category,
                spend_category,
                health_category,
                spl_category,
                monthly_spend * health_score
            ]
            
            X.append(features)
            y.append(churn_prob * 100)  # Convert to 0-100 scale
        
        return np.array(X), np.array(y)
    
    def train_model(self):
        """Train the churn prediction model"""
        print("🔄 Generating training data...")
        X, y = self._generate_training_data(1000)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        print("🔄 Training Random Forest model...")
        self.model = RandomForestRegressor(
            n_estimators=150,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_scaled, y)
        
        # Calculate R² score
        score = self.model.score(X_scaled, y)
        print(f"✓ Churn Model trained successfully! R² Score: {score:.4f}")
        
        # Save model
        try:
            with open(self.model_file, 'wb') as f:
                pickle.dump(self.model, f)
            with open(self.scaler_file, 'wb') as f:
                pickle.dump(self.scaler, f)
            print(f"✓ Churn Model saved to {self.model_file}")
        except Exception as e:
            print(f"Warning: Could not save churn model: {e}")
    
    def predict(self, client_data: dict) -> dict:
        """
        Predict churn risk for a client
        
        Args:
            client_data: dict with keys:
                - total_licenses: int
                - total_users: int
                - monthly_spend: float
                - health_score: float (optional, will use 50 if not provided)
        
        Returns:
            dict with:
                - probability: float (0.0 to 1.0)
                - risk_level: str ('low', 'medium', 'high')
                - factors: list of contributing factors
                - recommendations: list of actionable recommendations
        """
        if self.model is None:
            return {
                "probability": 0.5,
                "risk_level": "medium",
                "factors": ["Model not trained"],
                "recommendations": ["Train churn prediction model"]
            }
        
        # Extract features
        licenses = client_data.get('total_licenses', 0)
        users = client_data.get('total_users', 0)
        monthly_spend = client_data.get('monthly_spend', 0)
        health_score = client_data.get('health_score', 50)
        
        # Calculate derived features
        utilization_ratio = users / licenses if licenses > 0 else 0
        spend_per_license = monthly_spend / licenses if licenses > 0 else 0
        spend_per_user = monthly_spend / users if users > 0 else 0
        
        # Spending level category (PRIMARY CHURN FACTOR)
        if monthly_spend > 15000:
            spend_category = 4
        elif monthly_spend > 10000:
            spend_category = 3
        elif monthly_spend > 8000:
            spend_category = 2
        elif monthly_spend > 5000:
            spend_category = 1
        else:
            spend_category = 0
        
        # Spend per license category
        if spend_per_license > 200:
            spl_category = 4
        elif spend_per_license > 150:
            spl_category = 3
        elif spend_per_license > 100:
            spl_category = 2
        elif spend_per_license > 50:
            spl_category = 1
        else:
            spl_category = 0
        
        # Utilization category (SECONDARY)
        if utilization_ratio > 2.5:
            util_category = 4
        elif utilization_ratio > 2.0:
            util_category = 3
        elif utilization_ratio > 1.0:
            util_category = 2
        elif utilization_ratio > 0.5:
            util_category = 1
        else:
            util_category = 0
        
        # Health category
        if health_score > 85:
            health_category = 4
        elif health_score > 75:
            health_category = 3
        elif health_score > 65:
            health_category = 2
        elif health_score > 55:
            health_category = 1
        else:
            health_category = 0
        
        # Create feature vector (12 features)
        features = np.array([[
            licenses,
            users,
            monthly_spend,
            utilization_ratio,
            spend_per_license,
            spend_per_user,
            health_score,
            util_category,
            spend_category,
            health_category,
            spl_category,
            monthly_spend * health_score
        ]])
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict (returns 0-100)
        churn_percent = self.model.predict(features_scaled)[0]
        churn_prob = np.clip(churn_percent / 100, 0.05, 0.95)  # Convert to 0-1 and clip
        
        # Determine risk level
        if churn_prob < 0.30:
            risk_level = 'low'
        elif churn_prob < 0.70:
            risk_level = 'medium'
        else:
            risk_level = 'high'
        
        # Analyze contributing factors
        factors = []
        recommendations = []
        
        util_pct = utilization_ratio * 100
        
        # Utilization analysis (most important factor from data)
        if util_pct > 250:
            factors.append(f"Excellent utilization ({util_pct:.0f}%)")
            recommendations.append("Maintain high engagement levels")
        elif util_pct > 200:
            factors.append(f"Very good utilization ({util_pct:.0f}%)")
            recommendations.append("Continue current engagement strategy")
        elif util_pct > 100:
            factors.append(f"Good utilization ({util_pct:.0f}%)")
            recommendations.append("Monitor for any decline in usage")
        elif util_pct > 50:
            factors.append(f"Fair utilization ({util_pct:.0f}%)")
            recommendations.append("⚠️ Investigate barriers to adoption")
        else:
            factors.append(f"⚠️ Low utilization ({util_pct:.0f}%)")
            recommendations.append("🚨 URGENT: Address low adoption immediately")
        
        # Spending analysis
        if spend_per_license < 50:
            factors.append(f"Low spend per license (${spend_per_license:.0f})")
            recommendations.append("⚠️ Review pricing and value proposition")
        elif monthly_spend > 10000:
            factors.append(f"Strong revenue (${monthly_spend:.0f}/mo)")
            recommendations.append("Consider upsell opportunities")
        
        # Health score analysis
        if health_score < 60:
            factors.append(f"⚠️ Poor health score ({health_score:.1f})")
            recommendations.append("🚨 Schedule immediate intervention")
        elif health_score > 85:
            factors.append(f"Excellent health score ({health_score:.1f})")
            recommendations.append("Maintain strong relationship")
        
        return {
            "probability": round(churn_prob, 3),
            "risk_level": risk_level,
            "factors": factors,
            "recommendations": recommendations
        }

# Singleton instance
_ml_churn_predictor = None

def get_ml_churn_predictor():
    """Get or create the singleton ML churn predictor instance"""
    global _ml_churn_predictor
    if _ml_churn_predictor is None:
        _ml_churn_predictor = MLChurnPredictor()
    return _ml_churn_predictor
