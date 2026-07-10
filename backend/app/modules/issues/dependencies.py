from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.issues.repository import IssueRepository
from app.modules.issues.service import IssueService
from app.modules.projects.dependencies import get_project_repository
from app.modules.projects.repository import ProjectRepository


def get_issue_repository(db: Session = Depends(get_db)) -> IssueRepository:
    return IssueRepository(db)


def get_issue_service(
    repository: IssueRepository = Depends(get_issue_repository),
    project_repository: ProjectRepository = Depends(get_project_repository),
) -> IssueService:
    return IssueService(repository, project_repository)
