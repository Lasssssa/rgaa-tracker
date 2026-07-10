from app.core.exceptions import EntityNotFoundError
from app.modules.issues.models import Issue
from app.modules.issues.repository import IssueRepository
from app.modules.issues.schemas import IssueCreate, IssueUpdate
from app.modules.projects.repository import ProjectRepository


class IssueService:
    """Business logic for issues (groups of errors to export to GitLab)."""

    def __init__(
        self,
        repository: IssueRepository,
        project_repository: ProjectRepository,
    ) -> None:
        self.repository = repository
        self.project_repository = project_repository

    def _ensure_project_exists(self, project_id: int) -> None:
        if self.project_repository.get(project_id) is None:
            raise EntityNotFoundError("Project")

    def _resolve_errors(self, project_id: int, error_ids: list[int]) -> list:
        """Fetch the errors, refusing ids that don't belong to the project."""
        errors = self.repository.get_project_errors(project_id, error_ids)
        if len(errors) != len(set(error_ids)):
            raise EntityNotFoundError("Error")
        return errors

    def list_issues(self, project_id: int) -> list[Issue]:
        self._ensure_project_exists(project_id)
        return self.repository.list_for_project(project_id)

    def get_issue(self, issue_id: int) -> Issue:
        issue = self.repository.get(issue_id)
        if issue is None:
            raise EntityNotFoundError("Issue")
        return issue

    def create_issue(self, project_id: int, data: IssueCreate) -> Issue:
        self._ensure_project_exists(project_id)
        errors = self._resolve_errors(project_id, data.error_ids)
        issue = Issue(
            project_id=project_id,
            name=data.name,
            description=data.description,
            errors=errors,
        )
        return self.repository.add(issue)

    def update_issue(self, issue_id: int, data: IssueUpdate) -> Issue:
        issue = self.get_issue(issue_id)
        changes = data.model_dump(exclude_unset=True)
        if "name" in changes:
            issue.name = changes["name"]
        if "description" in changes:
            issue.description = changes["description"]
        if changes.get("error_ids") is not None:
            issue.errors = self._resolve_errors(
                issue.project_id, changes["error_ids"]
            )
        return self.repository.save(issue)

    def delete_issue(self, issue_id: int) -> None:
        issue = self.get_issue(issue_id)
        self.repository.delete(issue)
