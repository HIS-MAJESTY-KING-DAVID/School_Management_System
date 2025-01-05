from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.communication import Message, Announcement, Notification, Conference, ChatRoom, ChatParticipant, ChatMessage
from app.models.user import User
from app import db, mail
from flask_mail import Message as EmailMessage
from datetime import datetime

communication_bp = Blueprint('communication', __name__)

# Message routes
@communication_bp.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    data = request.get_json()
    message = Message(
        sender_id=get_jwt_identity(),
        recipient_id=data['recipient_id'],
        subject=data.get('subject'),
        content=data['content']
    )
    db.session.add(message)
    
    # Create notification for recipient
    notification = Notification(
        user_id=data['recipient_id'],
        title='New Message',
        content=f'You have a new message from {message.sender.first_name} {message.sender.last_name}',
        type='message',
        reference_id=message.id
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify(message.to_dict()), 201

@communication_bp.route('/messages/inbox', methods=['GET'])
@jwt_required()
def get_inbox():
    messages = Message.query.filter_by(recipient_id=get_jwt_identity()).order_by(Message.created_at.desc()).all()
    return jsonify([message.to_dict() for message in messages])

@communication_bp.route('/messages/sent', methods=['GET'])
@jwt_required()
def get_sent_messages():
    messages = Message.query.filter_by(sender_id=get_jwt_identity()).order_by(Message.created_at.desc()).all()
    return jsonify([message.to_dict() for message in messages])

@communication_bp.route('/messages/<int:message_id>/read', methods=['POST'])
@jwt_required()
def mark_message_read(message_id):
    message = Message.query.get_or_404(message_id)
    if message.recipient_id != get_jwt_identity():
        return jsonify({'error': 'Unauthorized'}), 403
    
    message.read = True
    db.session.commit()
    return jsonify({'message': 'Message marked as read'})

# Announcement routes
@communication_bp.route('/announcements', methods=['POST'])
@jwt_required()
def create_announcement():
    data = request.get_json()
    announcement = Announcement(
        title=data['title'],
        content=data['content'],
        sender_id=get_jwt_identity(),
        target_role=data['target_role']
    )
    db.session.add(announcement)
    
    # Create notifications for target users
    target_users = User.query.filter_by(role=data['target_role']).all() if data['target_role'] != 'all' else User.query.all()
    
    for user in target_users:
        notification = Notification(
            user_id=user.id,
            title='New Announcement',
            content=f'New announcement: {data["title"]}',
            type='announcement',
            reference_id=announcement.id
        )
        db.session.add(notification)
        
        # Send email notification if email is configured
        if user.email:
            email = EmailMessage(
                'New Announcement',
                f'There is a new announcement: {data["title"]}\n\n{data["content"]}',
                'noreply@school.com',
                [user.email]
            )
            mail.send(email)
    
    db.session.commit()
    return jsonify(announcement.to_dict()), 201

@communication_bp.route('/announcements', methods=['GET'])
@jwt_required()
def get_announcements():
    user = User.query.get(get_jwt_identity())
    announcements = Announcement.query.filter(
        (Announcement.target_role == 'all') | 
        (Announcement.target_role == user.role)
    ).order_by(Announcement.created_at.desc()).all()
    return jsonify([announcement.to_dict() for announcement in announcements])

# Notification routes
@communication_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    notifications = Notification.query.filter_by(
        user_id=get_jwt_identity()
    ).order_by(Notification.created_at.desc()).all()
    return jsonify([notification.to_dict() for notification in notifications])

@communication_bp.route('/notifications/unread', methods=['GET'])
@jwt_required()
def get_unread_notifications():
    notifications = Notification.query.filter_by(
        user_id=get_jwt_identity(),
        read=False
    ).order_by(Notification.created_at.desc()).all()
    return jsonify([notification.to_dict() for notification in notifications])

@communication_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    notification = Notification.query.get_or_404(notification_id)
    if notification.user_id != get_jwt_identity():
        return jsonify({'error': 'Unauthorized'}), 403
    
    notification.read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read'})

# Conference routes
@communication_bp.route('/conferences', methods=['POST'])
@jwt_required()
def create_conference():
    data = request.get_json()
    conference = Conference(
        teacher_id=data['teacher_id'],
        parent_id=data['parent_id'],
        student_id=data['student_id'],
        title=data['title'],
        description=data.get('description'),
        date=datetime.fromisoformat(data['date']),
        duration=data.get('duration', 30),
        meeting_link=data.get('meeting_link'),
        location=data.get('location')
    )
    db.session.add(conference)
    
    # Create notifications for participants
    participants = [
        (conference.teacher_id, 'teacher'),
        (conference.parent_id, 'parent'),
        (conference.student_id, 'student')
    ]
    
    for user_id, role in participants:
        notification = Notification(
            user_id=user_id,
            title='New Conference Scheduled',
            content=f'A parent-teacher conference has been scheduled: {data["title"]}',
            type='conference',
            reference_id=conference.id
        )
        db.session.add(notification)
        
        # Send email notification
        user = User.query.get(user_id)
        if user and user.email:
            email = EmailMessage(
                'Parent-Teacher Conference Scheduled',
                f'''
                A new conference has been scheduled:
                
                Title: {data["title"]}
                Date: {data["date"]}
                Duration: {data.get("duration", 30)} minutes
                {'Meeting Link: ' + data["meeting_link"] if data.get("meeting_link") else ''}
                {'Location: ' + data["location"] if data.get("location") else ''}
                
                Description:
                {data.get("description", "")}
                ''',
                'noreply@school.com',
                [user.email]
            )
            mail.send(email)
    
    db.session.commit()
    return jsonify(conference.to_dict()), 201

@communication_bp.route('/conferences', methods=['GET'])
@jwt_required()
def get_conferences():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role == 'teacher':
        conferences = Conference.query.filter_by(teacher_id=user_id).all()
    elif user.role == 'parent':
        conferences = Conference.query.filter_by(parent_id=user_id).all()
    elif user.role == 'student':
        conferences = Conference.query.filter_by(student_id=user_id).all()
    else:
        conferences = Conference.query.all()
    
    return jsonify([conf.to_dict() for conf in conferences])

@communication_bp.route('/conferences/<int:conference_id>', methods=['PUT'])
@jwt_required()
def update_conference(conference_id):
    conference = Conference.query.get_or_404(conference_id)
    data = request.get_json()
    
    # Update fields
    for field in ['title', 'description', 'date', 'duration', 'status', 'meeting_link', 'location']:
        if field in data:
            if field == 'date':
                setattr(conference, field, datetime.fromisoformat(data[field]))
            else:
                setattr(conference, field, data[field])
    
    # If status changed to cancelled, notify participants
    if data.get('status') == 'cancelled' and conference.status != 'cancelled':
        participants = [
            (conference.teacher_id, 'teacher'),
            (conference.parent_id, 'parent'),
            (conference.student_id, 'student')
        ]
        
        for user_id, role in participants:
            notification = Notification(
                user_id=user_id,
                title='Conference Cancelled',
                content=f'The conference "{conference.title}" has been cancelled.',
                type='conference_cancelled',
                reference_id=conference.id
            )
            db.session.add(notification)
    
    db.session.commit()
    return jsonify(conference.to_dict())

# Chat routes
@communication_bp.route('/chat/rooms', methods=['POST'])
@jwt_required()
def create_chat_room():
    data = request.get_json()
    chat_room = ChatRoom(
        name=data.get('name'),
        type=data['type'],
        class_id=data.get('class_id')
    )
    db.session.add(chat_room)
    
    # Add participants
    for user_id in data['participant_ids']:
        participant = ChatParticipant(
            chat_room_id=chat_room.id,
            user_id=user_id
        )
        db.session.add(participant)
    
    # Add the creator as participant
    creator_participant = ChatParticipant(
        chat_room_id=chat_room.id,
        user_id=get_jwt_identity()
    )
    db.session.add(creator_participant)
    
    db.session.commit()
    return jsonify(chat_room.to_dict()), 201

@communication_bp.route('/chat/rooms', methods=['GET'])
@jwt_required()
def get_chat_rooms():
    user_id = get_jwt_identity()
    participations = ChatParticipant.query.filter_by(user_id=user_id).all()
    chat_rooms = [p.chat_room for p in participations]
    return jsonify([room.to_dict() for room in chat_rooms])

@communication_bp.route('/chat/rooms/<int:room_id>/messages', methods=['POST'])
@jwt_required()
def send_chat_message(room_id):
    data = request.get_json()
    message = ChatMessage(
        chat_room_id=room_id,
        sender_id=get_jwt_identity(),
        content=data['content'],
        message_type=data.get('message_type', 'text'),
        file_url=data.get('file_url')
    )
    db.session.add(message)
    
    # Update last_read_at for sender
    participant = ChatParticipant.query.filter_by(
        chat_room_id=room_id,
        user_id=get_jwt_identity()
    ).first()
    if participant:
        participant.last_read_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(message.to_dict()), 201

@communication_bp.route('/chat/rooms/<int:room_id>/messages', methods=['GET'])
@jwt_required()
def get_chat_messages(room_id):
    # Verify user is participant
    participant = ChatParticipant.query.filter_by(
        chat_room_id=room_id,
        user_id=get_jwt_identity()
    ).first_or_404()
    
    # Get messages with pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    messages = ChatMessage.query.filter_by(chat_room_id=room_id)\
        .order_by(ChatMessage.created_at.desc())\
        .paginate(page=page, per_page=per_page)
    
    return jsonify({
        'messages': [msg.to_dict() for msg in messages.items],
        'total': messages.total,
        'pages': messages.pages,
        'current_page': messages.page
    })

@communication_bp.route('/chat/rooms/<int:room_id>/read', methods=['POST'])
@jwt_required()
def mark_messages_read(room_id):
    participant = ChatParticipant.query.filter_by(
        chat_room_id=room_id,
        user_id=get_jwt_identity()
    ).first_or_404()
    
    participant.last_read_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Messages marked as read'})
