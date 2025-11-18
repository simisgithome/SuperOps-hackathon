from database import SessionLocal
from models.models import Client

db = SessionLocal()
clients = db.query(Client).order_by(Client.client_id).all()

print(f"\n✓ Total Clients: {len(clients)}\n")
print("=" * 60)
print("Final Client List (CL00 prefix only):")
print("=" * 60)

for c in clients:
    util = (c.total_users / c.total_licenses * 100) if c.total_licenses else 0
    churn = c.churn_probability * 100 if c.churn_probability else 0
    print(f"{c.client_id}: {c.name:30} | Util: {util:3.0f}% | Churn: {churn:2.0f}% ({c.churn_risk})")

print("=" * 60)

db.close()
