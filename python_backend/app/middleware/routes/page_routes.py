from flask import Blueprint, request, jsonify
from app import fb_service
from app.models import Page
from flask_jwt_extended import jwt_required, get_jwt_identity

page_bp = Blueprint('page', __name__)

def get_active_page(user_id):
    """Helper to get active page for current user."""
    return Page.query.filter_by(user_id=user_id, is_active=True).first()

@page_bp.post('/page/post')
@jwt_required()
def post_to_page():
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    # Support both JSON and form-data
    if request.is_json:
        message = request.json.get('message')
        photo_file = None
    else:
        message = request.form.get('message')
        photo_file = request.files.get('file')

    if photo_file:
        res = fb_service.post_photo_to_feed(active_page.id, active_page.access_token, message, photo_file)
    else:
        res = fb_service.post_to_feed(active_page.id, active_page.access_token, message)
        
    return jsonify(res["data"] if res["success"] else res), (200 if res["success"] else 500)

@page_bp.get('/page/comments')
@jwt_required()
def get_comments():
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    post_id = request.args.get('postId')
    if post_id:
        res = fb_service.get_comment_list(post_id, active_page.access_token)
    else:
        res = fb_service.get_posts_with_comments(active_page.id, active_page.access_token)
    
    return jsonify(res["data"] if res["success"] else res), (200 if res["success"] else 500)

@page_bp.post('/page/comment/reply')
@jwt_required()
def reply_comment():
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    data = request.json
    comment_id = data.get("commentId")
    message = data.get("message")
    
    if not comment_id or not message:
        return jsonify({"error": "commentId and message are required"}), 400
        
    res = fb_service.reply_to_comment(comment_id, active_page.access_token, message)
    return jsonify(res["data"] if res["success"] else res), (200 if res["success"] else 500)

@page_bp.post('/page/comment/like')
@jwt_required()
def like_comment():
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    comment_id = request.json.get("commentId")
    if not comment_id:
        return jsonify({"error": "commentId is required"}), 400
        
    res = fb_service.like_comment(comment_id, active_page.access_token)
    return jsonify(res["data"] if res["success"] else res), (200 if res["success"] else 500)

@page_bp.delete('/page/comment')
@jwt_required()
def delete_comment():
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    comment_id = request.json.get("commentId")
    if not comment_id:
        return jsonify({"error": "commentId is required"}), 400
        
    res = fb_service.delete_comment(comment_id, active_page.access_token)
    return jsonify(res["data"] if res["success"] else res), (200 if res["success"] else 500)

@page_bp.post('/page/comment/hide')
@jwt_required()
def hide_comment():
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    data = request.json
    comment_id = data.get("commentId")
    hide = data.get("hide", True)
    
    if not comment_id:
        return jsonify({"error": "commentId is required"}), 400
        
    res = fb_service.toggle_comment_visibility(comment_id, active_page.access_token, hide)
    return jsonify(res["data"] if res["success"] else res), (200 if res["success"] else 500)

@page_bp.post('/page/message/send')
@jwt_required()
def send_message():
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    data = request.json
    recipient_id = data.get("recipientId")
    message = data.get("message")
    
    if not recipient_id or not message:
        return jsonify({"error": "recipientId and message are required"}), 400
        
    res = fb_service.send_messenger_message(recipient_id, active_page.access_token, message)
    return jsonify(res["data"] if res["success"] else res), (200 if res["success"] else 500)

@page_bp.get('/page/insights')
@jwt_required()
def get_insights():
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    res = fb_service.get_page_insights(active_page.id, active_page.access_token)
    return jsonify(res["data"] if res["success"] else res), (200 if res["success"] else 500)

@page_bp.get('/page/conversations')
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401
    
    res = fb_service.get_conversations(active_page.id, active_page.access_token)
    return jsonify(res["data"] if res["success"] else res), (200 if res["success"] else 500)

@page_bp.get('/page/conversation/messages')
@jwt_required()
def get_conversation_messages():
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401
    
    conversation_id = request.args.get("conversationId")
    if not conversation_id:
        return jsonify({"error": "conversationId is required"}), 400
        
    res = fb_service.get_conversation_messages(conversation_id, active_page.access_token)
    return jsonify(res["data"] if res["success"] else res), (200 if res["success"] else 500)
