from fastapi import APIRouter, Depends, status

from app.modules.tickets.dependencies import get_ticket_service
from app.modules.tickets.schemas import TicketCreate, TicketRead, TicketUpdate
from app.modules.tickets.service import TicketService

router = APIRouter(tags=["tickets"])


@router.get("/projects/{project_id}/tickets", response_model=list[TicketRead])
def list_tickets(
    project_id: int, service: TicketService = Depends(get_ticket_service)
):
    return service.list_tickets(project_id)


@router.post(
    "/projects/{project_id}/tickets",
    response_model=TicketRead,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    project_id: int,
    data: TicketCreate,
    service: TicketService = Depends(get_ticket_service),
):
    return service.create_ticket(project_id, data)


@router.get("/tickets/{ticket_id}", response_model=TicketRead)
def get_ticket(
    ticket_id: int, service: TicketService = Depends(get_ticket_service)
):
    return service.get_ticket(ticket_id)


@router.patch("/tickets/{ticket_id}", response_model=TicketRead)
def update_ticket(
    ticket_id: int,
    data: TicketUpdate,
    service: TicketService = Depends(get_ticket_service),
):
    return service.update_ticket(ticket_id, data)


@router.put("/tickets/{ticket_id}/toggle", response_model=TicketRead)
def toggle_ticket(
    ticket_id: int, service: TicketService = Depends(get_ticket_service)
):
    return service.toggle_ticket(ticket_id)


@router.delete("/tickets/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: int, service: TicketService = Depends(get_ticket_service)
):
    service.delete_ticket(ticket_id)
