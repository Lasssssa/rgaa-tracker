from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Severity = Literal["minor", "moderate", "major", "critical"]


class ErrorBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None


class ErrorCreate(ErrorBase):
    criterion_id: int
    severity: Severity
    # None = global / transverse element, not tied to a specific page.
    page_id: int | None = None


class ErrorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    criterion_id: int | None = None
    severity: Severity | None = None
    is_patched: bool | None = None
    page_id: int | None = None


class ErrorThematic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    number: int
    name: str


class ErrorCriterion(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    title: str
    thematic: ErrorThematic


class ErrorPage(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    url: str | None


class ErrorRead(ErrorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    severity: str
    criterion: ErrorCriterion | None
    issue_id: int | None
    page: ErrorPage | None
    is_patched: bool
    created_at: datetime
    updated_at: datetime
