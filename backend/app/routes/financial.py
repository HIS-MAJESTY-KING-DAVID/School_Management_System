from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.financial import FeeStructure, StudentFee, Payment, Invoice, InvoiceItem
from app.models.user import User
from app import db
from datetime import datetime
import stripe
from sqlalchemy import func

financial_bp = Blueprint('financial', __name__)

# Fee Structure routes
@financial_bp.route('/fee-structure', methods=['POST'])
@jwt_required()
def create_fee_structure():
    data = request.get_json()
    fee_structure = FeeStructure(
        name=data['name'],
        amount=data['amount'],
        frequency=data['frequency'],
        category=data['category'],
        grade_level=data.get('grade_level'),
        academic_year=data['academic_year']
    )
    db.session.add(fee_structure)
    db.session.commit()
    return jsonify(fee_structure.to_dict()), 201

@financial_bp.route('/fee-structure', methods=['GET'])
@jwt_required()
def get_fee_structures():
    fee_structures = FeeStructure.query.all()
    return jsonify([fs.to_dict() for fs in fee_structures])

# Student Fee routes
@financial_bp.route('/student-fees/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_fees(student_id):
    student_fees = StudentFee.query.filter_by(student_id=student_id).all()
    return jsonify([sf.to_dict() for sf in student_fees])

@financial_bp.route('/student-fees', methods=['POST'])
@jwt_required()
def create_student_fee():
    data = request.get_json()
    student_fee = StudentFee(
        student_id=data['student_id'],
        fee_structure_id=data['fee_structure_id'],
        amount_due=data['amount_due'],
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date()
    )
    db.session.add(student_fee)
    db.session.commit()
    return jsonify(student_fee.to_dict()), 201

# Payment routes
@financial_bp.route('/payments', methods=['POST'])
@jwt_required()
def process_payment():
    data = request.get_json()
    
    # Create payment record
    payment = Payment(
        student_fee_id=data['student_fee_id'],
        amount=data['amount'],
        payment_method=data['payment_method'],
        transaction_id=data.get('transaction_id'),
        notes=data.get('notes')
    )
    
    # Update student fee
    student_fee = StudentFee.query.get(data['student_fee_id'])
    student_fee.amount_paid += data['amount']
    if student_fee.amount_paid >= student_fee.amount_due:
        student_fee.status = 'paid'
    elif student_fee.amount_paid > 0:
        student_fee.status = 'partial'
    
    db.session.add(payment)
    db.session.commit()
    
    return jsonify(payment.to_dict()), 201

@financial_bp.route('/payments/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_payments(student_id):
    payments = Payment.query.join(StudentFee).filter(
        StudentFee.student_id == student_id
    ).all()
    return jsonify([payment.to_dict() for payment in payments])

# Invoice routes
@financial_bp.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    data = request.get_json()
    
    # Generate invoice number
    last_invoice = Invoice.query.order_by(Invoice.id.desc()).first()
    invoice_number = f"INV{datetime.now().year}{(last_invoice.id + 1 if last_invoice else 1):04d}"
    
    invoice = Invoice(
        student_id=data['student_id'],
        invoice_number=invoice_number,
        issue_date=datetime.strptime(data['issue_date'], '%Y-%m-%d').date(),
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date(),
        total_amount=sum(item['amount'] * item['quantity'] for item in data['items']),
        notes=data.get('notes')
    )
    db.session.add(invoice)
    
    # Add invoice items
    for item_data in data['items']:
        item = InvoiceItem(
            invoice=invoice,
            description=item_data['description'],
            amount=item_data['amount'],
            quantity=item_data['quantity']
        )
        db.session.add(item)
    
    db.session.commit()
    return jsonify(invoice.to_dict()), 201

@financial_bp.route('/invoices/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_invoices(student_id):
    invoices = Invoice.query.filter_by(student_id=student_id).all()
    return jsonify([invoice.to_dict() for invoice in invoices])

# Financial Reports
@financial_bp.route('/reports/fee-collection', methods=['GET'])
@jwt_required()
def fee_collection_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = db.session.query(
        func.sum(Payment.amount).label('total_collected'),
        func.count(Payment.id).label('total_payments')
    )
    
    if start_date and end_date:
        query = query.filter(
            Payment.payment_date.between(
                datetime.strptime(start_date, '%Y-%m-%d'),
                datetime.strptime(end_date, '%Y-%m-%d')
            )
        )
    
    result = query.first()
    
    return jsonify({
        'total_collected': float(result.total_collected) if result.total_collected else 0,
        'total_payments': result.total_payments
    })

@financial_bp.route('/reports/outstanding-fees', methods=['GET'])
@jwt_required()
def outstanding_fees_report():
    query = db.session.query(
        func.sum(StudentFee.amount_due - StudentFee.amount_paid).label('total_outstanding'),
        func.count(StudentFee.id).label('total_pending_fees')
    ).filter(StudentFee.status.in_(['pending', 'partial']))
    
    result = query.first()
    
    return jsonify({
        'total_outstanding': float(result.total_outstanding) if result.total_outstanding else 0,
        'total_pending_fees': result.total_pending_fees
    })
