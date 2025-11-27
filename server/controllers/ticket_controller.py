from flask import request, jsonify, current_app
import re
import datetime

def process_ticket_controller():
    data = request.get_json()

    text = data.get("text", "")
    client_id = data.get("client_id", "UNKNOWN")
    date = data.get("date", datetime.datetime.now().isoformat())
    software_type = data.get("software_type", "General")
    source = data.get("source", "Web") # Web or Email

    # Validaciones simples
    if not text:
        return jsonify({"error": "El texto es obligatorio"}), 400

    # ------------------------------------------
    # 1. SEGURIDAD: ANTI-PHISHING (Bloqueo)
    # ------------------------------------------
    # Palabras prohibidas que indican riesgo inmediato
    blocked_keywords = ["password", "contraseña", "click aquí", "haz clic", "banco", "restablecer"]
    if any(keyword in text.lower() for keyword in blocked_keywords):
        return jsonify({
            "error": "Bloqueado por seguridad",
            "detalle": "Se detectaron palabras clave de phishing o ingeniería social."
        }), 400

    # ------------------------------------------
    # 2. SEGURIDAD: ANONIMIZACIÓN (PII)
    # ------------------------------------------
    text_anon = text
    # Emails
    text_anon = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[EMAIL]", text_anon)
    # Teléfonos
    text_anon = re.sub(r"\b(3\d{9}|[0-9]{7,10})\b", "[PHONE]", text_anon)

    # ------------------------------------------
    # 3. LÓGICA DE NEGOCIO Y CHURN
    # ------------------------------------------
    
    # Clasificación
    clasificacion = "Correctivo" if any(w in text.lower() for w in ["error", "fallo", "bug", "caída", "no funciona"]) else "Evolutivo"
    
    # Datos del Cliente (Mock DB)
    client_data = current_app.mock_clients_db.get(client_id, {"antiguedad_anos": 1, "satisfaccion": 5})
    
    # Cálculo de Churn Score (0-100)
    # Fórmula: (Sentimiento Negativo * 0.6) + (Baja Antigüedad * 0.4)
    # Simplificación: Sentimiento negativo basado en palabras clave
    negative_words = ["lento", "malo", "pésimo", "error", "falla", "urgente", "molesto"]
    sentiment_score = sum(1 for w in negative_words if w in text.lower()) * 20 # 0 a 100 aprox
    sentiment_score = min(sentiment_score, 100)
    
    # Factor Antigüedad: Menos antigüedad = Más riesgo
    # 0 años -> 100 riesgo, 10 años -> 0 riesgo
    antiquity_factor = max(0, 100 - (client_data["antiguedad_anos"] * 10))
    
    churn_score = (sentiment_score * 0.6) + (antiquity_factor * 0.4)
    churn_score = round(min(churn_score, 100), 2)

    # Insight (Next Best Action)
    insight = "Cliente estable. Mantener servicio estándar."
    if churn_score > 70:
        insight = "ALERTA DE CHURN: Cliente en riesgo. Contactar proactivamente y ofrecer descuento/capacitación."
    elif clasificacion == "Evolutivo":
        insight = "Oportunidad de Venta: Cliente interesado en mejoras. Ofrecer consultoría."

    # ------------------------------------------
    # 4. ALMACENAMIENTO Y RESPUESTA
    # ------------------------------------------
    response = {
        "id": len(current_app.tickets_store) + 1,
        "client_id": client_id,
        "text_original": text,
        "text_anonimizado": text_anon,
        "clasificacion": clasificacion,
        "churn_score": churn_score,
        "insight": insight,
        "source": source,
        "date": date,
        "status": "Processed"
    }
    
    # Guardar en memoria
    current_app.tickets_store.append(response)

    return jsonify(response), 200
