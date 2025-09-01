from flask import Blueprint, request, jsonify
from src.models.customer import Customer
from src.models.order import Order
from src.models.quality import QualityCheck
from src.models.user import db
from datetime import datetime
import json

quality_bp = Blueprint('quality', __name__)

@quality_bp.route('/quality-checks', methods=['GET'])
def get_quality_checks():
    """Get all quality checks with optional filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '')
        order_id = request.args.get('order_id', type=int)
        inspector_id = request.args.get('inspector_id', type=int)
        
        query = QualityCheck.query
        
        if status:
            query = query.filter(QualityCheck.status == status)
        if order_id:
            query = query.filter(QualityCheck.order_id == order_id)
        if inspector_id:
            query = query.filter(QualityCheck.inspector_id == inspector_id)
            
        query = query.order_by(QualityCheck.created_at.desc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        quality_checks = []
        for check in pagination.items:
            customer = Customer.query.get(check.customer_id) if check.customer_id else None
            order = Order.query.get(check.order_id) if check.order_id else None
            
            check_data = {
                'id': check.id,
                'order_id': check.order_id,
                'order_title': order.title if order else None,
                'customer_id': check.customer_id,
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
                'inspector_id': check.inspector_id,
                'inspector_name': check.inspector_name,
                'check_date': check.check_date.isoformat() if check.check_date else None,
                'check_type': check.check_type,
                'overall_score': check.overall_score,
                'status': check.status,
                'notes': check.notes,
                'created_at': check.created_at.isoformat(),
                'updated_at': check.updated_at.isoformat()
            }
            quality_checks.append(check_data)
        
        return jsonify({
            'quality_checks': quality_checks,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quality_bp.route('/quality-checks/<int:check_id>', methods=['GET'])
def get_quality_check(check_id):
    """Get a specific quality check by ID"""
    try:
        check = QualityCheck.query.get_or_404(check_id)
        customer = Customer.query.get(check.customer_id) if check.customer_id else None
        order = Order.query.get(check.order_id) if check.order_id else None
        
        check_data = {
            'id': check.id,
            'order_id': check.order_id,
            'order_title': order.title if order else None,
            'customer_id': check.customer_id,
            'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
            'inspector_id': check.inspector_id,
            'inspector_name': check.inspector_name,
            'check_date': check.check_date.isoformat() if check.check_date else None,
            'check_type': check.check_type,
            'overall_score': check.overall_score,
            'status': check.status,
            'notes': check.notes,
            'check_details': check.check_details,
            'recommendations': check.recommendations,
            'created_at': check.created_at.isoformat(),
            'updated_at': check.updated_at.isoformat()
        }
        
        return jsonify(check_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quality_bp.route('/quality-checks', methods=['POST'])
def create_quality_check():
    """Create a new quality check"""
    try:
        data = request.get_json()
        
        # Create quality check
        quality_check = QualityCheck(
            order_id=data.get('order_id'),
            customer_id=data.get('customer_id'),
            inspector_id=data.get('inspector_id'),
            inspector_name=data.get('inspector_name', ''),
            check_date=datetime.fromisoformat(data['check_date']) if data.get('check_date') else datetime.now(),
            check_type=data['check_type'],
            overall_score=data.get('overall_score', 0),
            status=data.get('status', 'pending'),
            notes=data.get('notes', ''),
            check_details=data.get('check_details', ''),
            recommendations=data.get('recommendations', '')
        )
        
        db.session.add(quality_check)
        db.session.commit()
        
        return jsonify({
            'message': 'Quality check created successfully',
            'check_id': quality_check.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quality_bp.route('/quality-checks/<int:check_id>', methods=['PUT'])
def update_quality_check(check_id):
    """Update an existing quality check"""
    try:
        check = QualityCheck.query.get_or_404(check_id)
        data = request.get_json()
        
        # Update basic fields
        if 'check_date' in data:
            check.check_date = datetime.fromisoformat(data['check_date']) if data['check_date'] else None
        if 'check_type' in data:
            check.check_type = data['check_type']
        if 'overall_score' in data:
            check.overall_score = data['overall_score']
        if 'status' in data:
            check.status = data['status']
        if 'notes' in data:
            check.notes = data['notes']
        if 'check_details' in data:
            check.check_details = data['check_details']
        if 'recommendations' in data:
            check.recommendations = data['recommendations']
        if 'inspector_name' in data:
            check.inspector_name = data['inspector_name']
        
        check.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Quality check updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quality_bp.route('/quality-checks/<int:check_id>', methods=['DELETE'])
def delete_quality_check(check_id):
    """Delete a quality check"""
    try:
        check = QualityCheck.query.get_or_404(check_id)
        db.session.delete(check)
        db.session.commit()
        
        return jsonify({'message': 'Quality check deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quality_bp.route('/quality-checks/<int:check_id>/status', methods=['PUT'])
def update_quality_check_status(check_id):
    """Update quality check status"""
    try:
        check = QualityCheck.query.get_or_404(check_id)
        data = request.get_json()
        
        if 'status' in data:
            check.status = data['status']
            check.updated_at = datetime.utcnow()
            db.session.commit()
            return jsonify({'message': 'Quality check status updated successfully'})
        
        return jsonify({'error': 'Status field required'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quality_bp.route('/quality-checks/statistics', methods=['GET'])
def get_quality_statistics():
    """Get quality check statistics"""
    try:
        # Count by status
        status_counts = db.session.query(
            QualityCheck.status,
            db.func.count(QualityCheck.id)
        ).group_by(QualityCheck.status).all()
        
        # Average scores by check type
        avg_scores_by_type = db.session.query(
            QualityCheck.check_type,
            db.func.avg(QualityCheck.overall_score).label('avg_score')
        ).group_by(QualityCheck.check_type).all()
        
        # Monthly quality scores for current year
        current_year = datetime.now().year
        monthly_scores = db.session.query(
            db.func.strftime('%m', QualityCheck.check_date).label('month'),
            db.func.avg(QualityCheck.overall_score).label('avg_score')
        ).filter(
            db.func.strftime('%Y', QualityCheck.check_date) == str(current_year)
        ).group_by(
            db.func.strftime('%m', QualityCheck.check_date)
        ).all()
        
        # Recent quality checks
        recent_checks = QualityCheck.query.order_by(
            QualityCheck.created_at.desc()
        ).limit(5).all()
        
        recent_data = []
        for check in recent_checks:
            customer = Customer.query.get(check.customer_id) if check.customer_id else None
            recent_data.append({
                'id': check.id,
                'check_type': check.check_type,
                'overall_score': check.overall_score,
                'status': check.status,
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "Unbekannt",
                'created_at': check.created_at.isoformat()
            })
        
        return jsonify({
            'status_counts': dict(status_counts),
            'avg_scores_by_type': {item.check_type: float(item.avg_score) for item in avg_scores_by_type},
            'monthly_scores': {item.month: float(item.avg_score) for item in monthly_scores},
            'recent_checks': recent_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quality_bp.route('/quality-checks/standards', methods=['GET'])
def get_quality_standards():
    """Get quality standards and criteria"""
    try:
        # Define quality standards for different service types
        standards = {
            'cleaning': {
                'excellent': {'min_score': 90, 'description': 'Hervorragende Reinigungsqualität'},
                'good': {'min_score': 75, 'description': 'Gute Reinigungsqualität'},
                'acceptable': {'min_score': 60, 'description': 'Akzeptable Reinigungsqualität'},
                'poor': {'min_score': 0, 'description': 'Unzureichende Reinigungsqualität'}
            },
            'maintenance': {
                'excellent': {'min_score': 90, 'description': 'Hervorragende Wartungsqualität'},
                'good': {'min_score': 75, 'description': 'Gute Wartungsqualität'},
                'acceptable': {'min_score': 60, 'description': 'Akzeptable Wartungsqualität'},
                'poor': {'min_score': 0, 'description': 'Unzureichende Wartungsqualität'}
            }
        }
        
        return jsonify({'standards': standards})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
