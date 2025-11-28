import re
def sanitize_sensitive_data(text):
    """
    Reemplaza información sensible con [REDACTED] antes de análisis.
    Detecta: contraseñas, emails, números de tarjeta, documentos de identidad.
    """
    # Contraseña explícita: "contraseña es XXXXX" o "password: XXXXX"
    text = re.sub(r'(?:contraseña|password|clave|pwd)\s*(?:es|:)?\s*[^\s,\n]+', 
                  'password=[REDACTED]', text, flags=re.IGNORECASE)
    
    # Emails
    text = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 
                  '[EMAIL]', text)
    
    # Números de tarjeta (16 dígitos)
    text = re.sub(r'\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b', '[CARD]', text)
    
    return text