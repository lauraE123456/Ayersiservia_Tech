from flask import Blueprint
from controllers.ticket_controller import process_ticket_controller

ticket_bp = Blueprint('ticket_bp', __name__)

# Ruta POST /api/process_ticket
@ticket_bp.post("/process_ticket")
def process_ticket():
    return process_ticket_controller()
