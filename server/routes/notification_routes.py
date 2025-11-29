from flask import Blueprint, request, jsonify
from services.mail_service import send_notification_email

notification_bp = Blueprint("notification_bp", __name__)

@notification_bp.post("/notify-client")
def notify_client():
    data = request.get_json()

    client_email = data.get("client_email")
    project_name = data.get("project_name")

    if not client_email or not project_name:
        return jsonify({"error": "Falta client_email o project_name"}), 400

    success = send_notification_email(client_email, project_name)

    if success:
        return jsonify({"message": "Correo enviado correctamente"}), 200
    else:
        return jsonify({"error": "No se pudo enviar el correo"}), 500
