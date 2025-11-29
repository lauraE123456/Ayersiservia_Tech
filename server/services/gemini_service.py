import os
import google.generativeai as genai
from dotenv import load_dotenv

# Cargar variables una sola vez
load_dotenv()
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    print("⚠️ ADVERTENCIA: No se encontró API_KEY en el archivo .env")
else:
    genai.configure(api_key=API_KEY)

def generate_support_response(user_message, context):
    """
    Genera una respuesta de IA actuando como agente de soporte.
    """
    try:
        # 1. Definimos el modelo (gemini-2.0-flash o gemini-1.5-flash son excelentes opciones rápidas)
        model = genai.GenerativeModel("gemini-2.0-flash")

        # 2. Construimos un Prompt dinámico basado en TUS tickets
        prompt = f"""
                Actúas como un **Account Manager Senior y Customer Success Strategist**.
                Tu tarea es analizar el ticket, identificar señales de churn, urgencia y valor del cliente, y dar una **recomendación interna** para que el AM tome la mejor decisión.

                DATOS DEL CLIENTE Y TICKET
                - Cliente: {context.get('client_name', 'Cliente')}
                - Ticket ID: {context.get('ticket_id', 'N/A')}
                - Riesgo de Fuga (Churn): {context.get('churn_score', 0)}%
                - Proyecto / Servicio: {context.get('project', 'N/A')}
                - Clasificación del Cliente: {context.get('classification', 'N/A')}
                - Antigüedad: {context.get('antiquity', 0)} años
                - Estado del Ticket: {context.get('status', 'Abierto')}
                - Problema Reportado: "{context.get('ticket_text', '')}"

                CONSULTA DEL AGENTE
                El agente pregunta:
                "{user_message}"

                INSTRUCCIONES CLARAS
                - NO generes un mensaje para el cliente.
                - Genera una **recomendación interna SOLO para el Account Manager**.
                - Usa un tono profesional, estratégico y directo.
                - Incluye:
                1. Evaluación del riesgo y urgencia.
                2. Qué acciones debe tomar el AM.
                3. Si el churn > 30%, sugiere medidas de retención como:
                    - créditos,
                    - descuentos temporales,
                    - extensión del servicio,
                    - acompañamiento prioritario,
                    - llamada ejecutiva de seguimiento.
                4. Si el cliente es antiguo (>2 años), resalta valor de mantener relación.
                5. Sé concreto: máximo 10 líneas.
                6. Indica claramente, con base en la información analizada (antigüedad del cliente, nivel de urgencia y tipo de mantenimiento requerido), cuál es la probabilidad de churn(perder cliente) y cómo esto podría impactar la continuidad del contrato o la relación comercial.

                Devuelve SOLO la recomendación interna para el Account Manager.
                """


    


        # 3. Generar respuesta
        response = model.generate_content(prompt)
        
        # Validación de seguridad por si la respuesta viene vacía
        return response.text if hasattr(response, "text") else "No pude generar una respuesta."

    except Exception as e:
        print(f"Error en Gemini Service: {e}")
        return "Lo siento, el servicio de IA no está disponible en este momento."