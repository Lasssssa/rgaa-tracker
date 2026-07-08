from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.projects.models import Project


class ProjectRepository:
    """The only place that talks to the database for projects.

    It knows about SQLAlchemy and nothing about HTTP or business rules. Every
    method takes/returns the ``Project`` ORM model. Persistence is committed
    here so callers don't have to manage transactions by hand.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Project]:
        return list(
            self.db.scalars(select(Project).order_by(Project.created_at.desc()))
        )

    def get(self, project_id: int) -> Project | None:
        return self.db.get(Project, project_id)

    def add(self, project: Project) -> Project:
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def save(self, project: Project) -> Project:
        """Persist changes made to an already-tracked project."""
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project: Project) -> None:
        self.db.delete(project)
        self.db.commit()
