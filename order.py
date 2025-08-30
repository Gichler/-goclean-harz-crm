from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    # Order details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    service_type = db.Column(db.String(50), nullable=False)  # 'building_cleaning', 'garden_maintenance', 'winter_service'
    
    # Address (can be different from customer address)
    service_street = db.Column(db.String(200))
    service_house_number = db.Column(db.String(10))
    service_postal_code = db.Column(db.String(10))
    service_city = db.Column(db.String(100))
    
    # Scheduling
    scheduled_date = db.Column(db.Date)
    scheduled_time = db.Column(db.Time)
    estimated_duration = db.Column(db.Integer)  # in minutes
    
    # Status and progress
    status = db.Column(db.String(20), default='pending')  # 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
    priority = db.Column(db.String(10), default='normal')  # 'low', 'normal', 'high', 'urgent'
    
    # Financial
    estimated_price = db.Column(db.Float)
    final_price = db.Column(db.Float)
    is_recurring = db.Column(db.Boolean, default=False)
    recurring_interval = db.Column(db.String(20))  # 'weekly', 'monthly', 'quarterly'
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Special instructions
    special_instructions = db.Column(db.Text)
    access_instructions = db.Column(db.Text)
    
    # Relationships
    communications = db.relationship('Communication', backref='order', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'customer_id': self.customer_id,
            'title': self.title,
            'description': self.description,
            'service_type': self.service_type,
            'service_street': self.service_street,
            'service_house_number': self.service_house_number,
            'service_postal_code': self.service_postal_code,
            'service_city': self.service_city,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'estimated_duration': self.estimated_duration,
            'status': self.status,
            'priority': self.priority,
            'estimated_price': self.estimated_price,
            'final_price': self.final_price,
            'is_recurring': self.is_recurring,
            'recurring_interval': self.recurring_interval,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'special_instructions': self.special_instructions,
            'access_instructions': self.access_instructions
        }
    
    def __repr__(self):
        return f'<Order {self.order_number}: {self.title}>'


class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # 'building_cleaning', 'garden_maintenance', 'winter_service'
    description = db.Column(db.Text)
    base_price = db.Column(db.Float)
    price_unit = db.Column(db.String(20))  # 'per_hour', 'per_sqm', 'fixed'
    estimated_duration = db.Column(db.Integer)  # in minutes
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'base_price': self.base_price,
            'price_unit': self.price_unit,
            'estimated_duration': self.estimated_duration,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Service {self.name}>'

