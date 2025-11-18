from database import SessionLocal
from models.models import Client

db = SessionLocal()
clients = db.query(Client).all()

print(f'Total clients in database: {len(clients)}')
print('\nLast 5 clients:')
for c in clients[-5:]:
    print(f'  ID: {c.id}, Client ID: {c.client_id}, Name: {c.name}, Status: {c.status}')

db.close()
