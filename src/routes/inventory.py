from flask import Blueprint, request, jsonify
from src.models.inventory import InventoryItem, InventoryTransaction
from src.models.user import db
from datetime import datetime
import json

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/inventory', methods=['GET'])
def get_inventory():
    """Get all inventory items with optional filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category', '')
        status = request.args.get('status', '')
        low_stock = request.args.get('low_stock', type=bool)
        
        query = InventoryItem.query
        
        if category:
            query = query.filter(InventoryItem.category == category)
        if status:
            query = query.filter(InventoryItem.status == status)
        if low_stock:
            query = query.filter(InventoryItem.quantity <= InventoryItem.reorder_point)
            
        query = query.order_by(InventoryItem.name.asc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        inventory_items = []
        for item in pagination.items:
            item_data = {
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'category': item.category,
                'sku': item.sku,
                'quantity': item.quantity,
                'unit': item.unit,
                'unit_price': item.unit_price,
                'reorder_point': item.reorder_point,
                'supplier': item.supplier,
                'location': item.location,
                'status': item.status,
                'last_updated': item.last_updated.isoformat() if item.last_updated else None,
                'created_at': item.created_at.isoformat(),
                'updated_at': item.updated_at.isoformat()
            }
            inventory_items.append(item_data)
        
        return jsonify({
            'inventory_items': inventory_items,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/inventory/<int:item_id>', methods=['GET'])
def get_inventory_item(item_id):
    """Get a specific inventory item by ID"""
    try:
        item = InventoryItem.query.get_or_404(item_id)
        
        # Get recent transactions
        transactions = InventoryTransaction.query.filter_by(
            item_id=item.id
        ).order_by(InventoryTransaction.transaction_date.desc()).limit(10).all()
        
        transaction_data = []
        for trans in transactions:
            trans_data = {
                'id': trans.id,
                'transaction_type': trans.transaction_type,
                'quantity': trans.quantity,
                'transaction_date': trans.transaction_date.isoformat(),
                'notes': trans.notes,
                'user_id': trans.user_id
            }
            transaction_data.append(trans_data)
        
        item_data = {
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'category': item.category,
            'sku': item.sku,
            'quantity': item.quantity,
            'unit': item.unit,
            'unit_price': item.unit_price,
            'reorder_point': item.reorder_point,
            'supplier': item.supplier,
            'location': item.location,
            'status': item.status,
            'last_updated': item.last_updated.isoformat() if item.last_updated else None,
            'created_at': item.created_at.isoformat(),
            'updated_at': item.updated_at.isoformat(),
            'recent_transactions': transaction_data
        }
        
        return jsonify(item_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/inventory', methods=['POST'])
def create_inventory_item():
    """Create a new inventory item"""
    try:
        data = request.get_json()
        
        # Create inventory item
        inventory_item = InventoryItem(
            name=data['name'],
            description=data.get('description', ''),
            category=data['category'],
            sku=data.get('sku', ''),
            quantity=data.get('quantity', 0),
            unit=data.get('unit', 'Stück'),
            unit_price=data.get('unit_price', 0.0),
            reorder_point=data.get('reorder_point', 0),
            supplier=data.get('supplier', ''),
            location=data.get('location', ''),
            status=data.get('status', 'active')
        )
        
        db.session.add(inventory_item)
        db.session.commit()
        
        return jsonify({
            'message': 'Inventory item created successfully',
            'item_id': inventory_item.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/inventory/<int:item_id>', methods=['PUT'])
def update_inventory_item(item_id):
    """Update an existing inventory item"""
    try:
        item = InventoryItem.query.get_or_404(item_id)
        data = request.get_json()
        
        # Update basic fields
        if 'name' in data:
            item.name = data['name']
        if 'description' in data:
            item.description = data['description']
        if 'category' in data:
            item.category = data['category']
        if 'sku' in data:
            item.sku = data['sku']
        if 'unit' in data:
            item.unit = data['unit']
        if 'unit_price' in data:
            item.unit_price = data['unit_price']
        if 'reorder_point' in data:
            item.reorder_point = data['reorder_point']
        if 'supplier' in data:
            item.supplier = data['supplier']
        if 'location' in data:
            item.location = data['location']
        if 'status' in data:
            item.status = data['status']
        
        item.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Inventory item updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/inventory/<int:item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    """Delete an inventory item"""
    try:
        item = InventoryItem.query.get_or_404(item_id)
        
        # Delete associated transactions first
        InventoryTransaction.query.filter_by(item_id=item.id).delete()
        
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Inventory item deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/inventory/<int:item_id>/adjust', methods=['POST'])
def adjust_inventory_quantity(item_id):
    """Adjust inventory quantity (add/remove stock)"""
    try:
        item = InventoryItem.query.get_or_404(item_id)
        data = request.get_json()
        
        quantity_change = data.get('quantity_change', 0)
        transaction_type = data.get('transaction_type', 'adjustment')
        notes = data.get('notes', '')
        user_id = data.get('user_id', 1)  # Default user ID
        
        if transaction_type == 'in':
            item.quantity += abs(quantity_change)
        elif transaction_type == 'out':
            if item.quantity < abs(quantity_change):
                return jsonify({'error': 'Insufficient stock'}), 400
            item.quantity -= abs(quantity_change)
        else:
            item.quantity = quantity_change
        
        # Update last updated timestamp
        item.last_updated = datetime.utcnow()
        item.updated_at = datetime.utcnow()
        
        # Create transaction record
        transaction = InventoryTransaction(
            item_id=item.id,
            transaction_type=transaction_type,
            quantity=abs(quantity_change),
            transaction_date=datetime.utcnow(),
            notes=notes,
            user_id=user_id
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Inventory quantity adjusted successfully',
            'new_quantity': item.quantity
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/inventory/transactions', methods=['GET'])
def get_inventory_transactions():
    """Get inventory transactions"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        item_id = request.args.get('item_id', type=int)
        transaction_type = request.args.get('transaction_type', '')
        
        query = InventoryTransaction.query
        
        if item_id:
            query = query.filter(InventoryTransaction.item_id == item_id)
        if transaction_type:
            query = query.filter(InventoryTransaction.transaction_type == transaction_type)
            
        query = query.order_by(InventoryTransaction.transaction_date.desc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        transactions = []
        for trans in pagination.items:
            item = InventoryItem.query.get(trans.item_id)
            trans_data = {
                'id': trans.id,
                'item_id': trans.item_id,
                'item_name': item.name if item else 'Unbekannt',
                'transaction_type': trans.transaction_type,
                'quantity': trans.quantity,
                'transaction_date': trans.transaction_date.isoformat(),
                'notes': trans.notes,
                'user_id': trans.user_id
            }
            transactions.append(trans_data)
        
        return jsonify({
            'transactions': transactions,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/inventory/statistics', methods=['GET'])
def get_inventory_statistics():
    """Get inventory statistics"""
    try:
        # Total items
        total_items = InventoryItem.query.count()
        
        # Items by category
        category_counts = db.session.query(
            InventoryItem.category,
            db.func.count(InventoryItem.id)
        ).group_by(InventoryItem.category).all()
        
        # Low stock items
        low_stock_items = InventoryItem.query.filter(
            InventoryItem.quantity <= InventoryItem.reorder_point
        ).count()
        
        # Total inventory value
        total_value = db.session.query(
            db.func.sum(InventoryItem.quantity * InventoryItem.unit_price)
        ).scalar() or 0
        
        # Recent transactions
        recent_transactions = InventoryTransaction.query.order_by(
            InventoryTransaction.transaction_date.desc()
        ).limit(5).all()
        
        recent_data = []
        for trans in recent_transactions:
            item = InventoryItem.query.get(trans.item_id)
            recent_data.append({
                'id': trans.id,
                'item_name': item.name if item else 'Unbekannt',
                'transaction_type': trans.transaction_type,
                'quantity': trans.quantity,
                'transaction_date': trans.transaction_date.isoformat()
            })
        
        return jsonify({
            'total_items': total_items,
            'category_counts': dict(category_counts),
            'low_stock_items': low_stock_items,
            'total_value': float(total_value),
            'recent_transactions': recent_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/inventory/categories', methods=['GET'])
def get_inventory_categories():
    """Get available inventory categories"""
    try:
        categories = [
            'Reinigungsmittel',
            'Werkzeuge',
            'Ersatzteile',
            'Schutzausrüstung',
            'Verbrauchsmaterial',
            'Maschinen',
            'Sonstiges'
        ]
        
        return jsonify({'categories': categories})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
