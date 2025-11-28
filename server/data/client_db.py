# Mock Database for Clients
# Simulates a database table with client history and context

CLIENT_DB = [
    {
        "client_id": "CLIENT-001",
        "client_email": "le8965aa.ut@cendi.edu.co",
        "antiguedad": 5, # años
        "proyecto": "Implementación ERP Fase 2",
        "sector": "Fintech"
    },
    {
        "client_id": "CLIENT-002",
        "client_email": "laue0915@gmail.com",
        "antiguedad": 1,
        "proyecto": "App Móvil MVP",
        "sector": "Startup"
    },
    {
        "client_id": "CLIENT-003",
        "client_email": "le8965aa.ut@cendi.edu.co",
        "antiguedad": 3,
        "proyecto": "Mantenimiento E-commerce",
        "sector": "Retail"
    },
    {
        "client_id": "CLIENT-004",
        "client_email": "ayersiserviatech@gmail.com",
        "antiguedad": 0.5, # 6 meses
        "proyecto": "Consultoría IA",
        "sector": "Servicios"
    },
    {
        "client_id": "CLIENT-005",
        "client_email": "ceo@legacy.net",
        "antiguedad": 10,
        "proyecto": "Migración Cloud",
        "sector": "Banca"
    }
]

def get_client_by_id(client_id,client_email):
    # 1. Limpieza previa: Convertir a minúsculas y quitar espacios para comparar bien
    # Usamos 'str()' para evitar errores si llega un None
    search_email = str(client_email).lower().strip()
    for client in CLIENT_DB:
        # Extraemos los datos de la DB con seguridad (.get evita error si falta el campo)
        db_id = client.get("client_id")
        
        db_email = str(client.get("client_email", "")).lower().strip()

       # 2. Lógica de validación con "or"
        # Si el ID coincide O el email coincide, retorna el cliente.
        if db_id == client_id or db_email == search_email:
            return client
    # Default profile for unknown clients
    return {
        "client_id": client_id,
        "client_email": client_email,
        "antiguedad": 0,
        "proyecto": "Sin Proyecto Asignado",
        "sector": "General"
    }
