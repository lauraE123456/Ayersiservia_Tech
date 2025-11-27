import imaplib
import email
from email.header import decode_header
import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()
# CONFIGURACIÓN (Placeholders)
# Para usar esto, el usuario debe generar una "App Password" en su cuenta de Google
EMAIL_USER = os.getenv("EMAIL_USER") 
EMAIL_PASS = os.getenv("EMAIL_PASS") 
API_URL = os.getenv("API_URL")

def clean_text(text):
    # Limpieza básica
    return text.strip()

def listen_gmail():
    print("Iniciando Gmail Watcher...")
    try:
        # Conexión SSL
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(EMAIL_USER, EMAIL_PASS)
        
        while True:
            mail.select("inbox")
            
            # Buscar correos NO LEÍDOS
            status, messages = mail.search(None, 'UNSEEN')
            
            if status == "OK":
                email_ids = messages[0].split()
                
                for e_id in email_ids:
                    print(f"Procesando email ID: {e_id.decode()}")
                    
                    # Fetch del email
                    res, msg_data = mail.fetch(e_id, "(RFC822)")
                    for response_part in msg_data:
                        if isinstance(response_part, tuple):
                            msg = email.message_from_bytes(response_part[1])
                            
                            # Obtener Asunto
                            subject, encoding = decode_header(msg["Subject"])[0]
                            if isinstance(subject, bytes):
                                subject = subject.decode(encoding if encoding else "utf-8")
                            
                            # Obtener Remitente
                            from_ = msg.get("From")
                            
                            # Obtener Cuerpo
                            body = ""
                            if msg.is_multipart():
                                for part in msg.walk():
                                    content_type = part.get_content_type()
                                    content_disposition = str(part.get("Content-Disposition"))
                                    
                                    if content_type == "text/plain" and "attachment" not in content_disposition:
                                        body = part.get_payload(decode=True).decode()
                                        break
                            else:
                                body = msg.get_payload(decode=True).decode()
                            
                            # Enviar a la API
                            payload = {
                                "text": f"{subject} - {body}",
                                "client_id": from_, # Usamos el remitente como ID
                                "source": "Email"
                            }
                            
                            try:
                                r = requests.post(API_URL, json=payload)
                                print(f"Ticket enviado a API: {r.status_code}")
                            except Exception as e:
                                print(f"Error enviando a API: {e}")
                                
            time.sleep(10) # Revisar cada 10 segundos
            
    except Exception as e:
        print(f"Error en Gmail Listener: {e}")
        print("Asegúrate de configurar EMAIL_USER y EMAIL_PASS correctamente.")

if __name__ == "__main__":
    listen_gmail()
