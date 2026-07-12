from app.core.exceptions import EntityNotFoundError
from app.modules.pages.models import Page
from app.modules.pages.repository import PageRepository
from app.modules.pages.schemas import PageCreate, PageUpdate
from app.modules.projects.repository import ProjectRepository


class PageService:
    """Business logic for the audited pages sample."""

    def __init__(
        self,
        repository: PageRepository,
        project_repository: ProjectRepository,
    ) -> None:
        self.repository = repository
        self.project_repository = project_repository

    def _ensure_project_exists(self, project_id: int) -> None:
        if self.project_repository.get(project_id) is None:
            raise EntityNotFoundError("Project")

    def list_pages(self, project_id: int) -> list[Page]:
        self._ensure_project_exists(project_id)
        return self.repository.list_for_project(project_id)

    def get_page(self, page_id: int) -> Page:
        page = self.repository.get(page_id)
        if page is None:
            raise EntityNotFoundError("Page")
        return page

    def create_page(self, project_id: int, data: PageCreate) -> Page:
        self._ensure_project_exists(project_id)
        page = Page(project_id=project_id, **data.model_dump())
        return self.repository.add(page)

    def update_page(self, page_id: int, data: PageUpdate) -> Page:
        page = self.get_page(page_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(page, field, value)
        return self.repository.save(page)

    def delete_page(self, page_id: int) -> None:
        # The page's errors survive: their page_id is set to NULL by the
        # database, turning them back into global / transverse elements.
        page = self.get_page(page_id)
        self.repository.delete(page)
