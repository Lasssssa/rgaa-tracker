from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.errors.dependencies import get_error_repository
from app.modules.errors.repository import ErrorRepository
from app.modules.imports.repository import ImportJobRepository
from app.modules.imports.service import ImportService
from app.modules.pages.dependencies import get_page_repository
from app.modules.pages.repository import PageRepository
from app.modules.projects.dependencies import get_project_repository
from app.modules.projects.repository import ProjectRepository


def get_import_repository(db: Session = Depends(get_db)) -> ImportJobRepository:
    return ImportJobRepository(db)


def get_import_service(
    repository: ImportJobRepository = Depends(get_import_repository),
    project_repository: ProjectRepository = Depends(get_project_repository),
    page_repository: PageRepository = Depends(get_page_repository),
    error_repository: ErrorRepository = Depends(get_error_repository),
) -> ImportService:
    return ImportService(
        repository, project_repository, page_repository, error_repository
    )
