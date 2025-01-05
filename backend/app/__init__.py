from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from config import Config

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
scheduler = None

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    mail.init_app(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.academic import academic_bp
    from app.routes.communication import communication_bp
    from app.routes.financial import financial_bp
    from app.routes.assignments import assignments_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(academic_bp, url_prefix='/api/academic')
    app.register_blueprint(communication_bp, url_prefix='/api/communication')
    app.register_blueprint(financial_bp, url_prefix='/api/financial')
    app.register_blueprint(assignments_bp, url_prefix='/api/assignments')
    
    # Create database tables
    with app.app_context():
        db.create_all()
        
        # Initialize scheduler after database is ready
        from app.tasks.scheduled_tasks import init_scheduler
        global scheduler
        scheduler = init_scheduler()
    
    return app
