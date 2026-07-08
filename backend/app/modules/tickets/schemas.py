from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


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
