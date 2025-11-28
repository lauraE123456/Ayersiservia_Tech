from flask import Blueprint, request, jsonify, current_app
from controllers.ticket_controller import process_ticket_controller

ticket_bp = Blueprint("tickets", __name__)

@ticket_bp.route("/ticket", methods=["POST"])
def create_ticket():
    data = request.get_json()

    text = data.get("text", "")
    client_id = data.get("client_id", "UNKNOWN")
    source = data.get("source", "Unknown")

    ai_result = process_ticket_controller(text, client_id, source)

    current_app.tickets_store.append(ai_result)

    return jsonify(ai_result), 200
