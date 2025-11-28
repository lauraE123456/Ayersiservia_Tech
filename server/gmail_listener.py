import imaplib
import email
from email.header import decode_header
import requests
import time
import os
from dotenv import load_dotenv
import re

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
API_URL = os.getenv("API_URL")

def extract_email(from_field):
    match = re.search(r'<(.+?)>', from_field)
    return match.group(1) if match else from_field

def get_clean_text(msg):
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            if content_type == "text/plain":
                try:
                    return part.get_payload(decode=True).decode(errors="ignore")
                except:
                    continue
            if content_type == "text/html":  # fallback
                try:
                    html = part.get_payload(decode=True).decode(errors="ignore")
                    return re.sub('<[^<]+?>', '', html)  # Remove HTML tags
                except:
                    continue
    else:
        try:
            return msg.get_payload(decode=True).decode(errors="ignore")
        except:
            return ""
    return ""

def listen_gmail():
    print("Iniciando Gmail Listener...")

    while True:
        try:
            mail = imaplib.IMAP4_SSL("imap.gmail.com")
            mail.login(EMAIL_USER, EMAIL_PASS)

            mail.select("inbox")
            status, messages = mail.search(None, '(UNSEEN)')

            if status == "OK":
                for e_id in messages[0].split():

                    res, msg_data = mail.fetch(e_id, "(RFC822)")

                    for part in msg_data:
                        if not isinstance(part, tuple):
                            continue

                        msg = email.message_from_bytes(part[1])

                        subject, encoding = decode_header(msg["Subject"])[0]
                        if isinstance(subject, bytes):
                            subject = subject.decode(encoding or "utf-8", errors="ignore")

                        sender = extract_email(msg.get("From"))
                        body = get_clean_text(msg)

                        payload = {
                            "text": f"{subject} - {body}",
                            "client_id": sender,
                            "source": "Email"
                        }

                        print(f"Enviando ticket desde email: {sender}")
                        try:
                            r = requests.post(API_URL, json=payload)
                            print(f"API respondió: {r.status_code}")
                        except Exception as api_err:
                            print(f"Error enviando a API: {api_err}")

                    # Marcar como leído
                    mail.store(e_id, '+FLAGS', '\\Seen')

        except Exception as e:
            print(f"[ERROR] {e}")
            print("Reconectando en 5 segundos...")
            time.sleep(5)
            continue

        time.sleep(8)

if __name__ == "__main__":
    listen_gmail()
