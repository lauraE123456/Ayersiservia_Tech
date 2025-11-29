from datetime import datetime
from sqlalchemy.orm import Session
from models.ticket_model import Ticket

def resolve_ticket(db: Session, ticket_id: int, resolved_by: str):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        return None

    ticket.status = "resolved"
    ticket.resolved_by = resolved_by
    ticket.resolved_at = datetime.now()

    db.commit()
    db.refresh(ticket)
    return ticket
