from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.projects.repository import ProjectRepository
from app.modules.projects.service import ProjectService


def get_project_repository(db: Session = Depends(get_db)) -> ProjectRepository:
    return ProjectRepository(db)


def get_project_service(
    repository: ProjectRepository = Depends(get_project_repository),
) -> ProjectService:
    """Assembles the layers for a request: session -> repository -> service.

    Routers depend on this, so they receive a ready-to-use service and never
    build one themselves. This is the 'wiring' that keeps the layers decoupled.
    """
    return ProjectService(repository)
