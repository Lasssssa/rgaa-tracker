from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.criteria.models import Criterion
from app.modules.errors.models import Error
from app.modules.issues.models import Issue

# Issues are served with their errors (and each error's criterion) embedded.
_WITH_ERRORS = selectinload(Issue.errors).options(
    selectinload(Error.criterion).selectinload(Criterion.thematic)
)


class IssueRepository:
    """The only place that talks to the database for issues."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def list_for_project(self, project_id: int) -> list[Issue]:
        return list(
            self.db.scalars(
                select(Issue)
                .where(Issue.project_id == project_id)
                .options(_WITH_ERRORS)
                .order_by(Issue.created_at.desc())
            )
        )

    def get(self, issue_id: int) -> Issue | None:
        return self.db.scalar(
            select(Issue).where(Issue.id == issue_id).options(_WITH_ERRORS)
        )

    def get_project_errors(
        self, project_id: int, error_ids: list[int]
    ) -> list[Error]:
        """The subset of ``error_ids`` that belong to ``project_id``."""
        if not error_ids:
            return []
        return list(
            self.db.scalars(
                select(Error).where(
                    Error.project_id == project_id, Error.id.in_(error_ids)
                )
            )
        )

    def add(self, issue: Issue) -> Issue:
        self.db.add(issue)
        self.db.commit()
        return self.get(issue.id)  # reload with errors eager-loaded

    def save(self, issue: Issue) -> Issue:
        self.db.commit()
        return self.get(issue.id)

    def delete(self, issue: Issue) -> None:
        self.db.delete(issue)
        self.db.commit()
