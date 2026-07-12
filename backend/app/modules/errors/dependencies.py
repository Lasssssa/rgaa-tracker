from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.criteria.dependencies import get_criteria_repository
from app.modules.criteria.repository import CriteriaRepository
from app.modules.pages.dependencies import get_page_repository
from app.modules.pages.repository import PageRepository
from app.modules.projects.dependencies import get_project_repository
from app.modules.projects.repository import ProjectRepository
from app.modules.errors.repository import ErrorRepository
from app.modules.errors.service import ErrorService


def get_error_repository(db: Session = Depends(get_db)) -> ErrorRepository:
    return ErrorRepository(db)


def get_error_service(
    repository: ErrorRepository = Depends(get_error_repository),
    project_repository: ProjectRepository = Depends(get_project_repository),
    criteria_repository: CriteriaRepository = Depends(get_criteria_repository),
    page_repository: PageRepository = Depends(get_page_repository),
) -> ErrorService:
    return ErrorService(
        repository, project_repository, criteria_repository, page_repository
    )
