from flask import Blueprint, jsonify
from controllers.ticket_controller import (
    process_ticket_controller,
    recommendation_controller,
    resolve_ticket_controller
)

ticket_bp = Blueprint("ticket_bp", __name__)


# PROCESAR TICKET
@ticket_bp.post("/process_ticket")
def process_ticket():
    result = process_ticket_controller()
    return jsonify(result), 200


# RECOMENDACIÓN
@ticket_bp.post("/recommendation")
def recommendation():
    result = recommendation_controller()
    return jsonify(result), 200


# RESOLVER TICKET
@ticket_bp.post("/tickets/<int:ticket_id>/resolve")
def resolve_ticket(ticket_id):
    ticket = resolve_ticket_controller(ticket_id)

    if ticket is None:
        return jsonify({"error": "Ticket no encontrado"}), 404

    return jsonify({
        "status": "success",
        "ticket_id": ticket_id,
        "resolved_by": ticket["resolved_by"],
        "resolved_at": ticket["resolved_at"]
    }), 200
