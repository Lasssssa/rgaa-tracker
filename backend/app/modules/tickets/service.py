from app.core.exceptions import EntityNotFoundError
from app.modules.criteria.repository import CriteriaRepository
from app.modules.projects.repository import ProjectRepository
from app.modules.tickets.models import Ticket
from app.modules.tickets.repository import TicketRepository
from app.modules.tickets.schemas import TicketCreate, TicketUpdate


class TicketService:
    """Business logic for tickets.

    It depends on the *project* and *criteria* repositories too, because
    "a ticket belongs to an existing project and references an existing
    criterion" are business rules that belong here — not in the router and
    not in the database layer.
    """

    def __init__(
        self,
        repository: TicketRepository,
        project_repository: ProjectRepository,
        criteria_repository: CriteriaRepository,
    ) -> None:
        self.repository = repository
        self.project_repository = project_repository
        self.criteria_repository = criteria_repository

    def _ensure_project_exists(self, project_id: int) -> None:
        if self.project_repository.get(project_id) is None:
            raise EntityNotFoundError("Project")

    def _ensure_criterion_exists(self, criterion_id: int) -> None:
        if self.criteria_repository.get_criterion(criterion_id) is None:
            raise EntityNotFoundError("Criterion")

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
        self._ensure_criterion_exists(data.criterion_id)
        ticket = Ticket(project_id=project_id, **data.model_dump())
        return self.repository.add(ticket)

    def update_ticket(self, ticket_id: int, data: TicketUpdate) -> Ticket:
        ticket = self.get_ticket(ticket_id)
        changes = data.model_dump(exclude_unset=True)
        if changes.get("criterion_id") is not None:
            self._ensure_criterion_exists(changes["criterion_id"])
        for field, value in changes.items():
            setattr(ticket, field, value)
        return self.repository.save(ticket)

    def toggle_ticket(self, ticket_id: int) -> Ticket:
        ticket = self.get_ticket(ticket_id)
        ticket.is_patched = not ticket.is_patched
        return self.repository.save(ticket)

    def delete_ticket(self, ticket_id: int) -> None:
        ticket = self.get_ticket(ticket_id)
        self.repository.delete(ticket)
