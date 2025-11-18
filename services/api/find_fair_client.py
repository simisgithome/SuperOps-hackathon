from database import SessionLocal
from models.models import Client

db = SessionLocal()

# Find Fair client: 30 licenses, 85 users
client = db.query(Client).filter(
    Client.total_licenses == 30,
    Client.total_users == 85
).first()

if client:
    util = client.total_users / client.total_licenses * 100
    print(f"Found Fair Client:")
    print(f"  ID: {client.client_id}")
    print(f"  Licenses: {client.total_licenses}, Users: {client.total_users}")
    print(f"  Utilization: {util:.0f}%")
    print(f"  Monthly Spend: ${client.monthly_spend:,.0f}")
    print(f"  Health Score: {client.health_score:.1f}")
    print(f"  Churn: {client.churn_probability*100:.0f}% ({client.churn_risk})")
    print(f"  ✓ Color: {'🟢 Green (low)' if client.churn_probability*100 < 30 else '🟡 Yellow (medium)' if client.churn_probability*100 < 70 else '🔴 Red (high)'}")
else:
    print("No matching client found")

db.close()
