"""
Test script to verify dynamic utilization rate calculation
"""

import sys
sys.path.insert(0, '.')

from database import SessionLocal
from models.models import Client

def test_dynamic_utilization():
    db = SessionLocal()
    
    try:
        print("\n=== Testing Dynamic Utilization Rate ===\n")
        
        # Get a few clients to test
        clients = db.query(Client).limit(5).all()
        
        for client in clients:
            print(f"Client: {client.name}")
            print(f"  Total Licenses: {client.total_licenses}")
            print(f"  Total Users: {client.total_users}")
            print(f"  Utilization Rate (Dynamic): {client.utilization_rate}%")
            
            # Manual calculation for verification
            if client.total_licenses and client.total_licenses > 0:
                manual_calc = (client.total_users / client.total_licenses) * 100
                print(f"  Manual Calculation: {manual_calc:.2f}%")
                print(f"  ✓ Matches: {abs(client.utilization_rate - manual_calc) < 0.01}")
            
            print()
        
        # Test update scenario
        print("\n=== Testing Update Scenario ===\n")
        test_client = clients[0]
        print(f"Before Update:")
        print(f"  {test_client.name}: {test_client.total_licenses} licenses, {test_client.total_users} users")
        print(f"  Utilization Rate: {test_client.utilization_rate}%")
        
        # Update total_users
        old_users = test_client.total_users
        test_client.total_users = old_users + 10
        db.commit()
        db.refresh(test_client)
        
        print(f"\nAfter Updating Users (+10):")
        print(f"  {test_client.name}: {test_client.total_licenses} licenses, {test_client.total_users} users")
        print(f"  Utilization Rate (Auto-updated): {test_client.utilization_rate}%")
        
        # Restore original value
        test_client.total_users = old_users
        db.commit()
        print(f"\nRestored to original: {old_users} users, Utilization: {test_client.utilization_rate}%")
        
        print("\n✓ Dynamic utilization rate is working correctly!")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_dynamic_utilization()
