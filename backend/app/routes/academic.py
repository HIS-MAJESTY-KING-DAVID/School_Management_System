from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.academic import Course, Student, Attendance, Grade, CourseEnrollment
from app.models.user import User
from app import db
from datetime import datetime

academic_bp = Blueprint('academic', __name__)

# Course routes
@academic_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_courses():
    courses = Course.query.all()
    return jsonify([course.to_dict() for course in courses])

@academic_bp.route('/courses', methods=['POST'])
@jwt_required()
def create_course():
    data = request.get_json()
    course = Course(
        code=data['code'],
        name=data['name'],
        description=data.get('description'),
        credits=data['credits'],
        teacher_id=data['teacher_id']
    )
    db.session.add(course)
    db.session.commit()
    return jsonify(course.to_dict()), 201

@academic_bp.route('/courses/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    return jsonify(course.to_dict())

# Student routes
@academic_bp.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    students = Student.query.all()
    return jsonify([student.to_dict() for student in students])

@academic_bp.route('/students', methods=['POST'])
@jwt_required()
def create_student():
    data = request.get_json()
    student = Student(
        user_id=data['user_id'],
        registration_number=data['registration_number'],
        current_grade=data.get('current_grade')
    )
    db.session.add(student)
    db.session.commit()
    return jsonify(student.to_dict()), 201

# Attendance routes
@academic_bp.route('/attendance', methods=['POST'])
@jwt_required()
def mark_attendance():
    data = request.get_json()
    attendance = Attendance(
        student_id=data['student_id'],
        course_id=data['course_id'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        status=data['status'],
        remarks=data.get('remarks')
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify(attendance.to_dict()), 201

@academic_bp.route('/attendance/course/<int:course_id>/date/<date>', methods=['GET'])
@jwt_required()
def get_course_attendance(course_id, date):
    attendance_date = datetime.strptime(date, '%Y-%m-%d').date()
    attendances = Attendance.query.filter_by(
        course_id=course_id,
        date=attendance_date
    ).all()
    return jsonify([attendance.to_dict() for attendance in attendances])

# Grade routes
@academic_bp.route('/grades', methods=['POST'])
@jwt_required()
def add_grade():
    data = request.get_json()
    grade = Grade(
        student_id=data['student_id'],
        course_id=data['course_id'],
        assessment_type=data['assessment_type'],
        score=data['score'],
        max_score=data['max_score'],
        remarks=data.get('remarks')
    )
    db.session.add(grade)
    db.session.commit()
    return jsonify(grade.to_dict()), 201

@academic_bp.route('/grades/student/<int:student_id>/course/<int:course_id>', methods=['GET'])
@jwt_required()
def get_student_course_grades(student_id, course_id):
    grades = Grade.query.filter_by(
        student_id=student_id,
        course_id=course_id
    ).all()
    return jsonify([grade.to_dict() for grade in grades])

# Course enrollment routes
@academic_bp.route('/enrollment', methods=['POST'])
@jwt_required()
def enroll_student():
    data = request.get_json()
    enrollment = CourseEnrollment(
        student_id=data['student_id'],
        course_id=data['course_id'],
        status=data.get('status', 'active')
    )
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({'message': 'Student enrolled successfully'}), 201

@academic_bp.route('/enrollment/course/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course_enrollments(course_id):
    enrollments = CourseEnrollment.query.filter_by(course_id=course_id).all()
    students = []
    for enrollment in enrollments:
        student = Student.query.get(enrollment.student_id)
        if student:
            student_dict = student.to_dict()
            student_dict['enrollment_status'] = enrollment.status
            students.append(student_dict)
    return jsonify(students)
