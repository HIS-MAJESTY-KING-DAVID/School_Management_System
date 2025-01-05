from app import db
from datetime import datetime

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer, nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    teacher = db.relationship('User', backref='courses_taught')
    students = db.relationship('Student', secondary='course_enrollment')

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'credits': self.credits,
            'teacher_id': self.teacher_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    registration_number = db.Column(db.String(20), unique=True, nullable=False)
    current_grade = db.Column(db.String(10))
    admission_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='student_profile')
    courses = db.relationship('Course', secondary='course_enrollment')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'registration_number': self.registration_number,
            'current_grade': self.current_grade,
            'admission_date': self.admission_date.isoformat()
        }

class CourseEnrollment(db.Model):
    __tablename__ = 'course_enrollment'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='active')  # active, completed, dropped

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # present, absent, late
    remarks = db.Column(db.Text)
    
    # Relationships
    student = db.relationship('Student', backref='attendances')
    course = db.relationship('Course', backref='attendances')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id,
            'date': self.date.isoformat(),
            'status': self.status,
            'remarks': self.remarks
        }

class Grade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    assessment_type = db.Column(db.String(50), nullable=False)  # exam, assignment, project
    score = db.Column(db.Float, nullable=False)
    max_score = db.Column(db.Float, nullable=False)
    remarks = db.Column(db.Text)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    student = db.relationship('Student', backref='grades')
    course = db.relationship('Course', backref='grades')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id,
            'assessment_type': self.assessment_type,
            'score': self.score,
            'max_score': self.max_score,
            'remarks': self.remarks,
            'date': self.date.isoformat()
        }
