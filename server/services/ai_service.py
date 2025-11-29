import re, hashlib
import spacy
import tldextract
from pysentimiento import create_analyzer

# -----------------------
#  MODELOS NLP
# -----------------------
nlp = spacy.load("es_core_news_sm")

try:
    sentiment_model = create_analyzer(task="sentiment", lang="es")
except:
    sentiment_model = None

try:
    emotion_model = create_analyzer(task="emotion", lang="es")
except:
    emotion_model = None

try:
    hate_model = create_analyzer(task="hate_speech", lang="es")
except:
    hate_model = None


URL_RE = re.compile(r'(https?://[^\s]+)')

PHISH_KEYWORDS = [
    'verifique','urgente','confirmar','contraseña','reset','actualice',
    'inicie sesión','haz clic','gratis','obligatorio','actividad sospechosa'
]

CRITICAL_KEYWORDS = [
    "fallo crítico", "critico", "error crítico", "no funciona", "caído",
    "pago", "billing", "facturación", "no puedo acceder", "bloqueado",
    "urgente", "inmediato", "solución ya", "no responde"
]


# -------------------------------------------------------------------
#  1. SANITIZACIÓN + DETECCIÓN DE PHISHING
# -------------------------------------------------------------------

def extract_urls(text):
    return URL_RE.findall(text)

def suspicious_url_score(url):
    try:
        if re.match(r'https?://\d+\.\d+\.\d+\.\d+', url):
            return 1.0
        if any(short in url for short in ['bit.ly', 'tinyurl', 't.co']):
            return 0.8
        ext = tldextract.extract(url)
        domain = f"{ext.domain}.{ext.suffix}"
        if len(ext.domain) < 3 or len(domain) > 25:
            return 0.6
    except:
        return 0.2
    return 0.0

def quick_phishing_check(text, sender_domain=None):
    t = text.lower()
    score = 0

    for k in PHISH_KEYWORDS:
        if k in t:
            score += 0.3

    for url in extract_urls(text):
        score += suspicious_url_score(url)

    if sender_domain and sender_domain not in ['gmail.com', 'empresa.com', 'outlook.com']:
        score += 0.1

    return score

def redact_pii(text, keep_hash=True):
    def repl_email(m):
        s = m.group(0)
        if keep_hash:
            return "<EMAIL_HASHED:" + hashlib.sha256(s.encode()).hexdigest()[:8] + ">"
        return "<EMAIL_REDACTED>"

    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    text = re.sub(email_pattern, repl_email, text)

    phone_pattern = r"\b(?:\+?\d{1,3})?\d{7,12}\b"
    text = re.sub(phone_pattern, "<PHONE_REDACTED>", text)

    credit_pattern = r"\b(?:\d[ -]*?){13,16}\b"
    text = re.sub(credit_pattern, "<CARD_REDACTED>", text)

    pwd_pattern = r"\b(pass(word)?|pwd|clave|contraseña)\s*[:= ]+\s*[^\s]+\b"
    text = re.sub(pwd_pattern, "<PASSWORD_REDACTED>", text, flags=re.IGNORECASE)

    return text


# -------------------------------------------------------------------
#  2. SEVERIDAD DEL TICKET (TÉCNICA)
# -------------------------------------------------------------------

def compute_severity(text):
    t = text.lower()
    if any(k in t for k in ["fallo crítico", "pago", "facturación", "no funciona"]):
        return "critical"
    if any(k in t for k in ["error", "bloqueado", "no puedo acceder"]):
        return "high"
    if any(k in t for k in ["mejora", "feature", "solicitud"]):
        return "medium"
    return "low"


# -------------------------------------------------------------------
#  3. CHURN SCORE HÍBRIDO (NLP + REGLAS DEL OTRO MODELO)
# -------------------------------------------------------------------

