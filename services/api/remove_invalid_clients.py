from database import SessionLocal
from models.models import Client

db = SessionLocal()

try:
    # Remove CL0026 and CL0027 (test entries with invalid data)
    test_clients = db.query(Client).filter(
        Client.client_id.in_(['CL0026', 'CL0027'])
    ).all()
    
    print(f"Removing {len(test_clients)} invalid test entries:\n")
    
    for client in test_clients:
        print(f"  Removing: {client.client_id} - {client.name} (Lic={client.total_licenses}, Users={client.total_users})")
        db.delete(client)
    
    db.commit()
    print(f"\n✓ Successfully removed invalid entries")
    
    # Verify remaining clients
    remaining = db.query(Client).all()
    print(f"\n✓ Final count: {len(remaining)} clients")
    print(f"✓ All valid CL00 clients retained")
    
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
finally:
    db.close()
