from database import SessionLocal
from models.models import Client

db = SessionLocal()

# Get all clients
all_clients = db.query(Client).all()

print(f"Total clients: {len(all_clients)}\n")

cl00_clients = []
other_clients = []

for client in all_clients:
    if client.client_id and client.client_id.startswith('CL00'):
        cl00_clients.append(client)
    else:
        other_clients.append(client)

print(f"CL00 prefix clients ({len(cl00_clients)}):")
for c in cl00_clients:
    print(f"  - {c.client_id}: {c.name}")

print(f"\nOther clients to remove ({len(other_clients)}):")
for c in other_clients:
    print(f"  - {c.client_id}: {c.name}")

db.close()
