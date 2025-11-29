from flask import Blueprint, request, jsonify
from services.gemini_service import generate_support_response

def chat_controller():
    try:
        data = request.get_json()
        
        # Extraer datos
        user_message = data.get("message", "")
        # El frontend nos debe enviar el objeto 'contexto' con los datos del ticket
        contexto = data.get("contexto", {}) 

        if not user_message:
            return jsonify({"error": "El mensaje no puede estar vacío"}), 400

        # Llamar al servicio
        ai_reply = generate_support_response(user_message, contexto)

        return jsonify({"reply": ai_reply})

    except Exception as e:
        print("Error en el endpoint de chat:", e)
        return jsonify({"error": "Error interno del servidor"}), 500