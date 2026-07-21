from fastapi import APIRouter, BackgroundTasks, Depends, status

from app.modules.imports.dependencies import get_import_service
from app.modules.imports.schemas import (
    ConfirmResult,
    ExtractionPreview,
    ImportJobRead,
)
from app.modules.imports.service import ImportService, run_extraction_job

router = APIRouter(tags=["imports"])


@router.post(
    "/projects/{project_id}/audit-pdf/extract",
    response_model=ImportJobRead,
    status_code=status.HTTP_202_ACCEPTED,
)
def start_extraction(
    project_id: int,
    background_tasks: BackgroundTasks,
    service: ImportService = Depends(get_import_service),
):
    """Kick off error extraction from the project's uploaded audit PDF.

    Returns immediately with a pending job; the extraction runs in the
    background and the client polls ``GET /imports/{job_id}`` for the result.
    """
    job = service.start_extraction(project_id)
    background_tasks.add_task(run_extraction_job, job.id)
    return job


@router.get("/imports/{job_id}", response_model=ImportJobRead)
def get_import_job(
    job_id: int, service: ImportService = Depends(get_import_service)
):
    return service.get_job(job_id)


@router.post("/imports/{job_id}/confirm", response_model=ConfirmResult)
def confirm_import(
    job_id: int,
    preview: ExtractionPreview,
    service: ImportService = Depends(get_import_service),
):
    """Persist the reviewed proposal as real pages and errors."""
    return service.confirm(job_id, preview)
