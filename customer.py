from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_number = db.Column(db.String(20), unique=True, nullable=False)
    company_name = db.Column(db.String(200))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    mobile = db.Column(db.String(20))
    
    # Address information
    street = db.Column(db.String(200))
    house_number = db.Column(db.String(10))
    postal_code = db.Column(db.String(10))
    city = db.Column(db.String(100))
    
    # Customer type and preferences
    customer_type = db.Column(db.String(50))  # 'private', 'business'
    preferred_contact_method = db.Column(db.String(20))  # 'email', 'phone', 'whatsapp'
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    orders = db.relationship('Order', backref='customer', lazy=True)
    communications = db.relationship('Communication', backref='customer', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_number': self.customer_number,
            'company_name': self.company_name,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'mobile': self.mobile,
            'street': self.street,
            'house_number': self.house_number,
            'postal_code': self.postal_code,
            'city': self.city,
            'customer_type': self.customer_type,
            'preferred_contact_method': self.preferred_contact_method,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }
    
    def __repr__(self):
        return f'<Customer {self.customer_number}: {self.first_name} {self.last_name}>'

