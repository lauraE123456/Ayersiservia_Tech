from flask import request, jsonify, current_app
def update_ticket_status_controller(ticket_id):
    data = request.get_json()
    new_status = data.get("status")
    
    # Buscar el ticket en tu lista en memoria (current_app.tickets_store)
    # Nota: Como es una lista, iteramos para encontrar el ID.
    ticket_found = next((t for t in current_app.tickets_store if t["id"] == ticket_id), None)
    
    if ticket_found:
        ticket_found["status"] = new_status
        return jsonify({"message": "Estado actualizado", "id": ticket_id, "new_status": new_status}), 200
    
    return jsonify({"error": "Ticket no encontrado"}), 404