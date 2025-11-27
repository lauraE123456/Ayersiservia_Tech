from flask import request, jsonify
import re

def process_ticket_controller():
    data = request.get_json()

    text = data.get("text", "")
    client_id = data.get("client_id", "")
    date = data.get("date", "")
    software_type = data.get("software_type", "")

    # Validaciones simples
    if not text or not client_id:
        return jsonify({"error": "text y client_id son obligatorios"}), 400

    # ------------------------------------------
    # 1. DETECCIÓN AVANZADA DE PHISHING
    # ------------------------------------------
    phishing_patterns = [
        r"http[s]?://[^\s]+",                         # URLs sospechosas
        r"(actualiza|verifica|restablece).*cuenta",   # urgencias falsas
        r"(password|contraseña).*aquí",               # pedir credenciales
        r"(soporte|banco|seguridad).*(urgente)",      # ingeniería social
        r"haz clic|click here|presiona aquí",         # llamados a acción
        r"su cuenta será suspendida",                 # amenazas típicas
        r"(paypal|netflix|bancolombia|davivienda).*login"  # dominios falsos
    ]

    phishing_detectado = any(re.search(pattern, text.lower()) for pattern in phishing_patterns)

    if phishing_detectado:
        return jsonify({
            "error": "Phishing detectado. Ticket bloqueado.",
            "detalle": "Se encontraron patrones de ciberataque en el texto."
        }), 400

    # ------------------------------------------
    # 2. ANONIMIZACIÓN DE DATOS PERSONALES (PII)
    # ------------------------------------------
    text_anon = text

    # Correos
    text_anon = re.sub(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        "[EMAIL]", text_anon
    )

    # Teléfonos (Colombia general)
    text_anon = re.sub(
        r"\b(3\d{9}|[0-9]{7,10})\b",
        "[PHONE]", text_anon
    )

    # Documentos cédula (8-10 dígitos)
    text_anon = re.sub(
        r"\b\d{8,10}\b",
        "[DOCUMENTO]", text_anon
    )

    # Direcciones IP
    text_anon = re.sub(
        r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
        "[IP]", text_anon
    )

    # ------------------------------------------
    # 3. CREACIÓN DEL TICKET LIMPIO
    # ------------------------------------------
    response = {
        "text_original": text,
        "text_anonimizado": text_anon,
        "clasificacion": "Correctivo",
        "churn_score": 72,
        "insight": "Nivel de frustración elevado detectado",
        "client_id": client_id,
        "date": date,
        "software_type": software_type
    }

    return jsonify(response), 200
