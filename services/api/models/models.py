"""
Database models for PulseOps AI
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'msp' or 'it_admin'
    company_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    clients = relationship("Client", back_populates="owner")
    software_licenses = relationship("SoftwareLicense", back_populates="owner")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String)
    contract_value = Column(Float)
    monthly_spend = Column(Float)
    total_licenses = Column(Integer)
    total_users = Column(Integer)
    health_score = Column(Float)
    churn_risk = Column(String)  # 'low', 'medium', 'high'
    churn_probability = Column(Float)
    last_support_ticket = Column(DateTime)
    
    # Contact information fields
    contact = Column(String)
    email = Column(String)
    phone = Column(String)
    status = Column(String, default='Active')
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="clients")
    metrics = relationship("ClientMetric", back_populates="client")
    
    @property
    def utilization_rate(self):
        """Calculate utilization rate dynamically based on total_users and total_licenses"""
        if self.total_licenses and self.total_licenses > 0:
            return round((self.total_users / self.total_licenses) * 100, 2) if self.total_users else 0
        return 0

class ClientMetric(Base):
    __tablename__ = "client_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    metric_type = Column(String)  # 'revenue', 'support_tickets', 'satisfaction'
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="metrics")

class SoftwareLicense(Base):
    __tablename__ = "software_licenses"
    
    id = Column(Integer, primary_key=True, index=True)
    software_name = Column(String, nullable=False)
    vendor = Column(String)
    category = Column(String)  # Productivity, Development, Communication, Security, Other
    total_licenses = Column(Integer)
    active_users = Column(Integer)
    utilization_percent = Column(Float)
    monthly_cost = Column(Float)
    annual_cost = Column(Float)
    department = Column(String)
    renewal_date = Column(DateTime)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="software_licenses")
    usage_logs = relationship("LicenseUsage", back_populates="license")

class LicenseUsage(Base):
    __tablename__ = "license_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    license_id = Column(Integer, ForeignKey("software_licenses.id"))
    user_email = Column(String)
    last_login = Column(DateTime)
    usage_hours = Column(Float)
    is_active = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    license = relationship("SoftwareLicense", back_populates="usage_logs")

class CostAnomaly(Base):
    __tablename__ = "cost_anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    software_name = Column(String)
    expected_cost = Column(Float)
    actual_cost = Column(Float)
    variance_percent = Column(Float)
    severity = Column(String)  # 'low', 'medium', 'high'
    cause = Column(Text)
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    recommendation_type = Column(String)  # 'upsell', 'cost_saving', 'churn_prevention'
    title = Column(String)
    description = Column(Text)
    potential_value = Column(Float)
    priority = Column(String)  # 'low', 'medium', 'high'
    status = Column(String, default='pending')  # 'pending', 'implemented', 'dismissed'
    meta_data = Column(JSON)  # Renamed from 'metadata' to avoid SQLAlchemy reserved keyword
    created_at = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String)  # 'critical', 'warning', 'action', 'support', 'usage'
    title = Column(String, nullable=False)
    description = Column(Text)
    client_id = Column(String)
    client_name = Column(String)
    impact = Column(String)
    priority = Column(String)  # 'Critical', 'High', 'Medium', 'Low'
    action_label = Column(String)
    action_route = Column(String)
    details = Column(Text)
    due_date = Column(String)
    status = Column(String, default='active')  # 'active', 'resolved', 'dismissed'
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    owner_id = Column(Integer, ForeignKey("users.id"))