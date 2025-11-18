from database import SessionLocal
from models.models import Client

db = SessionLocal()
clients = db.query(Client).filter(Client.client_id.in_(['CL0003', 'CL0019', 'CL0004'])).all()

print('\n✓ ML Churn Predictions (Final Verification):\n')
print('━' * 70)
for c in clients:
    util = c.total_users / c.total_licenses * 100
    print(f'{c.client_id}: Util={util:.0f}%, Health={c.health_score:.0f}, '
          f'Churn={c.churn_probability*100:.0f}% ({c.churn_risk})')
print('━' * 70)

db.close()
