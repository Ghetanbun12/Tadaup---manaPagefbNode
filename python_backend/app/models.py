from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# db is defined here to be the single source of truth for models
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(100), primary_key=True) # Facebook User ID
    name = db.Column(db.String(200), nullable=False)
    access_token = db.Column(db.Text, nullable=False) # Long-lived user token
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship: One user can manage many pages
    pages = db.relationship('Page', backref='user', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "totalPages": len(self.pages)
        }

class Page(db.Model):
    __tablename__ = 'pages'
    
    id = db.Column(db.String(100), primary_key=True) # Facebook Page ID
    name = db.Column(db.String(200), nullable=False)
    access_token = db.Column(db.Text, nullable=False) # Page access token
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "accessToken": self.access_token,
            "isActive": self.is_active
        }

class CustomerTag(db.Model):
    __tablename__ = 'customer_tags'
    
    id = db.Column(db.Integer, primary_key=True)
    page_id = db.Column(db.String(100), db.ForeignKey('pages.id'), nullable=False)
    customer_id = db.Column(db.String(100), nullable=False) # Facebook user ID of customer
    name = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(20), default='#6366f1')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "page_id": self.page_id,
            "customer_id": self.customer_id,
            "name": self.name,
            "color": self.color
        }
