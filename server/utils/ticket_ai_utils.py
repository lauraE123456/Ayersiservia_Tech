# ticket_ai_utils.py - Versión mejorada con NLP, NER, urgencia semántica y manejo seguro de PII
# Principios:
#  - PII se redacta y se guarda como hash (mapping). Los modelos NLP NO reciben hashes.
#  - Los modelos usan 'deidentified_text' (PII removida) para evitar exposición.
#  - Phishing: reglas + heurísticas de URL + remitente.
#  - Urgencia y severidad semántica: intenta usar embeddings; si no hay, usa reglas.
#  - Código defensivo: carga modelos opcionales con try/except.

import re
import hashlib
import logging
from typing import Tuple, Dict, Any, List

# Dependencias NLP opcionales
try:
    import spacy
    _spacy = spacy.load("es_core_news_sm")
except Exception:
    _spacy = None

try:
    from pysentimiento import create_analyzer
    sentiment_model = create_analyzer(task="sentiment", lang="es")
    emotion_model = create_analyzer(task="emotion", lang="es")
    hate_model = create_analyzer(task="hate_speech", lang="es")
except Exception:
    sentiment_model = None
    emotion_model = None
    hate_model = None

# Embeddings (semantic severity) optional
try:
    from sentence_transformers import SentenceTransformer, util
    embed_model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception:
    embed_model = None

# ----------------------------------
# Configuración y constantes
# ----------------------------------
URL_RE = re.compile(r'(https?://[^\s]+)')
EMAIL_RE = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
PHONE_RE = re.compile(r'\b(?:\+?\d{1,3})?\d{7,12}\b')
CREDITCARD_RE = re.compile(r'\b(?:\d[ -]*?){13,19}\b')
PWD_EXPLICT_RE = re.compile(r"\b(pass(word)?|pwd|clave|contraseña)\s*[:= ]+\s*[^\s]+\b", flags=re.IGNORECASE)

PHISH_KEYWORDS = [
    'verifique','urgente','confirmar','contraseña','reset','actualice',
    'inicie sesión','haz clic','gratis','obligatorio','actividad sospechosa','restablecer'
]

CRITICAL_KEYWORDS = [
    "fallo crítico", "critico", "error crítico", "no funciona", "caído",
    "pago", "billing", "facturación", "no puedo acceder", "bloqueado",
    "urgente", "inmediato", "solución ya", "no responde"
]

# Templates de severidad semántica (ejemplos para embeddings fallback)
SEVERITY_PROTOTYPES = {
    'critical': [
        'el sistema está caído',
        'no puedo acceder, servicio crítico',
        'pago fallido y contrato en riesgo'
    ],
    'high': [
        'error repetido que impide el trabajo',
        'problema serio con facturación'
    ],
    'medium': [
        'mejoras solicitadas',
        'funcionalidad no crítica'
    ],
    'low': [
        'pregunta general',
        'consulta informativa'
    ]
}

logger = logging.getLogger(__name__)

# ----------------------------------
# UTIL: PII handling seguro
# ----------------------------------

def _hash_value(value: str) -> str:
    return hashlib.sha256(value.encode('utf-8')).hexdigest()[:16]

