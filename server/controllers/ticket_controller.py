from flask import request, current_app
from services.ai_service import process_ticket_ai
from services.recommender_service import recommender_ai
from services.mail_service import send_resolution_email
from datetime import datetime


# ============================================================
#   1. PROCESAR TICKET CON LA IA
# ============================================================

def process_ticket_controller():

    data = request.get_json()

    text = data.get("text")
    email = data.get("email")
    classification = data.get("classification", "general")
    project = data.get("project", "Sin proyecto")
    antiquity = float(data.get("antiquity", 1.0))

    # Ejecuta la IA
    result = process_ticket_ai(
        text=text,
        sender=email,
        classification=classification,
        project=project,
        antiquity=antiquity
    )

    return result



# ============================================================
#   2. RECOMENDACIÓN (Versión Flask)
# ============================================================

def recommendation_controller():

    data = request.get_json()

    churn_score = data.get("churn_score")
    antiquity = data.get("antiquity")
    classification = data.get("classification")
    sentiment = data.get("sentiment")
    emotion = data.get("emotion")

    rec = recommender_ai.recommend(
        churn_score=churn_score,
        antiquity=antiquity,
        classification=classification,
        sentiment=sentiment,
        emotion=emotion
    )

    return {"recommendation": rec}



# ============================================================
#   3. RESOLVER UN TICKET
# ============================================================

def resolve_ticket_controller(ticket_id):

    data = request.get_json()
    resolved_by = data.get("resolved_by")
    message = data.get("message", "Tu solicitud ha sido atendida correctamente.")

    tickets = current_app.tickets_store

    # Buscar ticket
    ticket = next((t for t in tickets if t["id"] == ticket_id), None)

    if not ticket:
        return None  # Se manejará desde la ruta

    # Actualizar ticket
    ticket["status"] = "resolved"
    ticket["resolved_by"] = resolved_by
    ticket["resolved_at"] = datetime.now().isoformat()

    # Enviar email si existe
    if ticket.get("email"):
        send_resolution_email(
            to=ticket["email"],
            subject="Tu ticket ha sido resuelto",
            body=message
        )

    return ticket
