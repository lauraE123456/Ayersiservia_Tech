import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os

EMAIL_USER = os.getenv("EMAIL_USER", "ayersiserviatech@gmail.com")
EMAIL_PASS = os.getenv("EMAIL_PASS", "rzql cinl ddls qmpb")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.normpath(os.path.join(BASE_DIR, "..", "LOGO", "logo.jpg"))


# -------------------------------------------------------------------
# FUNCIÓN BASE PARA ENVIAR CORREOS
# -------------------------------------------------------------------
def send_email(to_email: str, subject: str, html_body: str):

    msg = MIMEMultipart("related")
    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    # HTML
    html_part = MIMEMultipart("alternative")
    html_part.attach(MIMEText(html_body, "html"))
    msg.attach(html_part)

    # Imagen banner/logo
    try:
        with open(LOGO_PATH, "rb") as f:
            img = MIMEImage(f.read())
            img.add_header("Content-ID", "<banner>")
            img.add_header("Content-Disposition", "inline", filename="logo.jpg")
            msg.attach(img)
    except Exception as e:
        print("Error cargando logo/banner:", e)

    # Enviar por SMTP
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.sendmail(EMAIL_USER, to_email, msg.as_string())
        return True

    except Exception as e:
        print("ERROR SMTP:", e)
        return False


# -------------------------------------------------------------------
# EMAIL: ACTUALIZACIÓN DE PROYECTO
# -------------------------------------------------------------------
def send_notification_email(to_email: str, project_name: str):

    subject = f"Actualización en su proyecto: {project_name}"

    html = f"""
    <div style="font-family: Arial, sans-serif; padding:0; margin:0;">
        
        <!-- BANNER COMPLETO -->
        <div style='width:100%; background:#0b0f1a;'>
            <img src="cid:banner" style="width:100%; max-height:180px; object-fit:cover;">
        </div>

        <div style="padding: 25px;">
            <h2 style="margin-top:0;">Actualización de proyecto</h2>
            <p>Hola,</p>

            <p>Su solicitud ha sido atendida. Por favor, verifique la actualización correspondiente en su perfil de usuario.</p>

            <p>Si requiere información adicional o desea realizar una nueva gestión relacionada, le invitamos a utilizar el mismo Ticket ID,
            con el fin de asegurar una atención continua y eficiente.</p>

            <p>Gracias por ser miembro de la Familia VORTEXs,<br>
            <b>VORTEX</b></p>
        </div>
    </div>
    """

    return send_email(to_email, subject, html)


# -------------------------------------------------------------------
# EMAIL: TICKET RESUELTO
# -------------------------------------------------------------------
def send_resolution_email(to_email: str, ticket_id: int):

    subject = f"Su ticket #{ticket_id} fue resuelto"

    html = f"""
    <div style="font-family: Arial, sans-serif; padding:0; margin:0;">
        
        <!-- BANNER COMPLETO -->
        <div style='width:100%; background:#0b0f1a;'>
            <img src="cid:banner" style="width:100%; max-height:180px; object-fit:cover;">
        </div>

        <div style="padding: 25px;">
            <h2 style="margin-top:0;">Ticket Resuelto</h2>
            <p>Hola,</p>

            <p>Su ticket <b>#{ticket_id}</b> ha sido resuelto por nuestro equipo.</p>

            <p>Si necesita más ayuda, puede responder este mismo correo.</p>

            <p>Saludos,<br><b>Ayersi ServiaTech</b></p>
        </div>
    </div>
    """

    return send_email(to_email, subject, html)
