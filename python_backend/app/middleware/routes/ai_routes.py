from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import gemini_service, fb_service
from app.models import Page
import logging

logger = logging.getLogger("AiRoutes")
ai_bp = Blueprint('ai', __name__)

def get_active_page(user_id):
    """Helper to get active page for current user."""
    return Page.query.filter_by(user_id=user_id, is_active=True).first()


@ai_bp.post('/ai/analyze-comments')
@jwt_required()
def analyze_comments():
    """
    Phân tích danh sách comment bằng Gemini AI.
    Body: { "comments": [...], "postId": "optional" }
    Trả về mảng kết quả với priority, sentiment, category, summary.
    """
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    data = request.get_json()
    comments = data.get("comments", [])
    post_id = data.get("postId")

    # Nếu không truyền comments mà truyền postId → fetch comments từ Facebook
    if not comments and post_id:
        res = fb_service.get_comment_list(post_id, active_page.access_token)
        if not res["success"]:
            return jsonify(res), 500
        comments = res["data"].get("data", [])

    if not comments:
        return jsonify({"error": "Không có comment nào để phân tích"}), 400

    try:
        results = gemini_service.analyze_comments(comments)
        # Merge kết quả AI vào từng comment gốc
        merged = []
        for i, comment in enumerate(comments):
            ai_result = next((r for r in results if r.get("index") == i), {})
            merged.append({
                **comment,
                "ai": {
                    "priority": ai_result.get("priority", 3),
                    "sentiment": ai_result.get("sentiment", "neutral"),
                    "category": ai_result.get("category", "other"),
                    "summary": ai_result.get("summary", "")
                }
            })
        # Sort by priority descending
        merged.sort(key=lambda x: x["ai"]["priority"], reverse=True)
        return jsonify({"data": merged, "total": len(merged)}), 200
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        logger.exception("Lỗi analyze_comments")
        return jsonify({"error": "Lỗi phân tích AI", "detail": str(e)}), 500


@ai_bp.post('/ai/suggest-reply')
@jwt_required()
def suggest_reply():
    """
    Gợi ý câu trả lời bán hàng cho 1 comment.
    Body: { "commentText": str, "postContext": str (optional), "tone": str (optional) }
    Trả về: { "suggestions": ["...", "...", "..."] }
    """
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    data = request.get_json()
    comment_text = data.get("commentText", "").strip()
    post_context = data.get("postContext", "")
    tone = data.get("tone", "friendly")

    if not comment_text:
        return jsonify({"error": "commentText là bắt buộc"}), 400

    try:
        suggestions = gemini_service.suggest_reply(comment_text, post_context, tone)
        return jsonify({"suggestions": suggestions}), 200
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        logger.exception("Lỗi suggest_reply")
        return jsonify({"error": "Lỗi tạo gợi ý AI", "detail": str(e)}), 500


@ai_bp.post('/ai/auto-analyze-page')
@jwt_required()
def auto_analyze_page():
    """
    Lấy toàn bộ posts + comments của page và phân tích AI.
    Trả về list posts, mỗi post có comments đã được AI phân tích và sort.
    """
    user_id = get_jwt_identity()
    active_page = get_active_page(user_id)
    if not active_page:
        return jsonify({"error": "No active page selected"}), 401

    try:
        # Fetch posts with comments từ Facebook
        res = fb_service.get_posts_with_comments(active_page.id, active_page.access_token)
        if not res["success"]:
            return jsonify(res), 500

        posts = res["data"].get("data", [])
        analyzed_posts = []

        for post in posts:
            raw_comments = post.get("comments", {}).get("data", [])
            if raw_comments:
                ai_results = gemini_service.analyze_comments(raw_comments)
                enriched = []
                for i, c in enumerate(raw_comments):
                    ai_data = next((r for r in ai_results if r.get("index") == i), {})
                    enriched.append({
                        **c,
                        "ai": {
                            "priority": ai_data.get("priority", 3),
                            "sentiment": ai_data.get("sentiment", "neutral"),
                            "category": ai_data.get("category", "other"),
                            "summary": ai_data.get("summary", "")
                        }
                    })
                enriched.sort(key=lambda x: x["ai"]["priority"], reverse=True)
                post["comments"]["data"] = enriched
            analyzed_posts.append(post)

        return jsonify({"data": analyzed_posts, "total": len(analyzed_posts)}), 200
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        logger.exception("Lỗi auto_analyze_page")
        return jsonify({"error": str(e)}), 500
