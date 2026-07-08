from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    client: str | None = Field(default=None, max_length=255)
    audit_date: date | None = None
    gitlab_project_id: str | None = Field(default=None, max_length=255)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    client: str | None = Field(default=None, max_length=255)
    audit_date: date | None = None
    gitlab_project_id: str | None = Field(default=None, max_length=255)


class ProjectRead(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    global_compliance_rate: float | None
    ticket_count: int
    created_at: datetime
    updated_at: datetime


class TicketBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    is_patched: bool | None = None


class TicketRead(TicketBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    is_patched: bool
    created_at: datetime
    updated_at: datetime
