from app.modules.criteria.models import Criterion, Thematic
from app.modules.criteria.repository import CriteriaRepository


class CriteriaService:
    """Read access to the RGAA referential, plus the idempotent import used
    by the seeding command."""

    def __init__(self, repository: CriteriaRepository) -> None:
        self.repository = repository

    def list_thematics(self) -> list[Thematic]:
        return self.repository.list_thematics()

    def list_criteria(self) -> list[Criterion]:
        return self.repository.list_criteria()

    def import_referential(self, data: dict) -> dict[str, int]:
        """Upsert thematics and criteria from the seed payload.

        Idempotent: re-running updates names/titles in place and creates
        what is missing, so the command can be re-run after an RGAA update.
        """
        created = updated = 0

        for thematic_data in data["thematics"]:
            thematic = self.repository.get_thematic_by_number(
                thematic_data["number"]
            )
            if thematic is None:
                thematic = Thematic(
                    number=thematic_data["number"], name=thematic_data["name"]
                )
                self.repository.add(thematic)
            else:
                thematic.name = thematic_data["name"]

            for criterion_data in thematic_data["criteria"]:
                criterion = self.repository.get_criterion_by_code(
                    criterion_data["code"]
                )
                if criterion is None:
                    criterion = Criterion(
                        thematic=thematic,
                        number=criterion_data["number"],
                        code=criterion_data["code"],
                        title=criterion_data["title"],
                        url=criterion_data.get("url"),
                    )
                    self.repository.add(criterion)
                    created += 1
                else:
                    criterion.title = criterion_data["title"]
                    criterion.url = criterion_data.get("url")
                    updated += 1

        self.repository.commit()
        return {"created": created, "updated": updated}
