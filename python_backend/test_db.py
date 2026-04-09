from app import create_app
from app.models import db, User, Page, CustomerTag
import sys

try:
    print("Initializing Flask app...")
    app = create_app()
    with app.app_context():
        print("Attempting to connect to database and create tables...")
        db.create_all()
        # Test Query
        user_count = User.query.count()
        tag_count = CustomerTag.query.count()
        print(f"SUCCESS! Database connection works perfectly.")
        print(f"Stats: {user_count} Users, {tag_count} Tags.")
        sys.exit(0)
except Exception as e:
    print(f"DATABASE ERROR: {e}")
    sys.exit(1)
