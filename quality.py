from src.models.user import db
from datetime import datetime

class QualityChecklist(db.Model):
    __tablename__ = 'quality_checklists'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # cleaning, garden, winter
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    items = db.relationship('QualityChecklistItem', backref='checklist', cascade='all, delete-orphan')
    inspections = db.relationship('QualityInspection', backref='checklist')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'is_active': self.is_active,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class QualityChecklistItem(db.Model):
    __tablename__ = 'quality_checklist_items'
    
    id = db.Column(db.Integer, primary_key=True)
    checklist_id = db.Column(db.Integer, db.ForeignKey('quality_checklists.id'), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    is_required = db.Column(db.Boolean, default=True)
    order_index = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'checklist_id': self.checklist_id,
            'description': self.description,
            'is_required': self.is_required,
            'order_index': self.order_index
        }

class QualityInspection(db.Model):
    __tablename__ = 'quality_inspections'
    
    id = db.Column(db.Integer, primary_key=True)
    inspection_number = db.Column(db.String(50), unique=True, nullable=False)
    checklist_id = db.Column(db.Integer, db.ForeignKey('quality_checklists.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))
    inspector_name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    overall_rating = db.Column(db.Integer, default=5)  # 1-5 stars
    completion_rate = db.Column(db.Float, default=0)  # Percentage
    defect_count = db.Column(db.Integer, default=0)
    photo_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='in_progress')  # in_progress, completed
    notes = db.Column(db.Text)
    inspection_date = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Relationships
    order = db.relationship('Order', backref='quality_inspections')
    customer = db.relationship('Customer', backref='quality_inspections')
    results = db.relationship('QualityInspectionResult', backref='inspection', cascade='all, delete-orphan')
    photos = db.relationship('QualityPhoto', backref='inspection', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'inspection_number': self.inspection_number,
            'checklist_id': self.checklist_id,
            'checklist_name': self.checklist.name if self.checklist else None,
            'order_id': self.order_id,
            'order_title': self.order.title if self.order else None,
            'customer_id': self.customer_id,
            'customer_name': f"{self.customer.first_name} {self.customer.last_name}" if self.customer else None,
            'inspector_name': self.inspector_name,
            'location': self.location,
            'overall_rating': self.overall_rating,
            'completion_rate': self.completion_rate,
            'defect_count': self.defect_count,
            'photo_count': self.photo_count,
            'status': self.status,
            'notes': self.notes,
            'results': [result.to_dict() for result in self.results],
            'photos': [photo.to_dict() for photo in self.photos],
            'inspection_date': self.inspection_date.isoformat() if self.inspection_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def calculate_completion_rate(self):
        if not self.results:
            return 0
        
        total_items = len(self.results)
        completed_items = sum(1 for result in self.results if result.status in ['ok', 'defect'])
        self.completion_rate = (completed_items / total_items) * 100 if total_items > 0 else 0
        
        # Count defects
        self.defect_count = sum(1 for result in self.results if result.status == 'defect')

class QualityInspectionResult(db.Model):
    __tablename__ = 'quality_inspection_results'
    
    id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey('quality_inspections.id'), nullable=False)
    checklist_item_id = db.Column(db.Integer, db.ForeignKey('quality_checklist_items.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # ok, defect, not_checked
    notes = db.Column(db.Text)
    
    # Relationship
    checklist_item = db.relationship('QualityChecklistItem')
    
    def to_dict(self):
        return {
            'id': self.id,
            'inspection_id': self.inspection_id,
            'checklist_item_id': self.checklist_item_id,
            'item_description': self.checklist_item.description if self.checklist_item else None,
            'status': self.status,
            'notes': self.notes
        }

class QualityPhoto(db.Model):
    __tablename__ = 'quality_photos'
    
    id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey('quality_inspections.id'), nullable=False)
    filename = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(200))
    photo_type = db.Column(db.String(20), default='general')  # before, after, defect, general
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'inspection_id': self.inspection_id,
            'filename': self.filename,
            'description': self.description,
            'photo_type': self.photo_type,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

