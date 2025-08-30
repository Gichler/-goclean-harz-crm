from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from src.models.user import db

class Quote(db.Model):
    __tablename__ = 'quotes'
    
    id = db.Column(db.Integer, primary_key=True)
    quote_number = db.Column(db.String(20), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    # Quote details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    service_type = db.Column(db.String(50), nullable=False)
    
    # Location details
    service_street = db.Column(db.String(200))
    service_house_number = db.Column(db.String(10))
    service_postal_code = db.Column(db.String(10))
    service_city = db.Column(db.String(100))
    
    # Pricing
    subtotal = db.Column(db.Float, nullable=False, default=0.0)
    tax_rate = db.Column(db.Float, default=19.0)  # 19% MwSt
    tax_amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    
    # Status and validity
    status = db.Column(db.String(20), default='draft')  # 'draft', 'sent', 'accepted', 'rejected', 'expired'
    valid_until = db.Column(db.Date)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sent_at = db.Column(db.DateTime)
    accepted_at = db.Column(db.DateTime)
    
    # Additional information
    notes = db.Column(db.Text)
    terms_conditions = db.Column(db.Text)
    
    # Relationships
    quote_items = db.relationship('QuoteItem', backref='quote', lazy=True, cascade='all, delete-orphan')
    
    def calculate_totals(self):
        """Calculate subtotal, tax, and total amounts based on quote items"""
        self.subtotal = sum(item.total_price for item in self.quote_items)
        self.tax_amount = self.subtotal * (self.tax_rate / 100)
        self.total_amount = self.subtotal + self.tax_amount
    
    def to_dict(self):
        return {
            'id': self.id,
            'quote_number': self.quote_number,
            'customer_id': self.customer_id,
            'title': self.title,
            'description': self.description,
            'service_type': self.service_type,
            'service_street': self.service_street,
            'service_house_number': self.service_house_number,
            'service_postal_code': self.service_postal_code,
            'service_city': self.service_city,
            'subtotal': self.subtotal,
            'tax_rate': self.tax_rate,
            'tax_amount': self.tax_amount,
            'total_amount': self.total_amount,
            'status': self.status,
            'valid_until': self.valid_until.isoformat() if self.valid_until else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
            'notes': self.notes,
            'terms_conditions': self.terms_conditions,
            'quote_items': [item.to_dict() for item in self.quote_items]
        }
    
    def __repr__(self):
        return f'<Quote {self.quote_number}: {self.title}>'


class QuoteItem(db.Model):
    __tablename__ = 'quote_items'
    
    id = db.Column(db.Integer, primary_key=True)
    quote_id = db.Column(db.Integer, db.ForeignKey('quotes.id'), nullable=False)
    
    # Item details
    description = db.Column(db.String(500), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=1.0)
    unit = db.Column(db.String(20), default='Stück')  # 'Stück', 'Stunden', 'm²', etc.
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    
    # Additional details
    notes = db.Column(db.Text)
    sort_order = db.Column(db.Integer, default=0)
    
    def calculate_total(self):
        """Calculate total price based on quantity and unit price"""
        self.total_price = self.quantity * self.unit_price
    
    def to_dict(self):
        return {
            'id': self.id,
            'quote_id': self.quote_id,
            'description': self.description,
            'quantity': self.quantity,
            'unit': self.unit,
            'unit_price': self.unit_price,
            'total_price': self.total_price,
            'notes': self.notes,
            'sort_order': self.sort_order
        }
    
    def __repr__(self):
        return f'<QuoteItem {self.description}: {self.total_price}€>'


class QuoteTemplate(db.Model):
    __tablename__ = 'quote_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    
    # Default values
    default_title = db.Column(db.String(200))
    default_description = db.Column(db.Text)
    default_terms_conditions = db.Column(db.Text)
    default_validity_days = db.Column(db.Integer, default=30)
    
    # Template items
    template_items = db.relationship('QuoteTemplateItem', backref='template', lazy=True, cascade='all, delete-orphan')
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'service_type': self.service_type,
            'description': self.description,
            'default_title': self.default_title,
            'default_description': self.default_description,
            'default_terms_conditions': self.default_terms_conditions,
            'default_validity_days': self.default_validity_days,
            'template_items': [item.to_dict() for item in self.template_items],
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<QuoteTemplate {self.name}>'


class QuoteTemplateItem(db.Model):
    __tablename__ = 'quote_template_items'
    
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('quote_templates.id'), nullable=False)
    
    # Item details
    description = db.Column(db.String(500), nullable=False)
    default_quantity = db.Column(db.Float, default=1.0)
    unit = db.Column(db.String(20), default='Stück')
    unit_price = db.Column(db.Float, nullable=False)
    
    # Additional details
    notes = db.Column(db.Text)
    sort_order = db.Column(db.Integer, default=0)
    is_optional = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'template_id': self.template_id,
            'description': self.description,
            'default_quantity': self.default_quantity,
            'unit': self.unit,
            'unit_price': self.unit_price,
            'notes': self.notes,
            'sort_order': self.sort_order,
            'is_optional': self.is_optional
        }
    
    def __repr__(self):
        return f'<QuoteTemplateItem {self.description}>'

