from app import db
from datetime import datetime

class FeeStructure(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    frequency = db.Column(db.String(20), nullable=False)  # yearly, term, monthly
    category = db.Column(db.String(50), nullable=False)  # tuition, transport, etc.
    grade_level = db.Column(db.String(20))  # Optional: specific grade level
    academic_year = db.Column(db.String(9), nullable=False)  # e.g., "2024-2025"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'amount': self.amount,
            'frequency': self.frequency,
            'category': self.category,
            'grade_level': self.grade_level,
            'academic_year': self.academic_year,
            'created_at': self.created_at.isoformat()
        }

class StudentFee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    fee_structure_id = db.Column(db.Integer, db.ForeignKey('fee_structure.id'), nullable=False)
    amount_due = db.Column(db.Float, nullable=False)
    amount_paid = db.Column(db.Float, default=0)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, partial, paid
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    student = db.relationship('Student', backref='fees')
    fee_structure = db.relationship('FeeStructure')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'fee_structure_id': self.fee_structure_id,
            'amount_due': self.amount_due,
            'amount_paid': self.amount_paid,
            'due_date': self.due_date.isoformat(),
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_fee_id = db.Column(db.Integer, db.ForeignKey('student_fee.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    payment_method = db.Column(db.String(50), nullable=False)  # cash, card, bank_transfer
    transaction_id = db.Column(db.String(100))
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    notes = db.Column(db.Text)
    
    # Relationships
    student_fee = db.relationship('StudentFee', backref='payments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_fee_id': self.student_fee_id,
            'amount': self.amount,
            'payment_date': self.payment_date.isoformat(),
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'notes': self.notes
        }

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    invoice_number = db.Column(db.String(20), unique=True, nullable=False)
    issue_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='unpaid')  # unpaid, paid, overdue
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    student = db.relationship('Student', backref='invoices')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'invoice_number': self.invoice_number,
            'issue_date': self.issue_date.isoformat(),
            'due_date': self.due_date.isoformat(),
            'total_amount': self.total_amount,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }

class InvoiceItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, default=1)
    
    # Relationships
    invoice = db.relationship('Invoice', backref='items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'description': self.description,
            'amount': self.amount,
            'quantity': self.quantity,
            'total': self.amount * self.quantity
        }
