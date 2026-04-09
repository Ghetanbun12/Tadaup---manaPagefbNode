import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("FacebookService")

class FacebookService:
    def __init__(self, app_id=None, app_secret=None):
        self.app_id = app_id
        self.app_secret = app_secret
        self.base_url = "https://graph.facebook.com/v19.0"

    def _call_api(self, method, endpoint, params=None, data=None, token=None):
        """Helper to call Facebook Graph API with error handling."""
        url = f"{self.base_url}/{endpoint}"
        
        # Add access token to params if provided
        if token:
            params = params or {}
            params["access_token"] = token

        try:
            logger.info(f"Calling Graph API: {method} {endpoint}")
            response = requests.request(method, url, params=params, json=data)
            
            # Parse response
            res_data = response.json()
            
            if not response.ok:
                logger.error(f"Graph API Error: {res_data}")
                return {"success": False, "error": res_data.get("error", {}).get("message", "Unknown error"), "details": res_data}
            
            return {"success": True, "data": res_data}
        except Exception as e:
            logger.exception("Network error calling Graph API")
            return {"success": False, "error": str(e)}

    def exchange_token(self, short_lived_token):
        """Exchange short-lived user token for long-lived user token."""
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": self.app_id,
            "client_secret": self.app_secret,
            "fb_exchange_token": short_lived_token
        }
        return self._call_api("GET", "oauth/access_token", params=params)

    def get_user_accounts(self, user_token):
        """Get all pages managed by the user."""
        return self._call_api("GET", "me/accounts", token=user_token)

    def post_to_feed(self, page_id, token, message):
        """Post a message to page's feed."""
        data = {"message": message}
        return self._call_api("POST", f"{page_id}/feed", data=data, token=token)

    def post_photo_to_feed(self, page_id, token, message, photo_file):
        """Post a photo with message to page."""
        url = f"{self.base_url}/{page_id}/photos"
        params = {
            "message": message,
            "access_token": token
        }
        # In Flask, photo_file is a FileStorage object
        files = {
            "source": (photo_file.filename, photo_file.stream, photo_file.mimetype)
        }
        try:
            logger.info(f"Calling Graph API: POST {page_id}/photos")
            response = requests.post(url, params=params, files=files)
            res_data = response.json()
            
            if not response.ok:
                logger.error(f"Graph API Photo Error: {res_data}")
                return {"success": False, "error": res_data.get("error", {}).get("message", "Unknown error"), "details": res_data}
            
            return {"success": True, "data": res_data}
        except Exception as e:
            logger.exception("Network error calling Graph API for photo")
            return {"success": False, "error": str(e)}

    def get_posts_with_comments(self, page_id, token):
        """Get recent posts and their comments."""
        params = {"fields": "message,comments{from,message,created_time,comments{from,message,created_time}}"}
        return self._call_api("GET", f"{page_id}/posts", params=params, token=token)

    def get_comment_list(self, post_id, token):
        """Get comments for a specific post."""
        params = {"fields": "from,message,created_time,comments{from,message,created_time}"}
        return self._call_api("GET", f"{post_id}/comments", params=params, token=token)

    def reply_to_comment(self, comment_id, token, message):
        """Reply to a comment."""
        data = {"message": message}
        return self._call_api("POST", f"{comment_id}/comments", data=data, token=token)

    def like_comment(self, comment_id, token):
        """Like a comment."""
        return self._call_api("POST", f"{comment_id}/likes", token=token)

    def delete_comment(self, comment_id, token):
        """Delete a comment."""
        return self._call_api("DELETE", comment_id, token=token)

    def toggle_comment_visibility(self, comment_id, token, hide=True):
        """Hide or unhide a comment."""
        params = {"is_hidden": str(hide).lower()}
        return self._call_api("POST", comment_id, params=params, token=token)

    def send_messenger_message(self, recipient_id, token, message_text):
        """Send a message via Messenger API."""
        data = {
            "recipient": {"id": recipient_id},
            "message": {"text": message_text}
        }
        return self._call_api("POST", "me/messages", data=data, token=token)

    def get_page_insights(self, page_id, token):
        """Get page impressions."""
        params = {
            "metric": "page_impressions_unique",
            "period": "day"
        }
        return self._call_api("GET", f"{page_id}/insights", params=params, token=token)

    def get_conversations(self, page_id, token):
        """Get recent conversations with unread counts."""
        params = {
            "fields": "participants,updated_time,unread_count,snippet"
        }
        return self._call_api("GET", "me/conversations", params=params, token=token)

    def get_conversation_messages(self, conversation_id, token):
        """Get message history for a specific conversation."""
        params = {
            "fields": "message,from,created_time",
            "limit": 50
        }
        return self._call_api("GET", f"{conversation_id}/messages", params=params, token=token)
