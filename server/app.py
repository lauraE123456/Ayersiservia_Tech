from flask import Flask, jsonify
from flask_cors import CORS

# IMPORTAR RUTAS
from routes.ticket_routes import ticket_bp
from routes.notification_routes import notification_bp

# INICIAR APP
app = Flask(__name__)
CORS(app)

# ================================
# 1. BASE DE DATOS SIMULADA (Mock)
# ================================
app.mock_clients_db = {
    "CLIENT-001": {"antiguedad_anos": 5, "valor_contrato": 50000, "satisfaccion": 9},
    "CLIENT-002": {"antiguedad_anos": 1, "valor_contrato": 12000, "satisfaccion": 4},
    "CLIENT-003": {"antiguedad_anos": 3, "valor_contrato": 30000, "satisfaccion": 7},
    "CLIENT-004": {"antiguedad_anos": 0.5, "valor_contrato": 5000, "satisfaccion": 3},
    "CLIENT-005": {"antiguedad_anos": 10, "valor_contrato": 100000, "satisfaccion": 10}
}

# Dashboard
app.tickets_store = []

# ================================
# 2. REGISTRAR BLUEPRINTS
# ================================
app.register_blueprint(notification_bp, url_prefix="/api")
app.register_blueprint(ticket_bp, url_prefix="/api")

# ================================
# 3. ENDPOINTS EXTRA
# ================================
@app.route("/api/tickets", methods=["GET"])
def get_tickets():
    return jsonify(app.tickets_store), 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)
