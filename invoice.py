from src.models.user import db
from datetime import datetime, timedelta

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    status = db.Column(db.String(20), nullable=False, default='draft')  # draft, sent, paid, overdue
    amount_net = db.Column(db.Float, nullable=False, default=0)
    tax_rate = db.Column(db.Float, nullable=False, default=19.0)
    amount_tax = db.Column(db.Float, nullable=False, default=0)
    amount_total = db.Column(db.Float, nullable=False, default=0)
    due_date = db.Column(db.Date, nullable=False)
    paid_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    reminder_count = db.Column(db.Integer, default=0)
    last_reminder_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    customer = db.relationship('Customer', backref='invoices')
    order = db.relationship('Order', backref='invoices')
    items = db.relationship('InvoiceItem', backref='invoice', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'customer_id': self.customer_id,
            'customer_name': f"{self.customer.first_name} {self.customer.last_name}" if self.customer else None,
            'order_id': self.order_id,
            'order_title': self.order.title if self.order else None,
            'status': self.status,
            'amount_net': self.amount_net,
            'tax_rate': self.tax_rate,
            'amount_tax': self.amount_tax,
            'amount_total': self.amount_total,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'paid_date': self.paid_date.isoformat() if self.paid_date else None,
            'notes': self.notes,
            'reminder_count': self.reminder_count,
            'last_reminder_date': self.last_reminder_date.isoformat() if self.last_reminder_date else None,
            'days_overdue': self.get_days_overdue(),
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def get_days_overdue(self):
        if self.status == 'paid' or not self.due_date:
            return 0
        today = datetime.now().date()
        if today > self.due_date:
            return (today - self.due_date).days
        return 0
    
    def calculate_totals(self):
        self.amount_net = sum(item.amount for item in self.items)
        self.amount_tax = self.amount_net * (self.tax_rate / 100)
        self.amount_total = self.amount_net + self.amount_tax

class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=1)
    unit = db.Column(db.String(20), nullable=False, default='Stk')
    unit_price = db.Column(db.Float, nullable=False, default=0)
    amount = db.Column(db.Float, nullable=False, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'description': self.description,
            'quantity': self.quantity,
            'unit': self.unit,
            'unit_price': self.unit_price,
            'amount': self.amount
        }
    
    def calculate_amount(self):
        self.amount = self.quantity * self.unit_price

class PaymentReminder(db.Model):
    __tablename__ = 'payment_reminders'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    reminder_type = db.Column(db.String(20), nullable=False)  # friendly, urgent, final
    sent_date = db.Column(db.Date, nullable=False)
    template_used = db.Column(db.String(50))
    notes = db.Column(db.Text)
    
    # Relationship
    invoice = db.relationship('Invoice', backref='reminders')
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'reminder_type': self.reminder_type,
            'sent_date': self.sent_date.isoformat() if self.sent_date else None,
            'template_used': self.template_used,
            'notes': self.notes
        }

