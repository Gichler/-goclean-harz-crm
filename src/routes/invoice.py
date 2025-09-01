from flask import Blueprint, request, jsonify
from src.models.customer import Customer
from src.models.order import Order
from src.models.invoice import Invoice, InvoiceItem
from src.models.user import db
from datetime import datetime
import json

invoice_bp = Blueprint('invoice', __name__)

@invoice_bp.route('/invoices', methods=['GET'])
def get_invoices():
    """Get all invoices with optional filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '')
        customer_id = request.args.get('customer_id', type=int)
        
        query = Invoice.query
        
        if status:
            query = query.filter(Invoice.status == status)
        if customer_id:
            query = query.filter(Invoice.customer_id == customer_id)
            
        query = query.order_by(Invoice.created_at.desc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        invoices = []
        for invoice in pagination.items:
            customer = Customer.query.get(invoice.customer_id)
            invoice_data = {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'customer_id': invoice.customer_id,
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
                'order_id': invoice.order_id,
                'invoice_date': invoice.invoice_date.isoformat() if invoice.invoice_date else None,
                'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
                'subtotal': invoice.subtotal,
                'tax_rate': invoice.tax_rate,
                'tax_amount': invoice.tax_amount,
                'total_amount': invoice.total_amount,
                'status': invoice.status,
                'payment_method': invoice.payment_method,
                'notes': invoice.notes,
                'created_at': invoice.created_at.isoformat(),
                'updated_at': invoice.updated_at.isoformat()
            }
            invoices.append(invoice_data)
        
        return jsonify({
            'invoices': invoices,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    """Get a specific invoice by ID"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        customer = Customer.query.get(invoice.customer_id)
        order = Order.query.get(invoice.order_id) if invoice.order_id else None
        
        # Get invoice items
        items = []
        for item in invoice.items:
            item_data = {
                'id': item.id,
                'description': item.description,
                'quantity': item.quantity,
                'unit_price': item.unit_price,
                'total_price': item.total_price
            }
            items.append(item_data)
        
        invoice_data = {
            'id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'customer_id': invoice.customer_id,
            'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
            'customer_email': customer.email if customer else "",
            'customer_phone': customer.phone if customer else "",
            'order_id': invoice.order_id,
            'order_title': order.title if order else None,
            'invoice_date': invoice.invoice_date.isoformat() if invoice.invoice_date else None,
            'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
            'subtotal': invoice.subtotal,
            'tax_rate': invoice.tax_rate,
            'tax_amount': invoice.tax_amount,
            'total_amount': invoice.total_amount,
            'status': invoice.status,
            'payment_method': invoice.payment_method,
            'notes': invoice.notes,
            'items': items,
            'created_at': invoice.created_at.isoformat(),
            'updated_at': invoice.updated_at.isoformat()
        }
        
        return jsonify(invoice_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/invoices', methods=['POST'])
def create_invoice():
    """Create a new invoice"""
    try:
        data = request.get_json()
        
        # Generate invoice number
        invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{Invoice.query.count() + 1:04d}"
        
        # Create invoice
        invoice = Invoice(
            invoice_number=invoice_number,
            customer_id=data['customer_id'],
            order_id=data.get('order_id'),
            invoice_date=datetime.fromisoformat(data['invoice_date']) if data.get('invoice_date') else datetime.now(),
            due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None,
            tax_rate=data.get('tax_rate', 19.0),
            payment_method=data.get('payment_method', 'bank_transfer'),
            notes=data.get('notes', ''),
            status='draft'
        )
        
        db.session.add(invoice)
        db.session.flush()  # Get the invoice ID
        
        # Create invoice items
        if data.get('invoice_items'):
            for item_data in data['invoice_items']:
                item = InvoiceItem(
                    invoice_id=invoice.id,
                    description=item_data['description'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price']
                )
                db.session.add(item)
        
        db.session.commit()
        
        # Calculate totals
        invoice.calculate_totals()
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice created successfully',
            'invoice_id': invoice.id,
            'invoice_number': invoice.invoice_number
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/invoices/<int:invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    """Update an existing invoice"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        data = request.get_json()
        
        # Update basic fields
        if 'invoice_date' in data:
            invoice.invoice_date = datetime.fromisoformat(data['invoice_date']) if data['invoice_date'] else None
        if 'due_date' in data:
            invoice.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
        if 'tax_rate' in data:
            invoice.tax_rate = data['tax_rate']
        if 'payment_method' in data:
            invoice.payment_method = data['payment_method']
        if 'notes' in data:
            invoice.notes = data['notes']
        if 'status' in data:
            invoice.status = data['status']
        
        invoice.updated_at = datetime.utcnow()
        
        # Update invoice items if provided
        if 'invoice_items' in data:
            # Remove existing items
            InvoiceItem.query.filter_by(invoice_id=invoice.id).delete()
            
            # Add new items
            for item_data in data['invoice_items']:
                item = InvoiceItem(
                    invoice_id=invoice.id,
                    description=item_data['description'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price']
                )
                db.session.add(item)
        
        db.session.commit()
        
        # Recalculate totals
        invoice.calculate_totals()
        db.session.commit()
        
        return jsonify({'message': 'Invoice updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/invoices/<int:invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id):
    """Delete an invoice"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        
        # Delete associated items first
        InvoiceItem.query.filter_by(invoice_id=invoice.id).delete()
        
        db.session.delete(invoice)
        db.session.commit()
        
        return jsonify({'message': 'Invoice deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/invoices/<int:invoice_id>/status', methods=['PUT'])
def update_invoice_status(invoice_id):
    """Update invoice status"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        data = request.get_json()
        
        if 'status' in data:
            invoice.status = data['status']
            invoice.updated_at = datetime.utcnow()
            
            # If paid, set payment date
            if data['status'] == 'paid':
                invoice.payment_date = datetime.utcnow()
            
            db.session.commit()
            return jsonify({'message': 'Invoice status updated successfully'})
        
        return jsonify({'error': 'Status field required'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/invoices/<int:invoice_id>/send', methods=['POST'])
def send_invoice(invoice_id):
    """Send invoice to customer"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        
        if invoice.status == 'draft':
            invoice.status = 'sent'
            invoice.sent_at = datetime.utcnow()
            invoice.updated_at = datetime.utcnow()
            db.session.commit()
            
            # Here you would typically send the invoice via email
            # For now, we just update the status
            
            return jsonify({'message': 'Invoice sent successfully'})
        else:
            return jsonify({'error': 'Invoice is not in draft status'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/invoices/statistics', methods=['GET'])
def get_invoice_statistics():
    """Get invoice statistics"""
    try:
        # Count by status
        status_counts = db.session.query(
            Invoice.status,
            db.func.count(Invoice.id)
        ).group_by(Invoice.status).all()
        
        # Total amounts by status
        amount_by_status = db.session.query(
            Invoice.status,
            db.func.sum(Invoice.total_amount)
        ).group_by(Invoice.status).all()
        
        # Monthly totals for current year
        current_year = datetime.now().year
        monthly_totals = db.session.query(
            db.func.strftime('%m', Invoice.invoice_date).label('month'),
            db.func.sum(Invoice.total_amount).label('total')
        ).filter(
            db.func.strftime('%Y', Invoice.invoice_date) == str(current_year)
        ).group_by(
            db.func.strftime('%m', Invoice.invoice_date)
        ).all()
        
        # Overdue invoices
        overdue_invoices = Invoice.query.filter(
            Invoice.due_date < datetime.now(),
            Invoice.status.in_(['sent', 'overdue'])
        ).count()
        
        return jsonify({
            'status_counts': dict(status_counts),
            'amount_by_status': dict(amount_by_status),
            'monthly_totals': {item.month: float(item.total) for item in monthly_totals},
            'overdue_invoices': overdue_invoices
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
