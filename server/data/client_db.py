# Mock Database for Clients
# Simulates a database table with client history and context

CLIENT_DB = [
    {
        "client_id": "CLIENT-001",
        "email": "le8965aa.ut@cendi.edu.co",
        "antiguedad": 5, # años
        "proyecto": "Implementación ERP Fase 2",
        "sector": "Fintech"
    },
    {
        "client_id": "CLIENT-002",
        "email": "laue0915@gmail.com",
        "antiguedad": 1,
        "proyecto": "App Móvil MVP",
        "sector": "Startup"
    },
    {
        "client_id": "CLIENT-003",
        "email": "le8965aa.ut@cendi.edu.co",
        "antiguedad": 3,
        "proyecto": "Mantenimiento E-commerce",
        "sector": "Retail"
    },
    {
        "client_id": "CLIENT-004",
        "email": "new@cliente.com",
        "antiguedad": 0.5, # 6 meses
        "proyecto": "Consultoría IA",
        "sector": "Servicios"
    },
    {
        "client_id": "CLIENT-005",
        "email": "ceo@legacy.net",
        "antiguedad": 10,
        "proyecto": "Migración Cloud",
        "sector": "Banca"
    }
]

def get_client_by_id(client_id):
    for client in CLIENT_DB:
        if client["client_id"] == client_id :
            return client
    # Default profile for unknown clients
    return {
        "client_id": client_id,
        "email": "unknown@domain.com",
        "antiguedad": 0,
        "proyecto": "Sin Proyecto Asignado",
        "sector": "General"
    }
