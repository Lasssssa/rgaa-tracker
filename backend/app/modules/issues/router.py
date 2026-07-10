from fastapi import APIRouter, Depends, status

from app.modules.issues.dependencies import get_issue_service
from app.modules.issues.schemas import IssueCreate, IssueRead, IssueUpdate
from app.modules.issues.service import IssueService

router = APIRouter(tags=["issues"])


@router.get("/projects/{project_id}/issues", response_model=list[IssueRead])
def list_issues(
    project_id: int, service: IssueService = Depends(get_issue_service)
):
    return service.list_issues(project_id)


@router.post(
    "/projects/{project_id}/issues",
    response_model=IssueRead,
    status_code=status.HTTP_201_CREATED,
)
def create_issue(
    project_id: int,
    data: IssueCreate,
    service: IssueService = Depends(get_issue_service),
):
    return service.create_issue(project_id, data)


@router.get("/issues/{issue_id}", response_model=IssueRead)
def get_issue(issue_id: int, service: IssueService = Depends(get_issue_service)):
    return service.get_issue(issue_id)


@router.patch("/issues/{issue_id}", response_model=IssueRead)
def update_issue(
    issue_id: int,
    data: IssueUpdate,
    service: IssueService = Depends(get_issue_service),
):
    return service.update_issue(issue_id, data)


@router.delete("/issues/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: int, service: IssueService = Depends(get_issue_service)
):
    service.delete_issue(issue_id)
