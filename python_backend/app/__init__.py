from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .models import db
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize fb_service at module level so routes can import it
from app.services.facebook_service import FacebookService
fb_service = FacebookService(
    app_id=os.getenv('FB_APP_ID'),
    app_secret=os.getenv('FB_APP_SECRET')
)

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Database Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///fb_manager.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key-change-me')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600 * 24 * 7  # 7 days

    # Initialize Extensions
    db.init_app(app)
    JWTManager(app)

    with app.app_context():
        db.create_all()
        print("Database tables created successfully.")

    # Middleware
    from app.middleware.logger import setup_logger
    setup_logger(app)

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.page_routes import page_bp
    from app.routes.webhook_routes import webhook_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(page_bp, url_prefix='/api')
    app.register_blueprint(webhook_bp, url_prefix='/webhook')

    return app
