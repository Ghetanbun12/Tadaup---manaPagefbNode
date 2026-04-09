from flask import Blueprint, request, jsonify
from app import fb_service
from ..models import db, User, Page
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import logging

logger = logging.getLogger("AuthRoutes")
auth_bp = Blueprint('auth', __name__)

@auth_bp.post('/auth/facebook')
def authenticate_facebook():
    """Exchange token, save user & pages to DB, return JWT."""
    data = request.json
    short_lived_token = data.get('shortLivedToken')

    if not short_lived_token:
        return jsonify({"error": "Short-lived token is required"}), 400

    # 1. Exchange for long-lived user token
    res = fb_service.exchange_token(short_lived_token)
    if not res["success"]:
        return jsonify(res), 500
    
    user_token = res["data"].get("access_token")

    # 2. Get User Profile (to get ID and Name)
    user_info_res = fb_service._call_api("GET", "me", params={"fields": "id,name"}, token=user_token)
    if not user_info_res["success"]:
        return jsonify({"error": "Could not fetch user profile"}), 500
    
    fb_user_id = user_info_res["data"]["id"]
    fb_user_name = user_info_res["data"]["name"]

    # 3. Save/Update User in DB
    user = User.query.get(fb_user_id)
    if not user:
        user = User(id=fb_user_id, name=fb_user_name, access_token=user_token)
        db.session.add(user)
    else:
        user.access_token = user_token
    
    # 4. Get and Sync Pages
    pages_res = fb_service.get_user_accounts(user_token)
    if not pages_res["success"]:
        return jsonify(pages_res), 500
    
    fb_pages = pages_res["data"].get("data", [])
    
    # Delete old pages for this user to sync fresh
    Page.query.filter_by(user_id=fb_user_id).delete()
    
    db_pages = []
    for p in fb_pages:
        new_page = Page(id=p["id"], name=p["name"], access_token=p["access_token"], user_id=fb_user_id)
        db.session.add(new_page)
        db_pages.append(new_page)

    db.session.commit()

    # 5. Issue JWT
    access_token = create_access_token(identity=fb_user_id)
    
    first_page_name = db_pages[0].name if db_pages else "No Pages"
    
    logger.info(f"User {fb_user_name} logged in. DB Synced.")
    
    return jsonify({
        "message": "Authentication successful",
        "jwt": access_token,
        "activePage": first_page_name,
        "totalPages": len(db_pages),
        "user": user.to_dict()
    })

@auth_bp.get('/pages')
@jwt_required()
def get_all_pages():
    """Get all managed pages for current user."""
    user_id = get_jwt_identity()
    pages = Page.query.filter_by(user_id=user_id).all()
    
    # Find active page (first one if none active)
    active_page = Page.query.filter_by(user_id=user_id, is_active=True).first()
    if not active_page and pages:
        active_page = pages[0]
        active_page.is_active = True
        db.session.commit()

    return jsonify({
        "pages": [p.to_dict() for p in pages],
        "activePageId": active_page.id if active_page else None
    })

@auth_bp.post('/page/select')
@jwt_required()
def select_active_page():
    """Switch active page in DB."""
    user_id = get_jwt_identity()
    page_id = request.json.get("pageId")
    
    if not page_id:
        return jsonify({"error": "pageId is required"}), 400
    
    # Reset all pages to inactive for this user
    Page.query.filter_by(user_id=user_id).update({"is_active": False})
    
    # Set selected page to active
    target_page = Page.query.filter_by(id=page_id, user_id=user_id).first()
    if not target_page:
        return jsonify({"error": "Page not found"}), 404
        
    target_page.is_active = True
    db.session.commit()
    

@auth_bp.get('/me')
@jwt_required()
def get_current_user():
    """Verify JWT and return user info & active page."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    active_page = Page.query.filter_by(user_id=user_id, is_active=True).first()
    
    return jsonify({
        "user": user.to_dict(),
        "activePage": active_page.to_dict() if active_page else None
    })
