from app import db
from datetime import datetime

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject = db.Column(db.String(200))
    content = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_messages')

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'subject': self.subject,
            'content': self.content,
            'read': self.read,
            'created_at': self.created_at.isoformat(),
            'sender_name': f"{self.sender.first_name} {self.sender.last_name}",
            'recipient_name': f"{self.recipient.first_name} {self.recipient.last_name}"
        }

class Announcement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    target_role = db.Column(db.String(20))  # all, teachers, students, parents
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = db.relationship('User', backref='announcements')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'sender_id': self.sender_id,
            'target_role': self.target_role,
            'created_at': self.created_at.isoformat(),
            'sender_name': f"{self.sender.first_name} {self.sender.last_name}"
        }

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50))  # assignment, grade, attendance, announcement
    reference_id = db.Column(db.Integer)  # ID of the referenced item
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'content': self.content,
            'type': self.type,
            'reference_id': self.reference_id,
            'read': self.read,
            'created_at': self.created_at.isoformat()
        }

class Conference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, default=30)  # Duration in minutes
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled
    meeting_link = db.Column(db.String(500))  # For virtual meetings
    location = db.Column(db.String(200))  # For in-person meetings
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    teacher = db.relationship('User', foreign_keys=[teacher_id], backref='teacher_conferences')
    parent = db.relationship('User', foreign_keys=[parent_id], backref='parent_conferences')
    student = db.relationship('User', foreign_keys=[student_id], backref='student_conferences')

    def to_dict(self):
        return {
            'id': self.id,
            'teacher_id': self.teacher_id,
            'parent_id': self.parent_id,
            'student_id': self.student_id,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat(),
            'duration': self.duration,
            'status': self.status,
            'meeting_link': self.meeting_link,
            'location': self.location,
            'created_at': self.created_at.isoformat(),
            'teacher_name': f"{self.teacher.first_name} {self.teacher.last_name}",
            'parent_name': f"{self.parent.first_name} {self.parent.last_name}",
            'student_name': f"{self.student.first_name} {self.student.last_name}"
        }

class ChatRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    type = db.Column(db.String(20))  # private, group, course
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'created_at': self.created_at.isoformat(),
            'course_id': self.course_id
        }

class ChatParticipant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_room_id = db.Column(db.Integer, db.ForeignKey('chat_room.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_read_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    chat_room = db.relationship('ChatRoom', backref='participants')
    user = db.relationship('User', backref='chat_participations')
    
    def to_dict(self):
        return {
            'id': self.id,
            'chat_room_id': self.chat_room_id,
            'user_id': self.user_id,
            'joined_at': self.joined_at.isoformat(),
            'last_read_at': self.last_read_at.isoformat(),
            'user_name': f"{self.user.first_name} {self.user.last_name}"
        }

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_room_id = db.Column(db.Integer, db.ForeignKey('chat_room.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, image, file
    file_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    chat_room = db.relationship('ChatRoom', backref='messages')
    sender = db.relationship('User', backref='chat_messages')
    
    def to_dict(self):
        return {
            'id': self.id,
            'chat_room_id': self.chat_room_id,
            'sender_id': self.sender_id,
            'content': self.content,
            'message_type': self.message_type,
            'file_url': self.file_url,
            'created_at': self.created_at.isoformat(),
            'sender_name': f"{self.sender.first_name} {self.sender.last_name}"
        }
