from fastapi import APIRouter, Depends, File, UploadFile, status

from app.modules.projects.dependencies import get_project_service
from app.modules.projects.schemas import (
    AuditPdfUploadResult,
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
)
from app.modules.projects.service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
def list_projects(service: ProjectService = Depends(get_project_service)):
    return service.list_projects()


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate, service: ProjectService = Depends(get_project_service)
):
    return service.create_project(data)


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int, service: ProjectService = Depends(get_project_service)
):
    return service.get_project(project_id)


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    service: ProjectService = Depends(get_project_service),
):
    return service.update_project(project_id, data)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int, service: ProjectService = Depends(get_project_service)
):
    service.delete_project(project_id)


@router.post(
    "/{project_id}/audit-pdf",
    response_model=AuditPdfUploadResult,
    status_code=status.HTTP_201_CREATED,
)
async def upload_audit_pdf(
    project_id: int,
    file: UploadFile = File(...),
    service: ProjectService = Depends(get_project_service),
):
    content = await file.read()
    return service.save_audit_pdf(
        project_id, file.filename or "audit.pdf", content
    )
