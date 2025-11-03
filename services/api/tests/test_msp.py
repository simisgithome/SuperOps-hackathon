"""
Tests for MSP endpoints
"""
import pytest
from datetime import datetime, timedelta


def test_msp_dashboard(client, auth_headers, db_session, test_user):
    """Test MSP dashboard endpoint"""
    from models.models import Client
    
    # Create test client with owner_id set to test_user
    client_obj = Client(
        client_id="CLT-TEST001",
        name="Test Client",
        industry="Technology",
        monthly_spend=10000.0,
        health_score=85.0,
        owner_id=test_user.id
    )
    db_session.add(client_obj)
    db_session.commit()
    
    response = client.get("/api/msp/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_clients" in data
    assert "total_mrr" in data
    assert "avg_health_score" in data
    assert "high_risk_clients" in data


def test_get_clients_list(client, auth_headers, db_session, test_user):
    """Test getting list of clients"""
    from models.models import Client
    
    # Create test clients with owner_id set to test_user
    for i in range(3):
        client_obj = Client(
            client_id=f"CLT-TEST{i:03d}",
            name=f"Client {i}",
            industry="Technology",
            monthly_spend=10000.0,
            health_score=80.0,
            owner_id=test_user.id
        )
        db_session.add(client_obj)
    db_session.commit()
    
    response = client.get("/api/msp/clients", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3


def test_get_client_details(client, auth_headers, db_session, test_user):
    """Test getting client details"""
    from models.models import Client
    
    client_obj = Client(
        client_id="CLT-TEST002",
        name="Test Client",
        industry="Technology",
        monthly_spend=10000.0,
        health_score=85.0,
        owner_id=test_user.id
    )
    db_session.add(client_obj)
    db_session.commit()
    
    response = client.get(f"/api/msp/clients/{client_obj.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Client"
    assert data["health_score"] == 85.0


def test_get_nonexistent_client(client, auth_headers):
    """Test getting nonexistent client"""
    response = client.get("/api/msp/clients/99999", headers=auth_headers)
    assert response.status_code == 404
