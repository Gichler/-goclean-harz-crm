from flask import Blueprint, request, jsonify
from ..models.user import db
from src.communication import Communication

communication_bp = Blueprint('communication', __name__)

@communication_bp.route('/communications', methods=['GET'])
def list_communications():
    try:
        query = Communication.query

        comm_type = request.args.get('type', type=str)
        status = request.args.get('status', type=str)
        per_page = request.args.get('per_page', default=50, type=int)

        if comm_type:
            query = query.filter(Communication.type == comm_type)
        if status:
            query = query.filter(Communication.status == status)

        communications = query.order_by(Communication.created_at.desc()).limit(per_page).all()
        return jsonify({
            'communications': [c.to_dict() for c in communications]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/communications/<int:communication_id>', methods=['GET'])
def get_communication(communication_id):
    try:
        communication = Communication.query.get_or_404(communication_id)
        return jsonify(communication.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@communication_bp.route('/communications', methods=['POST'])
def create_communication():
    try:
        data = request.get_json()

        communication = Communication(
            customer_id=data.get('customer_id'),
            order_id=data.get('order_id'),
            type=data.get('type'),
            direction=data.get('direction', 'outbound'),
            subject=data.get('subject'),
            content=data.get('content'),
            contact_person=data.get('contact_person'),
            contact_method=data.get('contact_method'),
            status=data.get('status', 'completed'),
            tags=data.get('tags'),
            is_important=data.get('is_important', False)
        )

        db.session.add(communication)
        db.session.commit()

        return jsonify(communication.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

