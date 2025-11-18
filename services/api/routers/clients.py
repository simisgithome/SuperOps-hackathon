"""
Client management endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.models import Client
from pydantic import BaseModel
from datetime import datetime
import sys
import os

# Import churn predictor - use ML-based version
churn_predictor = None
try:
    import importlib.util
    churn_spec = importlib.util.spec_from_file_location(
        "ml_churn_predictor",
        os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ml')), "models", "ml_churn_predictor.py")
    )
    churn_module = importlib.util.module_from_spec(churn_spec)
    churn_spec.loader.exec_module(churn_module)
    churn_predictor = churn_module.get_ml_churn_predictor()
    print("✓ ML Churn Predictor loaded successfully")
except Exception as e:
    churn_predictor = None
    print(f"Warning: ML Churn Predictor not available - {e}")

def calculate_churn_risk_ml(client_data: dict) -> dict:
    """
    Calculate churn risk using ML model.
    Returns a dict with probability and risk_level.
    """
    if churn_predictor is None:
        return {"probability": None, "risk_level": None}
    try:
        result = churn_predictor.predict(client_data)
        return {
            "probability": result.get("probability"),
            "risk_level": result.get("risk_level"),
            "factors": result.get("factors"),
            "recommendations": result.get("recommendations")
        }
    except Exception as e:
        print(f"Error in churn risk ML calculation: {e}")
        return {"probability": None, "risk_level": None}

# Add ML models to path
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ml'))
if ml_path not in sys.path:
    sys.path.insert(0, ml_path)

# Try to load real ML model first, fallback to rule-based
ml_predictor = None
health_calculator = None
ML_AVAILABLE = False
USE_REAL_ML = True  # Set to True to use real ML model

try:
    if USE_REAL_ML:
        # Import real ML predictor
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "ml_health_predictor",
            os.path.join(ml_path, "models", "ml_health_predictor.py")
        )
        ml_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ml_module)
        ml_predictor = ml_module.get_ml_predictor()
        ML_AVAILABLE = True
        print("Real ML Health Score Predictor loaded successfully")
    else:
        # Import rule-based calculator
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "health_score_calculator",
            os.path.join(ml_path, "models", "health_score_calculator.py")
        )
        health_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(health_module)
        HealthScoreCalculator = health_module.HealthScoreCalculator
        health_calculator = HealthScoreCalculator()
        ML_AVAILABLE = True
        print("Rule-based Health Score Calculator loaded successfully")
except ImportError as e:
    ML_AVAILABLE = False
    print(f"Warning: ML Health Score Calculator not available - {e}")
    print("Using basic calculation as fallback.")
except Exception as e:
    ML_AVAILABLE = False
    print(f"Error loading ML Health Score Calculator: {e}")
    print("Using basic calculation as fallback.")

router = APIRouter(prefix="/api/clients", tags=["clients"])

def calculate_health_score_ml(client_data: dict) -> float:
    """
    Calculate health score using ML model.
    Falls back to basic calculation if ML is not available.
    
    Required fields:
    - total_licenses
    - total_users
    - monthly_spend
    """
    if not ML_AVAILABLE or (ml_predictor is None and health_calculator is None):
        return calculate_basic_health_score(client_data)
    
    try:
        # Use real ML predictor if available
        if ml_predictor is not None:
            score = ml_predictor.predict(client_data)
            return round(score, 1)
        
        # Otherwise use rule-based calculator
        # Get values with proper None handling
        contract_value = client_data.get('contract_value')
        if contract_value is None or contract_value == 0:
            # Calculate from monthly spend if not provided
            monthly_spend = client_data.get('monthly_spend', 2000)
            contract_value = monthly_spend * 12
        
        # Calculate utilization percentage
        total_licenses = client_data.get('total_licenses') or 50
        total_users = client_data.get('total_users') or 40
        monthly_spend = client_data.get('monthly_spend') or 2000
        utilization_pct = (total_users / total_licenses * 100) if total_licenses > 0 else 0
        
        # Calculate a combined health indicator (0-100)
        util_score = min(utilization_pct / 90 * 100, 100)  # 90% util = 100 points
        spend_score = min(monthly_spend / 2000 * 100, 100)  # $2000/mo = 100 points
        combined_indicator = (util_score * 0.6 + spend_score * 0.4)  # Weight util more
        
        # Adjust defaults based on combined health indicator
        # This creates a realistic correlation: poor metrics → poor engagement
        if combined_indicator < 40:  # Critical - At Risk
            defaults = {
                'on_time_payments': 0.65,  # 65% on-time (very poor)
                'payment_history_months': 4,  # Very short history
                'support_tickets_per_month': 6,  # Very high ticket volume
                'avg_resolution_time_days': 6,  # Very slow resolution
                'support_satisfaction': 0.55,  # Very low satisfaction
                'features_used': 2,
                'features_available': 15,  # Very low adoption (13%)
                'days_since_last_contact': 120,  # Very poor communication
                'contract_age_days': 120  # 4 months
            }
        elif combined_indicator < 55:  # Poor - At Risk / Fair boundary
            defaults = {
                'on_time_payments': 0.75,  # 75% on-time (poor)
                'payment_history_months': 6,  # Short history
                'support_tickets_per_month': 4,  # High ticket volume
                'avg_resolution_time_days': 4,  # Slow resolution
                'support_satisfaction': 0.65,  # Low satisfaction
                'features_used': 4,
                'features_available': 15,  # Low adoption (27%)
                'days_since_last_contact': 75,  # Poor communication
                'contract_age_days': 180  # 6 months
            }
        elif combined_indicator < 70:  # Fair
            defaults = {
                'on_time_payments': 0.80,  # 80% on-time
                'payment_history_months': 8,  # Moderate history
                'support_tickets_per_month': 3,  # Moderate tickets
                'avg_resolution_time_days': 3,  # Moderate resolution
                'support_satisfaction': 0.72,  # Fair satisfaction
                'features_used': 5,
                'features_available': 15,  # Fair adoption (33%)
                'days_since_last_contact': 50,  # Fair communication
                'contract_age_days': 250  # 8 months
            }
        elif combined_indicator < 85:  # Good
            defaults = {
                'on_time_payments': 0.85,  # 85% on-time
                'payment_history_months': 9,  # Good history
                'support_tickets_per_month': 3,  # Moderate tickets
                'avg_resolution_time_days': 2,  # Fast resolution
                'support_satisfaction': 0.78,  # Good satisfaction
                'features_used': 7,
                'features_available': 15,  # Good adoption (47%)
                'days_since_last_contact': 30,  # Good communication
                'contract_age_days': 300  # 10 months
            }
        else:  # Excellent
            defaults = {
                'on_time_payments': 0.95,  # 95% on-time
                'payment_history_months': 12,  # Excellent history
                'support_tickets_per_month': 1,  # Very low tickets
                'avg_resolution_time_days': 1,  # Very fast resolution
                'support_satisfaction': 0.90,  # Excellent satisfaction
                'features_used': 10,
                'features_available': 15,  # Excellent adoption (67%)
                'days_since_last_contact': 14,  # Excellent communication
                'contract_age_days': 365  # 1 year+
            }
        
        # Prepare data for ML model
        ml_input = {
            'total_licenses': total_licenses,
            'total_users': total_users,
            'monthly_spend': monthly_spend,
            'contract_value': contract_value,
            **defaults
        }
        
        # Get ML calculation
        result = health_calculator.calculate(ml_input)
        return round(result['overall_score'], 1)
    
    except Exception as e:
        print(f"Error in ML health score calculation: {e}")
        # Fall back to basic calculation
        return calculate_basic_health_score(client_data)

def calculate_basic_health_score(client_data: dict) -> float:
    """
    Calculate a basic health score based on available client data.
    Returns a score between 0-100.
    
    Required fields for calculation:
    - total_licenses
    - total_users
    - monthly_spend
    """
    try:
        total_licenses = client_data.get('total_licenses', 0)
        total_users = client_data.get('total_users', 0)
        monthly_spend = client_data.get('monthly_spend', 0)
        contract_value = client_data.get('contract_value', 0)
        
        # Check if we have minimum required data
        if total_licenses <= 0 or monthly_spend <= 0:
            return None
        
        score = 0
        
        # 1. License Utilization (40 points)
        if total_licenses > 0:
            utilization = (total_users / total_licenses) * 100
            if 70 <= utilization <= 90:
                score += 40
            elif 60 <= utilization < 70 or 90 < utilization <= 95:
                score += 35
            elif utilization > 95:
                score += 30
            else:
                score += max(0, utilization * 0.4)
        
        # 2. Spending Level (30 points)
        # Assume higher monthly spend indicates larger, more stable client
        if monthly_spend >= 5000:
            score += 30
        elif monthly_spend >= 2000:
            score += 25
        elif monthly_spend >= 1000:
            score += 20
        else:
            score += max(0, (monthly_spend / 1000) * 20)
        
        # 3. Contract Value (30 points)
        if contract_value and contract_value > 0:
            # Check if spending aligns with contract
            annual_spend = monthly_spend * 12
            if contract_value > 0:
                spend_ratio = annual_spend / contract_value
                if 0.8 <= spend_ratio <= 1.2:
                    score += 30  # Good alignment
                elif 0.6 <= spend_ratio < 0.8 or 1.2 < spend_ratio <= 1.5:
                    score += 20  # Moderate alignment
                else:
                    score += 10
        else:
            # No contract value, give partial credit
            score += 15
        
        return round(min(score, 100), 1)
    
    except Exception as e:
        print(f"Error calculating health score: {e}")
        return None

def should_auto_calculate_health_score(client_data: dict, manual_score: float = None) -> bool:
    """
    Determine if health score should be auto-calculated.
    Returns False if user provided a valid manual score (> 0).
    Returns True if manual_score is None, 0, or 0.0 (these indicate "no manual value").
    """
    # Treat 0, 0.0, None, and empty string as "no manual value provided"
    # Only a positive value (> 0) is considered a manual override
    if manual_score is not None and manual_score != '' and manual_score > 0:
        return False  # User provided a valid manual score, don't auto-calculate
    
    # Check if we have required fields for auto-calculation
    required_fields = ['total_licenses', 'monthly_spend']
    has_required = all(
        client_data.get(field) is not None and client_data.get(field) > 0
        for field in required_fields
    )
    
    return has_required

# Pydantic models for request/response
class ClientBase(BaseModel):
    name: str
    industry: str | None = None
    contract_value: float | None = None
    monthly_spend: float | None = None
    total_licenses: int | None = None
    total_users: int | None = None
    health_score: float | None = None
    churn_risk: str | None = None
    churn_probability: float | None = None
    contact: str | None = None
    email: str | None = None
    phone: str | None = None
    status: str | None = None

class ClientCreate(ClientBase):
    client_id: str  # Accept client_id from frontend
    pass

class ClientUpdate(BaseModel):
    name: str | None = None
    industry: str | None = None
    contract_value: float | None = None
    monthly_spend: float | None = None
    total_licenses: int | None = None
    total_users: int | None = None
    health_score: float | None = None
    churn_risk: str | None = None
    churn_probability: float | None = None
    contact: str | None = None
    email: str | None = None
    phone: str | None = None
    status: str | None = None
    health_score: float | None = None
    churn_risk: str | None = None
    churn_probability: float | None = None

class ClientResponse(ClientBase):
    id: int
    client_id: str
    utilization_rate: float | None = None  # Dynamic property
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[ClientResponse])
def get_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all clients"""
    clients = db.query(Client).offset(skip).limit(limit).all()
    return clients

