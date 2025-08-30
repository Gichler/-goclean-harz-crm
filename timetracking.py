from src.models.user import db
from datetime import datetime, timedelta

class TimeEntry(db.Model):
    __tablename__ = 'time_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_name = db.Column(db.String(100), nullable=False)
    task_title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    break_duration = db.Column(db.Integer, default=0)  # in minutes
    location = db.Column(db.String(200))
    hourly_rate = db.Column(db.Float, default=18.50)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))
    is_active = db.Column(db.Boolean, default=False)  # Currently running timer
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    order = db.relationship('Order', backref='time_entries')
    customer = db.relationship('Customer', backref='time_entries')
    
    def to_dict(self):
        return {
            'id': self.id,
            'employee_name': self.employee_name,
            'task_title': self.task_title,
            'description': self.description,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'break_duration': self.break_duration,
            'location': self.location,
            'hourly_rate': self.hourly_rate,
            'order_id': self.order_id,
            'order_title': self.order.title if self.order else None,
            'customer_id': self.customer_id,
            'customer_name': f"{self.customer.first_name} {self.customer.last_name}" if self.customer else None,
            'is_active': self.is_active,
            'duration_hours': self.get_duration_hours(),
            'earnings': self.get_earnings(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def get_duration_hours(self):
        if not self.start_time:
            return 0
        
        end_time = self.end_time or datetime.utcnow()
        duration = end_time - self.start_time
        duration_minutes = duration.total_seconds() / 60 - self.break_duration
        return max(0, duration_minutes / 60)
    
    def get_earnings(self):
        return round(self.get_duration_hours() * self.hourly_rate, 2)

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)  # cleaning, garden, winter
    priority = db.Column(db.String(20), default='normal')  # low, normal, high
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed
    estimated_hours = db.Column(db.Float, default=0)
    actual_hours = db.Column(db.Float, default=0)
    assigned_to = db.Column(db.String(100))
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))
    due_date = db.Column(db.Date)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    order = db.relationship('Order', backref='tasks')
    customer = db.relationship('Customer', backref='tasks')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'priority': self.priority,
            'status': self.status,
            'estimated_hours': self.estimated_hours,
            'actual_hours': self.actual_hours,
            'assigned_to': self.assigned_to,
            'order_id': self.order_id,
            'order_title': self.order.title if self.order else None,
            'customer_id': self.customer_id,
            'customer_name': f"{self.customer.first_name} {self.customer.last_name}" if self.customer else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'is_overdue': self.is_overdue(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def is_overdue(self):
        if not self.due_date or self.status == 'completed':
            return False
        return datetime.now().date() > self.due_date

class WorkSchedule(db.Model):
    __tablename__ = 'work_schedules'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    break_duration = db.Column(db.Integer, default=30)  # in minutes
    location = db.Column(db.String(200))
    notes = db.Column(db.Text)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, in_progress, completed, cancelled
    
    def to_dict(self):
        return {
            'id': self.id,
            'employee_name': self.employee_name,
            'date': self.date.isoformat() if self.date else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'break_duration': self.break_duration,
            'location': self.location,
            'notes': self.notes,
            'status': self.status,
            'planned_hours': self.get_planned_hours()
        }
    
    def get_planned_hours(self):
        if not self.start_time or not self.end_time:
            return 0
        
        start_datetime = datetime.combine(datetime.today(), self.start_time)
        end_datetime = datetime.combine(datetime.today(), self.end_time)
        duration = end_datetime - start_datetime
        duration_minutes = duration.total_seconds() / 60 - self.break_duration
        return max(0, duration_minutes / 60)