def churn_base_nlp(text, sentiment_label, hate_score):
    text_l = text.lower()
    score = 0

    # Sentimiento NLP
    if sentiment_label == "NEG":
        score += 30
    elif sentiment_label == "NEU":
        score += 10

    # Hate speech
    score += int(hate_score * 40)

    # Keywords críticas
    for k in CRITICAL_KEYWORDS:
        if k in text_l:
            score += 10

    # Urgencia
    if "urgente" in text_l:
        score += 15
    if "!" in text:
        score += 5

    return min(score, 100)


def churn_by_classification(classification):
    if classification == "Correctivo":
        return 25
    if classification == "Evolutivo":
        return -15
    return 0


def churn_by_antiquity(antiquity):
    if antiquity < 0.5:
        return 40
    elif antiquity < 1.0:
        return 30
    elif antiquity < 2.0:
        return 10
    elif antiquity > 5.0:
        return -20
    return 0


def compute_churn_final(text, sentiment_label, hate_score, classification, antiquity):
    base = churn_base_nlp(text, sentiment_label, hate_score)
    timpact = churn_by_classification(classification)
    aimpact = churn_by_antiquity(antiquity)

    final = base + timpact + aimpact
    return max(0, min(100, final))


# -------------------------------------------------------------------
#  4. INSIGHT COMERCIAL (FUSIONADO)
# -------------------------------------------------------------------

def generate_insight(churn_score, classification, project, antiquity):
    if churn_score > 80:
        if antiquity < 1:
            return f"URGENTE: Cliente nuevo en riesgo crítico. El proyecto '{project}' podría cancelarse. Ofrecer 1 mes de soporte extendido gratis."
        return f"ALERTA: Cliente antiguo muy insatisfecho. Agendar reunión urgente y ofrecer 15% de descuento."

    if churn_score > 60:
        return f"Riesgo medio-alto. Recomendar seguimiento personalizado sobre '{project}'."

    if classification == "Evolutivo":
        return f"Oportunidad de mejora: Cliente interesado en expandir '{project}'. Ofrecer nuevos módulos."

    return "Cliente estable. Mantener SLA y realizar seguimiento estándar."


# -------------------------------------------------------------------
#  5. PROCESO COMPLETO DEL TICKET
# -------------------------------------------------------------------

def process_ticket_ai(text, sender, classification, project, antiquity):
    sender_domain = sender.split("@")[-1] if sender and "@" in sender else None

    # 1. phishing
    phish = quick_phishing_check(text, sender_domain)
    if phish >= 0.8:
        return {
            "action": "quarantine",
            "phishing_score": phish,
            "reason": "high_phishing_suspicion"
        }

    # 2. sanitización
    redacted = redact_pii(text)

    # 3. modelos NLP
    sentiment_label = sentiment_model.predict(redacted).output if sentiment_model else None
    emotion_label = emotion_model.predict(redacted).output if emotion_model else None

    hs = hate_model.predict(redacted) if hate_model else None
    hate_label = hs.output if hs else None
    hate_score = max(hs.probas.values()) if hs else 0.0

    # 4. severidad
    severity = compute_severity(text)

    # 5. churn final
    churn_score = compute_churn_final(
        text,
        sentiment_label,
        hate_score,
        classification,
        antiquity
    )

    churn_risk = (
        "Crítico" if churn_score >= 80 else
        "Alto" if churn_score >= 60 else
        "Medio" if churn_score >= 40 else
        "Bajo"
    )

    # 6. insight
    insight = generate_insight(churn_score, classification, project, antiquity)

    return {
        "action": "accept",
        "original_text": text,
        "redacted_text": redacted,
        "phishing_score": phish,
        "sentiment": sentiment_label,
        "emotion": emotion_label,
        "hate_label": hate_label,
        "hate_score": hate_score,
        "severity": severity,
        "classification": classification,
        "antiquity": antiquity,
        "project": project,
        "churn_score": churn_score,
        "churn_risk": churn_risk,
        "insight": insight
    }
