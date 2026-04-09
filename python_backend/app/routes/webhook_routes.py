import os
import logging
from flask import Blueprint, request

logger = logging.getLogger("WebhookRoutes")
webhook_bp = Blueprint('webhook', __name__)

VERIFY_TOKEN = os.getenv('WEBHOOK_VERIFY_TOKEN', 'my_secret_token_123')

@webhook_bp.get('/webhook')
def verify_webhook():
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')

    if mode == 'subscribe' and token == VERIFY_TOKEN:
        logger.info("Webhook verified successfully!")
        return challenge, 200
    else:
        logger.warning("Webhook verification failed.")
        return 'Forbidden', 403

@webhook_bp.post('/webhook')
def receive_webhook():
    data = request.json
    logger.info(f"Received Webhook Event: {data}")
    return "EVENT_RECEIVED", 200