def redact_pii_secure(text: str, keep_hash: bool = True) -> Tuple[str, Dict[str, str], str]:
    """
    Redacta PII del texto y devuelve:
      - redacted_text: texto con placeholders/hashes (para auditing/storage)
      - pii_map: diccionario hash -> original (si keep_hash True)
      - deidentified_text: texto para modelos (PII removida o reemplazada por tokens neutrales)

    IMPORTANT: Los modelos deben usar 'deidentified_text' para evitar exposición a hashes.
    """
    pii_map: Dict[str, str] = {}
    t = text

    # Emails
    def _repl_email(m):
        s = m.group(0)
        h = _hash_value(s)
        pii_map[h] = s
        return f"<EMAIL_HASH:{h}>" if keep_hash else "<EMAIL_RED>"

    t = re.sub(EMAIL_RE, _repl_email, t)

    # Phones
    def _repl_phone(m):
        s = m.group(0)
        h = _hash_value(s)
        pii_map[h] = s
        return "<PHONE_REDACTED>" if keep_hash else "<PHONE_RED>"

    t = re.sub(PHONE_RE, _repl_phone, t)

    # Credit cards
    t = re.sub(CREDITCARD_RE, "<CARD_REDACTED>", t)

    # Explicit passwords (keep pattern)
    t = re.sub(PWD_EXPLICT_RE, "<PASSWORD_REDACTED>", t)

    redacted_text = t

    # deidentified_text: remove hashed tokens so models don't see hashes
    deidentified = redacted_text
    # remove any <EMAIL_HASH:...> tokens entirely
    deidentified = re.sub(r"<EMAIL_HASH:[0-9a-f]{16}>", "", deidentified)
    deidentified = re.sub(r"<PHONE_REDACTED>|<PHONE_RED>|<CARD_REDACTED>|<PASSWORD_REDACTED>", "", deidentified)

    # collapse spaces
    deidentified = re.sub(r"\s+", " ", deidentified).strip()

    return redacted_text, pii_map, deidentified

# ----------------------------------
# NLP helpers
# ----------------------------------

def extract_entities_spacy(text: str) -> List[Dict[str, Any]]:
    """Usa spaCy NER si está disponible, devuelve lista de entidades.
    Cada entidad: {text, label, start, end}
    """
    if _spacy is None:
        return []
    doc = _spacy(text)
    ents = []
    for e in doc.ents:
        ents.append({
            'text': e.text,
            'label': e.label_,
            'start': e.start_char,
            'end': e.end_char
        })
    return ents

def detect_sentiment(text: str) -> str:
    if sentiment_model is None:
        # fallback simple heuristic
        t = text.lower()
        neg = any(w in t for w in ['malo','pésimo','error','falla','no funciona','molesto'])
        if neg:
            return 'NEG'
        return 'NEU'
    res = sentiment_model.predict(text)
    return getattr(res, 'output', None)

def detect_emotion(text: str) -> str:
    if emotion_model is None:
        return None
    res = emotion_model.predict(text)
    return getattr(res, 'output', None)

def detect_hate(text: str) -> Tuple[str, float]:
    if hate_model is None:
        return None, 0.0
    res = hate_model.predict(text)
    label = getattr(res, 'output', None)
    proba = 0.0
    try:
        proba = max(res.probas.values())
    except Exception:
        proba = 0.0
    return label, proba

# ----------------------------------
# Urgencia / severidad semántica
# ----------------------------------

def detect_urgency_semantic(text: str) -> str:
    """Devuelve one of: low, medium, high, critical"""
    t = text.lower()
    # quick rules first
    if any(k in t for k in ['caído', 'no funciona', 'no puedo acceder', 'error crítico']):
        return 'critical'
    if any(k in t for k in ['urgente','inmediato','lo necesito ya','por favor urgente']):
        return 'high'

    # embeddings-based similarity
    if embed_model is not None:
        try:
            q = embed_model.encode(text, convert_to_tensor=True)
            best = ('low', 0.0)
            for label, protos in SEVERITY_PROTOTYPES.items():
                proto_emb = embed_model.encode(protos, convert_to_tensor=True)
                sim = util.cos_sim(q, proto_emb).max().item()
                if sim > best[1]:
                    best = (label, sim)
            return best[0]
        except Exception as e:
            logger.exception("embed error: %s", e)

    # fallback
    if any(k in t for k in ['mejora','feature','solicitud']):
        return 'medium'
    return 'low'

# ----------------------------------
# Phishing robust check
# ----------------------------------

def suspicious_url_score(url: str) -> float:
    try:
        if re.match(r'https?://\d+\.\d+\.\d+\.\d+', url):
            return 1.0
        if any(short in url for short in ['bit.ly','tinyurl','t.co']):
            return 0.8
        ext = __import__('tldextract').extract(url)
        domain = f"{ext.domain}.{ext.suffix}"
        if len(ext.domain) < 3 or len(domain) > 25:
            return 0.6
    except Exception:
        return 0.2
    return 0.0

