import random
import re

# Simulación de "Red Neuronal" y Lógica de Negocio Avanzada

def detect_phishing(text):
    """
    Simula una red neuronal de detección de phishing.
    Retorna una probabilidad entre 0.0 y 1.0.
    """
    text_lower = text.lower()
    
    # Patrones que "activan" las neuronas de riesgo
    risk_patterns = [
        r"password", r"contraseña", r"clave", 
        r"click aqu[íi]", r"haz clic", r"verify", 
        r"banco", r"cuenta bloqueada", r"urgente",
        r"ganaste", r"premio", r"oferta", r"bitcoin"
    ]
    
    hits = sum(1 for p in risk_patterns if re.search(p, text_lower))
    
    # Función de activación sigmoide simulada
    # Si hay 0 hits -> probabilidad baja (0.01 - 0.1)
    # Si hay 1 hit -> probabilidad media (0.4 - 0.6)
    # Si hay 2+ hits -> probabilidad alta (0.8 - 0.99)
    
    if hits == 0:
        return random.uniform(0.01, 0.1)
    elif hits == 1:
        return random.uniform(0.4, 0.6)
    else:
        return random.uniform(0.8, 0.99)

def predict_churn(text, antiquity):
    """
    Calcula el riesgo de Churn basado en sentimiento (texto) y antigüedad.
    Retorna: (score, nivel, color)
    """
    text_lower = text.lower()
    
    # Análisis de Sentimiento (Simulado)
    negative_words = ["lento", "malo", "pésimo", "error", "falla", "urgente", "molesto", "cancelar", "baja", "insatisfecho"]
    positive_words = ["gracias", "excelente", "bueno", "rápido", "mejorar", "cotización", "interesado"]
    
    neg_score = sum(1 for w in negative_words if w in text_lower)
    pos_score = sum(1 for w in positive_words if w in text_lower)
    
    # Base score (0-100)
    sentiment_impact = (neg_score * 15) - (pos_score * 5)
    
    # Factor Antigüedad: Clientes nuevos (< 1 año) tienen más riesgo de irse si algo falla
    antiquity_factor = 0
    if antiquity < 1:
        antiquity_factor = 30
    elif antiquity < 3:
        antiquity_factor = 15
    elif antiquity > 5:
        antiquity_factor = -10 # Clientes leales tienen "crédito"
        
    final_score = 30 + sentiment_impact + antiquity_factor # Base risk 30%
    
    # Clamping 0-100
    final_score = max(0, min(100, final_score))
    
    # Categorización
    if final_score <= 30:
        return final_score, "Bajo", "green"
    elif final_score <= 60:
        return final_score, "Medio", "yellow"
    elif final_score <= 80:
        return final_score, "Alto", "orange"
    elif final_score <= 94:
        return final_score, "Muy Alto", "red"
    else:
        return final_score, "Crítico", "darkred"

def generate_insight(churn_score, classification, project, antiquity):
    """
    Genera una recomendación ("Insight") para el Account Manager.
    """
    if churn_score > 80:
        if antiquity < 1:
            return f"URGENTE: Cliente nuevo en riesgo crítico. El proyecto '{project}' podría cancelarse. Ofrecer 1 mes de soporte extendido gratis."
        else:
            return f"ALERTA: Cliente antiguo insatisfecho. Agendar reunión de emergencia. Ofrecer descuento del 15% en renovación."
            
    elif churn_score > 60:
        return f"Riesgo considerable. Monitorear tickets del proyecto '{project}'. Enviar correo de seguimiento personalizado."
        
    elif classification == "Evolutivo":
        return f"Oportunidad de Venta: Cliente interesado en mejoras para '{project}'. Ofrecer consultoría o nuevos módulos."
        
    else:
        return f"Cliente estable. Mantener SLA estándar. Recordar aniversario de contrato en {int(12 - (antiquity % 1 * 12))} meses."
