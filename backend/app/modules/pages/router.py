from fastapi import APIRouter, Depends, status

from app.modules.pages.dependencies import get_page_service
from app.modules.pages.schemas import PageCreate, PageRead, PageUpdate
from app.modules.pages.service import PageService

router = APIRouter(tags=["pages"])


@router.get("/projects/{project_id}/pages", response_model=list[PageRead])
def list_pages(
    project_id: int, service: PageService = Depends(get_page_service)
):
    return service.list_pages(project_id)


@router.post(
    "/projects/{project_id}/pages",
    response_model=PageRead,
    status_code=status.HTTP_201_CREATED,
)
def create_page(
    project_id: int,
    data: PageCreate,
    service: PageService = Depends(get_page_service),
):
    return service.create_page(project_id, data)


@router.get("/pages/{page_id}", response_model=PageRead)
def get_page(page_id: int, service: PageService = Depends(get_page_service)):
    return service.get_page(page_id)


@router.patch("/pages/{page_id}", response_model=PageRead)
def update_page(
    page_id: int,
    data: PageUpdate,
    service: PageService = Depends(get_page_service),
):
    return service.update_page(page_id, data)


@router.delete("/pages/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_page(
    page_id: int, service: PageService = Depends(get_page_service)
):
    service.delete_page(page_id)
