from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.resources import (
    Book, BookLending, InventoryItem, InventoryTransaction,
    MaintenanceRecord
)
from app.models.user import User
from app import db
from datetime import datetime, timedelta
from sqlalchemy import or_

resources_bp = Blueprint('resources', __name__)

# Library Management Routes
@resources_bp.route('/books', methods=['GET'])
@jwt_required()
def get_books():
    query = Book.query
    
    # Filter by search term
    search = request.args.get('search')
    if search:
        query = query.filter(or_(
            Book.title.ilike(f'%{search}%'),
            Book.author.ilike(f'%{search}%'),
            Book.isbn.ilike(f'%{search}%')
        ))
    
    # Filter by category
    category = request.args.get('category')
    if category:
        query = query.filter_by(category=category)
    
    books = query.all()
    return jsonify([book.to_dict() for book in books])

@resources_bp.route('/books', methods=['POST'])
@jwt_required()
def create_book():
    data = request.get_json()
    book = Book(
        title=data['title'],
        author=data.get('author'),
        isbn=data.get('isbn'),
        publisher=data.get('publisher'),
        publication_year=data.get('publication_year'),
        category=data.get('category'),
        subject=data.get('subject'),
        description=data.get('description'),
        total_copies=data.get('total_copies', 1),
        available_copies=data.get('total_copies', 1),
        location=data.get('location')
    )
    db.session.add(book)
    db.session.commit()
    return jsonify(book.to_dict()), 201

@resources_bp.route('/books/lending', methods=['POST'])
@jwt_required()
def lend_book():
    data = request.get_json()
    book = Book.query.get_or_404(data['book_id'])
    
    if book.available_copies <= 0:
        return jsonify({'error': 'No copies available'}), 400
    
    lending = BookLending(
        book_id=data['book_id'],
        user_id=data['user_id'],
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d')
    )
    
    book.available_copies -= 1
    db.session.add(lending)
    db.session.commit()
    
    return jsonify(lending.to_dict()), 201

@resources_bp.route('/books/return/<int:lending_id>', methods=['POST'])
@jwt_required()
def return_book(lending_id):
    lending = BookLending.query.get_or_404(lending_id)
    
    if lending.return_date:
        return jsonify({'error': 'Book already returned'}), 400
    
    lending.return_date = datetime.utcnow()
    lending.status = 'returned'
    
    # Calculate fine if overdue
    if lending.due_date < datetime.utcnow():
        days_overdue = (datetime.utcnow() - lending.due_date).days
        lending.fine_amount = days_overdue * 1.0  # $1 per day
    
    lending.book.available_copies += 1
    db.session.commit()
    
    return jsonify(lending.to_dict())

# Inventory Management Routes
@resources_bp.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    query = InventoryItem.query
    
    # Filter by category
    category = request.args.get('category')
    if category:
        query = query.filter_by(category=category)
    
    # Filter by status
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    items = query.all()
    return jsonify([item.to_dict() for item in items])

@resources_bp.route('/inventory', methods=['POST'])
@jwt_required()
def create_inventory_item():
    data = request.get_json()
    item = InventoryItem(
        name=data['name'],
        category=data.get('category'),
        description=data.get('description'),
        quantity=data.get('quantity', 0),
        unit=data.get('unit'),
        minimum_quantity=data.get('minimum_quantity', 0),
        location=data.get('location'),
        supplier=data.get('supplier'),
        unit_cost=data.get('unit_cost')
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@resources_bp.route('/inventory/transaction', methods=['POST'])
@jwt_required()
def create_inventory_transaction():
    data = request.get_json()
    item = InventoryItem.query.get_or_404(data['item_id'])
    
    transaction = InventoryTransaction(
        item_id=data['item_id'],
        transaction_type=data['transaction_type'],
        quantity=data['quantity'],
        user_id=get_jwt_identity(),
        department=data.get('department'),
        purpose=data.get('purpose'),
        notes=data.get('notes')
    )
    
    # Update item quantity
    if data['transaction_type'] == 'in':
        item.quantity += data['quantity']
        if not item.last_restock_date:
            item.last_restock_date = datetime.utcnow()
    else:  # out
        if item.quantity < data['quantity']:
            return jsonify({'error': 'Insufficient quantity'}), 400
        item.quantity -= data['quantity']
    
    # Update item status
    if item.quantity <= 0:
        item.status = 'out_of_stock'
    elif item.quantity <= item.minimum_quantity:
        item.status = 'low_stock'
    else:
        item.status = 'active'
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify(transaction.to_dict()), 201

@resources_bp.route('/inventory/maintenance', methods=['POST'])
@jwt_required()
def create_maintenance_record():
    data = request.get_json()
    maintenance = MaintenanceRecord(
        item_id=data['item_id'],
        maintenance_type=data['maintenance_type'],
        description=data['description'],
        cost=data.get('cost'),
        performed_by=data.get('performed_by'),
        next_maintenance_date=datetime.strptime(data['next_maintenance_date'], '%Y-%m-%d') if data.get('next_maintenance_date') else None,
        status=data.get('status', 'completed'),
        notes=data.get('notes')
    )
    db.session.add(maintenance)
    db.session.commit()
    return jsonify(maintenance.to_dict()), 201

# Reports and Analytics
@resources_bp.route('/reports/low-stock', methods=['GET'])
@jwt_required()
def low_stock_report():
    items = InventoryItem.query.filter(
        InventoryItem.quantity <= InventoryItem.minimum_quantity
    ).all()
    return jsonify([item.to_dict() for item in items])

@resources_bp.route('/reports/overdue-books', methods=['GET'])
@jwt_required()
def overdue_books_report():
    overdue = BookLending.query.filter(
        BookLending.due_date < datetime.utcnow(),
        BookLending.return_date.is_(None)
    ).all()
    return jsonify([lending.to_dict() for lending in overdue])

@resources_bp.route('/reports/maintenance-schedule', methods=['GET'])
@jwt_required()
def maintenance_schedule_report():
    upcoming = MaintenanceRecord.query.filter(
        MaintenanceRecord.next_maintenance_date.isnot(None),
        MaintenanceRecord.next_maintenance_date > datetime.utcnow()
    ).order_by(MaintenanceRecord.next_maintenance_date).all()
    return jsonify([record.to_dict() for record in upcoming])
