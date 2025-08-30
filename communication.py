from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Communication(db.Model):
    __tablename__ = 'communications'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    
    # Communication details
    type = db.Column(db.String(20), nullable=False)  # 'email', 'phone', 'whatsapp', 'sms', 'meeting', 'note'
    direction = db.Column(db.String(10), nullable=False)  # 'inbound', 'outbound'
    subject = db.Column(db.String(200))
    content = db.Column(db.Text, nullable=False)
    
    # Contact information
    contact_person = db.Column(db.String(100))
    contact_method = db.Column(db.String(100))  # email address, phone number, etc.
    
    # Status and follow-up
    status = db.Column(db.String(20), default='completed')  # 'pending', 'completed', 'follow_up_required'
    follow_up_date = db.Column(db.DateTime)
    follow_up_completed = db.Column(db.Boolean, default=False)
    
    # Timestamps
    communication_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Additional metadata
    tags = db.Column(db.String(200))  # comma-separated tags for categorization
    is_important = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'order_id': self.order_id,
            'type': self.type,
            'direction': self.direction,
            'subject': self.subject,
            'content': self.content,
            'contact_person': self.contact_person,
            'contact_method': self.contact_method,
            'status': self.status,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'follow_up_completed': self.follow_up_completed,
            'communication_date': self.communication_date.isoformat() if self.communication_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'tags': self.tags,
            'is_important': self.is_important
        }
    
    def __repr__(self):
        return f'<Communication {self.type}: {self.subject}>'

