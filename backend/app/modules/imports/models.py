from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ImportJob(Base):
    """Tracks one attempt at extracting errors from a project's audit PDF.

    The extraction runs in the background (it can take a while for a large
    report), so the request that starts it returns immediately and the client
    polls this row for progress. When it succeeds, ``result`` holds the
    proposed pages and errors for the user to review before anything is
    written to the real ``pages`` / ``errors`` tables.
    """

    __tablename__ = "import_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # pending -> running -> succeeded | failed
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="pending", default="pending"
    )
    # Human-readable reason when status is "failed".
    error_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    # The extraction proposal (pages + errors) once status is "succeeded".
    result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
