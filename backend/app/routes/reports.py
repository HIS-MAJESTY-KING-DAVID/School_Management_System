from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.academic import Course, Student, Grade, Attendance
from app.models.financial import Payment, StudentFee, Invoice
from app import db
from sqlalchemy import func
from datetime import datetime, timedelta
import pandas as pd
import io

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/academic/performance', methods=['GET'])
@jwt_required()
def academic_performance_report():
    student_id = request.args.get('student_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = db.session.query(
        Grade.student_id,
        Student.first_name,
        Student.last_name,
        Course.name.label('course_name'),
        func.avg(Grade.score).label('average_score'),
        func.count(Grade.id).label('total_assessments')
    ).join(Student).join(Course)
    
    if student_id:
        query = query.filter(Grade.student_id == student_id)
    if start_date and end_date:
        query = query.filter(Grade.created_at.between(
            datetime.strptime(start_date, '%Y-%m-%d'),
            datetime.strptime(end_date, '%Y-%m-%d')
        ))
    
    results = query.group_by(
        Grade.student_id,
        Student.first_name,
        Student.last_name,
        Course.name
    ).all()
    
    return jsonify([{
        'student_id': r.student_id,
        'student_name': f"{r.first_name} {r.last_name}",
        'course_name': r.course_name,
        'average_score': float(r.average_score),
        'total_assessments': r.total_assessments
    } for r in results])

@reports_bp.route('/academic/attendance', methods=['GET'])
@jwt_required()
def attendance_report():
    student_id = request.args.get('student_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = db.session.query(
        Attendance.student_id,
        Student.first_name,
        Student.last_name,
        Course.name.label('course_name'),
        func.count(Attendance.id).label('total_classes'),
        func.sum(case([(Attendance.status == 'present', 1)], else_=0)).label('present_count'),
        func.sum(case([(Attendance.status == 'absent', 1)], else_=0)).label('absent_count'),
        func.sum(case([(Attendance.status == 'late', 1)], else_=0)).label('late_count')
    ).join(Student).join(Course)
    
    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    if start_date and end_date:
        query = query.filter(Attendance.date.between(
            datetime.strptime(start_date, '%Y-%m-%d'),
            datetime.strptime(end_date, '%Y-%m-%d')
        ))
    
    results = query.group_by(
        Attendance.student_id,
        Student.first_name,
        Student.last_name,
        Course.name
    ).all()
    
    return jsonify([{
        'student_id': r.student_id,
        'student_name': f"{r.first_name} {r.last_name}",
        'course_name': r.course_name,
        'total_classes': r.total_classes,
        'present_count': r.present_count,
        'absent_count': r.absent_count,
        'late_count': r.late_count,
        'attendance_rate': (r.present_count / r.total_classes * 100) if r.total_classes > 0 else 0
    } for r in results])

@reports_bp.route('/financial/summary', methods=['GET'])
@jwt_required()
def financial_summary_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Fee collection summary
    payments_query = db.session.query(
        func.sum(Payment.amount).label('total_collected'),
        func.count(Payment.id).label('total_payments')
    )
    
    # Outstanding fees summary
    outstanding_query = db.session.query(
        func.sum(StudentFee.amount_due - StudentFee.amount_paid).label('total_outstanding'),
        func.count(StudentFee.id).label('total_pending_fees')
    ).filter(StudentFee.status.in_(['pending', 'partial']))
    
    if start_date and end_date:
        payments_query = payments_query.filter(Payment.payment_date.between(
            datetime.strptime(start_date, '%Y-%m-%d'),
            datetime.strptime(end_date, '%Y-%m-%d')
        ))
    
    payments_result = payments_query.first()
    outstanding_result = outstanding_query.first()
    
    return jsonify({
        'total_collected': float(payments_result.total_collected) if payments_result.total_collected else 0,
        'total_payments': payments_result.total_payments,
        'total_outstanding': float(outstanding_result.total_outstanding) if outstanding_result.total_outstanding else 0,
        'total_pending_fees': outstanding_result.total_pending_fees
    })

@reports_bp.route('/export/academic', methods=['GET'])
@jwt_required()
def export_academic_report():
    report_type = request.args.get('type')  # grades or attendance
    format_type = request.args.get('format', 'csv')  # csv or excel
    
    if report_type == 'grades':
        data = academic_performance_report().get_json()
    elif report_type == 'attendance':
        data = attendance_report().get_json()
    else:
        return jsonify({'error': 'Invalid report type'}), 400
    
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    if format_type == 'csv':
        df.to_csv(output, index=False)
        mimetype = 'text/csv'
        filename = f'{report_type}_report.csv'
    else:  # excel
        df.to_excel(output, index=False)
        mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f'{report_type}_report.xlsx'
    
    output.seek(0)
    return send_file(
        output,
        mimetype=mimetype,
        as_attachment=True,
        download_name=filename
    )

@reports_bp.route('/export/financial', methods=['GET'])
@jwt_required()
def export_financial_report():
    format_type = request.args.get('format', 'csv')  # csv or excel
    
    data = financial_summary_report().get_json()
    df = pd.DataFrame([data])  # Convert single dictionary to DataFrame
    
    output = io.BytesIO()
    if format_type == 'csv':
        df.to_csv(output, index=False)
        mimetype = 'text/csv'
        filename = 'financial_report.csv'
    else:  # excel
        df.to_excel(output, index=False)
        mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = 'financial_report.xlsx'
    
    output.seek(0)
    return send_file(
        output,
        mimetype=mimetype,
        as_attachment=True,
        download_name=filename
    )
