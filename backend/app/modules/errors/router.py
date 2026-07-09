from fastapi import APIRouter, Depends, status

from app.modules.errors.dependencies import get_error_service
from app.modules.errors.schemas import ErrorCreate, ErrorRead, ErrorUpdate
from app.modules.errors.service import ErrorService

router = APIRouter(tags=["errors"])


@router.get("/projects/{project_id}/errors", response_model=list[ErrorRead])
def list_errors(
    project_id: int, service: ErrorService = Depends(get_error_service)
):
    return service.list_errors(project_id)


@router.post(
    "/projects/{project_id}/errors",
    response_model=ErrorRead,
    status_code=status.HTTP_201_CREATED,
)
def create_error(
    project_id: int,
    data: ErrorCreate,
    service: ErrorService = Depends(get_error_service),
):
    return service.create_error(project_id, data)


@router.get("/errors/{error_id}", response_model=ErrorRead)
def get_error(
    error_id: int, service: ErrorService = Depends(get_error_service)
):
    return service.get_error(error_id)


@router.patch("/errors/{error_id}", response_model=ErrorRead)
def update_error(
    error_id: int,
    data: ErrorUpdate,
    service: ErrorService = Depends(get_error_service),
):
    return service.update_error(error_id, data)


@router.put("/errors/{error_id}/toggle", response_model=ErrorRead)
def toggle_error(
    error_id: int, service: ErrorService = Depends(get_error_service)
):
    return service.toggle_error(error_id)


@router.delete("/errors/{error_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_error(
    error_id: int, service: ErrorService = Depends(get_error_service)
):
    service.delete_error(error_id)
