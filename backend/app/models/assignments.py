from app import db
from datetime import datetime

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    max_score = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    course = db.relationship('Course', backref='assignments')
    submissions = db.relationship('AssignmentSubmission', backref='assignment')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'course_id': self.course_id,
            'due_date': self.due_date.isoformat(),
            'max_score': self.max_score,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AssignmentSubmission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    submission_date = db.Column(db.DateTime, default=datetime.utcnow)
    file_path = db.Column(db.String(255))
    score = db.Column(db.Float)
    feedback = db.Column(db.Text)
    status = db.Column(db.String(20), default='submitted')  # submitted, graded, late

    def to_dict(self):
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'student_id': self.student_id,
            'submission_date': self.submission_date.isoformat(),
            'file_path': self.file_path,
            'score': self.score,
            'feedback': self.feedback,
            'status': self.status
        }

class CourseMaterial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    file_path = db.Column(db.String(255))
    material_type = db.Column(db.String(50))  # lecture_note, assignment, reading
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    course = db.relationship('Course', backref='materials')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'course_id': self.course_id,
            'file_path': self.file_path,
            'material_type': self.material_type,
            'upload_date': self.upload_date.isoformat()
        }
