from app import create_app, db
from app.models.user import User
from app.models.communication import Message, Announcement, Notification, Conference, ChatRoom, ChatParticipant, ChatMessage
from app.models.resources import BookLending, InventoryItem, MaintenanceRecord

app = create_app()

with app.app_context():
    # Create all tables
    db.create_all()
    
    # Create a test admin user if it doesn't exist
    if not User.query.filter_by(email='admin@school.com').first():
        admin = User(
            email='admin@school.com',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("Created admin user: admin@school.com / admin123")
    
    print("Database initialized successfully!")
