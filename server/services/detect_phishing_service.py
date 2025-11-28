import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier
from services.satinitize_sensitive_services import sanitize_sensitive_data
# Lista básica de palabras vacías en español para limpiar el ruido
SPANISH_STOP_WORDS = [
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 
    'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como'
]

class PhishingAI:
    def __init__(self):
        # Configuramos para español
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2), # Analiza palabras sueltas y pares de palabras
            stop_words=SPANISH_STOP_WORDS, 
            max_features=1500
        )
        # Red Neuronal (Cerebro)
        self.model = MLPClassifier(hidden_layer_sizes=(20, 10), max_iter=1000, random_state=42)
        self._train_spanish_brain()

    def _train_spanish_brain(self):
        # --- DATOS DE ENTRENAMIENTO EN ESPAÑOL ---
        texts = [
            # === GRUPO A: PHISHING (INTENCIÓN DE ATAQUE) ===
            # Patrones: Urgencia, amenazas, pedir clic en links externos
            "URGENTE: Su cuenta ha sido bloqueada, verifique identidad en [LINK]",
            "Detectamos actividad sospechosa, inicie sesión aquí [LINK]",
            "Su factura electrónica está vencida, descargue aquí [LINK]",
            "Actualice sus datos de pago inmediatamente o perderá el acceso",
            "Felicidades ha ganado un premio, reclame en [LINK]",
            "Seguridad: Confirme su contraseña [REDACTED] en el siguiente enlace",
            "Haga clic aquí para validar sus credenciales bancarias",
            
            # === GRUPO B: USUARIO LEGÍTIMO (INTENCIÓN DE SOPORTE) ===
            # Patrones: Pedir ayuda, explicar errores, dar información (incluso por error)
            "Hola, no puedo ingresar a la plataforma, me da error",
            "Olvidé mi contraseña, ¿me pueden ayudar a restablecerla?",
            "Adjunto la captura de pantalla del error que me sale",
            "Mi contraseña es [REDACTED] y el sistema no me deja entrar", # <--- CLAVE: Usuario dando su pass
            "Buenas tardes, el reporte no carga los datos correctamente",
            "Por error envié mi clave [REDACTED], por favor ignorenla",
            "Solicito acceso al módulo de contabilidad",
            "No funciona el botón de guardar en el formulario",
            "Reunión programada para la revisión del proyecto"
        ]
        
        # 1 = Phishing (Bloquear), 0 = Legítimo (Permitir)
        labels = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        
        # Entrenamos
        X = self.vectorizer.fit_transform(texts)
        self.model.fit(X, labels)

    def get_neural_score(self, clean_text):
        try:
            vec = self.vectorizer.transform([clean_text])
            # Retorna la probabilidad de que sea CLASE 1 (Phishing)
            return self.model.predict_proba(vec)[0][1]
        except:
            return 0.5

# Instancia global
brain = PhishingAI()

def detect_phishing_advanced(clean_text, metadata):
    """
    Combina la IA entrenada en español con reglas lógicas.
    """
    # 1. Análisis Semántico (¿Qué parece decir el texto?)
    clean_text=sanitize_sensitive_data(clean_text)
    nn_score = brain.get_neural_score(clean_text)
    
    # 2. Variables de contexto
    link_count = metadata.get('links_count', 0)
    has_creds = metadata.get('sensitive_found', False) # True si el usuario escribió una contraseña
    
    final_score = nn_score
    
    # --- REGLAS DE LÓGICA DIFUSA (AJUSTE FINO) ---
    
    # CASO: Usuario envía contraseña (Data Leak)
    # Si la red neuronal dice "Parece un correo de soporte" (score bajo) Y hay contraseña...
    if has_creds and nn_score < 0.4:
        # NO subimos el score. La IA entendió que es un usuario pidiendo ayuda.
        # Esto evita que bloquees a tus propios clientes torpes.
        pass 
        
    # CASO: Phishing Real
    # Si la red neuronal dice "Parece ataque" (score alto) O hay links sospechosos...
    if link_count > 0:
        # Si hay links, la sospecha sube.
        if nn_score > 0.4:
            final_score += (link_count * 0.2) # Penalización fuerte por links
            
    # CASO: Phishing de Ingeniería Social (Sin links, pero pide datos)
    # Ej: "Envíame tu contraseña urgente por este chat"
    if has_creds and nn_score > 0.7:
        final_score += 0.2

    return min(max(final_score, 0.0), 1.0)