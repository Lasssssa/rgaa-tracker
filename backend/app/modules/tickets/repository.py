from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.tickets.models import Ticket


class TicketRepository:
    """The only place that talks to the database for tickets."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def list_for_project(self, project_id: int) -> list[Ticket]:
        return list(
            self.db.scalars(
                select(Ticket)
                .where(Ticket.project_id == project_id)
                .order_by(Ticket.created_at.desc())
            )
        )

    def get(self, ticket_id: int) -> Ticket | None:
        return self.db.get(Ticket, ticket_id)

    def add(self, ticket: Ticket) -> Ticket:
        self.db.add(ticket)
        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def save(self, ticket: Ticket) -> Ticket:
        """Persist changes made to an already-tracked ticket."""
        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def delete(self, ticket: Ticket) -> None:
        self.db.delete(ticket)
        self.db.commit()
