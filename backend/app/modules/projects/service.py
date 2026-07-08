from app.core.exceptions import EntityNotFoundError
from app.modules.projects.models import Project
from app.modules.projects.repository import ProjectRepository
from app.modules.projects.schemas import ProjectCreate, ProjectUpdate


class ProjectService:
    """Business logic for projects.

    The router calls this; it never touches SQLAlchemy directly. When a rule is
    violated (e.g. project not found) it raises a domain error, not an
    ``HTTPException`` — translating that to HTTP is the web layer's job.
    """

    def __init__(self, repository: ProjectRepository) -> None:
        self.repository = repository

    def list_projects(self) -> list[Project]:
        return self.repository.list()

    def get_project(self, project_id: int) -> Project:
        project = self.repository.get(project_id)
        if project is None:
            raise EntityNotFoundError("Project")
        return project

    def create_project(self, data: ProjectCreate) -> Project:
        project = Project(**data.model_dump())
        return self.repository.add(project)

    def update_project(self, project_id: int, data: ProjectUpdate) -> Project:
        project = self.get_project(project_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(project, field, value)
        return self.repository.save(project)

    def delete_project(self, project_id: int) -> None:
        project = self.get_project(project_id)
        self.repository.delete(project)
