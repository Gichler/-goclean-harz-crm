from flask import Blueprint, request, jsonify
from src.models.customer import Customer
from src.models.order import Order
from src.models.quote import Quote, QuoteItem
from src.models.user import db
from datetime import datetime, timedelta
import json

quote_bp = Blueprint('quote', __name__)

@quote_bp.route('/quotes', methods=['GET'])
def get_quotes():
    """Get all quotes with optional filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '')
        service_type = request.args.get('service_type', '')
        customer_id = request.args.get('customer_id', type=int)
        
        query = Quote.query
        
        if status:
            query = query.filter(Quote.status == status)
        if service_type:
            query = query.filter(Quote.service_type == service_type)
        if customer_id:
            query = query.filter(Quote.customer_id == customer_id)
            
        query = query.order_by(Quote.created_at.desc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        quotes = []
        for quote in pagination.items:
            customer = Customer.query.get(quote.customer_id)
            quote_data = {
                'id': quote.id,
                'customer_id': quote.customer_id,
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
                'title': quote.title,
                'description': quote.description,
                'service_type': quote.service_type,
                'service_address': f"{quote.service_street} {quote.service_house_number}, {quote.service_postal_code} {quote.service_city}",
                'valid_until': quote.valid_until.isoformat() if quote.valid_until else None,
                'tax_rate': quote.tax_rate,
                'subtotal': quote.subtotal,
                'tax_amount': quote.tax_amount,
                'total_amount': quote.total_amount,
                'status': quote.status,
                'notes': quote.notes,
                'terms_conditions': quote.terms_conditions,
                'created_at': quote.created_at.isoformat(),
                'updated_at': quote.updated_at.isoformat()
            }
            quotes.append(quote_data)
        
        return jsonify({
            'quotes': quotes,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quotes/<int:quote_id>', methods=['GET'])
def get_quote(quote_id):
    """Get a specific quote by ID"""
    try:
        quote = Quote.query.get_or_404(quote_id)
        customer = Customer.query.get(quote.customer_id)
        
        # Get quote items
        items = []
        for item in quote.items:
            item_data = {
                'id': item.id,
                'description': item.description,
                'quantity': item.quantity,
                'unit_price': item.unit_price,
                'total_price': item.total_price
            }
            items.append(item_data)
        
        quote_data = {
            'id': quote.id,
            'customer_id': quote.customer_id,
            'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
            'customer_email': customer.email if customer else "",
            'customer_phone': customer.phone if customer else "",
            'title': quote.title,
            'description': quote.description,
            'service_type': quote.service_type,
            'service_street': quote.service_street,
            'service_house_number': quote.service_house_number,
            'service_postal_code': quote.service_postal_code,
            'service_city': quote.service_city,
            'valid_until': quote.valid_until.isoformat() if quote.valid_until else None,
            'tax_rate': quote.tax_rate,
            'subtotal': quote.subtotal,
            'tax_amount': quote.tax_amount,
            'total_amount': quote.total_amount,
            'status': quote.status,
            'notes': quote.notes,
            'terms_conditions': quote.terms_conditions,
            'items': items,
            'created_at': quote.created_at.isoformat(),
            'updated_at': quote.updated_at.isoformat()
        }
        
        return jsonify(quote_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quotes', methods=['POST'])
def create_quote():
    """Create a new quote"""
    try:
        data = request.get_json()
        
        # Create quote
        quote = Quote(
            customer_id=data['customer_id'],
            title=data['title'],
            description=data.get('description', ''),
            service_type=data.get('service_type', ''),
            service_street=data.get('service_street', ''),
            service_house_number=data.get('service_house_number', ''),
            service_postal_code=data.get('service_postal_code', ''),
            service_city=data.get('service_city', ''),
            valid_until=datetime.fromisoformat(data['valid_until']) if data.get('valid_until') else None,
            tax_rate=data.get('tax_rate', 19.0),
            notes=data.get('notes', ''),
            terms_conditions=data.get('terms_conditions', ''),
            status='draft'
        )
        
        db.session.add(quote)
        db.session.flush()  # Get the quote ID
        
        # Create quote items
        if data.get('quote_items'):
            for item_data in data['quote_items']:
                item = QuoteItem(
                    quote_id=quote.id,
                    description=item_data['description'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price']
                )
                db.session.add(item)
        
        db.session.commit()
        
        # Calculate totals
        quote.calculate_totals()
        db.session.commit()
        
        return jsonify({
            'message': 'Quote created successfully',
            'quote_id': quote.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quotes/<int:quote_id>', methods=['PUT'])
def update_quote(quote_id):
    """Update an existing quote"""
    try:
        quote = Quote.query.get_or_404(quote_id)
        data = request.get_json()
        
        # Update basic fields
        if 'title' in data:
            quote.title = data['title']
        if 'description' in data:
            quote.description = data['description']
        if 'service_type' in data:
            quote.service_type = data['service_type']
        if 'service_street' in data:
            quote.service_street = data['service_street']
        if 'service_house_number' in data:
            quote.service_house_number = data['service_house_number']
        if 'service_postal_code' in data:
            quote.service_postal_code = data['service_postal_code']
        if 'service_city' in data:
            quote.service_city = data['service_city']
        if 'valid_until' in data:
            quote.valid_until = datetime.fromisoformat(data['valid_until']) if data['valid_until'] else None
        if 'tax_rate' in data:
            quote.tax_rate = data['tax_rate']
        if 'notes' in data:
            quote.notes = data['notes']
        if 'terms_conditions' in data:
            quote.terms_conditions = data['terms_conditions']
        if 'status' in data:
            quote.status = data['status']
        
        quote.updated_at = datetime.utcnow()
        
        # Update quote items if provided
        if 'quote_items' in data:
            # Remove existing items
            QuoteItem.query.filter_by(quote_id=quote.id).delete()
            
            # Add new items
            for item_data in data['quote_items']:
                item = QuoteItem(
                    quote_id=quote.id,
                    description=item_data['description'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price']
                )
                db.session.add(item)
        
        db.session.commit()
        
        # Recalculate totals
        quote.calculate_totals()
        db.session.commit()
        
        return jsonify({'message': 'Quote updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quotes/<int:quote_id>', methods=['DELETE'])
def delete_quote(quote_id):
    """Delete a quote"""
    try:
        quote = Quote.query.get_or_404(quote_id)
        
        # Delete associated items first
        QuoteItem.query.filter_by(quote_id=quote.id).delete()
        
        db.session.delete(quote)
        db.session.commit()
        
        return jsonify({'message': 'Quote deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quotes/<int:quote_id>/status', methods=['PUT'])
def update_quote_status(quote_id):
    """Update quote status"""
    try:
        quote = Quote.query.get_or_404(quote_id)
        data = request.get_json()
        
        if 'status' in data:
            quote.status = data['status']
            quote.updated_at = datetime.utcnow()
            
            # If converting to order, create order
            if data['status'] == 'accepted':
                # Create order logic here if needed
                pass
            
            db.session.commit()
            return jsonify({'message': 'Quote status updated successfully'})
        
        return jsonify({'error': 'Status field required'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quote-templates', methods=['GET'])
def get_quote_templates():
    """Get quote templates"""
    try:
        # For now, return basic templates
        # In the future, this could be stored in the database
        templates = [
            {
                'id': 1,
                'name': 'Standard Reinigung',
                'description': 'Grundreinigung für Privatkunden',
                'items': [
                    {'description': 'Grundreinigung', 'quantity': 1, 'unit_price': 50.00},
                    {'description': 'Fensterreinigung', 'quantity': 1, 'unit_price': 25.00}
                ]
            },
            {
                'id': 2,
                'name': 'Gewerbereinigung',
                'description': 'Reinigung für Gewerbekunden',
                'items': [
                    {'description': 'Büroreinigung', 'quantity': 1, 'unit_price': 80.00},
                    {'description': 'Teppichreinigung', 'quantity': 1, 'unit_price': 45.00}
                ]
            }
        ]
        
        return jsonify({'templates': templates})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
