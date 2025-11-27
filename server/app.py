from flask import Flask
from flask_cors import CORS
from routes.ticket_routes import ticket_bp

app = Flask(__name__)

CORS(app)

# Registrar Rutas
app.register_blueprint(ticket_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(port=5000, debug=True)