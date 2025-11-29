from flask import Blueprint
from controllers.chat_controller import chat_controller

chat_ia_bp = Blueprint('chat_ia_bp', __name__)

# Ruta POST /api/process_ticket
@chat_ia_bp.post("/chat")
def chat():
    return chat_controller()