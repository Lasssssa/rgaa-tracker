"""Seed the RGAA referential (thematics + criteria) into the database.

Usage (from the backend container):

    python -m app.commands.import_criteria

Idempotent: safe to re-run; existing rows are updated in place.
The seed file is generated from the official source:
https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
"""

import json
from pathlib import Path

from app.core.database import Base, SessionLocal, engine

# Import all models so create_all knows every table.
from app.modules.criteria import models as _criteria_models  # noqa: F401
from app.modules.criteria.repository import CriteriaRepository
from app.modules.criteria.service import CriteriaService
from app.modules.projects import models as _projects_models  # noqa: F401
from app.modules.tickets import models as _tickets_models  # noqa: F401

SEED_FILE = Path(__file__).resolve().parent.parent / "data" / "rgaa_criteria.json"


def main() -> None:
    Base.metadata.create_all(bind=engine)

    with SEED_FILE.open(encoding="utf-8") as f:
        data = json.load(f)

    db = SessionLocal()
    try:
        service = CriteriaService(CriteriaRepository(db))
        result = service.import_referential(data)
    finally:
        db.close()

    print(
        f"RGAA referential imported: {result['created']} created, "
        f"{result['updated']} updated."
    )


if __name__ == "__main__":
    main()
