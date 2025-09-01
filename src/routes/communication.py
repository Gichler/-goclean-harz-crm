from flask import Blueprint, request, jsonify
from src.models.customer import Customer
from src.models.order import Order
from src.models.communication import Communication
from src.models.user import db
from datetime import datetime
import json

communication_bp = Blueprint('communication', __name__)

@communication_bp.route('/communications', methods=['GET'])
def get_communications():
    """Get all communications with optional filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        type_filter = request.args.get('type', '')
        status_filter = request.args.get('status', '')
        customer_id = request.args.get('customer_id', type=int)
        order_id = request.args.get('order_id', type=int)
        
        query = Communication.query
        
        if type_filter:
            query = query.filter(Communication.type == type_filter)
        if status_filter:
            query = query.filter(Communication.status == status_filter)
        if customer_id:
            query = query.filter(Communication.customer_id == customer_id)
        if order_id:
            query = query.filter(Communication.order_id == order_id)
            
        query = query.order_by(Communication.created_at.desc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        communications = []
        for comm in pagination.items:
            customer = Customer.query.get(comm.customer_id)
            order = Order.query.get(comm.order_id) if comm.order_id else None
            
            comm_data = {
                'id': comm.id,
                'customer_id': comm.customer_id,
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
                'order_id': comm.order_id,
                'order_title': order.title if order else None,
                'type': comm.type,
                'direction': comm.direction,
                'subject': comm.subject,
                'content': comm.content,
                'contact_person': comm.contact_person,
                'contact_method': comm.contact_method,
                'status': comm.status,
                'follow_up_date': comm.follow_up_date.isoformat() if comm.follow_up_date else None,
                'tags': comm.tags,
                'is_important': comm.is_important,
                'created_at': comm.created_at.isoformat(),
                'updated_at': comm.updated_at.isoformat()
            }
            communications.append(comm_data)
        
        return jsonify({
            'communications': communications,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/communications/<int:communication_id>', methods=['GET'])
def get_communication(communication_id):
    """Get a specific communication by ID"""
    try:
        comm = Communication.query.get_or_404(communication_id)
        customer = Customer.query.get(comm.customer_id)
        order = Order.query.get(comm.order_id) if comm.order_id else None
        
        comm_data = {
            'id': comm.id,
            'customer_id': comm.customer_id,
            'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
            'customer_email': customer.email if customer else "",
            'customer_phone': customer.phone if customer else "",
            'order_id': comm.order_id,
            'order_title': order.title if order else None,
            'type': comm.type,
            'direction': comm.direction,
            'subject': comm.subject,
            'content': comm.content,
            'contact_person': comm.contact_person,
            'contact_method': comm.contact_method,
            'status': comm.status,
            'follow_up_date': comm.follow_up_date.isoformat() if comm.follow_up_date else None,
            'tags': comm.tags,
            'is_important': comm.is_important,
            'created_at': comm.created_at.isoformat(),
            'updated_at': comm.updated_at.isoformat()
        }
        
        return jsonify(comm_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/communications', methods=['POST'])
def create_communication():
    """Create a new communication"""
    try:
        data = request.get_json()
        
        # Parse follow_up_date if provided
        follow_up_date = None
        if data.get('follow_up_date'):
            try:
                follow_up_date = datetime.fromisoformat(data['follow_up_date'])
            except ValueError:
                follow_up_date = None
        
        communication = Communication(
            customer_id=data['customer_id'],
            order_id=data.get('order_id'),
            type=data['type'],
            direction=data.get('direction', 'outbound'),
            subject=data.get('subject', ''),
            content=data['content'],
            contact_person=data.get('contact_person', ''),
            contact_method=data.get('contact_method', ''),
            status=data.get('status', 'completed'),
            follow_up_date=follow_up_date,
            tags=data.get('tags', ''),
            is_important=data.get('is_important', False)
        )
        
        db.session.add(communication)
        db.session.commit()
        
        return jsonify({
            'message': 'Communication created successfully',
            'communication_id': communication.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/communications/<int:communication_id>', methods=['PUT'])
def update_communication(communication_id):
    """Update an existing communication"""
    try:
        communication = Communication.query.get_or_404(communication_id)
        data = request.get_json()
        
        # Update basic fields
        if 'subject' in data:
            communication.subject = data['subject']
        if 'content' in data:
            communication.content = data['content']
        if 'contact_person' in data:
            communication.contact_person = data['contact_person']
        if 'contact_method' in data:
            communication.contact_method = data['contact_method']
        if 'status' in data:
            communication.status = data['status']
        if 'tags' in data:
            communication.tags = data['tags']
        if 'is_important' in data:
            communication.is_important = data['is_important']
        if 'follow_up_date' in data:
            if data['follow_up_date']:
                try:
                    communication.follow_up_date = datetime.fromisoformat(data['follow_up_date'])
                except ValueError:
                    communication.follow_up_date = None
            else:
                communication.follow_up_date = None
        
        communication.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Communication updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/communications/<int:communication_id>', methods=['DELETE'])
def delete_communication(communication_id):
    """Delete a communication"""
    try:
        communication = Communication.query.get_or_404(communication_id)
        db.session.delete(communication)
        db.session.commit()
        
        return jsonify({'message': 'Communication deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/communications/<int:communication_id>/status', methods=['PUT'])
def update_communication_status(communication_id):
    """Update communication status"""
    try:
        communication = Communication.query.get_or_404(communication_id)
        data = request.get_json()
        
        if 'status' in data:
            communication.status = data['status']
            communication.updated_at = datetime.utcnow()
            db.session.commit()
            return jsonify({'message': 'Communication status updated successfully'})
        
        return jsonify({'error': 'Status field required'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/communications/bulk', methods=['POST'])
def bulk_update_communications():
    """Bulk update communications (e.g., mark multiple as read)"""
    try:
        data = request.get_json()
        communication_ids = data.get('communication_ids', [])
        updates = data.get('updates', {})
        
        if not communication_ids:
            return jsonify({'error': 'No communication IDs provided'}), 400
        
        communications = Communication.query.filter(Communication.id.in_(communication_ids)).all()
        
        for communication in communications:
            for field, value in updates.items():
                if hasattr(communication, field):
                    if field == 'follow_up_date' and value:
                        try:
                            setattr(communication, field, datetime.fromisoformat(value))
                        except ValueError:
                            pass
                    else:
                        setattr(communication, field, value)
            
            communication.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Updated {len(communications)} communications successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/communications/statistics', methods=['GET'])
def get_communication_statistics():
    """Get communication statistics"""
    try:
        # Count by type
        type_counts = db.session.query(
            Communication.type,
            db.func.count(Communication.id)
        ).group_by(Communication.type).all()
        
        # Count by status
        status_counts = db.session.query(
            Communication.status,
            db.func.count(Communication.id)
        ).group_by(Communication.status).all()
        
        # Count by direction
        direction_counts = db.session.query(
            Communication.direction,
            db.func.count(Communication.id)
        ).group_by(Communication.direction).all()
        
        # Recent communications
        recent_communications = Communication.query.order_by(
            Communication.created_at.desc()
        ).limit(5).all()
        
        recent_data = []
        for comm in recent_communications:
            customer = Customer.query.get(comm.customer_id)
            recent_data.append({
                'id': comm.id,
                'type': comm.type,
                'subject': comm.subject,
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
                'created_at': comm.created_at.isoformat()
            })
        
        return jsonify({
            'type_counts': dict(type_counts),
            'status_counts': dict(status_counts),
            'direction_counts': dict(direction_counts),
            'recent_communications': recent_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
