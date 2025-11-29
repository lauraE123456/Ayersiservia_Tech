import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_resolution_email(to: str, subject: str, body: str):
    """
    Envía un email al cliente cuando se resuelve un ticket.
    """
    if not EMAIL_USER or not EMAIL_PASS:
        raise Exception("EMAIL_USER o EMAIL_PASS no configurados en .env")

    msg = MIMEMultipart()
    msg["From"] = EMAIL_USER
    msg["To"] = to
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.sendmail(EMAIL_USER, to, msg.as_string())
        server.quit()
        print("Correo enviado correctamente!")
        return True

    except Exception as e:
        print(f"Error enviando correo: {e}")
        return False
