from flask import request, jsonify, current_app
import re
import datetime
from data.client_db import get_client_by_id
from services.ai_service import predict_churn, generate_insight
from services.detect_phishing_service import detect_phishing_advanced

def process_ticket_controller():
    # 1. Recibir datos del Request
    data = request.get_json()
    text = data.get("text", "")
    head = data.get("head","")
    body = data.get("body","")
    client_id = data.get("client_id", "UNKNOWN")
    client_name = data.get("client_name","UNKNOWN")
    client_email= data.get("client_email","unknown@domain.com" )
    date = data.get("date", datetime.datetime.now().isoformat())
    source = data.get("source", "Web")

    # 2. VALIDACIÓN BÁSICA
    if not text:
        return jsonify({"error": "Solicitud incompleta"}), 400

    # 3. RECUPERAR CONTEXTO DEL CLIENTE
    client_context = get_client_by_id(client_id,client_email)
    real_antiguedad = client_context["antiguedad"]
    project_name = client_context["proyecto"]

    # ---------------------------------------------------------
    # ETAPA DE SEGURIDAD (Phishing & Sanitización)
    # ---------------------------------------------------------
    
    # A. Enmascarar datos sensibles (PII) - ANTES de la IA
    text_anon = body or text
    # 1. Normalizar Links (Crucial para la IA)
    # Convertimos cualquier URL en la palabra "[LINK]". La IA aprenderá que "[LINK]" es sospechoso en ciertos contextos.
    text_anon = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', "[LINK]", text_anon)
    # Emails
    text_anon = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[EMAIL]", text_anon)
    # Teléfonos
    text_anon = re.sub(r"\b(3\d{9}|[0-9]{7,10})\b", "[PHONE]", text_anon)
    # Patrón robusto para passwords
    pattern_creds = r"(?i)\b(password|contraseña|contrasena|clave|pass|pin)\b\s*(?:es|is|:|de|en|acc|access)?\s*(\S+)"
    text_anon = re.sub(pattern_creds, r"\1 [REDACTED]", text_anon)

    link_count = len(re.findall(r'http[s]?://', body))
    sensitive_match = re.search(pattern_creds, body)
    sensitive_found = True if sensitive_match else False

    # PASO C: Inferencia (La IA piensa)
    # Le pasamos el texto limpio + los metadatos que extrajimos al principio
    metadata = {
        "links_count": link_count,
        "sensitive_found": sensitive_found
    }

    # B. Detección de Phishing con "IA"
    # Se usa el texto anonimizado (aunque el phishing suele estar en el texto original, 
    # la anonimización protege datos reales si se enviaran a una API externa)
    phishing_prob = detect_phishing_advanced(text,metadata) # Usamos original para detectar patrones exactos de phishing
    
    if phishing_prob > 0.5:
        # Log interno detallado
        current_app.logger.warning(
            f"SECURITY BLOCK: Phishing detected. ID: {client_id} | Project: {project_name} | Score: {phishing_prob:.2f}"
        )
        # Respuesta opaca al frontend (seguridad) - Error 400 pero "silencioso" para el usuario final
        return jsonify({
            "error": "Error de procesamiento.",
            "code": "SECURITY_BLOCK",
            "detail": "Solicitud rechazada por políticas de seguridad."
        }), 400

    

    # ---------------------------------------------------------
    # ETAPA DE NEGOCIO (Usando el Contexto)
    # ---------------------------------------------------------

    # 1. Clasificación del Ticket (Lógica simple por ahora)
    clasificacion = "Correctivo" if any(w in text.lower() for w in ["error", "fallo", "bug", "caída", "no funciona"]) else "Evolutivo"

    # 2. Predicción de Churn (¡Usando antiguedad real!)
    churn_score, churn_level, churn_color = predict_churn(text_anon, real_antiguedad,clasificacion)

    # 3. Generación de Insights
    final_recommendation = generate_insight(churn_score, clasificacion, project_name, real_antiguedad)

    # ---------------------------------------------------------
    # RESPUESTA
    # ---------------------------------------------------------
    #client_context["email"] 
    response = {
        "id": len(current_app.tickets_store) + 1,
        "client_id": client_id,
        "client_email":  client_email,
        "client_name": client_name,
        "text_processed": text_anon,
        "classification": clasificacion,
        "churn_score": churn_score,
        "churn_level": churn_level, # Nuevo campo
        "churn_color": churn_color, # Nuevo campo
        "insight": final_recommendation,
        "source": source,
        "status": "Success",
        "project": project_name, # Contexto extra
        "urgency": "Alta" if churn_score > 60 else "Baja", # Campo derivado para UI
        "phishing_prob":phishing_prob
    }
    
    current_app.tickets_store.append(response)
    return jsonify(response), 200
