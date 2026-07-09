from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    # Import only for type checkers to avoid a runtime circular import between
    # the projects and errors modules. SQLAlchemy resolves the "Error" string
    # reference below at mapper-configuration time, so no real import is needed.
    from app.modules.errors.models import Error


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    client: Mapped[str | None] = mapped_column(String(255), nullable=True)
    audit_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    gitlab_project_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Calculated from audit data in a later phase; stored here for convenience.
    global_compliance_rate: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    errors: Mapped[list["Error"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    @property
    def error_count(self) -> int:
        return len(self.errors)