def quick_phishing_check_improved(text: str, sender_domain: str = None) -> float:
    t = text.lower()
    score = 0.0
    for k in PHISH_KEYWORDS:
        if k in t:
            score += 0.25
    for u in URL_RE.findall(text):
        score += suspicious_url_score(u)
    # sender domain heuristics
    if sender_domain and sender_domain not in ['gmail.com','empresa.com','outlook.com']:
        score += 0.1
    return min(score, 1.0)

# ----------------------------------
# Churn scoring (usa features sin PII)
# ----------------------------------

def compute_churn_score_semantic(text: str, sentiment_label: str, hate_score: float, client_info: Dict[str, Any]) -> int:
    # Use only deidentified signals + client metadata (antiguedad, satisfaccion)
    base = 0
    if sentiment_label == 'NEG':
        base += 30
    elif sentiment_label == 'NEU':
        base += 10

    base += int(hate_score * 40)

    t = text.lower()
    for k in CRITICAL_KEYWORDS:
        if k in t:
            base += 10

    # client features
    sats = client_info.get('satisfaccion', 5)
    antig = client_info.get('antiguedad_anos', 1)
    base += max(0, (5 - sats) * 5)
    if antig < 1:
        base += max(0, int((1 - antig) * 10))

    # urgency factor
    urgency = detect_urgency_semantic(text)
    if urgency == 'critical':
        base += 20
    elif urgency == 'high':
        base += 10

    return max(0, min(100, base))

# ----------------------------------
# Process full ticket (entrypoint)
# ----------------------------------

def process_full_ticket(text: str, sender: str = None, client_info: Dict[str, Any] = None, keep_hash: bool = True) -> Dict[str, Any]:
    """
    Pipeline principal. Retorna un diccionario listo para guardar/mostrar.
    - No pasa hashes a los modelos (usa 'deidentified_text')
    - Guarda mapping pii_map (hash->original) en la respuesta para storage seguro
    """
    # sender domain
    sender_domain = None
    if sender and '@' in sender:
        sender_domain = sender.split('@')[-1]

    # 1) Phishing heuristic
    phish_score = quick_phishing_check_improved(text, sender_domain)
    if phish_score >= 0.8:
        return {
            'action': 'quarantine',
            'reason': 'high_phishing_suspicion',
            'phishing_score': phish_score
        }

    # 2) Redact PII securely
    redacted_text, pii_map, deidentified_text = redact_pii_secure(text, keep_hash=keep_hash)

    # 3) NLP on deidentified_text
    sentiment = detect_sentiment(deidentified_text)
    emotion = detect_emotion(deidentified_text)
    hate_label, hate_score = detect_hate(deidentified_text)

    # 4) NER (on original redacted_text)
    entities = extract_entities_spacy(redacted_text) if _spacy is not None else []

    # 5) churn and severity
    client_info = client_info or {}
    churn_score = compute_churn_score_semantic(deidentified_text, sentiment, hate_score, client_info)
    if churn_score >= 70:
        churn_risk = 'critical'
    elif churn_score >= 40:
        churn_risk = 'medium'
    else:
        churn_risk = 'low'

    severity = detect_urgency_semantic(deidentified_text)

    # 6) incentive logic
    if churn_risk == 'critical':
        incentive = '1 mes gratis'
    elif churn_risk == 'medium':
        incentive = '15% descuento'
    else:
        incentive = '5 puntos fidelidad'

    return {
        'action': 'accept',
        'original': text,
        'redacted_text': redacted_text,
        'deidentified_text': deidentified_text,  # útil para debugging interno; no exponer en UI si sensible
        'pii_map': pii_map,  # almacenar cifrado en repositorio seguro
        'phishing_score': phish_score,
        'sentiment': sentiment,
        'emotion': emotion,
        'hate_label': hate_label,
        'hate_score': hate_score,
        'entities': entities,
        'severity': severity,
        'churn_risk': churn_risk,
        'churn_score': churn_score,
        'incentive': incentive,
        'explanation': {
            'matched_keywords': [k for k in CRITICAL_KEYWORDS if k in text.lower()],
            'sentiment': sentiment,
            'hate_score': hate_score
        }
    }
