from flask import Blueprint, request, jsonify
from ..models.customer import Customer
from ..models.user import db
import uuid

customer_bp = Blueprint('customer', __name__)

@customer_bp.route('/customers', methods=['GET'])
def get_customers():
    try:
        customers = Customer.query.filter_by(is_active=True).all()
        return jsonify([customer.to_dict() for customer in customers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@customer_bp.route('/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    try:
        customer = Customer.query.get_or_404(customer_id)
        return jsonify(customer.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@customer_bp.route('/customers', methods=['POST'])
def create_customer():
    try:
        data = request.get_json()
        
        # Generate unique customer number
        customer_number = f"K-{uuid.uuid4().hex[:8].upper()}"
        
        customer = Customer(
            customer_number=customer_number,
            company_name=data.get('company_name'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=data.get('email'),
            phone=data.get('phone'),
            mobile=data.get('mobile'),
            street=data.get('street'),
            house_number=data.get('house_number'),
            postal_code=data.get('postal_code'),
            city=data.get('city'),
            customer_type=data.get('customer_type', 'private'),
            preferred_contact_method=data.get('preferred_contact_method', 'email')
        )
        
        db.session.add(customer)
        db.session.commit()
        
        return jsonify(customer.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customer_bp.route('/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    try:
        customer = Customer.query.get_or_404(customer_id)
        data = request.get_json()
        
        for key, value in data.items():
            if hasattr(customer, key):
                setattr(customer, key, value)
        
        db.session.commit()
        return jsonify(customer.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customer_bp.route('/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    try:
        customer = Customer.query.get_or_404(customer_id)
        customer.is_active = False
        db.session.commit()
        return jsonify({'message': 'Customer deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
