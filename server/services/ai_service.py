import random
import re

def predict_churn(text, antiquity,classification):
    """
    Calcula el riesgo de Churn basado en sentimiento (texto) y antigüedad.
    Retorna: (score, nivel, color)
    """
    text_lower = text.lower()
    
    # Análisis de Sentimiento (Simulado)
    negative_words = ["lento", "malo", "pésimo", "error", "falla", "urgente", "molesto", "cancelar", "baja", "insatisfecho","problemas"]
    positive_words = ["gracias", "excelente", "bueno", "rápido", "mejorar", "cotización", "interesado"]
    
    neg_score = sum(1 for w in negative_words if w in text_lower)
    pos_score = sum(1 for w in positive_words if w in text_lower)
    
    # Base score (0-100)
    sentiment_impact = (neg_score * 15) - (pos_score * 5)
    # ---------------------------------------------------------
    #  FACTOR CLASIFICACIÓN (Peso: ALTO)
    # ---------------------------------------------------------
    # Si es "Correctivo" (algo falló), el riesgo sube drásticamente.
    # Si es "Evolutivo" (quieren mejoras), el riesgo baja (significa compromiso).
    type_impact = 0
    
    if classification == "Correctivo":
        type_impact = 25  # +25 puntos de riesgo por ser un fallo
    elif classification == "Evolutivo":
        type_impact = -15 # -15 puntos (bonificación) porque están invirtiendo en el producto
    
    antiquity_impact = 0
    # Factor Antigüedad: Clientes nuevos (< 1 año) tienen más riesgo de irse si algo falla
    if antiquity < 0.5:   # Menos de 6 meses
        antiquity_impact = 40 # Riesgo extremo
    elif antiquity < 1.0: # Menos de 1 año
        antiquity_impact = 30
    elif antiquity < 2.0: # Entre 1 y 2 años
        antiquity_impact = 10
    elif antiquity > 5.0: # Veteranos
        antiquity_impact = -20 # Crédito de lealtad
        
   # ---------------------------------------------------------
    # CÁLCULO FINAL
    # Base 20 + Sentimiento + Tipo + Antigüedad
    # ---------------------------------------------------------
    final_score = 20 + sentiment_impact + type_impact + antiquity_impact
    
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
