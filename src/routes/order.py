from flask import Blueprint, request, jsonify
from ..models.order import Order, Service
from ..models.user import db
from datetime import datetime
import uuid

order_bp = Blueprint('order', __name__)

@order_bp.route('/orders', methods=['GET'])
def get_orders():
    try:
        orders = Order.query.all()
        return jsonify([order.to_dict() for order in orders]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@order_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    try:
        order = Order.query.get_or_404(order_id)
        return jsonify(order.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@order_bp.route('/orders', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        
        # Generate unique order number
        order_number = f"AU-{datetime.now().strftime('%Y-%m')}-{uuid.uuid4().hex[:4].upper()}"
        
        order = Order(
            order_number=order_number,
            customer_id=data.get('customer_id'),
            title=data.get('title'),
            description=data.get('description'),
            service_type=data.get('service_type'),
            service_street=data.get('service_street'),
            service_house_number=data.get('service_house_number'),
            service_postal_code=data.get('service_postal_code'),
            service_city=data.get('service_city'),
            scheduled_date=datetime.strptime(data.get('scheduled_date'), '%Y-%m-%d').date() if data.get('scheduled_date') else None,
            scheduled_time=datetime.strptime(data.get('scheduled_time'), '%H:%M').time() if data.get('scheduled_time') else None,
            estimated_duration=data.get('estimated_duration'),
            status=data.get('status', 'pending'),
            priority=data.get('priority', 'normal'),
            estimated_price=data.get('estimated_price'),
            final_price=data.get('final_price'),
            is_recurring=data.get('is_recurring', False),
            recurring_interval=data.get('recurring_interval'),
            special_instructions=data.get('special_instructions'),
            access_instructions=data.get('access_instructions')
        )
        
        db.session.add(order)
        db.session.commit()
        
        return jsonify(order.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@order_bp.route('/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    try:
        order = Order.query.get_or_404(order_id)
        data = request.get_json()
        
        for key, value in data.items():
            if hasattr(order, key):
                if key in ['scheduled_date'] and value:
                    order.scheduled_date = datetime.strptime(value, '%Y-%m-%d').date()
                elif key in ['scheduled_time'] and value:
                    order.scheduled_time = datetime.strptime(value, '%H:%M').time()
                else:
                    setattr(order, key, value)
        
        db.session.commit()
        return jsonify(order.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@order_bp.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    try:
        order = Order.query.get_or_404(order_id)
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Order deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@order_bp.route('/orders/dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        from ..models.customer import Customer
        
        # Get order counts by status
        order_counts = {
            'pending': Order.query.filter_by(status='pending').count(),
            'confirmed': Order.query.filter_by(status='confirmed').count(),
            'in_progress': Order.query.filter_by(status='in_progress').count(),
            'completed': Order.query.filter_by(status='completed').count()
        }
        
        # Get today's orders
        today = datetime.now().date()
        todays_orders = Order.query.filter(
            Order.scheduled_date == today
        ).count()
        
        # Get this week's orders
        from datetime import timedelta
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        this_week_orders = Order.query.filter(
            Order.scheduled_date >= week_start,
            Order.scheduled_date <= week_end
        ).count()
        
        # Get total customers
        total_customers = Customer.query.filter_by(is_active=True).count()
        
        return jsonify({
            'order_counts': order_counts,
            'todays_orders': todays_orders,
            'this_week_orders': this_week_orders,
            'total_customers': total_customers
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
