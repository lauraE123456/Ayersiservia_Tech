from flask import Blueprint
from controllers.ticket_status_controler import update_ticket_status_controller

update_ticket_status_bp = Blueprint('update_ticket_status_bp', __name__)

# Ruta POST /api/process_ticket
@update_ticket_status_bp.put("/update_ticket_status/<int:ticket_id>/status")
def update_ticket_status(ticket_id):
    return update_ticket_status_controller(ticket_id)
