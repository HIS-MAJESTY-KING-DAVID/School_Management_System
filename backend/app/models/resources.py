from app import db
from datetime import datetime

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100))
    isbn = db.Column(db.String(13), unique=True)
    publisher = db.Column(db.String(100))
    publication_year = db.Column(db.Integer)
    category = db.Column(db.String(50))
    subject = db.Column(db.String(50))
    description = db.Column(db.Text)
    total_copies = db.Column(db.Integer, default=1)
    available_copies = db.Column(db.Integer, default=1)
    location = db.Column(db.String(50))  # Shelf/Row number
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'isbn': self.isbn,
            'publisher': self.publisher,
            'publication_year': self.publication_year,
            'category': self.category,
            'subject': self.subject,
            'description': self.description,
            'total_copies': self.total_copies,
            'available_copies': self.available_copies,
            'location': self.location,
            'created_at': self.created_at.isoformat()
        }

class BookLending(db.Model):
    __tablename__ = 'book_lendings'
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    checkout_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    return_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='borrowed')  # borrowed, returned, overdue
    fine_amount = db.Column(db.Float, default=0.0)
    notification_sent = db.Column(db.Boolean, default=False)
    reminder_sent = db.Column(db.Boolean, default=False)
    
    # Relationships
    book = db.relationship('Book', backref='lendings')
    user = db.relationship('User', backref='book_lendings')
    
    def to_dict(self):
        return {
            'id': self.id,
            'book_id': self.book_id,
            'user_id': self.user_id,
            'checkout_date': self.checkout_date.isoformat(),
            'due_date': self.due_date.isoformat(),
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'status': self.status,
            'fine_amount': self.fine_amount,
            'notes': self.notes,
            'book_title': self.book.title,
            'user_name': f"{self.user.first_name} {self.user.last_name}"
        }

class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50))  # equipment, supplies, furniture, etc.
    description = db.Column(db.Text)
    quantity = db.Column(db.Integer, default=0)
    unit = db.Column(db.String(20))  # pieces, sets, boxes, etc.
    minimum_quantity = db.Column(db.Integer, default=0)
    location = db.Column(db.String(50))
    supplier = db.Column(db.String(100))
    unit_cost = db.Column(db.Float)
    status = db.Column(db.String(20), default='active')  # active, discontinued, out_of_stock
    last_restock_date = db.Column(db.DateTime)
    barcode = db.Column(db.String(50), unique=True)
    qr_code = db.Column(db.String(100), unique=True)
    notification_sent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'quantity': self.quantity,
            'unit': self.unit,
            'minimum_quantity': self.minimum_quantity,
            'location': self.location,
            'supplier': self.supplier,
            'unit_cost': self.unit_cost,
            'status': self.status,
            'last_restock_date': self.last_restock_date.isoformat() if self.last_restock_date else None,
            'created_at': self.created_at.isoformat()
        }

class InventoryTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('inventory_item.id'), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # in, out
    quantity = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    department = db.Column(db.String(50))
    purpose = db.Column(db.String(200))
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    
    # Relationships
    item = db.relationship('InventoryItem', backref='transactions')
    user = db.relationship('User', backref='inventory_transactions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_id': self.item_id,
            'transaction_type': self.transaction_type,
            'quantity': self.quantity,
            'user_id': self.user_id,
            'department': self.department,
            'purpose': self.purpose,
            'transaction_date': self.transaction_date.isoformat(),
            'notes': self.notes,
            'item_name': self.item.name,
            'user_name': f"{self.user.first_name} {self.user.last_name}"
        }

class MaintenanceRecord(db.Model):
    __tablename__ = 'maintenance_records'
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('inventory_item.id'), nullable=False)
    maintenance_type = db.Column(db.String(50))  # repair, inspection, cleaning
    description = db.Column(db.Text)
    cost = db.Column(db.Float)
    performed_by = db.Column(db.String(100))
    maintenance_date = db.Column(db.DateTime, default=datetime.utcnow)
    next_maintenance_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='completed')  # scheduled, in_progress, completed
    notes = db.Column(db.Text)
    maintenance_reminder_sent = db.Column(db.Boolean, default=False)
    
    # Relationships
    item = db.relationship('InventoryItem', backref='maintenance_records')
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_id': self.item_id,
            'maintenance_type': self.maintenance_type,
            'description': self.description,
            'cost': self.cost,
            'performed_by': self.performed_by,
            'maintenance_date': self.maintenance_date.isoformat(),
            'next_maintenance_date': self.next_maintenance_date.isoformat() if self.next_maintenance_date else None,
            'status': self.status,
            'notes': self.notes,
            'item_name': self.item.name
        }
