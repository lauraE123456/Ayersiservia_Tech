import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

# Cargar variables de entorno (asegúrate de que .env esté en la raíz)
load_dotenv()

# Creamos el Blueprint
email_bp = Blueprint('email_bp', __name__)

@email_bp.route('/send-email', methods=['POST'])
def send_email_route():
    try:
        # 1. Obtener datos
        data = request.json
        user_email = data.get('userEmail')
        user_name = data.get('userName', 'Usuario') # Default 'Usuario' si no viene nombre
        message_body = data.get('message')
        urgency = data.get('urgency')

        if not user_email or not message_body:
            return jsonify({'success': False, 'message': 'Faltan datos (email o mensaje)'}), 400

        # 2. Definir colores según prioridad
        priority_colors = {
            'Baja': '#4caf50',    # Verde
            'Media': '#ff9800',   # Naranja
            'Alta': '#ff5722',    # Rojo naranja
            'Crítica': '#d32f2f'  # Rojo oscuro
        }
        color = priority_colors.get(urgency, '#1976d2')

        # 3. Construir HTML
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd;">
              <div style="background-color: {color}; padding: 15px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">Prioridad: {urgency}</h2>
              </div>
              <div style="padding: 20px;">
                <p>Hola <strong>{user_name}</strong>,</p>
                <p>Tienes una nueva recomendación:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 5px solid {color}; margin: 15px 0;">
                   <p style="white-space: pre-wrap; margin: 0;">{message_body}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
        """

        # 4. Configurar Email
        msg = MIMEMultipart()
        msg['From'] = os.getenv('EMAIL_USER')
        msg['To'] = user_email
        msg['Subject'] = f"⚠️ Acción Requerida: {urgency}"
        msg.attach(MIMEText(html_content, 'html'))

        # 5. Enviar (SMTP)
        # Nota: Si usas Gmail. Si es Outlook usa: smtp.office365.com
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(os.getenv('EMAIL_USER'), os.getenv('EMAIL_PASS'))
        server.send_message(msg)
        server.quit()

        return jsonify({'success': True, 'message': 'Correo enviado'})

    except Exception as e:
        print(f"Error enviando correo: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500