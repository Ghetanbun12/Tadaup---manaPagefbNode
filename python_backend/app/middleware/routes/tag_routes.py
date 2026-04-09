from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, CustomerTag, Page

tag_bp = Blueprint('tag_routes', __name__)

def get_active_page(user_id):
    return Page.query.filter_by(user_id=user_id, is_active=True).first()

@tag_bp.route('/tags/<customer_id>', methods=['GET'])
@jwt_required()
def get_tags(customer_id):
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page: return jsonify({"error": "No active page"}), 401
    
    tags = CustomerTag.query.filter_by(page_id=active_page.id, customer_id=customer_id).order_by(CustomerTag.created_at.desc()).all()
    return jsonify({"tags": [t.to_dict() for t in tags]}), 200

@tag_bp.route('/tags/<customer_id>', methods=['POST'])
@jwt_required()
def add_tag(customer_id):
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page: return jsonify({"error": "No active page"}), 401
    
    data = request.json
    name = data.get('name')
    color = data.get('color', '#6366f1')
    
    if not name: return jsonify({"error": "Name required"}), 400
    
    tag = CustomerTag(page_id=active_page.id, customer_id=customer_id, name=name, color=color)
    db.session.add(tag)
    db.session.commit()
    
    return jsonify({"success": True, "tag": tag.to_dict()}), 201

@tag_bp.route('/tags/<int:tag_id>', methods=['DELETE'])
@jwt_required()
def delete_tag(tag_id):
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page: return jsonify({"error": "No active page"}), 401
    
    tag = CustomerTag.query.filter_by(id=tag_id, page_id=active_page.id).first()
    if not tag: return jsonify({"error": "Not found"}), 404
    
    db.session.delete(tag)
    db.session.commit()
    return jsonify({"success": True}), 200
