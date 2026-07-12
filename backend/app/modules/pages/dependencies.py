from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.pages.repository import PageRepository
from app.modules.pages.service import PageService
from app.modules.projects.dependencies import get_project_repository
from app.modules.projects.repository import ProjectRepository


def get_page_repository(db: Session = Depends(get_db)) -> PageRepository:
    return PageRepository(db)


def get_page_service(
    repository: PageRepository = Depends(get_page_repository),
    project_repository: ProjectRepository = Depends(get_project_repository),
) -> PageService:
    return PageService(repository, project_repository)