@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Get a specific client by ID"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("/", response_model=ClientResponse)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client with optional auto-calculated health score using ML"""
    
    # Prepare client data dict for calculation
    client_dict = {
        'total_licenses': client.total_licenses,
        'total_users': client.total_users,
        'monthly_spend': client.monthly_spend,
        'contract_value': client.contract_value,
        'health_score': client.health_score
    }

    # Determine health score
    final_health_score = None
    manual_score = client.health_score
    has_valid_manual_score = (manual_score is not None and manual_score != '' and manual_score > 0)
    if has_valid_manual_score:
        final_health_score = manual_score
    elif should_auto_calculate_health_score(client_dict, None):
        final_health_score = calculate_health_score_ml(client_dict)
    
    # Update client_dict with calculated health score for churn calculation
    client_dict['health_score'] = final_health_score if final_health_score else 50
    
    # Calculate churn risk using ML model (now with health score)
    churn_result = calculate_churn_risk_ml(client_dict)
    churn_risk = churn_result.get('risk_level')
    churn_probability = churn_result.get('probability')

    db_client = Client(
        client_id=client.client_id,
        name=client.name,
        industry=client.industry,
        contract_value=client.contract_value,
        monthly_spend=client.monthly_spend,
        total_licenses=client.total_licenses,
        total_users=client.total_users,
        health_score=final_health_score,
        churn_risk=churn_risk,
        churn_probability=churn_probability,
        contact=client.contact,
        email=client.email,
        phone=client.phone,
        status=client.status or 'Active'
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    # Utilization rate is calculated dynamically via @property
    print(f"Client created with utilization rate: {db_client.utilization_rate}%")
    
    return db_client

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client_update: ClientUpdate, db: Session = Depends(get_db)):
    """Update a client with optional auto-calculated health score using ML"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get update data
    update_data = client_update.model_dump(exclude_unset=True)
    print(f"\n=== UPDATE CLIENT {client_id} ===")
    print(f"Update data received: {update_data}")
    
    # Extract health_score to check if it's a manual override
    manual_health_score = update_data.get('health_score')
    print(f"Health score in update: {manual_health_score}")
    
    # Check if any of the 3 key fields are being updated
    key_fields_updated = any(field in update_data for field in ['total_licenses', 'total_users', 'monthly_spend'])
    
    # Treat 0, 0.0, None as "no manual value" - these should trigger auto-calculation
    should_auto_calc = (
        'health_score' not in update_data or 
        manual_health_score is None or 
        manual_health_score == 0 or 
        manual_health_score == 0.0
    )
    
    # ALWAYS recalculate if key fields changed AND no new manual score provided
    if should_auto_calc and key_fields_updated:
        # Build client data from existing + updates for ML calculation
        client_dict = {
            'total_licenses': update_data.get('total_licenses', db_client.total_licenses),
            'total_users': update_data.get('total_users', db_client.total_users),
            'monthly_spend': update_data.get('monthly_spend', db_client.monthly_spend),
            'contract_value': update_data.get('contract_value', db_client.contract_value),
            'health_score': update_data.get('health_score', db_client.health_score)
        }
        # Health score
        if should_auto_calculate_health_score(client_dict, None):
            calculated_score = calculate_health_score_ml(client_dict)
            if calculated_score is not None:
                update_data['health_score'] = calculated_score
                client_dict['health_score'] = calculated_score  # Update for churn calculation
        # Churn risk (now with updated health score)
        churn_result = calculate_churn_risk_ml(client_dict)
        update_data['churn_risk'] = churn_result.get('risk_level')
        update_data['churn_probability'] = churn_result.get('probability')
    elif should_auto_calc:
        client_dict = {
            'total_licenses': update_data.get('total_licenses', db_client.total_licenses),
            'total_users': update_data.get('total_users', db_client.total_users),
            'monthly_spend': update_data.get('monthly_spend', db_client.monthly_spend),
            'contract_value': update_data.get('contract_value', db_client.contract_value),
            'health_score': update_data.get('health_score', db_client.health_score)
        }
        if should_auto_calculate_health_score(client_dict, None):
            calculated_score = calculate_health_score_ml(client_dict)
            if calculated_score is not None:
                update_data['health_score'] = calculated_score
                client_dict['health_score'] = calculated_score  # Update for churn calculation
        churn_result = calculate_churn_risk_ml(client_dict)
        update_data['churn_risk'] = churn_result.get('risk_level')
        update_data['churn_probability'] = churn_result.get('probability')
    # Update fields
    for field, value in update_data.items():
        setattr(db_client, field, value)
    
    # Utilization rate will be automatically recalculated via @property
    # when total_licenses or total_users change
    
    db.commit()
    db.refresh(db_client)
    
    print(f"Client updated. New utilization rate: {db_client.utilization_rate}%")
    
    return db_client
    print(f"Final health score saved: {db_client.health_score}\n")
    return db_client

@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Delete a client"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(db_client)
    db.commit()
    return {"message": "Client deleted successfully"}
