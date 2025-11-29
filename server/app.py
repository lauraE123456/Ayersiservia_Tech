from flask import Flask, jsonify
from flask_cors import CORS
from routes.ticket_routes import ticket_bp
from routes.ticket_status_routes import update_ticket_status_bp
from routes.chat_routes import chat_ia_bp
from routes.email_routes import email_bp
app = Flask(__name__)

CORS(app)

# Almacenamiento en memoria para el Dashboard
app.tickets_store = []

# Registrar Rutas
app.register_blueprint(ticket_bp, url_prefix="/api")

# Endpoint para el Dashboard
@app.route("/api/tickets", methods=["GET"])
def get_tickets():
    return jsonify(app.tickets_store), 200

# Registrar Rutas de actualización de estado de tickets
app.register_blueprint(update_ticket_status_bp, url_prefix="/api")

#Ruta de chat IA
app.register_blueprint(chat_ia_bp, url_prefix="/api")

app.register_blueprint(email_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(port=5000, debug=True)