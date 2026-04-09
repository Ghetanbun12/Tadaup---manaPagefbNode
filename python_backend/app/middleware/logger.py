import logging
from flask import request

logger = logging.getLogger("App")

def setup_logger(app):
    @app.before_request
    def log_request_info():
        logger.info(f"Request: {request.method} {request.path} | Args: {request.args.to_dict()} | Body: {request.get_json(silent=True)}")
