from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class QualityCheck(db.Model):
    __tablename__ = 'quality_checks'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=True)
    inspector_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Quality check details
    check_date = db.Column(db.DateTime, default=datetime.utcnow)
    check_type = db.Column(db.String(50), nullable=False)  # 'cleaning', 'maintenance', 'inspection', 'final'
    overall_score = db.Column(db.Float, default=0.0)  # 0-100 scale
    
    # Status
    status = db.Column(db.String(20), default='pending')  # 'pending', 'in_progress', 'completed', 'failed'
    
    # Detailed results
    check_details = db.Column(db.Text)  # JSON string with detailed criteria scores
    recommendations = db.Column(db.Text)
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Inspector information
    inspector_name = db.Column(db.String(100))
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'customer_id': self.customer_id,
            'inspector_id': self.inspector_id,
            'inspector_name': self.inspector_name,
            'check_date': self.check_date.isoformat() if self.check_date else None,
            'check_type': self.check_type,
            'overall_score': self.overall_score,
            'status': self.status,
            'check_details': self.check_details,
            'recommendations': self.recommendations,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<QualityCheck {self.check_type}: {self.overall_score}%>'
