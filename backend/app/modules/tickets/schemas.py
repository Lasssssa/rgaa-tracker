from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Severity = Literal["minor", "moderate", "major", "critical"]


class TicketBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None


class TicketCreate(TicketBase):
    criterion_id: int
    severity: Severity


class TicketUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    criterion_id: int | None = None
    severity: Severity | None = None
    is_patched: bool | None = None


class TicketThematic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    number: int
    name: str


class TicketCriterion(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    title: str
    thematic: TicketThematic


class TicketRead(TicketBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    severity: str
    criterion: TicketCriterion | None
    is_patched: bool
    created_at: datetime
    updated_at: datetime
