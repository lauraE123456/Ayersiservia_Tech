# services/recommender_service.py

class RecommenderAI:
    def recommend(self, churn_score, antiquity, classification, sentiment, emotion):
        """
        Motor simple de recomendación basado en reglas + inputs del modelo IA.
        """

        # 1. Riesgo crítico
        if churn_score >= 80:
            return {
                "level": "CRITICO",
                "recommendation": "Contactar al cliente inmediatamente. Ofrecer reunión y plan de retención.",
                "reason": "Churn muy alto"
            }

        # 2. Riesgo alto
        if churn_score >= 60:
            return {
                "level": "ALTO",
                "recommendation": "Asignar Account Manager para seguimiento personalizado.",
                "reason": "Riesgo alto basado en sentimiento o emoción negativa"
            }

        # 3. Cliente nuevo (antigüedad baja)
        if antiquity < 1:
            return {
                "level": "MEDIO",
                "recommendation": "Enviar bienvenida + verificar satisfacción inicial.",
                "reason": "Cliente reciente"
            }

        # 4. Evolutivo: oportunidad comercial
        if classification.lower() == "evolutivo":
            return {
                "level": "OPORTUNIDAD",
                "recommendation": "Ofrecer nuevo módulo o upgrade.",
                "reason": "Cliente muestra interés en mejoras."
            }

        # 5. Cliente estable
        return {
            "level": "BAJO",
            "recommendation": "Mantener seguimiento normal.",
            "reason": "Cliente estable según métricas."
        }


# Instancia global que se importa desde otros módulos
recommender_ai = RecommenderAI()
