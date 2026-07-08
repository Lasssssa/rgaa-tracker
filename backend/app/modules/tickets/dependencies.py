from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.projects.dependencies import get_project_repository
from app.modules.projects.repository import ProjectRepository
from app.modules.tickets.repository import TicketRepository
from app.modules.tickets.service import TicketService


def get_ticket_repository(db: Session = Depends(get_db)) -> TicketRepository:
    return TicketRepository(db)


def get_ticket_service(
    repository: TicketRepository = Depends(get_ticket_repository),
    project_repository: ProjectRepository = Depends(get_project_repository),
) -> TicketService:
    return TicketService(repository, project_repository)
