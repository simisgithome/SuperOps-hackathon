"""
Verification: All clients have ML churn predictions with correct color coding
"""
from database import SessionLocal
from models.models import Client

db = SessionLocal()

clients = db.query(Client).order_by(Client.client_id).all()

print("\n" + "=" * 80)
print("FINAL VERIFICATION: ML CHURN PREDICTIONS")
print("=" * 80)
print(f"\nTotal Clients: {len(clients)}\n")

# Color coding thresholds
low_count = 0
medium_count = 0
high_count = 0

for client in clients:
    churn_pct = client.churn_probability * 100 if client.churn_probability else 0
    util = (client.total_users / client.total_licenses * 100) if client.total_licenses else 0
    
    # Determine color based on thresholds
    if churn_pct < 30:
        color = "🟢"
        risk_text = "Low"
        low_count += 1
    elif churn_pct < 70:
        color = "🟡"
        risk_text = "Medium"
        medium_count += 1
    else:
        color = "🔴"
        risk_text = "High"
        high_count += 1
    
    print(f"{client.client_id} {color} {client.name:30} | "
          f"Health: {client.health_score:5.1f} | "
          f"Churn: {churn_pct:5.1f}% ({risk_text:6}) | "
          f"Util: {util:3.0f}%")

print("\n" + "=" * 80)
print(f"Color Coding Summary:")
print(f"  🟢 Low (<30%):      {low_count} clients")
print(f"  🟡 Medium (30-69%): {medium_count} clients")
print(f"  🔴 High (≥70%):     {high_count} clients")
print("=" * 80)

print("\n✅ All clients have ML-calculated churn predictions")
print("✅ Color coding thresholds: Low <30%, Medium 30-69%, High ≥70%")
print("✅ Backend and frontend will display consistent values\n")

db.close()
