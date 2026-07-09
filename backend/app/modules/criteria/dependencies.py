from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.criteria.repository import CriteriaRepository
from app.modules.criteria.service import CriteriaService


def get_criteria_repository(db: Session = Depends(get_db)) -> CriteriaRepository:
    return CriteriaRepository(db)


def get_criteria_service(
    repository: CriteriaRepository = Depends(get_criteria_repository),
) -> CriteriaService:
    return CriteriaService(repository)
