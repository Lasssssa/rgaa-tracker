from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.errors.schemas import ErrorRead


class IssueBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None


class IssueCreate(IssueBase):
    error_ids: list[int] = []


class IssueUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    error_ids: list[int] | None = None


class IssueRead(IssueBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    errors: list[ErrorRead]
    created_at: datetime
    updated_at: datetime
