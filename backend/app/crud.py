from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Project, Ticket
from app.schemas import (
    ProjectCreate,
    ProjectUpdate,
    TicketCreate,
    TicketUpdate,
)


def list_projects(db: Session) -> list[Project]:
    return list(db.scalars(select(Project).order_by(Project.created_at.desc())))


def get_project(db: Session, project_id: int) -> Project | None:
    return db.get(Project, project_id)


def create_project(db: Session, data: ProjectCreate) -> Project:
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project: Project, data: ProjectUpdate) -> Project:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()


def list_tickets(db: Session, project_id: int) -> list[Ticket]:
    return list(
        db.scalars(
            select(Ticket)
            .where(Ticket.project_id == project_id)
            .order_by(Ticket.created_at.desc())
        )
    )


def get_ticket(db: Session, ticket_id: int) -> Ticket | None:
    return db.get(Ticket, ticket_id)


def create_ticket(db: Session, project_id: int, data: TicketCreate) -> Ticket:
    ticket = Ticket(project_id=project_id, **data.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def update_ticket(db: Session, ticket: Ticket, data: TicketUpdate) -> Ticket:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)
    db.commit()
    db.refresh(ticket)
    return ticket


def toggle_ticket(db: Session, ticket: Ticket) -> Ticket:
    ticket.is_patched = not ticket.is_patched
    db.commit()
    db.refresh(ticket)
    return ticket


def delete_ticket(db: Session, ticket: Ticket) -> None:
    db.delete(ticket)
    db.commit()
