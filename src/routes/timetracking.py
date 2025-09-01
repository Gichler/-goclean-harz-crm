from flask import Blueprint, request, jsonify
from src.models.customer import Customer
from src.models.order import Order
from src.models.timetracking import TimeEntry
from src.models.user import db
from datetime import datetime, timedelta
import json

timetracking_bp = Blueprint('timetracking', __name__)

@timetracking_bp.route('/time-entries', methods=['GET'])
def get_time_entries():
    """Get all time entries with optional filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        user_id = request.args.get('user_id', type=int)
        order_id = request.args.get('order_id', type=int)
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        query = TimeEntry.query
        
        if user_id:
            query = query.filter(TimeEntry.user_id == user_id)
        if order_id:
            query = query.filter(TimeEntry.order_id == order_id)
        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from)
                query = query.filter(TimeEntry.start_time >= date_from_obj)
            except ValueError:
                pass
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to)
                query = query.filter(TimeEntry.end_time <= date_to_obj)
            except ValueError:
                pass
            
        query = query.order_by(TimeEntry.start_time.desc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        time_entries = []
        for entry in pagination.items:
            customer = Customer.query.get(entry.customer_id) if entry.customer_id else None
            order = Order.query.get(entry.order_id) if entry.order_id else None
            
            # Calculate duration
            duration = None
            if entry.start_time and entry.end_time:
                duration = (entry.end_time - entry.start_time).total_seconds() / 3600  # hours
            
            entry_data = {
                'id': entry.id,
                'user_id': entry.user_id,
                'user_name': entry.user_name,
                'customer_id': entry.customer_id,
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
                'order_id': entry.order_id,
                'order_title': order.title if order else None,
                'start_time': entry.start_time.isoformat() if entry.start_time else None,
                'end_time': entry.end_time.isoformat() if entry.end_time else None,
                'duration': duration,
                'description': entry.description,
                'activity_type': entry.activity_type,
                'status': entry.status,
                'created_at': entry.created_at.isoformat(),
                'updated_at': entry.updated_at.isoformat()
            }
            time_entries.append(entry_data)
        
        return jsonify({
            'time_entries': time_entries,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@timetracking_bp.route('/time-entries/<int:entry_id>', methods=['GET'])
def get_time_entry(entry_id):
    """Get a specific time entry by ID"""
    try:
        entry = TimeEntry.query.get_or_404(entry_id)
        customer = Customer.query.get(entry.customer_id) if entry.customer_id else None
        order = Order.query.get(entry.order_id) if entry.order_id else None
        
        # Calculate duration
        duration = None
        if entry.start_time and entry.end_time:
            duration = (entry.end_time - entry.start_time).total_seconds() / 3600  # hours
        
        entry_data = {
            'id': entry.id,
            'user_id': entry.user_id,
            'user_name': entry.user_name,
            'customer_id': entry.customer_id,
            'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
            'order_id': entry.order_id,
            'order_title': order.title if order else None,
            'start_time': entry.start_time.isoformat() if entry.start_time else None,
            'end_time': entry.end_time.isoformat() if entry.end_time else None,
            'duration': duration,
            'description': entry.description,
            'activity_type': entry.activity_type,
            'status': entry.status,
            'notes': entry.notes,
            'created_at': entry.created_at.isoformat(),
            'updated_at': entry.updated_at.isoformat()
        }
        
        return jsonify(entry_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@timetracking_bp.route('/time-entries', methods=['POST'])
def create_time_entry():
    """Create a new time entry"""
    try:
        data = request.get_json()
        
        # Parse datetime fields
        start_time = None
        end_time = None
        
        if data.get('start_time'):
            try:
                start_time = datetime.fromisoformat(data['start_time'])
            except ValueError:
                start_time = datetime.now()
        
        if data.get('end_time'):
            try:
                end_time = datetime.fromisoformat(data['end_time'])
            except ValueError:
                end_time = None
        
        # Create time entry
        time_entry = TimeEntry(
            user_id=data['user_id'],
            user_name=data.get('user_name', ''),
            customer_id=data.get('customer_id'),
            order_id=data.get('order_id'),
            start_time=start_time,
            end_time=end_time,
            description=data.get('description', ''),
            activity_type=data.get('activity_type', 'work'),
            status=data.get('status', 'active'),
            notes=data.get('notes', '')
        )
        
        db.session.add(time_entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Time entry created successfully',
            'entry_id': time_entry.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@timetracking_bp.route('/time-entries/<int:entry_id>', methods=['PUT'])
def update_time_entry(entry_id):
    """Update an existing time entry"""
    try:
        entry = TimeEntry.query.get_or_404(entry_id)
        data = request.get_json()
        
        # Update basic fields
        if 'start_time' in data:
            try:
                entry.start_time = datetime.fromisoformat(data['start_time']) if data['start_time'] else None
            except ValueError:
                pass
        if 'end_time' in data:
            try:
                entry.end_time = datetime.fromisoformat(data['end_time']) if data['end_time'] else None
            except ValueError:
                pass
        if 'description' in data:
            entry.description = data['description']
        if 'activity_type' in data:
            entry.activity_type = data['activity_type']
        if 'status' in data:
            entry.status = data['status']
        if 'notes' in data:
            entry.notes = data['notes']
        if 'user_name' in data:
            entry.user_name = data['user_name']
        
        entry.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Time entry updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@timetracking_bp.route('/time-entries/<int:entry_id>', methods=['DELETE'])
def delete_time_entry(entry_id):
    """Delete a time entry"""
    try:
        entry = TimeEntry.query.get_or_404(entry_id)
        db.session.delete(entry)
        db.session.commit()
        
        return jsonify({'message': 'Time entry deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@timetracking_bp.route('/time-entries/<int:entry_id>/stop', methods=['POST'])
def stop_time_entry(entry_id):
    """Stop a running time entry"""
    try:
        entry = TimeEntry.query.get_or_404(entry_id)
        
        if entry.status == 'active' and entry.start_time and not entry.end_time:
            entry.end_time = datetime.utcnow()
            entry.status = 'completed'
            entry.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': 'Time entry stopped successfully',
                'duration': (entry.end_time - entry.start_time).total_seconds() / 3600
            })
        else:
            return jsonify({'error': 'Time entry is not active or already stopped'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@timetracking_bp.route('/time-entries/start', methods=['POST'])
def start_time_entry():
    """Start a new time entry"""
    try:
        data = request.get_json()
        
        # Check if user already has an active time entry
        active_entry = TimeEntry.query.filter_by(
            user_id=data['user_id'],
            status='active'
        ).first()
        
        if active_entry:
            return jsonify({'error': 'User already has an active time entry'}), 400
        
        # Create new time entry
        time_entry = TimeEntry(
            user_id=data['user_id'],
            user_name=data.get('user_name', ''),
            customer_id=data.get('customer_id'),
            order_id=data.get('order_id'),
            start_time=datetime.now(),
            description=data.get('description', ''),
            activity_type=data.get('activity_type', 'work'),
            status='active',
            notes=data.get('notes', '')
        )
        
        db.session.add(time_entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Time entry started successfully',
            'entry_id': time_entry.id,
            'start_time': time_entry.start_time.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@timetracking_bp.route('/time-entries/statistics', methods=['GET'])
def get_timetracking_statistics():
    """Get time tracking statistics"""
    try:
        # Total hours by user for current month
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_month = (current_month + timedelta(days=32)).replace(day=1)
        
        user_hours = db.session.query(
            TimeEntry.user_id,
            TimeEntry.user_name,
            db.func.sum(
                db.func.extract('epoch', TimeEntry.end_time - TimeEntry.start_time) / 3600
            ).label('total_hours')
        ).filter(
            TimeEntry.start_time >= current_month,
            TimeEntry.start_time < next_month,
            TimeEntry.status == 'completed'
        ).group_by(TimeEntry.user_id, TimeEntry.user_name).all()
        
        # Total hours by activity type
        activity_hours = db.session.query(
            TimeEntry.activity_type,
            db.func.sum(
                db.func.extract('epoch', TimeEntry.end_time - TimeEntry.start_time) / 3600
            ).label('total_hours')
        ).filter(
            TimeEntry.status == 'completed'
        ).group_by(TimeEntry.activity_type).all()
        
        # Active time entries
        active_entries = TimeEntry.query.filter_by(status='active').count()
        
        # Recent time entries
        recent_entries = TimeEntry.query.order_by(
            TimeEntry.created_at.desc()
        ).limit(5).all()
        
        recent_data = []
        for entry in recent_entries:
            customer = Customer.query.get(entry.customer_id) if entry.customer_id else None
            recent_data.append({
                'id': entry.id,
                'user_name': entry.user_name,
                'activity_type': entry.activity_type,
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
                'start_time': entry.start_time.isoformat() if entry.start_time else None,
                'status': entry.status
            })
        
        return jsonify({
            'user_hours': {f"{item.user_name}": float(item.total_hours) for item in user_hours},
            'activity_hours': {item.activity_type: float(item.total_hours) for item in activity_hours},
            'active_entries': active_entries,
            'recent_entries': recent_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@timetracking_bp.route('/time-entries/report', methods=['GET'])
def get_timetracking_report():
    """Get time tracking report for a specific period"""
    try:
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        user_id = request.args.get('user_id', type=int)
        
        if not date_from or not date_to:
            return jsonify({'error': 'Date range required'}), 400
        
        try:
            start_date = datetime.fromisoformat(date_from)
            end_date = datetime.fromisoformat(date_to)
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
        
        query = TimeEntry.query.filter(
            TimeEntry.start_time >= start_date,
            TimeEntry.start_time <= end_date,
            TimeEntry.status == 'completed'
        )
        
        if user_id:
            query = query.filter(TimeEntry.user_id == user_id)
        
        entries = query.all()
        
        report_data = []
        total_hours = 0
        
        for entry in entries:
            customer = Customer.query.get(entry.customer_id) if entry.customer_id else None
            order = Order.query.get(entry.order_id) if entry.order_id else None
            
            duration = (entry.end_time - entry.start_time).total_seconds() / 3600
            total_hours += duration
            
            entry_data = {
                'date': entry.start_time.date().isoformat(),
                'user_name': entry.user_name,
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
                'order_title': order.title if order else None,
                'activity_type': entry.activity_type,
                'start_time': entry.start_time.strftime('%H:%M'),
                'end_time': entry.end_time.strftime('%H:%M'),
                'duration': round(duration, 2),
                'description': entry.description
            }
            report_data.append(entry_data)
        
        return jsonify({
            'report_data': report_data,
            'total_hours': round(total_hours, 2),
            'period': {
                'from': date_from,
                'to': date_to
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
