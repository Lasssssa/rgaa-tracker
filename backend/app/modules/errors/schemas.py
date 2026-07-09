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


class ErrorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    criterion_id: int | None = None
    severity: Severity | None = None
    is_patched: bool | None = None


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


class ErrorRead(ErrorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    severity: str
    criterion: ErrorCriterion | None
    is_patched: bool
    created_at: datetime
    updated_at: datetime
