from app.core.exceptions import EntityNotFoundError
from app.modules.projects.repository import ProjectRepository
from app.modules.tickets.models import Ticket
from app.modules.tickets.repository import TicketRepository
from app.modules.tickets.schemas import TicketCreate, TicketUpdate


class TicketService:
    """Business logic for tickets.

    It depends on the *project* repository too, because "a ticket can only exist
    for a project that exists" is a business rule that belongs here — not in the
    router and not in the database layer.
    """

    def __init__(
        self,
        repository: TicketRepository,
        project_repository: ProjectRepository,
    ) -> None:
        self.repository = repository
        self.project_repository = project_repository

    def _ensure_project_exists(self, project_id: int) -> None:
        if self.project_repository.get(project_id) is None:
            raise EntityNotFoundError("Project")

    def list_tickets(self, project_id: int) -> list[Ticket]:
        self._ensure_project_exists(project_id)
        return self.repository.list_for_project(project_id)

    def get_ticket(self, ticket_id: int) -> Ticket:
        ticket = self.repository.get(ticket_id)
        if ticket is None:
            raise EntityNotFoundError("Ticket")
        return ticket

    def create_ticket(self, project_id: int, data: TicketCreate) -> Ticket:
        self._ensure_project_exists(project_id)
        ticket = Ticket(project_id=project_id, **data.model_dump())
        return self.repository.add(ticket)

    def update_ticket(self, ticket_id: int, data: TicketUpdate) -> Ticket:
        ticket = self.get_ticket(ticket_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(ticket, field, value)
        return self.repository.save(ticket)

    def toggle_ticket(self, ticket_id: int) -> Ticket:
        ticket = self.get_ticket(ticket_id)
        ticket.is_patched = not ticket.is_patched
        return self.repository.save(ticket)

    def delete_ticket(self, ticket_id: int) -> None:
        ticket = self.get_ticket(ticket_id)
        self.repository.delete(ticket)
