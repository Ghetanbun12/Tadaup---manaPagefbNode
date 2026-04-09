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

# Initialize gemini_service at module level
from app.services.gemini_service import GeminiService
gemini_service = GeminiService(api_key=os.getenv('GEMINI_API_KEY'))

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
    from app.middleware.routes.auth_routes import auth_bp
    from app.middleware.routes.page_routes import page_bp
    from app.middleware.routes.webhook_routes import webhook_bp
    from app.middleware.routes.ai_routes import ai_bp
    from app.middleware.routes.tag_routes import tag_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(page_bp, url_prefix='/api')
    app.register_blueprint(tag_bp, url_prefix='/api')
    app.register_blueprint(webhook_bp, url_prefix='/webhook')
    app.register_blueprint(ai_bp, url_prefix='/api')

    return app
