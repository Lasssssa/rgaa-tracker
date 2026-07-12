from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.criteria.models import Criterion
from app.modules.errors.models import Error


class ErrorRepository:
    """The only place that talks to the database for errors."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def list_for_project(self, project_id: int) -> list[Error]:
        return list(
            self.db.scalars(
                select(Error)
                .where(Error.project_id == project_id)
                .options(
                    selectinload(Error.criterion).selectinload(
                        Criterion.thematic
                    ),
                    selectinload(Error.page),
                )
                .order_by(Error.created_at.desc())
            )
        )

    def get(self, error_id: int) -> Error | None:
        return self.db.get(Error, error_id)

    def add(self, error: Error) -> Error:
        self.db.add(error)
        self.db.commit()
        self.db.refresh(error)
        return error

    def save(self, error: Error) -> Error:
        """Persist changes made to an already-tracked error."""
        self.db.commit()
        self.db.refresh(error)
        return error

    def delete(self, error: Error) -> None:
        self.db.delete(error)
        self.db.commit()
