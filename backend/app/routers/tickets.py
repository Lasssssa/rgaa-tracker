from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import TicketCreate, TicketRead, TicketUpdate

router = APIRouter(tags=["tickets"])


def _get_project_or_404(db: Session, project_id: int):
    project = crud.get_project(db, project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    return project


def _get_ticket_or_404(db: Session, ticket_id: int):
    ticket = crud.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )
    return ticket


@router.get("/projects/{project_id}/tickets", response_model=list[TicketRead])
def list_tickets(project_id: int, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    return crud.list_tickets(db, project_id)


@router.post(
    "/projects/{project_id}/tickets",
    response_model=TicketRead,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    project_id: int, data: TicketCreate, db: Session = Depends(get_db)
):
    _get_project_or_404(db, project_id)
    return crud.create_ticket(db, project_id, data)


@router.get("/tickets/{ticket_id}", response_model=TicketRead)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    return _get_ticket_or_404(db, ticket_id)


@router.patch("/tickets/{ticket_id}", response_model=TicketRead)
def update_ticket(
    ticket_id: int, data: TicketUpdate, db: Session = Depends(get_db)
):
    ticket = _get_ticket_or_404(db, ticket_id)
    return crud.update_ticket(db, ticket, data)


@router.put("/tickets/{ticket_id}/toggle", response_model=TicketRead)
def toggle_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = _get_ticket_or_404(db, ticket_id)
    return crud.toggle_ticket(db, ticket)


@router.delete("/tickets/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = _get_ticket_or_404(db, ticket_id)
    crud.delete_ticket(db, ticket)
