from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Basic information
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(50), unique=True)
    
    # Quantity and pricing
    quantity = db.Column(db.Integer, default=0)
    unit = db.Column(db.String(20), default='Stück')
    unit_price = db.Column(db.Float, default=0.0)
    reorder_point = db.Column(db.Integer, default=0)
    
    # Supplier and location
    supplier = db.Column(db.String(200))
    location = db.Column(db.String(100))
    
    # Status
    status = db.Column(db.String(20), default='active')  # 'active', 'inactive', 'discontinued'
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_updated = db.Column(db.DateTime)
    
    # Relationships
    transactions = db.relationship('InventoryTransaction', backref='item', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'sku': self.sku,
            'quantity': self.quantity,
            'unit': self.unit,
            'unit_price': self.unit_price,
            'reorder_point': self.reorder_point,
            'supplier': self.supplier,
            'location': self.location,
            'status': self.status,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<InventoryItem {self.name}: {self.quantity} {self.unit}>'


class InventoryTransaction(db.Model):
    __tablename__ = 'inventory_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('inventory_items.id'), nullable=False)
    
    # Transaction details
    transaction_type = db.Column(db.String(20), nullable=False)  # 'in', 'out', 'adjustment', 'transfer'
    quantity = db.Column(db.Integer, nullable=False)
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Additional information
    notes = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_id': self.item_id,
            'transaction_type': self.transaction_type,
            'quantity': self.quantity,
            'transaction_date': self.transaction_date.isoformat() if self.transaction_date else None,
            'notes': self.notes,
            'user_id': self.user_id
        }
    
    def __repr__(self):
        return f'<InventoryTransaction {self.transaction_type}: {self.quantity}>'
