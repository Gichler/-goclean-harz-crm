from flask import Blueprint, request, jsonify
from ..models.user import db
from src.quote import Quote, QuoteItem, QuoteTemplate, QuoteTemplateItem
from datetime import datetime
import uuid

quote_bp = Blueprint('quote', __name__)

@quote_bp.route('/quotes', methods=['GET'])
def list_quotes():
    try:
        query = Quote.query

        status = request.args.get('status', type=str)
        service_type = request.args.get('service_type', type=str)
        per_page = request.args.get('per_page', default=50, type=int)

        if status:
            query = query.filter(Quote.status == status)
        if service_type:
            query = query.filter(Quote.service_type == service_type)

        quotes = query.order_by(Quote.created_at.desc()).limit(per_page).all()
        return jsonify({'quotes': [q.to_dict() for q in quotes]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quotes/<int:quote_id>', methods=['GET'])
def get_quote(quote_id):
    try:
        quote = Quote.query.get_or_404(quote_id)
        return jsonify(quote.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quotes', methods=['POST'])
def create_quote():
    try:
        data = request.get_json()

        # Generate quote number
        quote_number = f"AN-{datetime.now().strftime('%Y-%m')}-{uuid.uuid4().hex[:4].upper()}"

        quote = Quote(
            quote_number=quote_number,
            customer_id=data.get('customer_id'),
            title=data.get('title'),
            description=data.get('description'),
            service_type=data.get('service_type'),
            service_street=data.get('service_street'),
            service_house_number=data.get('service_house_number'),
            service_postal_code=data.get('service_postal_code'),
            service_city=data.get('service_city'),
            valid_until=datetime.strptime(data.get('valid_until'), '%Y-%m-%d').date() if data.get('valid_until') else None,
            tax_rate=data.get('tax_rate', 19.0),
            notes=data.get('notes'),
            terms_conditions=data.get('terms_conditions')
        )

        # Quote items
        for item in data.get('quote_items', []):
            qi = QuoteItem(
                description=item.get('description'),
                quantity=item.get('quantity', 1),
                unit=item.get('unit', 'Stück'),
                unit_price=item.get('unit_price', 0)
            )
            qi.calculate_total()
            quote.quote_items.append(qi)

        quote.calculate_totals()
        db.session.add(quote)
        db.session.commit()

        return jsonify(quote.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quotes/<int:quote_id>/status', methods=['PUT'])
def update_quote_status(quote_id):
    try:
        quote = Quote.query.get_or_404(quote_id)
        data = request.get_json()
        new_status = data.get('status')
        if new_status:
            quote.status = new_status
            if new_status == 'sent':
                quote.sent_at = datetime.utcnow()
            if new_status == 'accepted':
                quote.accepted_at = datetime.utcnow()
        db.session.commit()
        return jsonify(quote.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quote-templates', methods=['GET'])
def list_quote_templates():
    try:
        templates = QuoteTemplate.query.filter_by(is_active=True).all()
        return jsonify({'templates': [t.to_dict() for t in templates]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quote_bp.route('/quote-templates/<int:template_id>/generate', methods=['POST'])
def generate_quote_from_template(template_id):
    try:
        template = QuoteTemplate.query.get_or_404(template_id)
        data = request.get_json()

        quote_number = f"AN-{datetime.now().strftime('%Y-%m')}-{uuid.uuid4().hex[:4].upper()}"

        quote = Quote(
            quote_number=quote_number,
            customer_id=data.get('customer_id'),
            title=template.default_title or f"Angebot {template.name}",
            description=template.default_description,
            service_type=template.service_type,
            valid_until=datetime.utcnow().date(),
            terms_conditions=template.default_terms_conditions
        )

        for item in template.template_items:
            qi = QuoteItem(
                description=item.description,
                quantity=item.default_quantity,
                unit=item.unit,
                unit_price=item.unit_price
            )
            qi.calculate_total()
            quote.quote_items.append(qi)

        quote.calculate_totals()
        db.session.add(quote)
        db.session.commit()

        return jsonify(quote.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

