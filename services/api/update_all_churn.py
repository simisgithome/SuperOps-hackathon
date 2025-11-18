#!/usr/bin/env python3
"""
Update all existing clients with ML-calculated churn risk
"""
import sys
sys.path.insert(0, '../ml/models')

from database import SessionLocal
from models.models import Client
from ml_churn_predictor import get_ml_churn_predictor

def update_all_churn():
    db = SessionLocal()
    predictor = get_ml_churn_predictor()
    
    try:
        clients = db.query(Client).all()
        print(f"Updating churn risk for {len(clients)} clients...")
        
        for client in clients:
            # Skip clients with missing data
            if not all([client.total_licenses, client.total_users, 
                       client.monthly_spend is not None, client.health_score]):
                print(f"  {client.client_id}: SKIPPED (missing data)")
                continue
                
            # Prepare client data for prediction
            client_data = {
                'total_licenses': client.total_licenses,
                'total_users': client.total_users,
                'monthly_spend': client.monthly_spend,
                'health_score': client.health_score
            }
            
            # Get ML prediction
            result = predictor.predict(client_data)
            
            # Update client
            old_churn = client.churn_probability or 0
            client.churn_probability = result['probability']
            client.churn_risk = result['risk_level']
            
            print(f"  {client.client_id}: {old_churn*100:.0f}% → {result['probability']*100:.0f}% ({result['risk_level']})")
        
        db.commit()
        print(f"\n✓ Successfully updated {len(clients)} clients with ML churn predictions")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_all_churn()
