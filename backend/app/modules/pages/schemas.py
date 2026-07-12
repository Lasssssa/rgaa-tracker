from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PageBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    url: str | None = Field(default=None, max_length=2048)


class PageCreate(PageBase):
    pass


class PageUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    url: str | None = Field(default=None, max_length=2048)


class PageRead(PageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
