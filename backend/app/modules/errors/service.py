from app.core.exceptions import EntityNotFoundError
from app.modules.criteria.repository import CriteriaRepository
from app.modules.pages.repository import PageRepository
from app.modules.projects.repository import ProjectRepository
from app.modules.errors.models import Error
from app.modules.errors.repository import ErrorRepository
from app.modules.errors.schemas import ErrorCreate, ErrorUpdate


class ErrorService:
    """Business logic for errors.

    It depends on the *project*, *criteria* and *pages* repositories too,
    because "an error belongs to an existing project, references an existing
    criterion and optionally one of the project's pages" are business rules
    that belong here — not in the router and not in the database layer.
    """

    def __init__(
        self,
        repository: ErrorRepository,
        project_repository: ProjectRepository,
        criteria_repository: CriteriaRepository,
        page_repository: PageRepository,
    ) -> None:
        self.repository = repository
        self.project_repository = project_repository
        self.criteria_repository = criteria_repository
        self.page_repository = page_repository

    def _ensure_project_exists(self, project_id: int) -> None:
        if self.project_repository.get(project_id) is None:
            raise EntityNotFoundError("Project")

    def _ensure_criterion_exists(self, criterion_id: int) -> None:
        if self.criteria_repository.get_criterion(criterion_id) is None:
            raise EntityNotFoundError("Criterion")

    def _ensure_page_in_project(self, page_id: int, project_id: int) -> None:
        page = self.page_repository.get(page_id)
        if page is None or page.project_id != project_id:
            raise EntityNotFoundError("Page")

    def list_errors(self, project_id: int) -> list[Error]:
        self._ensure_project_exists(project_id)
        return self.repository.list_for_project(project_id)

    def get_error(self, error_id: int) -> Error:
        error = self.repository.get(error_id)
        if error is None:
            raise EntityNotFoundError("Error")
        return error

    def create_error(self, project_id: int, data: ErrorCreate) -> Error:
        self._ensure_project_exists(project_id)
        self._ensure_criterion_exists(data.criterion_id)
        if data.page_id is not None:
            self._ensure_page_in_project(data.page_id, project_id)
        error = Error(project_id=project_id, **data.model_dump())
        return self.repository.add(error)

    def update_error(self, error_id: int, data: ErrorUpdate) -> Error:
        error = self.get_error(error_id)
        changes = data.model_dump(exclude_unset=True)
        if changes.get("criterion_id") is not None:
            self._ensure_criterion_exists(changes["criterion_id"])
        if changes.get("page_id") is not None:
            self._ensure_page_in_project(changes["page_id"], error.project_id)
        for field, value in changes.items():
            setattr(error, field, value)
        return self.repository.save(error)

    def toggle_error(self, error_id: int) -> Error:
        error = self.get_error(error_id)
        error.is_patched = not error.is_patched
        return self.repository.save(error)

    def delete_error(self, error_id: int) -> None:
        error = self.get_error(error_id)
        self.repository.delete(error)
