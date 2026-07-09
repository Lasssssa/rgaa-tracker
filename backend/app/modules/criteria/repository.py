from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.criteria.models import Criterion, Thematic


class CriteriaRepository:
    """The only place that talks to the database for the RGAA referential."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def list_thematics(self) -> list[Thematic]:
        return list(
            self.db.scalars(
                select(Thematic)
                .options(selectinload(Thematic.criteria))
                .order_by(Thematic.number)
            )
        )

    def list_criteria(self) -> list[Criterion]:
        return list(
            self.db.scalars(
                select(Criterion)
                .join(Criterion.thematic)
                .order_by(Thematic.number, Criterion.number)
            )
        )

    def get_thematic_by_number(self, number: int) -> Thematic | None:
        return self.db.scalar(select(Thematic).where(Thematic.number == number))

    def get_criterion_by_code(self, code: str) -> Criterion | None:
        return self.db.scalar(select(Criterion).where(Criterion.code == code))

    def add(self, entity: Thematic | Criterion) -> None:
        self.db.add(entity)

    def commit(self) -> None:
        self.db.commit()
