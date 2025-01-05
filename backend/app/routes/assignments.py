from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
from app.models.assignments import Assignment, AssignmentSubmission, CourseMaterial
from app.models.academic import Course
from app import db
from datetime import datetime

assignments_bp = Blueprint('assignments', __name__)

# Assignment routes
@assignments_bp.route('/assignments', methods=['POST'])
@jwt_required()
def create_assignment():
    data = request.get_json()
    assignment = Assignment(
        title=data['title'],
        description=data.get('description'),
        course_id=data['course_id'],
        due_date=datetime.fromisoformat(data['due_date']),
        max_score=data['max_score']
    )
    db.session.add(assignment)
    db.session.commit()
    return jsonify(assignment.to_dict()), 201

@assignments_bp.route('/assignments/course/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course_assignments(course_id):
    assignments = Assignment.query.filter_by(course_id=course_id).all()
    return jsonify([assignment.to_dict() for assignment in assignments])

@assignments_bp.route('/assignments/<int:assignment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assignment():
    student_id = get_jwt_identity()
    assignment_id = request.form.get('assignment_id')
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    filename = secure_filename(file.filename)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'assignments', filename)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    file.save(file_path)
    
    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=student_id,
        file_path=file_path
    )
    db.session.add(submission)
    db.session.commit()
    
    return jsonify(submission.to_dict()), 201

@assignments_bp.route('/assignments/<int:assignment_id>/submissions', methods=['GET'])
@jwt_required()
def get_assignment_submissions(assignment_id):
    submissions = AssignmentSubmission.query.filter_by(assignment_id=assignment_id).all()
    return jsonify([submission.to_dict() for submission in submissions])

# Course materials routes
@assignments_bp.route('/materials', methods=['POST'])
@jwt_required()
def upload_material():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    filename = secure_filename(file.filename)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'materials', filename)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    file.save(file_path)
    
    material = CourseMaterial(
        title=request.form.get('title'),
        description=request.form.get('description'),
        course_id=request.form.get('course_id'),
        file_path=file_path,
        material_type=request.form.get('material_type')
    )
    db.session.add(material)
    db.session.commit()
    
    return jsonify(material.to_dict()), 201

@assignments_bp.route('/materials/course/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course_materials(course_id):
    materials = CourseMaterial.query.filter_by(course_id=course_id).all()
    return jsonify([material.to_dict() for material in materials])
