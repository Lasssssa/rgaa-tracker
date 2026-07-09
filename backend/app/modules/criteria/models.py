from sqlalchemy import JSON, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Thematic(Base):
    """One of the 13 RGAA thematics (Images, Cadres, Couleurs, ...)."""

    __tablename__ = "thematics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    criteria: Mapped[list["Criterion"]] = relationship(
        back_populates="thematic",
        cascade="all, delete-orphan",
        order_by="Criterion.number",
    )


class Criterion(Base):
    """A single RGAA criterion (e.g. 1.1) within a thematic.

    This is a fixed referential (~106 rows) seeded by the import command,
    not user-editable data.
    """

    __tablename__ = "criteria"
    __table_args__ = (
        UniqueConstraint("thematic_id", "number", name="uq_criterion_number"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    thematic_id: Mapped[int] = mapped_column(
        ForeignKey("thematics.id", ondelete="CASCADE"), index=True, nullable=False
    )
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    # Full display code, e.g. "1.1" — kept denormalized for easy lookups.
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Test methodologies from the official referential, as a list of
    # {"test": "1.1.1", "content": "<markdown>"} entries.
    methodology: Mapped[list | None] = mapped_column(JSON, nullable=True)

    thematic: Mapped["Thematic"] = relationship(back_populates="criteria")
