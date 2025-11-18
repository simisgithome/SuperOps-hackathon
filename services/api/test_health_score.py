from database import SessionLocal
from models.models import Client

db = SessionLocal()

# Get the last 3 clients
clients = db.query(Client).order_by(Client.id.desc()).limit(3).all()

print("Last 3 clients with health scores:")
print("-" * 80)
for c in clients:
    health_display = f"{c.health_score}%" if c.health_score is not None else "Not set (NULL)"
    print(f"ID: {c.id:3d} | Client ID: {c.client_id:8s} | Name: {c.name:25s} | Health: {health_display}")

db.close()
