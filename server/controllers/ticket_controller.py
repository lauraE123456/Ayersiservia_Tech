from utils.ticket_ai_utils import process_full_ticket

def process_ticket_controller(text, client_id, source):
    ai_result = process_full_ticket(
        text=text,
        sender=client_id
    )

    ai_result["client_id"] = client_id
    ai_result["source"] = source
    
    return ai_result
