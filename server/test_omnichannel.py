import requests
import time
import sys

def test_omnichannel():
    url_process = "http://localhost:5000/api/process_ticket"
    url_dashboard = "http://localhost:5000/api/tickets"
    
    print("--- INICIANDO PRUEBAS OMNICANAL AVANZADO ---")

    # 1. Test Phishing (Debe ser bloqueado silenciosamente - 400)
    print("\n1. Probando Bloqueo de Phishing (Silent)...")
    phishing_payload = {
        "text": "Hola, necesito que restablezcas tu password haciendo click aquí.",
        "client_id": "CLIENT-001"
    }
    try:
        r = requests.post(url_process, json=phishing_payload)
        if r.status_code == 400:
            print("✅ PASS: Phishing bloqueado correctamente (400).")
            print(f"   -> Respuesta (debe ser opaca): {r.json()}")
        else:
            print(f"❌ FAIL: Phishing no bloqueado. Status: {r.status_code}, Resp: {r.json()}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

    # 2. Test Churn Alto (Cliente Nuevo + Queja)
    print("\n2. Probando Cálculo de Churn (Riesgo Alto)...")
    # CLIENT-004 es nuevo (0.5 años) -> Antiquity Factor alto
    # Texto negativo -> Sentiment Score alto
    risk_payload = {
        "text": "El servicio es pésimo, muy lento y siempre falla. Estoy molesto.",
        "client_id": "CLIENT-004",
        "source": "Web"
    }
    try:
        r = requests.post(url_process, json=risk_payload)
        data = r.json()
        if r.status_code == 200:
            print(f"✅ PASS: Ticket procesado.")
            print(f"   -> Churn Score: {data.get('churn_score')}")
            print(f"   -> Nivel: {data.get('churn_level')}")
            print(f"   -> Insight: {data.get('insight')}")
            
            if data.get('churn_score') > 60:
                print("   -> Riesgo Alto detectado correctamente.")
            else:
                print(f"   -> WARNING: Churn Score bajo ({data.get('churn_score')}). Revisar fórmula.")
        else:
            print(f"❌ FAIL: Error procesando ticket. Status: {r.status_code}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

    # 3. Test Dashboard Data
    print("\n3. Verificando Datos del Dashboard...")
    try:
        r = requests.get(url_dashboard)
        tickets = r.json()
        print(f"✅ PASS: Dashboard API respondió. Tickets almacenados: {len(tickets)}")
        if len(tickets) > 0:
            last_ticket = tickets[-1]
            print(f"   -> Último ticket: {last_ticket['client_id']} - Urgencia: {last_ticket.get('urgency')}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_omnichannel()
