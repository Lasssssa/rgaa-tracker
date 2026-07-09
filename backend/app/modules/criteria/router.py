from fastapi import APIRouter, Depends

from app.modules.criteria.dependencies import get_criteria_service
from app.modules.criteria.schemas import CriterionRead, ThematicRead
from app.modules.criteria.service import CriteriaService

router = APIRouter(tags=["criteria"])


@router.get("/thematics", response_model=list[ThematicRead])
def list_thematics(service: CriteriaService = Depends(get_criteria_service)):
    return service.list_thematics()


@router.get("/criteria", response_model=list[CriterionRead])
def list_criteria(service: CriteriaService = Depends(get_criteria_service)):
    return service.list_criteria()
